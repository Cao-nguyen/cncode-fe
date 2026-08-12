import type { PracticeQuestion, PracticeQuestionType, PracticeSet, PracticeStatus, PracticeTier } from '@/types/luyentap.type';
import type { Exercise, Question } from '@/lib/api/luyentap.api';
import type { QuestionShuffleMap } from '@/lib/luyentap/take-shuffle';

export function mapBackendTypeToFrontend(type: string): PracticeQuestionType {
    if (type === 'multiple-choice') return 'quiz';
    if (type === 'multiple-select') return 'multiple-select';
    if (type === 'matching') return 'matching';
    return type as PracticeQuestionType;
}

export function mapFrontendTypeToBackend(type: PracticeQuestionType): Question['type'] {
    if (type === 'quiz') return 'multiple-choice';
    if (type === 'multiple-select') return 'multiple-select';
    if (type === 'matching') return 'matching';
    return type as Question['type'];
}

export function mapBackendStatusToFrontend(status: string): PracticeStatus {
    if (status === 'published') return 'approved';
    if (status === 'rejected') return 'rejected';
    if (status === 'pending') return 'pending';
    return 'draft';
}

export function mapFrontendStatusToBackend(status: PracticeStatus): Exercise['status'] | 'pending' | 'rejected' {
    if (status === 'approved') return 'published';
    return status as 'draft' | 'pending' | 'rejected';
}

export function mapBackendQuestion(q: Question): PracticeQuestion {
    return {
        ...(q as PracticeQuestion),
        _id: q._id,
        type: mapBackendTypeToFrontend(q.type),
        question: q.question,
        groupTitle: q.groupTitle,
        points: (q as PracticeQuestion).points,
        options: q.options,
        trueFalseOptions: q.trueFalseOptions,
        correctAnswer: q.correctAnswer,
        language: (q as PracticeQuestion).language,
        starterCode: (q as PracticeQuestion).starterCode,
        testCases: (q as PracticeQuestion).testCases,
        maxLength: q.type === 'short-answer' ? 4 : undefined,
    };
}

export function mapBackendExercise(ex: Exercise & { questionCount?: number }): PracticeSet & {
    duration?: number;
    difficulty?: string;
    type?: string;
    completionStatus?: string;
} {
    const questionCount = ex.questionCount ?? ex.questions?.length ?? 0;
    return {
        _id: ex._id,
        title: ex.title,
        slug: ex.slug,
        description: ex.description,
        tier: (ex.tier as PracticeTier) || 'free',
        price: ex.price,
        discountType: ex.discountType,
        discountValue: ex.discountValue,
        discountPrice: ex.discountPrice,
        allowCoinPayment: ex.allowCoinPayment,
        status: mapBackendStatusToFrontend(ex.status),
        questions: (ex.questions || []).map(mapBackendQuestion),
        timeLimit: ex.duration,
        passThreshold: ex.passThreshold || 80,
        questionCount,
        attemptCount: ex.participantCount,
        createdAt: ex.createdAt,
        updatedAt: ex.updatedAt,
        duration: ex.duration,
        difficulty: (ex as Exercise & { difficulty?: string }).difficulty || 'medium',
        folderId: typeof ex.folderId === 'object' && ex.folderId?._id
            ? ex.folderId._id
            : (ex.folderId as string | null | undefined) ?? null,
        folder: typeof ex.folderId === 'object' && ex.folderId?._id
            ? { _id: ex.folderId._id, name: ex.folderId.name }
            : null,
        type: (ex.tier as string) === 'pro' ? 'vip' : 'free',
        completionStatus: 'not_started',
        grade: ex.grade,
        examPurpose: ex.examPurpose,
        deliveryFrom: ex.deliveryFrom,
        deliveryTo: ex.deliveryTo,
        hasExamPassword: ex.hasExamPassword,
        hideLeaderboard: ex.hideLeaderboard,
        preExamNoticeEnabled: ex.preExamNoticeEnabled,
        preExamNotice: ex.preExamNotice,
        availability: ex.availability,
        maxAttempts: ex.maxAttempts,
        totalPoints: ex.totalPoints ?? 0,
    };
}

export function buildSubmitPayload(
    questions: PracticeQuestion[],
    answers: Record<string, unknown>,
    options?: {
        originalQuestions?: PracticeQuestion[];
        shuffles?: Record<string, QuestionShuffleMap>;
    },
) {
    const originalById = new Map(
        (options?.originalQuestions ?? questions).map((question) => [question._id!, question]),
    );

    return questions.map((q) => {
        const qId = q._id!;
        const answer = answers[qId];
        const base = { questionId: qId };

        if (q.type === 'quiz') {
            const opt = q.options?.[answer as number];
            return { ...base, selectedOption: opt?._id };
        }
        if (q.type === 'multiple-select') {
            const indices = (answer as number[]) || [];
            return {
                ...base,
                selectedOptions: indices
                    .map((i) => q.options?.[i]?._id)
                    .filter(Boolean),
            };
        }
        if (q.type === 'matching') {
            const userPairs = (answer as Array<{ leftIndex: number; rightIndex: number }>) || [];
            const shuffle = options?.shuffles?.[qId];
            const matchingAnswers = userPairs.map((pair) => ({
                leftIndex: pair.leftIndex,
                rightIndex: shuffle?.matchingRight?.[pair.rightIndex] ?? pair.rightIndex,
            }));
            return { ...base, matchingAnswers };
        }
        if (q.type === 'true-false') {
            const raw = (answer as Array<{ optionId?: string; answer: boolean; optionIndex?: number; isTrue?: boolean }>) || [];
            const originalQuestion = originalById.get(qId);
            const trueFalseAnswers = raw.map((entry) => {
                if (typeof entry.optionIndex === 'number') {
                    return {
                        optionIndex: entry.optionIndex,
                        isTrue: entry.isTrue ?? entry.answer,
                    };
                }

                const optionId = entry.optionId;
                const originalIndex = originalQuestion?.trueFalseOptions?.findIndex(
                    (option, index) => String(option._id ?? index) === String(optionId),
                ) ?? -1;

                return {
                    optionIndex: Math.max(0, originalIndex),
                    isTrue: entry.answer,
                };
            });
            return { ...base, trueFalseAnswers };
        }
        if (q.type === 'short-answer') {
            return { ...base, shortAnswer: String(answer || '') };
        }
        if (q.type === 'essay') {
            return { ...base, essayAnswer: String(answer || '') };
        }
        if (q.type === 'code') {
            return { ...base, codeAnswer: String(answer || '') };
        }
        return base;
    });
}
