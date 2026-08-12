import type { PracticeQuestion } from '@/types/luyentap.type';



export interface QuestionShuffleMap {

    options?: number[];

    trueFalse?: number[];

    matchingRight?: number[];

}



export interface TakeShuffleState {

    questionOrder: string[];

    shuffles: Record<string, QuestionShuffleMap>;

    shuffleQuestions: boolean;

    shuffleAnswers: boolean;

}



export function normalizeQuestionId(id: unknown): string {

    if (id == null) return '';

    return String(id);

}



function isIdentityPermutation(order: number[]): boolean {

    return order.every((value, index) => value === index);

}



function shuffleIndices(length: number): number[] {

    const indices = Array.from({ length }, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i -= 1) {

        const j = Math.floor(Math.random() * (i + 1));

        [indices[i], indices[j]] = [indices[j], indices[i]];

    }

    return indices;

}



function shuffleIndicesNonIdentity(length: number): number[] {

    if (length < 2) {

        return Array.from({ length }, (_, index) => index);

    }



    let indices = shuffleIndices(length);

    let tries = 0;

    while (isIdentityPermutation(indices) && tries < 10) {

        indices = shuffleIndices(length);

        tries += 1;

    }

    return indices;

}



function groupQuestionsBySection(questions: PracticeQuestion[]): PracticeQuestion[][] {

    const groups: PracticeQuestion[][] = [];

    let current: PracticeQuestion[] = [];

    let lastGroup: string | undefined;



    questions.forEach((question) => {

        const groupTitle = question.groupTitle ?? '';

        if (current.length > 0 && groupTitle !== lastGroup) {

            groups.push(current);

            current = [];

        }

        current.push(question);

        lastGroup = groupTitle;

    });



    if (current.length > 0) {

        groups.push(current);

    }



    return groups;

}



function buildAnswerShuffle(question: PracticeQuestion): QuestionShuffleMap | undefined {

    const shuffle: QuestionShuffleMap = {};

    let hasShuffle = false;



    if (

        (question.type === 'quiz' || question.type === 'multiple-select')

        && (question.options?.length ?? 0) > 1

    ) {

        shuffle.options = shuffleIndicesNonIdentity(question.options!.length);

        hasShuffle = true;

    }



    if (question.type === 'true-false' && (question.trueFalseOptions?.length ?? 0) > 1) {

        shuffle.trueFalse = shuffleIndicesNonIdentity(question.trueFalseOptions!.length);

        hasShuffle = true;

    }



    if (question.type === 'matching' && (question.rightItems?.length ?? 0) > 1) {

        shuffle.matchingRight = shuffleIndicesNonIdentity(question.rightItems!.length);

        hasShuffle = true;

    }



    return hasShuffle ? shuffle : undefined;

}



export function buildTakeShuffleState(

    questions: PracticeQuestion[],

    shuffleQuestions: boolean,

    shuffleAnswers: boolean,

): TakeShuffleState {

    const orderedQuestions = shuffleQuestions

        ? groupQuestionsBySection(questions).flatMap((group) => {

              const indices = shuffleIndicesNonIdentity(group.length);

              return indices.map((index) => group[index]);

          })

        : questions;



    const shuffles: Record<string, QuestionShuffleMap> = {};

    if (shuffleAnswers) {

        orderedQuestions.forEach((question) => {

            const questionId = normalizeQuestionId(question._id);

            if (!questionId) return;

            const shuffle = buildAnswerShuffle(question);

            if (shuffle) {

                shuffles[questionId] = shuffle;

            }

        });

    }



    return {

        questionOrder: orderedQuestions

            .map((question) => normalizeQuestionId(question._id))

            .filter(Boolean),

        shuffles,

        shuffleQuestions,

        shuffleAnswers,

    };

}



function permuteByOrder<T>(items: T[] | undefined, order: number[] | undefined): T[] | undefined {

    if (!items || !order) return items;

    return order.map((index) => items[index]).filter((item) => item !== undefined);

}



export function normalizeTakeShuffleState(state: TakeShuffleState): TakeShuffleState {

    return {

        questionOrder: state.questionOrder.map((questionId) => normalizeQuestionId(questionId)).filter(Boolean),

        shuffles: Object.fromEntries(

            Object.entries(state.shuffles ?? {}).map(([questionId, shuffle]) => [

                normalizeQuestionId(questionId),

                shuffle,

            ]),

        ),

        shuffleQuestions: Boolean(state.shuffleQuestions),

        shuffleAnswers: Boolean(state.shuffleAnswers),

    };

}



