// types/exercise.ts

export type QuestionType = "multiple_choice" | "multi_select" | "short_answer" | "essay" | "code";
export type Subject = "programming" | "ai" | "office" | "highschool" | "other";
export type Difficulty = "easy" | "medium" | "hard";
export type ExerciseStatus = "pending" | "approved" | "rejected";

// ── Question data interfaces (phải khớp với BE schema) ──────────────────────
export interface MultipleChoiceData {
    options: string[];
    correctIndex: number;
}

export interface MultiSelectData {
    options: string[];
    correctIndexes: number[];
}

export interface ShortAnswerData {
    correctAnswer: string;
    hint?: string;
}

export interface EssayData {
    sampleAnswer?: string;
    keywords: string[];
}

export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface CodeData {
    language: "javascript" | "python" | "cpp" | "java" | "c";
    starterCode: string;
    testCases: TestCase[];
    timeLimit?: number;
    memoryLimit?: number;
}

// ── Question interface ────────────────────────────────────────────────────────
export interface Question {
    _id?: string;
    type: QuestionType;
    content: string;
    points: number;
    explanation?: string;
    multipleChoice?: MultipleChoiceData;
    multiSelect?: MultiSelectData;
    shortAnswer?: ShortAnswerData;
    essay?: EssayData;
    code?: CodeData;
    correctAnswer?: number | number[] | string | null;
}

// ── Exercise interface ────────────────────────────────────────────────────────
export interface Exercise {
    _id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    subject: Subject;
    difficulty: Difficulty;
    tags: string[];
    isFree: boolean;
    costCoins: number;
    questions: Question[];
    timeLimit: number | null;
    shuffleQuestions: boolean;
    author: {
        _id: string;
        name: string;
        avatar: string;
        username: string;
    };
    status: ExerciseStatus;
    totalAttempts: number;
    averageScore: number;
    isSpinnable: boolean;
    spinReward: number;
    createdAt: string;
}

// ── Graded answer ─────────────────────────────────────────────────────────────
export interface GradedAnswer {
    questionIndex: number;
    selectedIndex?: number | null;
    selectedIndexes?: number[];
    textAnswer?: string | null;
    code?: string | null;
    isCorrect: boolean;
    pointsEarned: number;
    testResults?: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
    }[];
}

// ── Submit result ─────────────────────────────────────────────────────────────
export interface SubmitResult {
    submissionId: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
    timeTaken: number;
    isSpinnable: boolean;
    spinReward: number;
    questions: Question[];
    answers: GradedAnswer[];
}

// ── User answer ───────────────────────────────────────────────────────────────
export type UserAnswer =
    | { type: "multiple_choice"; selectedIndex: number }
    | { type: "multi_select"; selectedIndexes: number[] }
    | { type: "short_answer"; textAnswer: string }
    | { type: "essay"; textAnswer: string }
    | { type: "code"; code: string };

// ── API types ─────────────────────────────────────────────────────────────────
export interface CreateExercisePayload {
    title: string;
    description: string;
    subject: Subject;
    difficulty: Difficulty;
    tags: string[];
    isFree: boolean;
    costCoins: number;
    questions: Omit<Question, '_id'>[];
    timeLimit: number | null;
    shuffleQuestions: boolean;
    isSpinnable: boolean;
    spinReward: number;
}

export interface SubmitAnswerPayload {
    answers: UserAnswer[];
    timeTaken: number;
}

export interface SpinRewardResponse {
    reward: number;
    segmentIndex: number;
    segments: number[];
    message?: string;
}

export type AnswerResult = GradedAnswer;
export type QuestionResult = Question;