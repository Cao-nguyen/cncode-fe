'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { toast } from 'sonner';
import type { LuyentapFolder } from '@/types/luyentap.type';
import { luyentapApi } from '@/lib/api/luyentap.api';
import CustomEditorContest, { type TrueFalseScale } from '@/components/custom/CustomEditorContest';
import LuyentapExerciseConfigOverlay, { type ExerciseConfigForm } from '@/components/luyentap/LuyentapExerciseConfigOverlay';
import LuyentapExerciseSettingsOverlay from '@/components/luyentap/LuyentapExerciseSettingsOverlay';
import {
    type ExerciseSettingsForm,
    buildSettingsForm,
    settingsFormToPayload,
} from '@/lib/luyentap/exercise-settings.types';
import {
    type WebRequirement,
    serializeWebRequirement,
    questionMissingAnswer,
    resolveEditorQuestionText,
} from '@/lib/luyentap/question-markdown';
import {
    serializeAlgorithmQuestionBody,
} from '@/lib/luyentap/algorithm-question-markdown';
import { parseAlgorithmQuestionDisplay } from '@/lib/luyentap/algorithm-question-display';

interface EditorQuestion {
    id: number;
    number: number;
    groupTitle?: string;
    type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'matching' | 'short-answer' | 'essay' | 'code';
    content: string;
    options?: string[];
    correctAnswers?: string[];
    leftItems?: string[];
    rightItems?: string[];
    matchingPairs?: Array<{ left: string; right: string }>;
    score: number;
    explanation?: string;
    codeMode?: 'algorithm' | 'web';
    language?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isSample: boolean }>;
    algoRequirement?: string;
    algoInputDesc?: string;
    algoOutputDesc?: string;
    webRequirements?: WebRequirement[];
}

interface Question {
    _id?: string;
    type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'matching' | 'short-answer' | 'essay' | 'code';
    question: string;
    groupTitle?: string;
    explanation?: string;
    points?: number;
    options?: Array<{ _id?: string; text: string; isCorrect: boolean }>;
    trueFalseOptions?: Array<{ text: string; isCorrect: boolean }>;
    leftItems?: Array<{ text: string }>;
    rightItems?: Array<{ text: string }>;
    matchingPairs?: Array<{ leftIndex: number; rightIndex: number }>;
    correctAnswer?: string;
    codeMode?: 'algorithm' | 'web';
    language?: string;
    testCases?: Array<{ input?: string; expectedOutput?: string; isSample?: boolean }>;
    webRequirements?: WebRequirement[];
}

interface Exercise {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    grade?: string;
    examPurpose?: string;
    deliveryFrom?: string;
    deliveryTo?: string;
    examPassword?: string;
    proctoring?: 'off' | 'tab-switch';
    verifyStudentInfo?: boolean;
    studentInfoFields?: {
        fullName?: boolean;
        className?: boolean;
        custom?: Array<{ label: string; required?: boolean }>;
    };
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    essayKeyboard?: 'basic' | 'math' | 'editor';
    showScoreWhen?: 'never' | 'after-submit' | 'after-expiry';
    showAnswersWhen?: 'never' | 'after-submit' | 'after-expiry';
    hideLeaderboard?: boolean;
    preExamNoticeEnabled?: boolean;
    preExamNotice?: string;
    thumbnail?: string;
    duration: number;
    difficulty?: ExerciseSettingsForm['difficulty'];
    folderId?: string | null | { _id?: string; name?: string };
    questions: Question[];
    totalPoints: number;
    status: 'draft' | 'pending' | 'published';
    maxAttempts: number;
    trueFalseScale?: TrueFalseScale;
}

