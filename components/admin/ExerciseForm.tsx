'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Save, ClipboardList, Loader2, Pencil } from 'lucide-react';
import { CustomButton } from '../custom/CustomButton';
import CustomEditorCourseExercise from './CustomEditorCourseExercise';
import ExerciseEditorOverlay from './ExerciseEditorOverlay';
import VideoQuizPreviewList from './VideoQuizPreviewList';
import { Exercise } from '@/types/khoahoc.type';
import { toast } from 'sonner';
import { khoahocApi } from '@/lib/api/khoahoc.api';
import { cn } from '@/lib/utils';
import {
    parseContestQuestions,
    type TrueFalseScale,
    type ContestQuestion,
} from '@/components/custom/CustomEditorContest';
import {
    buildScoreOverridesFromQuestions,
    convertContestQuestionsToExerciseFormat,
    DEFAULT_TRUE_FALSE_SCALE,
    extractScoreOverridesFromEditorQuestions,
    getInitialExerciseMarkdown,
    type CourseExerciseEditorQuestion,
} from '@/lib/khoahoc/course-exercise.utils';
import { questionIncomplete, questionMissingAnswer } from '@/lib/luyentap/question-markdown';

interface ExerciseFormProps {
    courseId: string;
    lessonId: string;
    exerciseId?: string;
    initialExercise?: Exercise;
    onSave: (exercise: Exercise) => void;
    onCancel: () => void;
    onExercisePersist?: (exercise: Exercise) => void;
}

function readExerciseDraft(lessonId: string) {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(`exercise_draft_${lessonId}`);
        if (!raw) return null;
        return JSON.parse(raw) as {
            content: string;
            scoreOverrides?: Record<number, number>;
            trueFalseScale?: TrueFalseScale;
        };
    } catch {
        return null;
    }
}

function writeExerciseDraft(
    lessonId: string,
    payload: {
        content: string;
        scoreOverrides: Record<number, number>;
        trueFalseScale: TrueFalseScale;
    },
) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`exercise_draft_${lessonId}`, JSON.stringify(payload));
}

function clearExerciseDraft(lessonId: string) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`exercise_draft_${lessonId}`);
}

