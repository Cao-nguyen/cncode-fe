'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Play, CheckCircle, Upload, Film, FileText, HelpCircle, Loader2, X, Pencil } from 'lucide-react';
import { CustomInput } from '../custom/CustomInput';
import { CustomButton } from '../custom/CustomButton';
import CustomEditor, { CustomEditorRef } from '../custom/CustomEditor';
import VideoQuizEditorOverlay from './VideoQuizEditorOverlay';
import VideoQuizPreviewList from './VideoQuizPreviewList';
import { createAdminLesson, updateAdminLesson } from '@/lib/api/khoahoc.api';
import { uploadApi } from '@/lib/upload';
import { Lesson } from '@/types/khoahoc.type';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    convertQuestionsToBackendFormat,
    quizToEditorFormat,
    type VideoQuizQuestion,
} from '@/lib/khoahoc/video-quiz.utils';
import { parseVideoQuizQuestionsFromEditor } from '@/lib/khoahoc/video-quiz-answer.utils';
import {
    readBuilderQuizOpen,
    writeBuilderQuizOpen,
} from '@/lib/courseBuilderStorage';

interface LessonFormProps {
    courseId: string;
    chapterId: string;
    lessonId?: string;
    initialTitle?: string;
    initialDescription?: string;
    initialVideoFileId?: string;
    initialDuration?: number;
    initialQuizMarkdown?: string;
    initialQuizQuestions?: Lesson['quizQuestions'];
    onSave: (lesson?: Lesson) => void;
    onCancel: () => void;
    onQuizPersist?: (lesson: Lesson) => void;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}


