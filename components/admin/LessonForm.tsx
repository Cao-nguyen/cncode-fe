'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Play, CheckCircle, Trash2 } from 'lucide-react';
import { CustomInput } from '../custom/CustomInput';
import { CustomButton } from '../custom/CustomButton';
import CustomEditor, { CustomEditorRef } from '../custom/CustomEditor';
import CompactEditor, { CompactEditorRef } from '../custom/CompactEditor';
import { createAdminLesson, updateAdminLesson } from '@/lib/api/khoahoc.api';
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
    initialQuizQuestions = [],
    onSave,
    onCancel
}: LessonFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description] = useState(initialDescription);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoFileId, setVideoFileId] = useState(initialVideoFileId);
    const [embedId, setEmbedId] = useState(extractYoutubeId(initialVideoFileId));
    const [duration, setDuration] = useState(initialDuration);
    const [saving, setSaving] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(initialQuizQuestions);
    const descriptionEditorRef = useRef<CustomEditorRef>(null);
    const quizEditorRefs = useRef<{ [key: number]: { question: CompactEditorRef | null; options: (CompactEditorRef | null)[] } }>({});

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

        if (!embedId) {
            toast.error('Vui lòng nhập link YouTube');
            return;
        }

        try {
            setSaving(true);

            // Collect quiz data from CompactEditor refs
            const quizzes = quizQuestions.map((q, idx) => {
                const refs = quizEditorRefs.current[idx];
                return {
                    time: q.time,
                    question: refs?.question?.getContent() || '',
                    options: q.options.map((_, optIdx) => refs?.options[optIdx]?.getContent() || ''),
                    correctAnswer: q.correctAnswer,
                };
            });

            const data = {
                courseId,
                chapterId,
                title,
                type: 'video' as const,
                description: descriptionEditorRef.current?.getContent() || '',
                videoFileId: youtubeUrl,
                duration,
                quizQuestions: quizzes,
            };

            if (lessonId) {
                const updatedLesson = await updateAdminLesson(lessonId, data);
                toast.success('Đã cập nhật bài học');
                onSave(updatedLesson);
            } else {
                const lesson = await createAdminLesson(chapterId, { ...data, order: 1 });
                toast.success('Đã tạo bài học');
                onSave(lesson);
            }
        } catch (err) {
            toast.error('Không thể lưu bài học');
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuiz = () => {
        setQuizQuestions([...quizQuestions, {
            time: 0, question: '', options: ['', '', '', ''], correctAnswer: 0,
        }]);
    };

    const handleRemoveQuiz = (index: number) => {
        setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    };

    const handleQuizChange = (index: number, field: keyof QuizQuestion, value: string | number | string[]) => {
        const updated = [...quizQuestions];
        updated[index] = { ...updated[index], [field]: value };
        setQuizQuestions(updated);
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

                    {/* YouTube URL */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Link YouTube *</label>
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
                            <CustomButton onClick={handleAddQuiz} variant="secondary">
                                <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
                            </CustomButton>
                        </div>

                        {quizQuestions.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <p className="text-sm text-gray-500">Chưa có câu hỏi nào</p>
                                <CustomButton onClick={handleAddQuiz} variant="secondary" className="mt-3">
                                    <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi đầu tiên
                                </CustomButton>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {quizQuestions.map((quiz, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-3 bg-white">
                                        <div className="flex items-start justify-between">
                                            <h5 className="font-medium text-gray-900">Câu hỏi {index + 1}</h5>
                                            <CustomButton
                                                onClick={() => handleRemoveQuiz(index)}
                                                variant="secondary"
                                                size="small"
                                                className="!p-1.5 !h-auto text-red-500 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </CustomButton>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian hiển thị</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] text-gray-500 mb-0.5">Giờ</label>
                                                    <CustomInput
                                                        value={String(Math.floor(quiz.time / 3600)).padStart(2, '0')}
                                                        onChange={(e) => {
                                                            const h = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                                            const m = Math.floor((quiz.time % 3600) / 60);
                                                            const s = quiz.time % 60;
                                                            handleQuizChange(index, 'time', h * 3600 + m * 60 + s);
                                                        }}
                                                        placeholder="00"
                                                    />
                                                </div>
                                                <span className="text-gray-400 text-lg font-medium mt-5">:</span>
                                                <div className="flex-1">
                                                    <label className="block text-[10px] text-gray-500 mb-0.5">Phút</label>
                                                    <CustomInput
                                                        value={String(Math.floor((quiz.time % 3600) / 60)).padStart(2, '0')}
                                                        onChange={(e) => {
                                                            const h = Math.floor(quiz.time / 3600);
                                                            const m = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                                            const s = quiz.time % 60;
                                                            handleQuizChange(index, 'time', h * 3600 + Math.min(m, 59) * 60 + s);
                                                        }}
                                                        placeholder="00"
                                                    />
                                                </div>
                                                <span className="text-gray-400 text-lg font-medium mt-5">:</span>
                                                <div className="flex-1">
                                                    <label className="block text-[10px] text-gray-500 mb-0.5">Giây</label>
                                                    <CustomInput
                                                        value={String(quiz.time % 60).padStart(2, '0')}
                                                        onChange={(e) => {
                                                            const h = Math.floor(quiz.time / 3600);
                                                            const m = Math.floor((quiz.time % 3600) / 60);
                                                            const s = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                                            handleQuizChange(index, 'time', h * 3600 + m * 60 + Math.min(s, 59));
                                                        }}
                                                        placeholder="00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi</label>
                                            <CompactEditor
                                                ref={(el) => {
                                                    if (!quizEditorRefs.current[index]) quizEditorRefs.current[index] = { question: null, options: [] };
                                                    quizEditorRefs.current[index].question = el;
                                                }}
                                                initialValue={quiz.question}
                                                height="200px"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Đáp án</label>
                                            {quiz.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-start gap-2">
                                                    <CustomButton
                                                        onClick={() => handleQuizChange(index, 'correctAnswer', optIndex)}
                                                        variant="secondary"
                                                        size="small"
                                                        className={`w-9 h-9 !p-0 flex items-center justify-center text-sm font-bold border-2 shrink-0 mt-1 transition-all ${quiz.correctAnswer === optIndex
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700'
                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                                                            }`}
                                                    >
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </CustomButton>
                                                    <div className="flex-1">
                                                        <CompactEditor
                                                            ref={(el) => {
                                                                if (!quizEditorRefs.current[index]) quizEditorRefs.current[index] = { question: null, options: [] };
                                                                quizEditorRefs.current[index].options[optIndex] = el;
                                                            }}
                                                            initialValue={opt}
                                                            height="200px"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {index === quizQuestions.length - 1 && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <CustomButton
                                                    onClick={handleAddQuiz}
                                                    variant="secondary"
                                                    size="small"
                                                    className="w-full"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
                                                </CustomButton>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}