export default function ExerciseForm({
    courseId,
    lessonId,
    exerciseId,
    initialExercise,
    onSave,
    onCancel: _onCancel,
    onExercisePersist,
}: ExerciseFormProps) {
    const initialMarkdown = useMemo(
        () => getInitialExerciseMarkdown(initialExercise),
        [initialExercise],
    );
    const initialScoreOverrides = useMemo(
        () => buildScoreOverridesFromQuestions(initialExercise?.questions),
        [initialExercise?.questions],
    );
    const initialTrueFalseScale = useMemo<TrueFalseScale>(
        () => initialExercise?.trueFalseScale ?? DEFAULT_TRUE_FALSE_SCALE,
        [initialExercise?.trueFalseScale],
    );

    const [resolvedExerciseId, setResolvedExerciseId] = useState<string | undefined>(exerciseId);
    const [editorContent, setEditorContent] = useState(initialMarkdown);
    const [editorBootstrap, setEditorBootstrap] = useState(() => ({
        content: initialMarkdown,
        scoreOverrides: initialScoreOverrides,
        trueFalseScale: initialTrueFalseScale,
    }));
    const [editorEpoch, setEditorEpoch] = useState(0);
    const [parsedQuestions, setParsedQuestions] = useState<CourseExerciseEditorQuestion[]>(() =>
        parseContestQuestions(initialMarkdown),
    );
    const [scoreOverrides, setScoreOverrides] = useState<Record<number, number>>(initialScoreOverrides);
    const [trueFalseScale, setTrueFalseScale] = useState<TrueFalseScale>(initialTrueFalseScale);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('saved');
    const [editorOverlayOpen, setEditorOverlayOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [loadingExercise, setLoadingExercise] = useState(!exerciseId && !initialExercise?._id);

    const initialContentRef = useRef(initialMarkdown);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const loadedLessonKeyRef = useRef<string | null>(null);
    const resolvedExerciseIdRef = useRef(resolvedExerciseId ?? exerciseId);

    useEffect(() => {
        resolvedExerciseIdRef.current = resolvedExerciseId ?? exerciseId;
    }, [resolvedExerciseId, exerciseId]);

    useEffect(() => {
        setResolvedExerciseId(exerciseId);
    }, [exerciseId]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const update = () => {
            setIsLargeScreen(mq.matches);
            if (mq.matches) setEditorOverlayOpen(false);
        };
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const applyExerciseSnapshot = useCallback(
        (exercise: Exercise, options?: { fromServer?: boolean }) => {
            const markdown = getInitialExerciseMarkdown(exercise);
            const overrides = buildScoreOverridesFromQuestions(exercise.questions);
            const scale = exercise.trueFalseScale ?? DEFAULT_TRUE_FALSE_SCALE;
            const questions = parseContestQuestions(markdown).map((q) => ({
                ...q,
                score: overrides[q.number] ?? overrides[q.id] ?? q.score ?? 1,
            }));

            setResolvedExerciseId(exercise._id);
            setEditorContent(markdown);
            setEditorBootstrap({
                content: markdown,
                scoreOverrides: overrides,
                trueFalseScale: scale,
            });
            setEditorEpoch((epoch) => epoch + 1);
            setParsedQuestions(questions);
            setScoreOverrides(overrides);
            setTrueFalseScale(scale);
            initialContentRef.current = markdown;
            setSaveStatus('saved');

            if (options?.fromServer) {
                onExercisePersist?.(exercise);
            }
        },
        [onExercisePersist],
    );

    useEffect(() => {
        const lessonKey = `exercise-${lessonId}`;
        if (loadedLessonKeyRef.current === lessonKey) return;

        let cancelled = false;

        const hydrate = async () => {
            setLoadingExercise(true);

            if (initialExercise?._id) {
                loadedLessonKeyRef.current = lessonKey;
                applyExerciseSnapshot(initialExercise);
                setLoadingExercise(false);
                return;
            }

            try {
                const existing = await khoahocApi.getExerciseByLessonId(lessonId);
                if (cancelled) return;

                if (existing?._id) {
                    loadedLessonKeyRef.current = lessonKey;
                    applyExerciseSnapshot(existing, { fromServer: true });
                    setLoadingExercise(false);
                    return;
                }
            } catch (error) {
                console.error('[ExerciseForm] Failed to load exercise:', error);
            }

            const draft = readExerciseDraft(lessonId);
            loadedLessonKeyRef.current = lessonKey;

            if (draft?.content) {
                const questions = parseContestQuestions(draft.content).map((q) => ({
                    ...q,
                    score: draft.scoreOverrides?.[q.number] ?? draft.scoreOverrides?.[q.id] ?? q.score ?? 1,
                }));
                const draftScale = draft.trueFalseScale ?? DEFAULT_TRUE_FALSE_SCALE;
                const draftOverrides = draft.scoreOverrides ?? {};
                setEditorContent(draft.content);
                setEditorBootstrap({
                    content: draft.content,
                    scoreOverrides: draftOverrides,
                    trueFalseScale: draftScale,
                });
                setEditorEpoch((epoch) => epoch + 1);
                setParsedQuestions(questions);
                setScoreOverrides(draftOverrides);
                setTrueFalseScale(draftScale);
                initialContentRef.current = draft.content;
                setSaveStatus('unsaved');
            } else {
                const markdown = getInitialExerciseMarkdown(undefined);
                const questions = parseContestQuestions(markdown);
                setEditorContent(markdown);
                setEditorBootstrap({
                    content: markdown,
                    scoreOverrides: {},
                    trueFalseScale: DEFAULT_TRUE_FALSE_SCALE,
                });
                setEditorEpoch((epoch) => epoch + 1);
                setParsedQuestions(questions);
                initialContentRef.current = markdown;
            }

            setLoadingExercise(false);
        };

        void hydrate();

        return () => {
            cancelled = true;
        };
    }, [applyExerciseSnapshot, initialExercise, lessonId]);

    const resolveQuestionsForSave = useCallback((): CourseExerciseEditorQuestion[] => {
        const source =
            parsedQuestions.length > 0 ? parsedQuestions : parseContestQuestions(editorContent);

        return source.map((q) => ({
            ...q,
            score: q.score ?? scoreOverrides[q.id] ?? scoreOverrides[q.number] ?? 1,
        }));
    }, [parsedQuestions, editorContent, scoreOverrides]);

    const persistExercise = useCallback(
        async (content: string, questions: CourseExerciseEditorQuestion[], scale: TrueFalseScale) => {
            const payload = {
                questions: convertContestQuestionsToExerciseFormat(questions),
                questionMarkdown: content,
                trueFalseScale: scale,
            };

            const currentExerciseId = resolvedExerciseIdRef.current;
            if (currentExerciseId) {
                return khoahocApi.updateBaitapExercise(currentExerciseId, payload);
            }

            const created = await khoahocApi.createBaitapExercise(lessonId, {
                courseId,
                ...payload,
                mustPassToNext: false,
            });

            resolvedExerciseIdRef.current = created._id;
            setResolvedExerciseId(created._id);
            clearExerciseDraft(lessonId);
            return created;
        },
        [courseId, lessonId],
    );

    const autoSave = useCallback(
        async (content: string, questions: CourseExerciseEditorQuestion[], scale: TrueFalseScale) => {
            if (!resolvedExerciseIdRef.current || questions.length === 0) return;

            try {
                setSaveStatus('saving');
                const exercise = await persistExercise(content, questions, scale);
                const savedOverrides = buildScoreOverridesFromQuestions(exercise.questions);
                setScoreOverrides(savedOverrides);
                initialContentRef.current = content;
                setSaveStatus('saved');
                onExercisePersist?.(exercise);
            } catch (err) {
                console.error('[ExerciseForm] Auto-save failed:', err);
                setSaveStatus('unsaved');
            }
        },
        [onExercisePersist, persistExercise],
    );

    const handleContentChange = useCallback(
        (content: string, questions: ContestQuestion[]) => {
            const editorScoreOverrides = extractScoreOverridesFromEditorQuestions(questions);
            const merged = questions as CourseExerciseEditorQuestion[];

            setScoreOverrides((prev) => ({ ...prev, ...editorScoreOverrides }));
            setEditorContent(content);
            setParsedQuestions(merged);

            const nextScoreOverrides = { ...scoreOverrides, ...editorScoreOverrides };

            if (!resolvedExerciseIdRef.current) {
                writeExerciseDraft(lessonId, {
                    content,
                    scoreOverrides: nextScoreOverrides,
                    trueFalseScale,
                });
            }

            setSaveStatus('unsaved');

            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            autoSaveTimeoutRef.current = setTimeout(() => {
                void autoSave(content, merged, trueFalseScale);
            }, 800);
        },
        [autoSave, lessonId, scoreOverrides, trueFalseScale],
    );

    const handleScoreConfigChange = useCallback(
        (config: { scoreOverrides: Record<number, number>; trueFalseScale: TrueFalseScale }) => {
            setScoreOverrides(config.scoreOverrides);
            setTrueFalseScale(config.trueFalseScale);
            setParsedQuestions((prev) =>
                (prev.length > 0 ? prev : parseContestQuestions(editorContent)).map((q) => ({
                    ...q,
                    score: config.scoreOverrides[q.number] ?? config.scoreOverrides[q.id] ?? q.score ?? 1,
                })),
            );
            if (saveStatus === 'saved') setSaveStatus('unsaved');

            if (!resolvedExerciseIdRef.current) {
                writeExerciseDraft(lessonId, {
                    content: editorContent,
                    scoreOverrides: config.scoreOverrides,
                    trueFalseScale: config.trueFalseScale,
                });
            }
        },
        [editorContent, lessonId, saveStatus],
    );

    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    const handleSave = async () => {
        const currentQuestions = resolveQuestionsForSave();

        if (currentQuestions.length === 0) {
            toast.error('Phải có ít nhất 1 câu hỏi');
            return;
        }

        const incomplete = currentQuestions.filter(questionIncomplete);
        if (incomplete.length > 0) {
            toast.error(`Câu chưa đủ nội dung: ${incomplete.map((q) => `Câu ${q.number}`).join(', ')}`);
            return;
        }

        const missing = currentQuestions.filter(questionMissingAnswer);
        if (missing.length > 0) {
            toast.error(`Chưa chọn đáp án: ${missing.map((q) => `Câu ${q.number}`).join(', ')}`);
            return;
        }

        try {
            setSaving(true);
            setSaveStatus('saving');

            const exercise = await persistExercise(editorContent, currentQuestions, trueFalseScale);

            const savedOverrides = buildScoreOverridesFromQuestions(exercise.questions);
            setScoreOverrides(savedOverrides);
            setParsedQuestions((prev) =>
                prev.map((q, index) => ({
                    ...q,
                    score: exercise.questions?.[index]?.score ?? q.score ?? 1,
                })),
            );

            initialContentRef.current = editorContent;
            setSaveStatus('saved');
            toast.success(resolvedExerciseIdRef.current === exerciseId ? 'Đã cập nhật bài tập' : 'Đã tạo bài tập');
            onExercisePersist?.(exercise);
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

    const saveStatusLabel =
        saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'unsaved' ? 'Có thay đổi' : 'Đã lưu';

    const questionCount = parsedQuestions.length;
    const activeExerciseId = resolvedExerciseId ?? exerciseId;

    if (loadingExercise) {
        return (
            <div className="flex h-full items-center justify-center bg-[var(--cn-bg-section,#f8fafc)] dark:bg-gray-950">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <>
            <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--cn-bg-section,#f8fafc)] dark:bg-gray-950">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900 sm:gap-3 sm:px-4 sm:py-3">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 sm:text-[11px]">
                                <ClipboardList className="h-3 w-3" />
                                Bài tập
                            </span>
                            {activeExerciseId ? (
                                <span
                                    className={cn(
                                        'rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:text-[11px]',
                                        saveStatus === 'saved'
                                            ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400'
                                            : saveStatus === 'saving'
                                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                                    )}
                                >
                                    {saveStatusLabel}
                                </span>
                            ) : (
                                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 sm:text-[11px]">
                                    Chưa lưu lần đầu
                                </span>
                            )}
                        </div>
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">
                            {activeExerciseId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
                        </h3>
                    </div>
                    <CustomButton
                        onClick={() => void handleSave()}
                        disabled={saving}
                        size="medium"
                        className="shrink-0 px-2.5 sm:px-4"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin sm:mr-1.5" />
                        ) : (
                            <Save className="h-4 w-4 sm:mr-1.5" />
                        )}
                        <span className="hidden sm:inline">{saving ? 'Đang lưu...' : 'Lưu bài tập'}</span>
                        <span className="sm:hidden">{saving ? '...' : 'Lưu'}</span>
                    </CustomButton>
                </div>

                {isLargeScreen ? (
                    <div className="min-h-0 flex-1 overflow-hidden bg-white">
                        <CustomEditorCourseExercise
                            key={`exercise-editor-${editorEpoch}`}
                            initialContent={editorBootstrap.content}
                            initialScoreOverrides={editorBootstrap.scoreOverrides}
                            initialTrueFalseScale={editorBootstrap.trueFalseScale}
                            onContentChange={handleContentChange}
                            onScoreConfigChange={handleScoreConfigChange}
                            saveStatus={saveStatus}
                        />
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 sm:p-4">
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex flex-col gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Nội dung bài tập
                                    </p>
                                    {questionCount > 0 ? (
                                        <p className="text-xs text-gray-500">{questionCount} câu hỏi</p>
                                    ) : null}
                                </div>
                                <CustomButton
                                    onClick={() => setEditorOverlayOpen(true)}
                                    variant="secondary"
                                    size="small"
                                    className="w-full sm:w-auto"
                                >
                                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                    Soạn bài tập
                                </CustomButton>
                            </div>
                            <div className="max-h-[min(32rem,65vh)] overflow-y-auto p-3 sm:p-4">
                                <VideoQuizPreviewList content={editorContent} />
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {editorOverlayOpen && !isLargeScreen && (
                <ExerciseEditorOverlay
                    title={activeExerciseId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
                    initialContent={editorContent}
                    initialScoreOverrides={scoreOverrides}
                    initialTrueFalseScale={trueFalseScale}
                    saveStatus={saveStatus}
                    saving={saving}
                    onClose={() => setEditorOverlayOpen(false)}
                    onSave={() => void handleSave()}
                    onContentChange={handleContentChange}
                    onScoreConfigChange={handleScoreConfigChange}
                />
            )}
        </>
    );
}
