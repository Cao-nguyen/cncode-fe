'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Save, Clock, Film, Pencil } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import CustomEditorVideoQuiz from './CustomEditorVideoQuiz';
import { CustomButton } from '@/components/custom/CustomButton';
import { updateAdminLesson } from '@/lib/api/khoahoc.api';
import type { Lesson } from '@/types/khoahoc.type';
import {
    convertQuestionsToBackendFormat,
    formatVideoQuizTime,
    type VideoQuizQuestion,
} from '@/lib/khoahoc/video-quiz.utils';
import { cn } from '@/lib/utils';

export interface VideoQuizEditorOverlayProps {
    lessonTitle: string;
    lessonId?: string;
    chapterId: string;
    initialContent: string;
    videoType: 'youtube' | 'upload';
    youtubeEmbedId?: string | null;
    uploadedVideoUrl?: string;
    onClose: () => void;
    onSaved: (content: string, questions: VideoQuizQuestion[], persistedLesson?: Lesson) => void;
}

function QuizVideoPanel({
    videoType,
    youtubeEmbedId,
    uploadedVideoUrl,
    onTimeUpdate,
}: {
    videoType: 'youtube' | 'upload';
    youtubeEmbedId?: string | null;
    uploadedVideoUrl?: string;
    onTimeUpdate: (seconds: number) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        onTimeUpdate(currentTime);
    }, [currentTime, onTimeUpdate]);

    if (videoType === 'youtube' && youtubeEmbedId) {
        return (
            <div className="flex h-full flex-col">
                <div className="overflow-hidden rounded-lg bg-black aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeEmbedId}?enablejsapi=1`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Dùng thanh thời gian YouTube để xác định giây hiển thị câu hỏi, rồi nhập vào trường Thời gian bên dưới.
                </p>
            </div>
        );
    }

    if (videoType === 'upload' && uploadedVideoUrl) {
        return (
            <div className="flex h-full flex-col">
                <div className="overflow-hidden rounded-lg bg-black aspect-video">
                    <video
                        ref={videoRef}
                        src={uploadedVideoUrl}
                        controls
                        className="h-full w-full"
                        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                        onSeeked={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                        onLoadedMetadata={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                    />
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>
                        Thời gian hiện tại:{' '}
                        <strong className="font-semibold text-gray-900">{formatVideoQuizTime(currentTime)}</strong>
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
            Chưa có video bài học
        </div>
    );
}

export default function VideoQuizEditorOverlay({
    lessonTitle,
    lessonId,
    chapterId,
    initialContent,
    videoType,
    youtubeEmbedId,
    uploadedVideoUrl,
    onClose,
    onSaved,
}: VideoQuizEditorOverlayProps) {
    const [editorContent, setEditorContent] = useState(initialContent);
    const [parsedQuestions, setParsedQuestions] = useState<VideoQuizQuestion[]>([]);
    const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('saved');
    const [saving, setSaving] = useState(false);
    const initialContentRef = useRef(initialContent);
    const [, setPlaybackTime] = useState(0);
    const [mobilePanel, setMobilePanel] = useState<'video' | 'editor'>('editor');
    const [isLargeLayout, setIsLargeLayout] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const update = () => {
            setIsLargeLayout(mq.matches);
            if (mq.matches) setMobilePanel('editor');
        };
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const handlePlaybackTime = useCallback((seconds: number) => {
        setPlaybackTime(seconds);
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const persistQuestions = useCallback(
        async (content: string, questions: VideoQuizQuestion[]) => {
            setSaveStatus('saving');
            try {
                let persistedLesson: Lesson | undefined;
                if (lessonId) {
                    persistedLesson = await updateAdminLesson(lessonId, {
                        quizMarkdown: content,
                        quizQuestions: convertQuestionsToBackendFormat(questions),
                    });
                } else {
                    const storageKey = `lesson_draft_${chapterId}`;
                    localStorage.setItem(
                        storageKey,
                        JSON.stringify({
                            content,
                            questions,
                            timestamp: Date.now(),
                        }),
                    );
                }
                initialContentRef.current = content;
                setSaveStatus('saved');
                onSaved(content, questions, persistedLesson);
                return true;
            } catch (error) {
                console.error('Auto-save quiz failed:', error);
                setSaveStatus('unsaved');
                return false;
            }
        },
        [chapterId, lessonId, onSaved],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                editorContent &&
                saveStatus === 'unsaved' &&
                editorContent !== initialContentRef.current
            ) {
                void persistQuestions(editorContent, parsedQuestions);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [editorContent, parsedQuestions, saveStatus, persistQuestions]);

    const handleContentChange = useCallback((content: string, questions: VideoQuizQuestion[]) => {
        setEditorContent(content);
        setParsedQuestions(questions);
        setSaveStatus(content !== initialContentRef.current ? 'unsaved' : 'saved');
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const ok = await persistQuestions(editorContent, parsedQuestions);
        setSaving(false);
        if (ok) {
            toast.success('Đã lưu câu hỏi trong video');
        } else {
            toast.error('Không thể lưu câu hỏi');
        }
    };

    const handleClose = async () => {
        if (saveStatus === 'unsaved') {
            const ok = await persistQuestions(editorContent, parsedQuestions);
            if (!ok) {
                toast.error('Còn thay đổi chưa lưu');
                return;
            }
        }
        onClose();
    };

    const saveStatusLabel =
        saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'unsaved' ? 'Có thay đổi' : 'Đã lưu';

    return (
        <div className="fixed inset-0 z-[110] flex h-dvh w-full flex-col overflow-hidden bg-white">
            <header className="flex-shrink-0 border-b border-gray-100 bg-white px-3 py-2.5 sm:px-6 sm:py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => void handleClose()}
                            className="shrink-0 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                            title="Quay lại"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <Image
                            src="/images/logo.png"
                            alt="CNcode"
                            width={90}
                            height={36}
                            className="hidden h-8 w-auto shrink-0 sm:block"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">Soạn câu hỏi trong video</p>
                            <p className="truncate text-xs text-gray-500">{lessonTitle || 'Bài học'}</p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <span
                            className={cn(
                                'rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-[11px]',
                                saveStatus === 'saved'
                                    ? 'bg-green-50 text-green-600'
                                    : saveStatus === 'saving'
                                      ? 'bg-amber-50 text-amber-600'
                                      : 'bg-gray-100 text-gray-600',
                            )}
                        >
                            {saveStatusLabel}
                        </span>
                        <CustomButton onClick={() => void handleSave()} disabled={saving} size="medium" className="px-2.5 sm:px-4">
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin sm:mr-1.5" />
                            ) : (
                                <Save className="h-4 w-4 sm:mr-1.5" />
                            )}
                            <span className="hidden sm:inline">Lưu</span>
                        </CustomButton>
                    </div>
                </div>
            </header>

            {!isLargeLayout && (
                <div className="flex shrink-0 border-b border-gray-100 bg-gray-50 p-1 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobilePanel('video')}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                            mobilePanel === 'video'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900',
                        )}
                    >
                        <Film className="h-3.5 w-3.5" />
                        Video
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobilePanel('editor')}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                            mobilePanel === 'editor'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900',
                        )}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Soạn câu hỏi
                    </button>
                </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
                <aside
                    className={cn(
                        'shrink-0 border-b border-gray-100 bg-gray-50 p-3 sm:p-4 lg:w-[min(420px,38%)] lg:border-b-0 lg:border-r',
                        !isLargeLayout && mobilePanel !== 'video' && 'hidden',
                        !isLargeLayout && mobilePanel === 'video' && 'flex min-h-0 flex-1 flex-col overflow-y-auto',
                    )}
                >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Video bài học</p>
                    <QuizVideoPanel
                        videoType={videoType}
                        youtubeEmbedId={youtubeEmbedId}
                        uploadedVideoUrl={uploadedVideoUrl}
                        onTimeUpdate={handlePlaybackTime}
                    />
                </aside>

                <div
                    className={cn(
                        'min-h-0 flex-1 overflow-hidden bg-white',
                        !isLargeLayout && mobilePanel !== 'editor' && 'hidden',
                        !isLargeLayout && mobilePanel === 'editor' && 'flex flex-col',
                    )}
                >
                    <CustomEditorVideoQuiz
                        initialContent={initialContent}
                        onContentChange={handleContentChange}
                        saveStatus={saveStatus}
                    />
                </div>
            </div>
        </div>
    );
}
