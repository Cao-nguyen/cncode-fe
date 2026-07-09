'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Save, X } from 'lucide-react';
import { CustomButton } from '../custom/CustomButton';
import CustomEditorQuestion from '../custom/CustomEditorQuestion';
import { Exercise, ExerciseQuestion } from '@/types/khoahoc.type';
import { toast } from 'sonner';
import { khoahocApi } from '@/lib/api/khoahoc.api';

interface ExerciseFormProps {
    courseId: string;
    lessonId: string;
    exerciseId?: string;
    initialExercise?: Exercise;
    onSave: (exercise: Exercise) => void;
    onCancel: () => void;
}

// CustomEditorQuestion output format
interface EditorQuestion {
    id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    content: string;
    options?: string[]; // Format: ["A. text", "B. text"]
    correctAnswers?: string[]; // Format: ["A", "B"]
    score: number;
    explanation?: string;
}

export default function ExerciseForm({
    courseId,
    lessonId,
    exerciseId,
    initialExercise,
    onSave,
    onCancel
}: ExerciseFormProps) {
    const [editorContent, setEditorContent] = useState<string>('');
    const [editorQuestions, setEditorQuestions] = useState<EditorQuestion[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('saved');
    const initialContentRef = useRef<string>('');
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Convert Exercise questions to CustomEditorQuestion format
    const convertToEditorFormat = (exercise: Exercise): string => {
        if (!exercise.questions || exercise.questions.length === 0) {
            return 'Câu 1. Nhập nội dung câu hỏi\nA. Phương án A\nB. Phương án B\nC. Phương án C\nD. Phương án D';
        }

        const lines: string[] = [];
        exercise.questions.forEach((q, index) => {
            lines.push(`Câu ${index + 1}. ${q.question || 'Nhập nội dung câu hỏi'}`);

            // New format: options = ["A. text", "B. text"], correctAnswers = ["A"]
            if (q.options && q.options.length > 0 && q.correctAnswers) {
                q.options.forEach((opt) => {
                    if (typeof opt === 'string') {
                        const letter = opt.charAt(0);
                        const text = opt.slice(opt.indexOf(' ') + 1);
                        const marker = q.correctAnswers?.includes(letter) ? '*' : '';
                        lines.push(`${marker}${letter}. ${text}`);
                    }
                });
            } else if (q.type === 'quiz' && q.legacyOptions) {
                // Legacy format fallback
                q.legacyOptions.forEach((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const marker = opt.isCorrect ? '*' : '';
                    lines.push(`${marker}${letter}. ${opt.text}`);
                });
            } else if (q.type === 'true-false' && q.trueFalseOptions) {
                // Legacy format fallback
                const tfOptions = q.trueFalseOptions || [];
                tfOptions.forEach((opt, i) => {
                    const letter = String.fromCharCode(97 + i);
                    const marker = opt.isCorrect ? '*' : '';
                    lines.push(`${marker}${letter}. ${opt.text}`);
                });
            } else if (q.type === 'short-answer' && q.correctAnswers) {
                lines.push(`[${q.correctAnswers[0]}]`);
            }

            if (index < exercise.questions.length - 1) {
                lines.push('');
            }
        });

        return lines.join('\n');
    };

    // Initialize editor content
    useEffect(() => {
        if (initialExercise) {
            const content = convertToEditorFormat(initialExercise);
            setEditorContent(content);
            initialContentRef.current = content;
        }
    }, [initialExercise]);

    // Auto-save function
    const autoSave = useCallback(async (questions: EditorQuestion[], content: string) => {
        if (!exerciseId || questions.length === 0) return;

        try {
            setSaveStatus('saving');
            const response = await khoahocApi.updateBaitapExercise(exerciseId, {
                questions: convertToBEFormat(questions)
            });

            initialContentRef.current = content;
            setSaveStatus('saved');
        } catch (err) {
            console.error('[ExerciseForm] Auto-save failed:', err);
            setSaveStatus('unsaved');
        }
    }, [exerciseId]);

    // Handle content changes from editor
    const handleContentChange = (content: string, questions: EditorQuestion[]) => {
        setEditorContent(content);
        setEditorQuestions(questions);

        if (content !== initialContentRef.current) {
            setSaveStatus('unsaved');

            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            autoSaveTimeoutRef.current = setTimeout(() => {
                autoSave(questions, content);
            }, 100);
        } else {
            setSaveStatus('saved');
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    // Convert CustomEditorQuestion format to BE format
    const convertToBEFormat = (questions: EditorQuestion[]): ExerciseQuestion[] => {
        return questions.map(q => {
            const baseQuestion: ExerciseQuestion = {
                type: q.type === 'multiple-choice' ? 'quiz' : q.type,
                question: q.content,
                score: q.score,
                explanation: q.explanation
            };

            // New format: options = ["A. text", "B. text"], correctAnswers = ["A"]
            if (q.type === 'multiple-choice') {
                baseQuestion.options = q.options || [];
                baseQuestion.correctAnswers = q.correctAnswers || [];
            } else if (q.type === 'true-false') {
                baseQuestion.options = q.options || [];
                baseQuestion.correctAnswers = q.correctAnswers || [];
            } else if (q.type === 'short-answer') {
                baseQuestion.correctAnswers = q.correctAnswers || [];
            }

            return baseQuestion;
        });
    };

    const handleSave = async () => {
        const currentQuestions = editorQuestions;

        if (currentQuestions.length === 0) {
            toast.error('Phải có ít nhất 1 câu hỏi');
            return;
        }

        // Validate questions
        for (let i = 0; i < currentQuestions.length; i++) {
            const q = currentQuestions[i];

            if (!q.content?.trim()) {
                toast.error(`Câu ${q.id}: Vui lòng nhập đề bài`);
                return;
            }

            if (q.type === 'multiple-choice' || q.type === 'true-false') {
                if (!q.options || q.options.length === 0) {
                    toast.error(`Câu ${q.id}: Vui lòng nhập các đáp án`);
                    return;
                }
                // Note: correctAnswers validation removed to match LessonForm behavior
                // Users can save questions without marking correct answers
            } else if (q.type === 'short-answer') {
                // Note: correctAnswers validation removed to match LessonForm behavior
                // Users can save questions without providing correct answers
            }
        }

        try {
            setSaving(true);
            setSaveStatus('saving');

            const exercise = exerciseId
                ? await khoahocApi.updateBaitapExercise(exerciseId, {
                    questions: convertToBEFormat(currentQuestions)
                })
                : await khoahocApi.createBaitapExercise(lessonId, {
                    courseId,
                    questions: convertToBEFormat(currentQuestions),
                    mustPassToNext: false
                });

            initialContentRef.current = editorContent;
            setSaveStatus('saved');
            toast.success(exerciseId ? 'Đã cập nhật bài tập' : 'Đã tạo bài tập');
            onSave(exercise);
        } catch (err) {
            console.error(err);
            const error = err as Error;
            toast.error(error.message || 'Không thể lưu bài tập');
            setSaveStatus('unsaved');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-[13.5px] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                    {exerciseId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
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

            <div className="flex-1 overflow-hidden">
                <CustomEditorQuestion
                    initialContent={editorContent}
                    onContentChange={handleContentChange}
                    saveStatus={saveStatus}
                />
            </div>
        </div>
    );
}