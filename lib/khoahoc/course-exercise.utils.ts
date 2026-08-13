import type { ContestQuestion } from '@/components/custom/CustomEditorContest';
import type { TrueFalseScale } from '@/components/custom/CustomEditorContest';
import type { ExerciseQuestion, Exercise } from '@/types/khoahoc.type';
import { parseAlgorithmQuestionDisplay } from '@/lib/luyentap/algorithm-question-display';
import { serializeAlgorithmQuestionBody } from '@/lib/luyentap/algorithm-question-markdown';
import {
    resolveEditorQuestionText,
    serializeWebRequirement,
    type WebRequirement,
} from '@/lib/luyentap/question-markdown';

export type CourseExerciseEditorQuestion = ContestQuestion;

export const DEFAULT_TRUE_FALSE_SCALE: TrueFalseScale = {
    correct1: 10,
    correct2: 25,
    correct3: 50,
    correct4: 100,
};

const DEFAULT_MARKDOWN = `Câu 1. Nhập nội dung câu hỏi
A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D`;

function mapExerciseTypeToContest(type: string, codeMode?: string): ContestQuestion['type'] {
    if (type === 'quiz') return 'multiple-choice';
    if (type === 'ide') return 'code';
    if (type === 'code' && codeMode === 'web') return 'code';
    if (type === 'code') return 'code';
    if (type === 'multiple-choice' || type === 'multiple-select' || type === 'true-false' || type === 'matching' || type === 'short-answer' || type === 'essay') {
        return type;
    }
    return 'essay';
}

function mapContestTypeToExercise(type: string, codeMode?: string): string {
    if (type === 'multiple-choice') return 'quiz';
    if (type === 'code' && (codeMode === 'algorithm' || !codeMode)) return 'ide';
    return type;
}

function getOptionLetter(opt: string, index: number, trueFalse: boolean): string {
    const match = opt.trim().match(/^([A-Da-d])[).]/);
    if (match) return match[1];
    return trueFalse ? String.fromCharCode(97 + index) : String.fromCharCode(65 + index);
}

function isCorrectOption(
    letter: string,
    correctAnswers: string[] | undefined,
    trueFalse: boolean,
    legacyCorrect?: boolean,
): boolean {
    if (legacyCorrect !== undefined) return legacyCorrect;
    if (!correctAnswers?.length) return false;
    if (trueFalse) {
        return correctAnswers.some((ans) => {
            const lower = ans.toLowerCase();
            if (lower === letter.toLowerCase()) return true;
            if (lower.startsWith(`${letter.toLowerCase()}:`)) return lower.endsWith('true');
            return false;
        });
    }
    return correctAnswers.some((ans) => ans.toUpperCase() === letter.toUpperCase());
}