const convertDbQuestionsToMarkdown = (questions: Question[]): string => {
    if (!questions?.length) return '';
    let lastGroup = '';
    return questions.map((q, index) => {
        const parts: string[] = [];
        if (q.groupTitle && q.groupTitle !== lastGroup) {
            parts.push(q.groupTitle);
            lastGroup = q.groupTitle;
        }
        const n = index + 1;
        const algoParsed = q.type === 'code' && q.codeMode === 'algorithm'
            ? parseAlgorithmQuestionDisplay(q.question || '')
            : null;
        let markdown = `Câu ${n}. ${algoParsed?.intro?.trim() || q.question}\n`;
        if (q.type === 'multiple-choice' || q.type === 'multiple-select' || q.type === 'true-false') {
            if (q.type === 'multiple-select') markdown += '{ms}\n';
            const options = q.type === 'true-false' ? q.trueFalseOptions : q.options;
            options?.forEach((opt, optIndex) => {
                const letter = q.type === 'true-false'
                    ? String.fromCharCode(97 + optIndex)
                    : String.fromCharCode(65 + optIndex);
                const prefix = opt.isCorrect ? '*' : '';
                const sep = q.type === 'true-false' ? ')' : '.';
                markdown += `${prefix}${letter}${sep} ${opt.text}\n`;
            });
        }
        if (q.type === 'matching') {
            markdown += '{match}\n';
            q.leftItems?.forEach((item, i) => {
                markdown += `${i + 1}. ${item.text}\n`;
            });
            q.rightItems?.forEach((item, i) => {
                markdown += `${String.fromCharCode(97 + i)}. ${item.text}\n`;
            });
            q.matchingPairs?.forEach((pair) => {
                markdown += `*${pair.leftIndex + 1}-${String.fromCharCode(97 + pair.rightIndex)}\n`;
            });
        }
        if (q.type === 'short-answer' && q.correctAnswer) {
            markdown += `*${q.correctAnswer}\n`;
        }
        if (q.type === 'code' && q.codeMode) {
            if (q.codeMode === 'web') {
                markdown += '{web}\n';
                q.webRequirements?.forEach((req) => {
                    markdown += `${serializeWebRequirement(req)}\n`;
                });
            } else {
                serializeAlgorithmQuestionBody({
                    algoRequirement: algoParsed?.requirementDesc,
                    algoInputDesc: algoParsed?.inputDesc,
                    algoOutputDesc: algoParsed?.outputDesc,
                    testCases: q.testCases?.map((tc) => ({
                        input: tc.input || '',
                        expectedOutput: tc.expectedOutput || '',
                        isSample: tc.isSample ?? false,
                    })),
                }).forEach((line) => {
                    markdown += `${line}\n`;
                });
            }
        }
        if (q.explanation) markdown += `{lg: ${q.explanation}}\n`;
        parts.push(markdown);
        return parts.join('\n');
    }).join('\n');
};

const convertQuestionsToMarkdown = (questions: EditorQuestion[]): string => {
    if (!questions?.length) return '';
    let lastGroup = '';
    return questions.map((q) => {
        const parts: string[] = [];
        if (q.groupTitle && q.groupTitle !== lastGroup) {
            parts.push(q.groupTitle);
            lastGroup = q.groupTitle;
        }
        let markdown = `Câu ${q.number}. ${q.content}\n`;
        if (q.type === 'multiple-select') markdown += '{ms}\n';
        if (q.type === 'multiple-choice' || q.type === 'multiple-select' || q.type === 'true-false') {
            q.options?.forEach((opt) => {
                markdown += `${opt}\n`;
            });
        }
        if (q.type === 'matching') {
            markdown += '{match}\n';
            q.leftItems?.forEach((text, i) => {
                markdown += `${i + 1}. ${text}\n`;
            });
            q.rightItems?.forEach((text, i) => {
                markdown += `${String.fromCharCode(97 + i)}. ${text}\n`;
            });
            q.matchingPairs?.forEach((pair) => {
                markdown += `*${pair.left}-${pair.right}\n`;
            });
        }
        if (q.type === 'short-answer' && q.correctAnswers?.[0]) {
            markdown += `*${q.correctAnswers[0]}\n`;
        }
        if (q.type === 'code' && q.codeMode) {
            if (q.codeMode === 'web') {
                markdown += '{web}\n';
                q.webRequirements?.forEach((req) => {
                    markdown += `${serializeWebRequirement(req)}\n`;
                });
            } else {
                serializeAlgorithmQuestionBody({
                    algoRequirement: q.algoRequirement,
                    algoInputDesc: q.algoInputDesc,
                    algoOutputDesc: q.algoOutputDesc,
                    testCases: q.testCases,
                }).forEach((line) => {
                    markdown += `${line}\n`;
                });
            }
        }
        if (q.explanation) markdown += `{lg: ${q.explanation}}\n`;
        parts.push(markdown.trimEnd());
        return parts.join('\n');
    }).join('\n');
};

interface LuyentapExerciseEditorOverlayProps {
    exerciseId: string;
    isUpload?: boolean;
    uploadMarkdown?: string;
    onClose?: (exercise?: Exercise | null) => void;
}

