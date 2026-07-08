'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { toast } from 'sonner';
import * as dautruongApi from '@/lib/api/dautruong.api';
import { Contest, Question as ApiQuestion } from '@/lib/api/dautruong.api';
import CustomEditorQuestion from '@/components/custom/CustomEditorQuestion';

// Editor question format (from CustomEditorQuestion component)
interface EditorQuestion {
    id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    content: string;
    options?: string[];
    correctAnswers?: string[];
    score: number;
    explanation?: string;
}

// Convert database questions to markdown format
const convertQuestionsToMarkdown = (questions: ApiQuestion[]): string => {
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

export default function ContestEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('saved');
    const [editorContent, setEditorContent] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<EditorQuestion[]>([]);
    const [initialContent, setInitialContent] = useState<string>('');

    const saveContest = useCallback(async (content: string, questions: EditorQuestion[]) => {
        if (!contest || saving) return;

        setSaving(true);
        setSaveStatus('saving');
        try {
            // Convert parsed questions to backend format
            const backendQuestions: ApiQuestion[] = questions.map((q, index) => ({
                _id: contest.questions[index]?._id,
                type: q.type,
                question: q.content,
                explanation: q.explanation,
                score: q.score,
                options: q.options?.map((opt, optIndex) => ({
                    _id: contest.questions[index]?.options?.[optIndex]?._id,
                    text: opt.replace(/^[A-Da-d][).]\s*/, ''), // Strip letter prefix before saving
                    isCorrect: q.correctAnswers?.includes(opt.charAt(0)) ?? false
                })),
                trueFalseOptions: q.type === 'true-false' ? q.options?.map((opt, optIndex) => ({
                    text: opt.replace(/^[A-Da-d][).]\s*/, ''), // Strip letter prefix before saving
                    isCorrect: q.correctAnswers?.includes(opt.charAt(0)) ?? false
                })) : undefined,
                correctAnswer: q.type === 'short-answer' ? q.correctAnswers?.[0] : undefined
            }));

            await dautruongApi.updateContest(id as string, {
                ...contest,
                questions: backendQuestions
            });

            setSaveStatus('saved');
        } catch (error) {
            console.error('Auto-save failed:', error);
            setSaveStatus('unsaved');
        } finally {
            setSaving(false);
        }
    }, [contest, id, saving]);

    const handleContentChange = useCallback((content: string, questions: EditorQuestion[]) => {
        setEditorContent(content);
        setParsedQuestions(questions);
        // Only mark as unsaved if content actually changed from initial
        if (content !== initialContent) {
            setSaveStatus('unsaved');
        } else {
            setSaveStatus('saved');
        }
    }, [initialContent]);

    // Debounced auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only auto-save if content has changed from initial and status is unsaved
            if (editorContent && parsedQuestions.length > 0 && saveStatus === 'unsaved') {
                saveContest(editorContent, parsedQuestions);
            }
        }, 500); // Save after 500ms of inactivity (reduced from 2s)

        return () => clearTimeout(timer);
    }, [editorContent, parsedQuestions, saveStatus, saveContest]);

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

    useEffect(() => {
        const loadContest = async () => {
            try {
                console.log('Loading contest with ID:', id);
                const result = await dautruongApi.getAdminContestById(id as string);
                console.log('Contest result:', result);

                const contestData = result.contest || result.data || result;
                console.log('Contest data:', contestData);

                setContest(contestData);

                // Convert questions to markdown format for the editor
                if (contestData.questions && contestData.questions.length > 0) {
                    const markdown = convertQuestionsToMarkdown(contestData.questions);
                    setInitialContent(markdown);
                }
            } catch (error) {
                console.error('Error loading contest:', error);
                toast.error('Không thể tải cuộc thi');
            } finally {
                setLoading(false);
            }
        };
        loadContest();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="p-6">
                <div className="text-center py-10">
                    <p className="text-gray-500">Cuộc thi không tồn tại</p>
                    <Link href="/admin/dautruong" className="mt-4 inline-block">
                        <CustomButton>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                        </CustomButton>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col" style={{ height: '83vh' }}>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dautruong" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold">Soạn câu hỏi: {contest.title}</h1>
                            <p className="text-sm text-gray-500">{contest.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Editor Question */}
            <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                <CustomEditorQuestion
                    initialContent={initialContent}
                    onContentChange={handleContentChange}
                    saveStatus={saveStatus}
                />
            </div>
        </div>
    );
}
