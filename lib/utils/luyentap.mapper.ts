import type { PracticeQuestion, PracticeQuestionType, PracticeSet, PracticeStatus, PracticeTier } from '@/types/luyentap.type';
import type { Exercise, Question } from '@/lib/api/luyentap.api';

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
        type: (ex.tier as string) === 'pro' ? 'vip' : 'free',
        completionStatus: 'not_started',
    };
}

export function buildSubmitPayload(
    questions: PracticeQuestion[],
    answers: Record<string, unknown>
) {
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
            return { ...base, matchingAnswers: answer as Array<{ leftIndex: number; rightIndex: number }> };
        }
        if (q.type === 'true-false') {
            return { ...base, trueFalseAnswers: answer as Array<{ optionIndex: number; isTrue: boolean }> };
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
