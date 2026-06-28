export type PracticeQuestionType = 'quiz' | 'true-false' | 'short-answer' | 'essay' | 'code';
export type PracticeTier = 'free' | 'pro';
export type PracticeStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type CodeLanguage = 'python' | 'pascal' | 'cpp' | 'csharp' | 'html' | 'css' | 'javascript';

export interface PracticeOption {
    _id?: string;
    text: string;
    isCorrect?: boolean;
}

export interface PracticeTestCase {
    _id?: string;
    input?: string;
    expectedOutput?: string;
}

export interface PracticeQuestion {
    _id?: string;
    type: PracticeQuestionType;
    question: string;
    points?: number;
    options?: PracticeOption[];
    trueFalseOptions?: PracticeOption[];
    correctAnswer?: string;
    maxLength?: number;
    language?: CodeLanguage;
    starterCode?: string;
    testCases?: PracticeTestCase[];
}

export interface PracticeSet {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    tier: PracticeTier;
    status: PracticeStatus;
    author?: {
        _id: string;
        fullName?: string;
        avatar?: string;
        username?: string;
        email?: string;
        role?: string;
    };
    questions: PracticeQuestion[];
    timeLimit?: number;
    passThreshold?: number;
    rejectionReason?: string;
    attemptCount?: number;
    questionCount?: number;
    locked?: boolean;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PracticeAnswer {
    questionId: string;
    answer: string | number | Record<string, boolean> | Array<{ optionId: string; answer: boolean }>;
}

export interface QuestionResult {
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    feedback?: string;
    question?: PracticeQuestion;
    userAnswer?: PracticeAnswer['answer'];
}

export interface SubmitResult {
    attemptId: string;
    score: number;
    totalPoints: number;
    percent: number;
    passed: boolean;
    coinsAwarded: number;
    passThreshold: number;
    questionResults: QuestionResult[];
}

export interface PracticeAttempt {
    _id: string;
    userId: string;
    practiceSetId: string;
    practiceTitle?: string;
    answers: PracticeAnswer[];
    score: number;
    totalPoints: number;
    percent: number;
    passed: boolean;
    coinsAwarded: number;
    passThreshold?: number;
    questionResults: QuestionResult[];
    detailedResults?: QuestionResult[];
    createdAt: string;
}

export interface CreatePracticeDto {
    title: string;
    description?: string;
    tier?: PracticeTier;
    status?: PracticeStatus;
    questions: PracticeQuestion[];
    timeLimit?: number;
    passThreshold?: number;
}

export interface PracticeListResponse {
    items: PracticeSet[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    hasProAccess?: boolean;
}

export const QUESTION_TYPE_LABELS: Record<PracticeQuestionType, string> = {
    quiz: 'Trắc nghiệm',
    'true-false': 'Đúng/Sai',
    'short-answer': 'Trả lời ngắn',
    essay: 'Tự luận',
    code: 'Code',
};

export const CODE_LANGUAGES: { value: CodeLanguage; label: string }[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'pascal', label: 'Pascal' },
    { value: 'cpp', label: 'C/C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
];

export const STATUS_LABELS: Record<PracticeStatus, string> = {
    draft: 'Bản nháp',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
};