export default function LuyentapExerciseEditorOverlay({
    exerciseId,
    isUpload = false,
    uploadMarkdown,
    onClose,
}: LuyentapExerciseEditorOverlayProps) {
    const router = useRouter();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('saved');
    const [editorContent, setEditorContent] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<EditorQuestion[]>([]);
    const [initialContent, setInitialContent] = useState('');
    const [initialScoreOverrides, setInitialScoreOverrides] = useState<Record<number, number>>({});
    const [trueFalseScale, setTrueFalseScale] = useState<TrueFalseScale>({
        correct1: 10,
        correct2: 25,
        correct3: 50,
        correct4: 100,
    });
    const [showConfigOverlay, setShowConfigOverlay] = useState(false);
    const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [configForm, setConfigForm] = useState<ExerciseConfigForm>({
        title: '',
        grade: '',
        examPurpose: '',
        description: '',
    });
    const [settingsForm, setSettingsForm] = useState<ExerciseSettingsForm>(
        buildSettingsForm({ title: '', grade: '', examPurpose: '', description: '' }),
    );
    const [folders, setFolders] = useState<LuyentapFolder[]>([]);

    const folderOptions = folders.map((folder) => ({
        value: folder._id,
        label: folder.name,
    }));

    const handleClose = useCallback(() => {
        if (onClose) {
            onClose(exercise);
        } else {
            router.replace('/admin/luyentap');
        }
    }, [onClose, router, exercise]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const buildBackendQuestions = useCallback((questions: EditorQuestion[]): Question[] => {
        if (!exercise) return [];
        return questions.map((q, index) => ({
            _id: exercise.questions[index]?._id,
            type: q.type,
            question: resolveEditorQuestionText(q, index),
            groupTitle: q.groupTitle,
            explanation: q.explanation,
            points: q.score,
            options: (q.type === 'multiple-choice' || q.type === 'multiple-select') ? q.options?.map((opt, optIndex) => ({
                _id: exercise.questions[index]?.options?.[optIndex]?._id,
                text: opt.replace(/^[A-Da-d][).]\s*/, ''),
                isCorrect: q.correctAnswers?.some((ans) => ans.toUpperCase() === opt.charAt(0).toUpperCase()) ?? false,
            })) : undefined,
            trueFalseOptions: q.type === 'true-false' ? q.options?.map((opt) => ({
                text: opt.replace(/^[A-Da-d][).]\s*/, ''),
                isCorrect: q.correctAnswers?.includes(opt.charAt(0).toLowerCase()) ?? false,
            })) : undefined,
            leftItems: q.type === 'matching' ? q.leftItems?.map((text) => ({ text })) : undefined,
            rightItems: q.type === 'matching' ? q.rightItems?.map((text) => ({ text })) : undefined,
            matchingPairs: q.type === 'matching' ? q.matchingPairs?.map((pair) => ({
                leftIndex: parseInt(pair.left, 10) - 1,
                rightIndex: pair.right.charCodeAt(0) - 97,
            })) : undefined,
            correctAnswer: q.type === 'short-answer' ? q.correctAnswers?.[0] : undefined,
            codeMode: q.type === 'code' ? q.codeMode : undefined,
            language: q.type === 'code' ? q.language : undefined,
            testCases: q.type === 'code' && q.codeMode === 'algorithm' ? q.testCases : undefined,
            webRequirements: q.type === 'code' && q.codeMode === 'web' ? q.webRequirements : undefined,
        }));
    }, [exercise]);

    const saveExercise = useCallback(async (
        content: string,
        questions: EditorQuestion[],
        config: ExerciseConfigForm,
        settings?: Partial<ExerciseSettingsForm>,
        options?: { status?: Exercise['status']; publish?: boolean; draft?: boolean },
    ) => {
        if (!exercise || saving) return false;
        const nextTitle = config.title.trim();
        const isDraft = options?.draft;

        if (!nextTitle) {
            if (!isDraft) toast.error('Nhập tên bài tập');
            return false;
        }
        if (!isDraft) {
            if (!config.grade) {
                toast.error('Chọn khối học');
                return false;
            }
            if (!config.examPurpose) {
                toast.error('Chọn mục đích tạo đề');
                return false;
            }
        }
        const mergedSettings = settings ? buildSettingsForm(config, { ...exercise, ...settings }) : null;
        if (mergedSettings && mergedSettings.duration < 1) {
            toast.error('Thời gian làm bài phải lớn hơn 0');
            return false;
        }
        if (options?.publish) {
            setPublishing(true);
        } else {
            setSaving(true);
        }
        setSaveStatus('saving');
        try {
            const backendQuestions = buildBackendQuestions(questions);
            const emptyQuestions = backendQuestions
                .map((q, index) => ({ number: questions[index]?.number ?? index + 1, question: q.question }))
                .filter(({ question }) => !question?.trim());

            if (emptyQuestions.length > 0) {
                toast.error(`Thiếu nội dung câu hỏi: ${emptyQuestions.map((q) => `Câu ${q.number}`).join(', ')}`);
                setSaveStatus('unsaved');
                return false;
            }

            const settingsPayload = mergedSettings ? settingsFormToPayload(mergedSettings) : {
                title: nextTitle,
                description: config.description,
                ...(config.grade ? { grade: config.grade } : {}),
                ...(config.examPurpose ? { examPurpose: config.examPurpose } : {}),
                duration: exercise.duration || 60,
            };

            await luyentapApi.adminUpdate(exerciseId, {
                ...exercise,
                ...settingsPayload,
                questions: backendQuestions,
                trueFalseScale,
                ...(options?.status ? { status: options.status } : {}),
            });
            setExercise((prev) => (prev ? {
                ...prev,
                ...settingsPayload,
                title: nextTitle,
                ...(options?.status ? { status: options.status } : {}),
            } : prev));
            setTitle(nextTitle);
            setSaveStatus('saved');
            return true;
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || (options?.publish ? 'Lỗi khi xuất bản' : 'Lỗi khi lưu bài tập'));
            setSaveStatus('unsaved');
            return false;
        } finally {
            setSaving(false);
            setPublishing(false);
        }
    }, [exercise, exerciseId, saving, trueFalseScale, buildBackendQuestions]);

    const handleScoreConfigChange = useCallback((config: {
        scoreOverrides: Record<number, number>;
        trueFalseScale: TrueFalseScale;
    }) => {
        setTrueFalseScale(config.trueFalseScale);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    }, [saveStatus]);

    const handleContinue = () => {
        if (parsedQuestions.length === 0) {
            toast.error('Đề chưa có câu hỏi');
            return;
        }
        const missing = parsedQuestions.filter(questionMissingAnswer);
        if (missing.length > 0) {
            const list = missing.map((q) => `Câu ${q.number}`).join(', ');
            toast.error(`Chưa chọn đáp án: ${list}`);
            return;
        }
        setConfigForm({
            title: title.trim(),
            grade: exercise?.grade || '',
            examPurpose: exercise?.examPurpose || '',
            description: exercise?.description || '',
        });
        setShowConfigOverlay(true);
    };

    const handleConfigSubmit = async () => {
        const ok = await saveExercise(editorContent, parsedQuestions, configForm);
        if (ok) {
            toast.success('Đã lưu đề');
            setSettingsForm(buildSettingsForm(configForm, exercise));
            setShowConfigOverlay(false);
            setShowSettingsOverlay(true);
        }
    };

    const handleSettingsChange = (patch: Partial<ExerciseSettingsForm>) => {
        setSettingsForm((prev) => ({ ...prev, ...patch }));
        if (patch.title !== undefined) setTitle(patch.title);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    };

    const handlePublish = async () => {
        const ok = await saveExercise(
            editorContent,
            parsedQuestions,
            {
                title: settingsForm.title,
                grade: settingsForm.grade,
                examPurpose: settingsForm.examPurpose,
                description: settingsForm.description,
            },
            settingsForm,
            { status: 'published', publish: true },
        );
        if (ok) {
            toast.success('Đã xuất bản');
            handleClose();
        }
    };

    const handleConfigChange = (patch: Partial<ExerciseConfigForm>) => {
        setConfigForm((prev) => ({ ...prev, ...patch }));
        if (patch.title !== undefined) setTitle(patch.title);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    };

    const canContinue = useMemo(
        () => parsedQuestions.length > 0 && parsedQuestions.every((q) => !questionMissingAnswer(q)),
        [parsedQuestions]
    );

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    };
    const handleContentChange = useCallback((content: string, questions: EditorQuestion[]) => {
        setEditorContent(content);
        setParsedQuestions(questions);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    }, [saveStatus]);

    useEffect(() => {
        luyentapApi.adminListFolders()
            .then((res) => {
                const data = res.data || res;
                setFolders(data.folders || []);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await luyentapApi.adminGetById(exerciseId);
                if (res.success !== false) {
                    const data = res.data || res;
                    setExercise(data);
                    setTitle(data.title || '');
                    if (data.trueFalseScale) {
                        setTrueFalseScale(data.trueFalseScale);
                    }
                    const scoreMap: Record<number, number> = {};
                    data.questions?.forEach((q: Question, index: number) => {
                        if (q.points != null) scoreMap[index + 1] = q.points;
                    });
                    setInitialScoreOverrides(scoreMap);
                    let markdown = '';
                    if (isUpload) {
                        if (uploadMarkdown) {
                            markdown = uploadMarkdown;
                        } else {
                            const uploaded = sessionStorage.getItem(`luyentap-upload-${exerciseId}`);
                            if (uploaded) {
                                markdown = uploaded;
                                sessionStorage.removeItem(`luyentap-upload-${exerciseId}`);
                            }
                        }
                    } else if (data.questions?.length) {
                        markdown = convertDbQuestionsToMarkdown(data.questions);
                    }
                    setInitialContent(markdown);
                    setEditorContent(markdown);
                }
            } catch {
                toast.error('Không thể tải bài tập');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [exerciseId, isUpload, uploadMarkdown]);

    useEffect(() => {
        if (saveStatus !== 'unsaved' || !exercise || showConfigOverlay || showSettingsOverlay) return;
        const timer = setTimeout(() => {
            saveExercise(editorContent, parsedQuestions, {
                title,
                grade: exercise.grade || configForm.grade,
                examPurpose: exercise.examPurpose || configForm.examPurpose,
                description: exercise.description || configForm.description,
            }, undefined, { draft: true });
        }, 3000);
        return () => clearTimeout(timer);
    }, [saveStatus, editorContent, parsedQuestions, exercise, saveExercise, title, showConfigOverlay, showSettingsOverlay, configForm]);

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
            <header className="flex-shrink-0 grid grid-cols-[1fr_minmax(0,72rem)_1fr] items-center gap-3 sm:gap-6 px-4 sm:px-6 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 justify-self-start">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
                        title="Quay lại"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <Image
                        src="/images/logo.png"
                        alt="CNcode"
                        width={90}
                        height={36}
                        className="h-8 w-auto shrink-0 hidden sm:block"
                    />
                    <Image
                        src="/images/logo.png"
                        alt="CNcode"
                        width={60}
                        height={24}
                        className="h-6 w-auto shrink-0 sm:hidden"
                    />
                </div>

                <div className="flex items-center gap-4 w-full min-w-0 px-2 sm:px-6">
                    <div className="flex-1 min-w-0">
                        <CustomInput
                            placeholder="Nhập tên bài tập..."
                            value={title}
                            onChange={handleTitleChange}
                            disabled={loading || !exercise}
                        />
                    </div>
                    <CustomButton
                        onClick={handleContinue}
                        disabled={loading || !exercise || !canContinue}
                        className="shrink-0 whitespace-nowrap"
                    >
                        Tiếp tục
                    </CustomButton>
                </div>

                <div aria-hidden="true" />
            </header>
            <div className="flex-1 min-h-0 bg-white overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full bg-white">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : !exercise ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 bg-white">
                        <p className="text-gray-500">Không tìm thấy bài tập</p>
                        <CustomButton variant="secondary" onClick={handleClose}>Quay lại</CustomButton>
                    </div>
                ) : (
                    <CustomEditorContest
                        initialContent={initialContent}
                        initialScoreOverrides={initialScoreOverrides}
                        initialTrueFalseScale={trueFalseScale}
                        onContentChange={handleContentChange}
                        onScoreConfigChange={handleScoreConfigChange}
                        saveStatus={saveStatus}
                    />
                )}
            </div>

            {showConfigOverlay && (
                <LuyentapExerciseConfigOverlay
                    form={configForm}
                    saving={saving}
                    onChange={handleConfigChange}
                    onBack={() => setShowConfigOverlay(false)}
                    onSubmit={handleConfigSubmit}
                />
            )}

            {showSettingsOverlay && (
                <LuyentapExerciseSettingsOverlay
                    form={settingsForm}
                    saving={saving}
                    publishing={publishing}
                    folderOptions={folderOptions}
                    onChange={handleSettingsChange}
                    onBack={() => setShowSettingsOverlay(false)}
                    onPublish={handlePublish}
                />
            )}
        </div>
    );
}