export function applyTakeShuffleState(

    questions: PracticeQuestion[],

    state: TakeShuffleState,

): PracticeQuestion[] {

    const normalizedState = normalizeTakeShuffleState(state);

    const questionById = new Map(

        questions.map((question) => [normalizeQuestionId(question._id), question]),

    );



    return normalizedState.questionOrder

        .map((questionId) => {

            const source = questionById.get(questionId);

            if (!source) return null;



            const shuffle = normalizedState.shuffles[questionId];

            if (!shuffle) {

                return { ...source };

            }



            return {

                ...source,

                options: permuteByOrder(source.options, shuffle.options),

                trueFalseOptions: permuteByOrder(source.trueFalseOptions, shuffle.trueFalse),

                rightItems: permuteByOrder(source.rightItems, shuffle.matchingRight),

            };

        })

        .filter((question): question is PracticeQuestion => question !== null);

}



export function isTakeShuffleStateValid(

    state: TakeShuffleState | undefined,

    questions: PracticeQuestion[],

    shuffleQuestions: boolean,

    shuffleAnswers: boolean,

): state is TakeShuffleState {

    if (!state) return false;



    const normalizedState = normalizeTakeShuffleState(state);

    if (normalizedState.shuffleQuestions !== shuffleQuestions) return false;

    if (normalizedState.shuffleAnswers !== shuffleAnswers) return false;

    if (normalizedState.questionOrder.length !== questions.length) return false;



    const questionIds = new Set(

        questions.map((question) => normalizeQuestionId(question._id)).filter(Boolean),

    );



    return normalizedState.questionOrder.every((questionId) => questionIds.has(questionId));

}



function isQuestionOrderEffectivelyShuffled(

    questions: PracticeQuestion[],

    questionOrder: string[],

): boolean {

    const originalIds = questions.map((question) => normalizeQuestionId(question._id)).filter(Boolean);

    const orderedIds = questionOrder.map((questionId) => normalizeQuestionId(questionId)).filter(Boolean);

    if (originalIds.length !== orderedIds.length) return false;



    const groups = groupQuestionsBySection(questions);

    return groups.every((group) => {

        if (group.length < 2) return true;



        const groupIds = new Set(group.map((question) => normalizeQuestionId(question._id)));

        const originalGroupOrder = originalIds.filter((id) => groupIds.has(id)).join('|');

        const shuffledGroupOrder = orderedIds.filter((id) => groupIds.has(id)).join('|');

        return originalGroupOrder !== shuffledGroupOrder;

    });

}



function areAnswerShufflesEffective(

    questions: PracticeQuestion[],

    shuffles: Record<string, QuestionShuffleMap>,

): boolean {

    return questions.every((question) => {

        const expected = buildAnswerShuffle(question);

        if (!expected) return true;



        const questionId = normalizeQuestionId(question._id);

        const saved = shuffles[questionId];

        if (!saved) return false;



        if (expected.options) {

            if (!saved.options || isIdentityPermutation(saved.options)) return false;

        }

        if (expected.trueFalse) {

            if (!saved.trueFalse || isIdentityPermutation(saved.trueFalse)) return false;

        }

        if (expected.matchingRight) {

            if (!saved.matchingRight || isIdentityPermutation(saved.matchingRight)) return false;

        }



        return true;

    });

}



export function isTakeShuffleStateEffective(

    state: TakeShuffleState | undefined,

    questions: PracticeQuestion[],

    shuffleQuestions: boolean,

    shuffleAnswers: boolean,

): boolean {

    if (!state) return !shuffleQuestions && !shuffleAnswers;



    const normalizedState = normalizeTakeShuffleState(state);

    if (!isTakeShuffleStateValid(normalizedState, questions, shuffleQuestions, shuffleAnswers)) {

        return false;

    }



    if (shuffleQuestions && !isQuestionOrderEffectivelyShuffled(questions, normalizedState.questionOrder)) {

        return false;

    }



    if (shuffleAnswers && !areAnswerShufflesEffective(questions, normalizedState.shuffles)) {

        return false;

    }



    return true;

}



export function resolveTakeShuffleState(

    questions: PracticeQuestion[],

    shuffleQuestions: boolean,

    shuffleAnswers: boolean,

    candidate?: TakeShuffleState | null,

): TakeShuffleState | null {

    if (!shuffleQuestions && !shuffleAnswers) {

        return null;

    }



    const normalizedCandidate = candidate ? normalizeTakeShuffleState(candidate) : null;

    if (

        normalizedCandidate

        && isTakeShuffleStateEffective(normalizedCandidate, questions, shuffleQuestions, shuffleAnswers)

    ) {

        return normalizedCandidate;

    }



    return buildTakeShuffleState(questions, shuffleQuestions, shuffleAnswers);

}


