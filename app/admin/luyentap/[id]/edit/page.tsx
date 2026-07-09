'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { toast } from 'sonner';
import { luyentapApi } from '@/lib/api/luyentap.api';
import CustomEditorContest from '@/components/custom/CustomEditorContest';

// Editor question format (from CustomEditorContest component)
interface EditorQuestion {
    id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    content: string;
    options?: string[];
    correctAnswers?: string[];
    score: number;
    explanation?: string;
}

interface Question {
    _id?: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question: string;
    explanation?: string;
    options?: Array<{ _id?: string; text: string; isCorrect: boolean }>;
    trueFalseOptions?: Array<{ text: string; isCorrect: boolean }>;
    correctAnswer?: string;
}

interface Exercise {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    duration: number;
    questions: Question[];
    totalPoints: number;
    status: 'draft' | 'published';
    maxAttempts: number;
}

// Convert database questions to markdown format
const convertQuestionsToMarkdown = (questions: Question[]): string => {
    if (!questions || questions.length === 0) return '';

    return questions.map((q, index) => {
        const questionNumber = index + 1;
        let markdown = `Câu ${questionNumber}. ${q.question}\n`;

        // Add options for multiple-choice and true-false
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
            const options = q.type === 'true-false' ? q.trueFalseOptions : q.options;
            if (options) {
                options.forEach((opt, optIndex) => {
                    const letter = q.type === 'true-false'
                        ? String.fromCharCode(97 + optIndex) // a, b, c, d
                        : String.fromCharCode(65 + optIndex); // A, B, C, D
                    const separator = q.type === 'true-false' ? '.' : '.';
                    const prefix = opt.isCorrect ? '*' : '';
                    markdown += `${prefix}${letter}${separator} ${opt.text}\n`;
                });
            }
        }

        // Add correct answer for short-answer
        if (q.type === 'short-answer' && q.correctAnswer) {
            markdown += `[${q.correctAnswer}]\n`;
        }

        // Add explanation if exists
        if (q.explanation) {
            markdown += `{LG: ${q.explanation}}\n`;
        }

        return markdown;
    }).join('\n');
};

export default function ExerciseEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('saved');
    const [editorContent, setEditorContent] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<EditorQuestion[]>([]);
    const [initialContent, setInitialContent] = useState<string>('');

    const saveExercise = useCallback(async (content: string, questions: EditorQuestion[]) => {
        if (!exercise || saving) return;

        setSaving(true);
        setSaveStatus('saving');
        try {
            // Convert parsed questions to backend format
            const backendQuestions: Question[] = questions.map((q, index) => ({
                _id: exercise.questions[index]?._id,
                type: q.type,
                question: q.content,
                explanation: q.explanation,
                options: q.type === 'multiple-choice' ? q.options?.map((opt, optIndex) => ({
                    _id: exercise.questions[index]?.options?.[optIndex]?._id,
                    text: opt.replace(/^[A-Da-d][).]\s*/, ''), // Strip letter prefix before saving
                    isCorrect: q.correctAnswers?.includes(opt.charAt(0)) ?? false
                })) : undefined,
                trueFalseOptions: q.type === 'true-false' ? q.options?.map((opt) => ({
                    text: opt.replace(/^[A-Da-d][).]\s*/, ''), // Strip letter prefix before saving
                    isCorrect: q.correctAnswers?.includes(opt.charAt(0)) ?? false
                })) : undefined,
                correctAnswer: q.type === 'short-answer' ? q.correctAnswers?.[0] : undefined
            }));

            await luyentapApi.adminUpdate(id as string, {
                ...exercise,
                questions: backendQuestions
            });

            setSaveStatus('saved');
            toast.success('Đã lưu thành công');
        } catch (error) {
            console.error('Failed to save exercise:', error);
            toast.error('Lỗi khi lưu bài tập');
            setSaveStatus('unsaved');
        } finally {
            setSaving(false);
        }
    }, [exercise, id, saving]);

    const handleContentChange = useCallback((content: string, questions: EditorQuestion[]) => {
        setEditorContent(content);
        setParsedQuestions(questions);
        if (saveStatus === 'saved') {
            setSaveStatus('unsaved');
        }
    }, [saveStatus]);

    const handleManualSave = () => {
        saveExercise(editorContent, parsedQuestions);
    };

    useEffect(() => {
        const loadExercise = async () => {
            try {
                const res = await luyentapApi.adminGetById(id as string);
                if (res.success) {
                    const data = res.data;
                    setExercise(data);
                    const markdown = convertQuestionsToMarkdown(data.questions || []);
                    setInitialContent(markdown);
                    setEditorContent(markdown);
                }
            } catch (error) {
                console.error('Failed to load exercise:', error);
                toast.error('Không thể tải bài tập');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadExercise();
        }
    }, [id]);

    // Auto-save every 3 seconds when there are unsaved changes
    useEffect(() => {
        if (saveStatus !== 'unsaved' || !exercise) return;

        const timer = setTimeout(() => {
            saveExercise(editorContent, parsedQuestions);
        }, 3000);

        return () => clearTimeout(timer);
    }, [saveStatus, editorContent, parsedQuestions, exercise, saveExercise]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-gray-600">Không tìm thấy bài tập</p>
                <Link href="/admin/luyentap">
                    <CustomButton variant="secondary">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </CustomButton>
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/luyentap">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{exercise.title}</h1>
                        <p className="text-sm text-gray-500">Chỉnh sửa bài tập</p>
                    </div>
                </div>
                <CustomButton onClick={handleManualSave} loading={saving}>
                    <Save className="w-4 h-4" /> Lưu ngay
                </CustomButton>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <CustomEditorContest
                    initialContent={initialContent}
                    onContentChange={handleContentChange}
                    saveStatus={saveStatus}
                />
            </div>
        </div>
    );
}