export function exerciseQuestionsToMarkdown(questions: ExerciseQuestion[] | undefined): string {
    if (!questions?.length) return DEFAULT_MARKDOWN;

    let lastGroup = '';
    return questions
        .map((q, index) => {
            const parts: string[] = [];
            const groupTitle = (q as ExerciseQuestion & { groupTitle?: string }).groupTitle;
            if (groupTitle && groupTitle !== lastGroup) {
                parts.push(groupTitle);
                lastGroup = groupTitle;
            }

            const contestType = mapExerciseTypeToContest(q.type, (q as ExerciseQuestion & { codeMode?: string }).codeMode);
            const n = index + 1;
            const codeMode = (q as ExerciseQuestion & { codeMode?: string }).codeMode;
            const algoParsed =
                (q.type === 'ide' || (q.type === 'code' && codeMode !== 'web'))
                    ? parseAlgorithmQuestionDisplay(q.question || '')
                    : null;

            let markdown = `Câu ${n}. ${algoParsed?.intro?.trim() || q.question || ''}\n`;

            if (contestType === 'multiple-select') markdown += '{ms}\n';

            if (contestType === 'multiple-choice' || contestType === 'multiple-select' || contestType === 'true-false') {
                const trueFalse = contestType === 'true-false';
                const stringOptions = q.options?.length
                    ? q.options.map((opt, i) =>
                          typeof opt === 'string' ? opt : `${String.fromCharCode(65 + i)}. ${opt.text}`,
                      )
                    : q.legacyOptions?.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text}`) || [];

                if (!stringOptions.length && q.trueFalseOptions?.length) {
                    q.trueFalseOptions.forEach((opt, i) => {
                        const letter = String.fromCharCode(97 + i);
                        const prefix = opt.isCorrect ? '*' : '';
                        markdown += `${prefix}${letter}) ${opt.text}\n`;
                    });
                } else {
                    stringOptions.forEach((opt, optIndex) => {
                        const letter = getOptionLetter(String(opt), optIndex, trueFalse);
                        const prefix = isCorrectOption(letter, q.correctAnswers, trueFalse) ? '*' : '';
                        const line = String(opt).trim().replace(/^\*/, '');
                        markdown += `${prefix}${line}\n`;
                    });
                }
            }

            if (contestType === 'matching') {
                markdown += '{match}\n';
                const leftItems = (q as ExerciseQuestion & { leftItems?: string[] }).leftItems || [];
                const rightItems = (q as ExerciseQuestion & { rightItems?: string[] }).rightItems || [];
                const matchingPairs = (q as ExerciseQuestion & { matchingPairs?: Array<{ left: string; right: string }> }).matchingPairs || [];

                leftItems.forEach((item, i) => {
                    markdown += `${i + 1}. ${item}\n`;
                });
                rightItems.forEach((item, i) => {
                    markdown += `${String.fromCharCode(97 + i)}. ${item}\n`;
                });
                matchingPairs.forEach((pair) => {
                    markdown += `*${pair.left}-${pair.right}\n`;
                });
            }

            if (contestType === 'short-answer') {
                const answer = q.correctAnswers?.[0] || q.correctAnswer;
                if (answer) markdown += `*${answer}\n`;
            }

            if (contestType === 'code') {
                const webRequirements = (q as ExerciseQuestion & { webRequirements?: WebRequirement[] }).webRequirements;
                if (codeMode === 'web' || q.type === 'code') {
                    markdown += '{web}\n';
                    webRequirements?.forEach((req) => {
                        markdown += `${serializeWebRequirement(req)}\n`;
                    });
                } else {
                    serializeAlgorithmQuestionBody({
                        algoRequirement: (q as ExerciseQuestion & { algoRequirement?: string }).algoRequirement || algoParsed?.requirementDesc,
                        algoInputDesc: (q as ExerciseQuestion & { algoInputDesc?: string }).algoInputDesc || algoParsed?.inputDesc,
                        algoOutputDesc: (q as ExerciseQuestion & { algoOutputDesc?: string }).algoOutputDesc || algoParsed?.outputDesc,
                        testCases: q.testCases?.map((tc) => ({
                            input: tc.input || '',
                            expectedOutput: tc.expectedOutput || '',
                            isSample: (tc as { isSample?: boolean }).isSample ?? false,
                        })),
                    }).forEach((line) => {
                        markdown += `${line}\n`;
                    });
                }
            }

            if (q.explanation) markdown += `{lg: ${q.explanation}}\n`;

            parts.push(markdown.trimEnd());
            return parts.join('\n');
        })
        .join('\n\n');
}

export function buildScoreOverridesFromQuestions(questions: ExerciseQuestion[] | undefined): Record<number, number> {
    const overrides: Record<number, number> = {};
    questions?.forEach((q, index) => {
        if (q.score != null) {
            overrides[index + 1] = q.score;
        }
    });
    return overrides;
}

export function extractScoreOverridesFromEditorQuestions(
    questions: Array<{ id: number; number: number; score?: number }>,
): Record<number, number> {
    const overrides: Record<number, number> = {};
    for (const q of questions) {
        if (q.score != null) {
            overrides[q.id] = q.score;
            overrides[q.number] = q.score;
        }
    }
    return overrides;
}

export function convertContestQuestionsToExerciseFormat(questions: CourseExerciseEditorQuestion[]): ExerciseQuestion[] {
    return questions.map((q, index) => {
        const exerciseType = mapContestTypeToExercise(q.type, q.codeMode);
        const base: ExerciseQuestion & {
            groupTitle?: string;
            leftItems?: string[];
            rightItems?: string[];
            matchingPairs?: Array<{ left: string; right: string }>;
            codeMode?: string;
            webRequirements?: WebRequirement[];
            algoRequirement?: string;
            algoInputDesc?: string;
            algoOutputDesc?: string;
        } = {
            type: exerciseType as ExerciseQuestion['type'],
            question: resolveEditorQuestionText(q, index),
            score: q.score,
            explanation: q.explanation,
            groupTitle: q.groupTitle,
        };

        if (q.type === 'multiple-choice' || q.type === 'multiple-select') {
            base.options = q.options || [];
            base.correctAnswers = q.correctAnswers?.map((a) => a.toUpperCase()) || [];
        } else if (q.type === 'true-false') {
            base.options = q.options || [];
            base.correctAnswers = q.correctAnswers || [];
        } else if (q.type === 'short-answer') {
            base.correctAnswers = q.correctAnswers || [];
            base.correctAnswer = q.correctAnswers?.[0];
        } else if (q.type === 'matching') {
            base.leftItems = q.leftItems;
            base.rightItems = q.rightItems;
            base.matchingPairs = q.matchingPairs;
        } else if (q.type === 'code') {
            base.codeMode = q.codeMode;
            base.language = q.language;
            base.testCases = q.testCases;
            base.webRequirements = q.webRequirements as WebRequirement[] | undefined;
            base.algoRequirement = q.algoRequirement;
            base.algoInputDesc = q.algoInputDesc;
            base.algoOutputDesc = q.algoOutputDesc;
            if (q.codeMode === 'algorithm') {
                base.starterCode = '';
            }
        }

        return base;
    });
}

export function getInitialExerciseMarkdown(exercise?: Partial<Exercise>): string {
    if (exercise?.questionMarkdown?.trim()) return exercise.questionMarkdown;
    if (exercise?.questions?.length) return exerciseQuestionsToMarkdown(exercise.questions);
    return DEFAULT_MARKDOWN;
}
