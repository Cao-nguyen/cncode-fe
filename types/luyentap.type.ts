export type PracticeQuestionType = 'quiz' | 'multiple-select' | 'true-false' | 'matching' | 'short-answer' | 'essay' | 'code';
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
    isSample?: boolean;
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
    sampleAnswer?: string;
    codeMode?: 'algorithm' | 'web';
    language?: CodeLanguage;
    starterCode?: string;
    testCases?: PracticeTestCase[];
    webRequirements?: Array<{
        type: 'has-tag' | 'has-text' | 'has-style' | 'contains';
        selector?: string;
        tag?: string;
        property?: string;
        value?: string;
        text?: string;
    }>;
    leftItems?: Array<{ _id?: string; text: string }>;
    rightItems?: Array<{ _id?: string; text: string }>;
    matchingPairs?: Array<{ leftIndex: number; rightIndex: number }>;
}

export interface PracticeSet {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    tier: PracticeTier;
    status: PracticeStatus;
    price?: number;
    discountType?: 'percent' | 'vnd';
    discountValue?: number;
    discountPrice?: number;
    allowCoinPayment?: boolean;
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
    grade?: string;
    examPurpose?: string;
    deliveryFrom?: string;
    deliveryTo?: string;
    examPassword?: string;
    proctoring?: 'off' | 'tab-switch';
    verifyStudentInfo?: boolean;
    studentInfoFields?: {
        fullName?: boolean;
        className?: boolean;
        custom?: Array<{ label: string; required?: boolean }>;
    };
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    essayKeyboard?: 'basic' | 'math' | 'editor';
    showScoreWhen?: 'never' | 'after-submit' | 'after-expiry';
    showAnswersWhen?: 'never' | 'after-submit' | 'after-expiry';
    hideLeaderboard?: boolean;
    preExamNoticeEnabled?: boolean;
    preExamNotice?: string;
    attemptCount?: number;
    questionCount?: number;
    locked?: boolean;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PracticeAnswer {
    questionId: string;
    answer:
        | string
        | number
        | number[]
        | Array<{ leftIndex: number; rightIndex: number }>
        | Record<string, boolean>
        | Array<{ optionId: string; answer: boolean }>;
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
    price?: number;
    discountType?: 'percent' | 'vnd';
    discountValue?: number;
    allowCoinPayment?: boolean;
    creationMethod?: 'editor' | 'upload';
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
    'multiple-select': 'TN nhiều đáp án',
    'true-false': 'Đúng/Sai',
    matching: 'Nối câu',
    'short-answer': 'Trả lời ngắn',
    essay: 'Tự luận',
    code: 'Code',
};

/** Nhãn tiếng Việt — chấp nhận cả type backend (multiple-choice) lẫn frontend (quiz). */
export function getQuestionTypeLabel(type: string): string {
    const frontendType = type === 'multiple-choice' ? 'quiz' : type;
    return QUESTION_TYPE_LABELS[frontendType as PracticeQuestionType] ?? type;
}

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
