
export interface UserInfo {
    _id: string;
    fullName: string;
    avatar?: string;
    role?: string;
    badge?: string;
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
    isLiked: boolean;
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

export interface StatisticsData {
    totalQuestions: number;
    answeredQuestions: number;
    pendingQuestions: number;
    totalAnswers: number;
    totalLikes: number;
    uniqueUsers: number;
    todayQuestions: number;
    gradeStats: Array<{ _id: string; count: number }>;
    monthlyStats: Array<{ _id: number; count: number }>;
    categoryStats?: Array<{ _id: string; count: number }>;
}

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return 'Có lỗi xảy ra';
};
