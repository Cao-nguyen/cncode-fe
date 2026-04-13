export type Subject = "programming" | "ai" | "office" | "highschool" | "other";
export type Difficulty = "easy" | "medium" | "hard";

export interface MultipleChoice {
    options: string[];
    correctIndex: number;
}

export interface MultiSelect {
    options: string[];
    correctIndexes: number[];
}

export interface ShortAnswer {
    correctAnswer: string;
    hint?: string;
}

export interface Essay {
    keywords?: string[];
    sampleAnswer?: string;
}

export interface CodeQuestion {
    starterCode?: string;
    testCases?: Array<{
        input: string;
        expectedOutput: string;
        isHidden?: boolean;
    }>;
}

export interface Question {
    _id: string;
    content: string;
    type: "multiple_choice" | "multi_select" | "short_answer" | "essay" | "code";
    points: number;
    multipleChoice?: MultipleChoice;
    multiSelect?: MultiSelect;
    shortAnswer?: ShortAnswer;
    essay?: Essay;
    code?: CodeQuestion;
    correctAnswer?: string | number | number[];
    explanation?: string;
}

export interface UserAnswer {
    type: string;
    selectedIndex?: number;
    selectedIndexes?: number[];
    textAnswer?: string;
    code?: string;
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
    questions: Question[];
    timeLimit?: number;
    totalAttempts: number;
    averageScore: number;
    author?: {
        _id: string;
        name: string;
        avatar: string;
        username: string;
    };
}