export default function LessonForm({
    courseId,
    chapterId,
    lessonId,
    initialTitle = '',
    initialDescription = '',
    initialVideoFileId = '',
    initialDuration = 0,
    initialQuizMarkdown = '',
    initialQuizQuestions,
    onSave,
    onCancel: _onCancel,
    onQuizPersist,
}: LessonFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizTargetId = lessonId || chapterId;
    const quizHydratedRef = useRef(false);
    const loadedQuizLessonKeyRef = useRef<string | null>(null);

    const getQuizLessonKey = useCallback(
        () => (lessonId ? `lesson-${lessonId}` : `draft-${chapterId}`),
        [lessonId, chapterId],
    );

    const [title, setTitle] = useState(initialTitle);
    const [description] = useState(initialDescription);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoFileId, setVideoFileId] = useState(initialVideoFileId);
    const [embedId, setEmbedId] = useState(extractYoutubeId(initialVideoFileId));
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [duration, setDuration] = useState(initialDuration);
    const [saving, setSaving] = useState(false);
    const initialQuizContent =
        initialQuizMarkdown || quizToEditorFormat(initialQuizQuestions ?? []);
    const [quizQuestions, setQuizQuestions] = useState<VideoQuizQuestion[]>(() =>
        parseVideoQuizQuestionsFromEditor(initialQuizContent),
    );
    const [quizEditorContent, setQuizEditorContent] = useState(initialQuizContent);
    const [showQuizOverlay, setShowQuizOverlay] = useState(false);
    const initialIsYoutube = Boolean(extractYoutubeId(initialVideoFileId));
    const [videoTab, setVideoTab] = useState<'youtube' | 'upload'>(() =>
        initialVideoFileId && !initialIsYoutube ? 'upload' : 'youtube',
    );
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState(() =>
        initialVideoFileId && !initialIsYoutube ? initialVideoFileId : '',
    );
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const descriptionEditorRef = useRef<CustomEditorRef>(null);
    const leftPanelRef = useRef<HTMLElement | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const [leftPanelHeight, setLeftPanelHeight] = useState<number | null>(null);
    const [matchLeftHeight, setMatchLeftHeight] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches,
    );

    useEffect(() => {
        const lessonKey = getQuizLessonKey();
        if (loadedQuizLessonKeyRef.current === lessonKey) return;

        loadedQuizLessonKeyRef.current = lessonKey;
        const content = initialQuizMarkdown || quizToEditorFormat(initialQuizQuestions ?? []);
        setQuizEditorContent(content);
        setQuizQuestions(parseVideoQuizQuestionsFromEditor(content));
    }, [getQuizLessonKey, initialQuizMarkdown, initialQuizQuestions]);

    // Sync title with initialTitle when it changes
    useEffect(() => {
        setTitle(initialTitle);
    }, [initialTitle]);

    const syncQuizUrl = useCallback(
        (open: boolean) => {
            const params = new URLSearchParams(searchParams.toString());
            if (open) {
                params.set('quiz', '1');
            } else {
                params.delete('quiz');
            }
            router.replace(`/admin/khoahoc?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

    const setQuizOverlayOpen = useCallback(
        (open: boolean) => {
            setShowQuizOverlay(open);
            writeBuilderQuizOpen(courseId, quizTargetId, open);
            syncQuizUrl(open);
        },
        [courseId, quizTargetId, syncQuizUrl],
    );

    useEffect(() => {
        if (quizHydratedRef.current) return;
        quizHydratedRef.current = true;

        const fromUrl = searchParams.get('quiz') === '1';
        const fromStorage = readBuilderQuizOpen(courseId, quizTargetId);

        if (fromUrl || fromStorage) {
            setShowQuizOverlay(true);
            writeBuilderQuizOpen(courseId, quizTargetId, true);
            if (!fromUrl) {
                syncQuizUrl(true);
            }
        }
    }, [courseId, quizTargetId, searchParams, syncQuizUrl]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1280px)');
        const updateMatch = () => setMatchLeftHeight(mq.matches);
        updateMatch();
        mq.addEventListener('change', updateMatch);
        return () => mq.removeEventListener('change', updateMatch);
    }, []);

    const attachLeftPanelObserver = useCallback(
        (node: HTMLElement | null) => {
            leftPanelRef.current = node;

            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }

            if (!node || !matchLeftHeight) {
                setLeftPanelHeight(null);
                return;
            }

            const updateHeight = () => {
                requestAnimationFrame(() => {
                    if (leftPanelRef.current) {
                        setLeftPanelHeight(leftPanelRef.current.getBoundingClientRect().height);
                    }
                });
            };

            updateHeight();
            const ro = new ResizeObserver(updateHeight);
            ro.observe(node);
            resizeObserverRef.current = ro;
        },
        [matchLeftHeight, videoTab, embedId, uploadedVideoUrl, uploadingVideo],
    );

    useEffect(() => {
        return () => {
            resizeObserverRef.current?.disconnect();
        };
    }, []);

    // Sync YouTube URL state with embedId
    useEffect(() => {
        if (embedId) {
            setYoutubeUrl(`https://youtube.com/watch?v=${embedId}`);
        }
    }, []);

    // Load draft from localStorage for new lessons
    useEffect(() => {
        if (!lessonId && chapterId) {
            const storageKey = `lesson_draft_${chapterId}`;
            const draft = localStorage.getItem(storageKey);
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed.content && parsed.questions) {
                        setQuizEditorContent(parsed.content);
                        setQuizQuestions(parsed.questions);
                    }
                } catch (error) {
                    console.error('Failed to load draft:', error);
                }
            }
        }
    }, [lessonId, chapterId]);

    const handleYoutubeUrlChange = (value: string) => {
        setYoutubeUrl(value);
        const id = extractYoutubeId(value);
        setEmbedId(id);
        if (id) {
            setVideoFileId(value);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tên bài học');
            return;
        }

        // Validate video source based on active tab
        if (videoTab === 'youtube') {
            if (!embedId) {
                toast.error('Vui lòng nhập link YouTube hợp lệ');
                return;
            }
        } else if (videoTab === 'upload') {
            if (!videoFileId && !uploadedVideoUrl) {
                toast.error('Vui lòng tải lên video');
                return;
            }
        }

        try {
            setSaving(true);

            const trimmedQuizContent = quizEditorContent.trim();
            const resolvedQuestions =
                quizQuestions.length > 0
                    ? quizQuestions
                    : parseVideoQuizQuestionsFromEditor(trimmedQuizContent);
            const quizzes =
                resolvedQuestions.length > 0
                    ? convertQuestionsToBackendFormat(resolvedQuestions)
                    : [];

            // Use the appropriate video source based on tab
            const videoSource = videoTab === 'youtube' ? youtubeUrl : videoFileId || uploadedVideoUrl;

            const data = {
                courseId,
                chapterId,
                title,
                type: 'video' as const,
                description: descriptionEditorRef.current?.getContent() || '',
                videoFileId: videoSource,
                duration,
                quizMarkdown: quizzes.length > 0 ? trimmedQuizContent : '',
                quizQuestions: quizzes,
            };

            if (lessonId) {
                const updatedLesson = await updateAdminLesson(lessonId, data);
                toast.success('Đã cập nhật bài học');
                onSave(updatedLesson);
            } else {
                const lesson = await createAdminLesson(chapterId, { ...data, order: 1 });
                // Clear localStorage draft after successful creation
                const storageKey = `lesson_draft_${chapterId}`;
                localStorage.removeItem(storageKey);
                toast.success('Đã tạo bài học');
                onSave(lesson);
            }
        } catch (err) {
            toast.error('Không thể lưu bài học');
        } finally {
            setSaving(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const uploadedVideoPreview =
        videoTab === 'upload'
            ? uploadedVideoUrl || (videoFileId && !extractYoutubeId(videoFileId) ? videoFileId : '')
            : '';
    const hasUploadedVideo = Boolean(uploadedVideoPreview && !uploadingVideo);
    const hasQuizVideo = videoTab === 'youtube' ? Boolean(embedId) : Boolean(uploadedVideoPreview);

    const handleOpenQuizEditor = () => {
        if (!hasQuizVideo) {
            toast.error('Vui lòng thêm video bài học trước khi soạn câu hỏi');
            return;
        }
        setQuizOverlayOpen(true);
    };

    const handleCloseQuizEditor = () => {
        setQuizOverlayOpen(false);
    };

    const handleQuizSaved = (content: string, questions: VideoQuizQuestion[], persistedLesson?: Lesson) => {
        setQuizEditorContent(content);
        setQuizQuestions(questions);

        if (persistedLesson) {
            onQuizPersist?.(persistedLesson);
        }
    };

    const handleRemoveUploadedVideo = () => {
        setUploadedVideoUrl('');
        setVideoFileId('');
    };

    const handleVideoFileUpload = async (file: File) => {
        if (file.size > 100 * 1024 * 1024) {
            toast.error('Video quá lớn. Tối đa 100MB');
            return;
        }

        try {
            setUploadingVideo(true);
            setUploadProgress(0);
            setUploadStatus('Bắt đầu upload...');
            setEmbedId(null);
            setYoutubeUrl('');

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setUploadedVideoUrl(reader.result);
                }
            };
            reader.readAsDataURL(file);

            const result = await uploadApi.uploadVideoWithProgress(file, (progress, status) => {
                setUploadProgress(progress);
                setUploadStatus(status);
            });

            if (!result.success || !result.url) {
                throw new Error(result.message || 'Upload failed');
            }

            setVideoFileId(result.url);
            setUploadingVideo(false);
            setUploadProgress(0);
            setUploadStatus('');
            toast.success('Video đã được tải lên');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Không thể tải video lên');
            setUploadingVideo(false);
            setUploadProgress(0);
            setUploadStatus('');
            setUploadedVideoUrl('');
            setVideoFileId('');
        }
    };

    return (
        <>
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--cn-bg-section,#f8fafc)] dark:bg-gray-950">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900 sm:gap-3 sm:px-4 sm:py-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 sm:text-[11px]">
                            <Film className="h-3 w-3" />
                            Bài học video
                        </span>
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tên bài học"
                        className="w-full truncate bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 sm:text-base"
                    />
                </div>
                <CustomButton onClick={handleSave} disabled={saving} size="medium" className="shrink-0 px-2.5 sm:px-4">
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin sm:mr-1.5" />
                    ) : (
                        <Save className="h-4 w-4 sm:mr-1.5" />
                    )}
                    <span className="hidden sm:inline">{saving ? 'Đang lưu...' : 'Lưu bài học'}</span>
                    <span className="sm:hidden">{saving ? '...' : 'Lưu'}</span>
                </CustomButton>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 sm:p-4">
                <div className="grid gap-3 sm:gap-4 xl:grid-cols-2 xl:items-start">
                    <section
                        ref={attachLeftPanelObserver}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex flex-col gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                <Play className="h-4 w-4 shrink-0 text-blue-500" />
                                Video bài học
                            </div>
                            <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800 sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setVideoTab('youtube')}
                                    className={cn(
                                        'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition sm:flex-none sm:py-1',
                                        videoTab === 'youtube'
                                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400',
                                    )}
                                >
                                    YouTube
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVideoTab('upload')}
                                    className={cn(
                                        'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition sm:flex-none sm:py-1',
                                        videoTab === 'upload'
                                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400',
                                    )}
                                >
                                    Tải lên
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 p-3 sm:p-4">
                            {videoTab === 'youtube' ? (
                                <>
                                    <CustomInput
                                        value={youtubeUrl}
                                        onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=... hoặc youtu.be/..."
                                    />
                                    {embedId ? (
                                        <>
                                            <div className="overflow-hidden rounded-lg bg-black aspect-video">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${embedId}?autoplay=0`}
                                                    className="h-full w-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Link hợp lệ
                                                </span>
                                                {duration > 0 && (
                                                    <span className="text-gray-500">{formatDuration(duration)}</span>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800/50">
                                            Nhập link YouTube để xem trước
                                        </div>
                                    )}
                                </>
                            ) : uploadingVideo ? (
                                <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-800/50">
                                    <div className="w-full max-w-xs">
                                        <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className="h-full rounded-full bg-blue-500 transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {uploadStatus} ({uploadProgress}%)
                                        </p>
                                    </div>
                                </div>
                            ) : hasUploadedVideo ? (
                                <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                                    <video src={uploadedVideoPreview} controls className="h-full w-full" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveUploadedVideo}
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                                        aria-label="Xóa video"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label
                                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 transition hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800/50"
                                >
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chọn video từ máy
                                    </span>
                                    <span className="text-xs text-gray-500">MP4, WebM, OGG · tối đa 100MB</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            await handleVideoFileUpload(file);
                                            e.target.value = '';
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </section>

                    <section
                        className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                        style={
                            matchLeftHeight && leftPanelHeight
                                ? { height: leftPanelHeight, maxHeight: leftPanelHeight }
                                : { height: 'min(55vh, 480px)', maxHeight: 'min(55vh, 480px)' }
                        }
                    >
                        <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100 sm:px-4 sm:py-3">
                            <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                            Nội dung bài học
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-3">
                            <CustomEditor
                                ref={descriptionEditorRef}
                                initialValue={description}
                                fillHeight
                            />
                        </div>
                    </section>
                </div>

                <section className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 sm:mt-4">
                    <div className="flex flex-col gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            <HelpCircle className="h-4 w-4 shrink-0 text-blue-500" />
                            Câu hỏi trong video
                        </div>
                        <CustomButton onClick={handleOpenQuizEditor} variant="secondary" size="small" className="w-full sm:w-auto">
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Soạn câu hỏi trong video
                        </CustomButton>
                    </div>
                    <div className="max-h-[min(28rem,60vh)] overflow-y-auto p-3 sm:p-4">
                        <VideoQuizPreviewList content={quizEditorContent} />
                    </div>
                </section>
            </div>
        </div>

        {showQuizOverlay && (
            <VideoQuizEditorOverlay
                lessonTitle={title}
                lessonId={lessonId}
                chapterId={chapterId}
                initialContent={quizEditorContent}
                videoType={videoTab === 'youtube' && embedId ? 'youtube' : 'upload'}
                youtubeEmbedId={videoTab === 'youtube' ? embedId : null}
                uploadedVideoUrl={videoTab === 'upload' ? uploadedVideoPreview || undefined : undefined}
                onClose={handleCloseQuizEditor}
                onSaved={handleQuizSaved}
            />
        )}
        </>
    );
}