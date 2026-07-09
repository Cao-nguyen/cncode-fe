'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Play, CheckCircle, Trash2, Upload } from 'lucide-react';
import { CustomInput } from '../custom/CustomInput';
import { CustomButton } from '../custom/CustomButton';
import CustomEditor, { CustomEditorRef } from '../custom/CustomEditor';
import CustomEditorVideo from '../custom/CustomEditorVideo';
import { createAdminLesson, updateAdminLesson } from '@/lib/api/khoahoc.api';
import { uploadApi } from '@/lib/upload';
import { Lesson } from '@/types/khoahoc.type';
import { toast } from 'sonner';

interface LessonFormProps {
    courseId: string;
    chapterId: string;
    lessonId?: string;
    initialTitle?: string;
    initialDescription?: string;
    initialVideoFileId?: string;
    initialDuration?: number;
    initialQuizQuestions?: {
        time: number;
        question: string;
        options: string[];
        correctAnswer: number;
    }[];
    onSave: (lesson?: Lesson) => void;
    onCancel: () => void;
}

interface QuizQuestion {
    time: number;
    question: string;
    options: string[];
    correctAnswer: number;
    correctAnswers?: string[];
}

// Convert quizQuestions to CustomEditorVideo format
const quizToEditorFormat = (quizzes: QuizQuestion[]): string => {
    return quizzes.map((q, idx) => {
        const h = Math.floor(q.time / 3600);
        const m = Math.floor((q.time % 3600) / 60);
        const s = q.time % 60;
        const timeStr = `{TIME:${h}:${m}:${s}}`;
        // Check if options already have letters (A., B., etc.) and skip adding letter
        const options = q.options.map((opt, i) => {
            const marker = q.correctAnswers?.includes(String.fromCharCode(65 + i)) ? '*' : '';
            // If option already starts with letter pattern (A., B., etc.), keep it as is
            if (/^[A-Da-d][).]\s/.test(opt)) {
                return marker ? `*${opt}` : opt;
            }
            // Otherwise add letter
            const letter = String.fromCharCode(65 + i);
            return `${marker}${letter}. ${opt}`;
        }).join('\n');
        return `Câu ${idx + 1}. ${q.question}\n${timeStr}\n${options}`;
    }).join('\n\n');
};

interface CustomEditorQuestion {
    id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    content: string;
    options?: string[];
    correctAnswers?: string[];
    score: number;
    explanation?: string;
    time?: number;
}

