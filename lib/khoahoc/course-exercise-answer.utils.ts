import type { ExerciseQuestion } from '@/types/khoahoc.type';
import type { PracticeAnswer, PracticeQuestion, PracticeQuestionType } from '@/types/luyentap.type';
import {
    getOptionLetter,
    getOptionText,
    getTrueFalseLetter,
    serializeMatchingAnswer,
} from '@/lib/khoahoc/video-quiz-answer.utils';

export function resolveExerciseQuestionId(question: ExerciseQuestion, index: number): string {
    return question._id ? String(question._id) : String(index);
}

function mapExerciseType(type: ExerciseQuestion['type']): PracticeQuestionType {
    if (type === 'quiz' || type === 'multiple-choice') return 'quiz';
    if (type === 'ide') return 'code';
    return type as PracticeQuestionType;
}

function normalizeQuizOptions(question: ExerciseQuestion) {
    if (question.legacyOptions?.length) {
        return question.legacyOptions.map((opt) => ({ text: opt.text }));
    }

    return (question.options || []).map((opt) => {
        if (typeof opt === 'string') return { text: getOptionText(opt) };
        return { text: opt.text };
    });
}

function normalizeTrueFalseOptions(question: ExerciseQuestion) {
    if (question.trueFalseOptions?.length) {
        return question.trueFalseOptions.map((opt, index) => ({
            _id: String.fromCharCode(97 + index),
            text: opt.text,
        }));
    }

    return (question.options || []).map((opt, index) => ({
        _id: getTrueFalseLetter(typeof opt === 'string' ? opt : `${String.fromCharCode(97 + index)}. ${opt.text}`, index),
        text: typeof opt === 'string' ? getOptionText(opt) : opt.text,
    }));
}

function normalizeMatchingItems(items?: string[]) {
    return (items || []).map((text) => ({ text }));
}

export function exerciseQuestionToPracticeQuestion(
    question: ExerciseQuestion,
    index: number,
): PracticeQuestion {
    const type = mapExerciseType(question.type);
    const id = resolveExerciseQuestionId(question, index);

    const base: PracticeQuestion = {
        _id: id,
        type,
        question: question.question,
        points: question.score ?? 1,
        groupTitle: question.groupTitle,
    };

    if (type === 'quiz' || type === 'multiple-select') {
        base.options = normalizeQuizOptions(question);
    }

    if (type === 'true-false') {
        base.trueFalseOptions = normalizeTrueFalseOptions(question);
    }

    if (type === 'short-answer') {
        base.correctAnswer = question.correctAnswers?.[0] || question.correctAnswer;
        base.maxLength = question.maxLength;
    }

    if (type === 'matching') {
        base.leftItems = normalizeMatchingItems(question.leftItems);
        base.rightItems = normalizeMatchingItems(question.rightItems);
        base.matchingPairs = (question.matchingPairs || []).map((pair) => ({
            leftIndex: Number(pair.left) - 1,
            rightIndex: String(pair.right).toLowerCase().charCodeAt(0) - 97,
        }));
    }

    if (type === 'code') {
        base.codeMode = question.codeMode || (question.type === 'ide' ? 'algorithm' : 'algorithm');
        base.language = (question.language as PracticeQuestion['language']) || 'javascript';
        base.starterCode = question.starterCode || '';
        base.testCases = question.testCases;
        base.webRequirements = (question.webRequirements || []) as PracticeQuestion['webRequirements'];
    }

    return base;
}

export function exerciseQuestionsToPracticeQuestions(questions: ExerciseQuestion[]): PracticeQuestion[] {
    return questions.map((question, index) => exerciseQuestionToPracticeQuestion(question, index));
}

const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function serializeCourseExerciseAnswer(
    question: PracticeQuestion,
    answer: PracticeAnswer['answer'] | undefined,
): string {
    if (answer === undefined || answer === null) return '';

    switch (question.type) {
        case 'quiz': {
            if (typeof answer !== 'number') return '';
            return getOptionLetter(question.options?.[answer]?.text || '', answer);
        }
        case 'multiple-select': {
            const indices = Array.isArray(answer) ? (answer as number[]) : [];
            return indices
                .map((index) => getOptionLetter(question.options?.[index]?.text || '', index))
                .filter(Boolean)
                .sort()
                .join(',');
        }
        case 'true-false': {
            const entries = Array.isArray(answer)
                ? (answer as Array<{ optionId?: string; answer: boolean }>)
                : [];
            return entries
                .map((entry, index) => {
                    const letter = entry.optionId || String.fromCharCode(97 + index);
                    return `${letter}:${entry.answer ? 'true' : 'false'}`;
                })
                .sort()
                .join(',');
        }
        case 'matching':
            return serializeMatchingAnswer(
                (answer as Array<{ leftIndex: number; rightIndex: number }>) || [],
            );
        case 'short-answer':
        case 'essay':
        case 'code':
            return String(answer || '');
        default:
            return String(answer || '');
    }
}

export function isCourseExerciseAnswerReady(
    question: PracticeQuestion,
    answer: PracticeAnswer['answer'] | undefined,
): boolean {
    if (answer === undefined || answer === null) return false;

    switch (question.type) {
        case 'quiz':
            return typeof answer === 'number';
        case 'multiple-select':
            return Array.isArray(answer) && answer.length > 0;
        case 'true-false': {
            const count = question.trueFalseOptions?.length || 0;
            const entries = Array.isArray(answer) ? answer.length : 0;
            return count > 0 && entries >= count;
        }
        case 'short-answer':
            return String(answer).trim().length > 0;
        case 'essay':
            return stripHtml(String(answer)).length > 0;
        case 'matching': {
            const pairs = (answer as Array<{ leftIndex: number; rightIndex: number }>) || [];
            const leftCount = question.leftItems?.length || 0;
            return leftCount > 0 ? pairs.length >= leftCount : pairs.length > 0;
        }
        case 'code':
            return String(answer).trim().length > 0;
        default:
            return String(answer).trim().length > 0;
    }
}

export function buildCourseExerciseSubmitPayload(
    questions: PracticeQuestion[],
    answers: Record<string, PracticeAnswer['answer'] | undefined>,
) {
    return questions.map((question) => ({
        questionId: question._id!,
        answer: serializeCourseExerciseAnswer(question, answers[question._id!]),
    }));
}

export function buildInitialCourseExerciseAnswers(questions: PracticeQuestion[]) {
    const initial: Record<string, PracticeAnswer['answer']> = {};
    questions.forEach((question) => {
        if (question.type === 'code' && question.starterCode) {
            initial[question._id!] = question.starterCode;
        }
    });
    return initial;
}
