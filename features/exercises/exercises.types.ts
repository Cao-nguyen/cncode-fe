export type Subject = "programming" | "ai" | "office" | "highschool" | "other";
export type Difficulty = "easy" | "medium" | "hard";

export interface Exercise {
    _id: string;
    title: string;
    description: string;
    subject: Subject;
    difficulty: Difficulty;
    isFree: boolean;
    costCoins: number;
    isSpinnable: boolean;
    thumbnail?: string;
    tags?: string[];
    questions?: unknown[];
    timeLimit?: number;
    totalAttempts: number;
    averageScore: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ExercisesResponse {
    exercises: Exercise[];
    pagination: Pagination;
}

export interface FilterOptions {
    search: string;
    subject: Subject | "";
    difficulty: Difficulty | "";
    isFree: boolean | null;
}

export interface SubmitResult {
    submissionId: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
    timeTaken: number;
    isSpinnable: boolean;
    spinReward: number;
    currentCoins: number;
}

export interface Question {
    _id: string;
    content: string;
    type: "multiple_choice" | "multi_select" | "short_answer" | "essay" | "code";
    points: number;
    multipleChoice?: { options: string[] };
    multiSelect?: { options: string[] };
    shortAnswer?: { hint?: string };
    code?: { starterCode?: string };
    correctAnswer?: string | number | number[];
    explanation?: string;
}

export interface GradedAnswer {
    questionIndex: number;
    selectedIndex: number | null;
    selectedIndexes: number[];
    textAnswer: string | null;
    code: string | null;
    isCorrect: boolean;
    pointsEarned: number;
    testResults?: string[];
}