import axios from 'axios';

export interface UserInfo {
    _id: string;
    fullName: string;
    avatar?: string;
    role?: string;
}

export interface Question {
    _id: string;
    slug: string;
    userId: UserInfo;
    title: string;
    content: string;
    grade: 'grade10' | 'grade11' | 'grade12' | 'other';
    isAnonymous: boolean;
    viewCount: number;
    answerCount: number;
    likeCount: number;
    userLiked?: boolean;
    isPinned: boolean;
    isLocked: boolean;
    isSolved: boolean;
    bestAnswerId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Answer {
    _id: string;
    questionId: string;
    userId: UserInfo;
    content: string;
    isBestAnswer: boolean;
    isEdited: boolean;
    likeCount: number;
    isLiked?: boolean;
    createdAt: string;
}

export interface CreateQuestionDto {
    title: string;
    content: string;
    grade?: string;
    isAnonymous?: boolean;
}

export interface CreateAnswerDto {
    questionId: string;
    content: string;
}

export interface FaqPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface FaqListResponse {
    success: boolean;
    data: Question[];
    pagination: FaqPagination;
}

export interface FaqDetailResponse {
    success: boolean;
    data: {
        question: Question;
        answers: Answer[];
        isLiked: boolean;
    };
}

export interface FaqPublicMeta {
    title: string;
    description: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    answerCount: number;
}

export interface FaqStatistics {
    totalQuestions: number;
    answeredQuestions: number;
    pendingQuestions: number;
    totalAnswers: number;
    totalLikes: number;
    todayQuestions?: number;
    uniqueUsers?: number;
    gradeStats?: Array<{ _id: string; count: number }>;
    monthlyStats?: Array<{ _id: number; count: number }>;
}

export interface LikeActionResult {
    action: 'added' | 'removed';
    likeCount: number;
}

export interface ViewCountResult {
    counted: boolean;
    views: number;
}

export const GRADE_LABELS: Record<string, string> = {
    grade10: 'Tin học 10',
    grade11: 'Tin học 11',
    grade12: 'Tin học 12',
    other: 'Khác',
};

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    }
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return 'Có lỗi xảy ra';
};