// Convert CustomEditorVideo questions to backend format
const convertQuestionsToBackendFormat = (questions: CustomEditorQuestion[]) => {
    return questions.map(q => ({
        time: q.time || 0,
        type: q.type || 'multiple-choice',
        question: q.content,
        options: q.options || [],
        correctAnswer: q.type === 'multiple-choice' && q.correctAnswers?.[0]
            ? q.correctAnswers[0].charCodeAt(0) - 65
            : 0,
        correctAnswers: q.correctAnswers || [],
        score: q.score || 1,
        explanation: q.explanation || ''
    }));
};

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
    initialQuizQuestions = [],
    onSave,
    onCancel
}: LessonFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description] = useState(initialDescription);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoFileId, setVideoFileId] = useState(initialVideoFileId);
    const [embedId, setEmbedId] = useState(extractYoutubeId(initialVideoFileId));
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [duration, setDuration] = useState(initialDuration);
    const [saving, setSaving] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<CustomEditorQuestion[]>([]);
    const [quizEditorContent, setQuizEditorContent] = useState(quizToEditorFormat(initialQuizQuestions));
    const [videoTab, setVideoTab] = useState<'youtube' | 'upload'>('youtube');
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('saved');
    const descriptionEditorRef = useRef<CustomEditorRef>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const initialContentRef = useRef(quizEditorContent);

    // Sync title with initialTitle when it changes
    useEffect(() => {
        setTitle(initialTitle);
    }, [initialTitle]);

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
                        initialContentRef.current = parsed.content;
                    }
                } catch (error) {
                    console.error('Failed to load draft:', error);
                }
            }
        }
    }, [lessonId, chapterId]);

    // Auto-save function
    const autoSaveQuestions = async (content: string, questions: CustomEditorQuestion[]) => {
        setSaveStatus('saving');
        try {
            if (lessonId) {
                // Auto-save to database for existing lessons
                const quizzes = convertQuestionsToBackendFormat(questions);
                await updateAdminLesson(lessonId, {
                    quizQuestions: quizzes
                });
                setSaveStatus('saved');
            } else {
                // Save to localStorage for new lessons (not yet created)
                const storageKey = `lesson_draft_${chapterId}`;
                localStorage.setItem(storageKey, JSON.stringify({
                    content,
                    questions,
                    timestamp: Date.now()
                }));
                setSaveStatus('saved');
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
            setSaveStatus('unsaved');
        }
    };

    const handleYoutubeUrlChange = (value: string) => {
        setYoutubeUrl(value);
        const id = extractYoutubeId(value);
        setEmbedId(id);
        if (id) {
            setVideoFileId(value);
        }
    };

    // Debounced auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only auto-save if content has changed from initial and status is unsaved
            if (quizEditorContent && quizQuestions.length > 0 && saveStatus === 'unsaved' && quizEditorContent !== initialContentRef.current) {
                autoSaveQuestions(quizEditorContent, quizQuestions);
            }
        }, 500); // Save after 500ms of inactivity

        return () => clearTimeout(timer);
    }, [quizEditorContent, quizQuestions, saveStatus]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saveStatus === 'unsaved' || saveStatus === 'saving') {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveStatus]);

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
            if (!uploadedVideoUrl) {
                toast.error('Vui lòng tải lên video');
                return;
            }
        }

        try {
            setSaving(true);

            // Convert questions using state from CustomEditorVideo
            const quizzes = convertQuestionsToBackendFormat(quizQuestions as CustomEditorQuestion[]);

            // Use the appropriate video source based on tab
            const videoSource = videoTab === 'youtube' ? youtubeUrl : uploadedVideoUrl;

            const data = {
                courseId,
                chapterId,
                title,
                type: 'video' as const,
                description: descriptionEditorRef.current?.getContent() || '',
                videoFileId: videoSource,
                duration,
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

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-[13.5px] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                    {lessonId ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
                </h3>
                <div className="flex items-center gap-3">
                    <CustomButton onClick={onCancel} variant="secondary">
                        <X className="w-4 h-4 mr-1.5" /> Huỷ
                    </CustomButton>
                    <CustomButton onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Đang lưu...' : 'Lưu'}
                    </CustomButton>
                </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6 pb-12">

                    {/* Tiêu đề bài học */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tên bài học *</label>
                        <CustomInput
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tên bài học"
                        />
                    </div>

                    {/* Video Source */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Nguồn video *</label>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
                            <button
                                type="button"
                                onClick={() => setVideoTab('youtube')}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${videoTab === 'youtube'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Play className="w-4 h-4" /> Link YouTube
                            </button>
                            <button
                                type="button"
                                onClick={() => setVideoTab('upload')}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${videoTab === 'upload'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Upload className="w-4 h-4" /> Tải lên video
                            </button>
                        </div>

                        {/* YouTube Tab */}
                        {videoTab === 'youtube' && (
                            <>
                                <CustomInput
                                    value={youtubeUrl}
                                    onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                                />

                                {embedId && (
                                    <div className="mt-4 space-y-4">
                                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${embedId}?autoplay=0`}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Link YouTube hợp lệ</span>
                                            </div>
                                            {duration > 0 && (
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Play className="w-3 h-3" />
                                                    <span>{formatDuration(duration)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Upload Tab */}
                        {videoTab === 'upload' && (
                            <>
                                <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg py-12 cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 relative ${uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploadingVideo ? (
                                        <>
                                            <div className="relative w-full max-w-xs">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-medium text-gray-700">{uploadStatus}</span>
                                                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={32} className="text-gray-400" />
                                            <div className="text-center">
                                                <span className="text-sm font-medium text-gray-700">Chọn file video từ máy tính</span>
                                                <p className="text-xs text-gray-500 mt-1">MP4, WebM, hoặc OGG (tối đa 100MB)</p>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        disabled={uploadingVideo}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            // Check file size
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

                                                // Create preview
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    if (typeof reader.result === 'string') {
                                                        setUploadedVideoUrl(reader.result);
                                                    }
                                                };
                                                reader.readAsDataURL(file);

                                                // Upload to server with progress
                                                const result = await uploadApi.uploadVideoWithProgress(file, (progress, status) => {
                                                    setUploadProgress(progress);
                                                    setUploadStatus(status);
                                                });

                                                if (!result.success || !result.url) {
                                                    throw new Error(result.message || 'Upload failed');
                                                }

                                                // Set video URL
                                                setVideoFileId(result.url);
                                                setUploadingVideo(false);
                                                setUploadProgress(0);
                                                setUploadStatus('');
                                                toast.success('Video đã được tải lên thành công');

                                            } catch (error) {
                                                console.error('Upload error:', error);
                                                toast.error(error instanceof Error ? error.message : 'Không thể tải video lên');
                                                setUploadingVideo(false);
                                                setUploadProgress(0);
                                                setUploadStatus('');
                                                setUploadedVideoUrl('');
                                                setVideoFileId('');
                                            }
                                        }}
                                    />
                                </label>

                                {uploadedVideoUrl && !uploadingVideo && (
                                    <div className="mt-4 space-y-4">
                                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                            <video
                                                src={uploadedVideoUrl}
                                                controls
                                                className="w-full h-full"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Video đã tải lên</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadedVideoUrl('');
                                                    setVideoFileId('');
                                                }}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Xóa video</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Nội dung bài học */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Nội dung bài học</label>
                        <CustomEditor ref={descriptionEditorRef} initialValue={description} />
                    </div>

                    {/* Câu hỏi trong video */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold">Câu hỏi trong video</h4>
                        </div>

                        <div className="border rounded-lg overflow-hidden bg-white">
                            <CustomEditorVideo
                                initialContent={quizEditorContent}
                                onContentChange={(content, questions) => {
                                    // Save questions from CustomEditorVideo directly
                                    setQuizQuestions(questions);
                                    setQuizEditorContent(content);
                                    // Mark as unsaved when content changes
                                    if (content !== initialContentRef.current) {
                                        setSaveStatus('unsaved');
                                    } else {
                                        setSaveStatus('saved');
                                    }
                                }}
                                saveStatus={saveStatus}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}