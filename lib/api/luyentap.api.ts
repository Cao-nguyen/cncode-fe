import axios from 'axios';

/** Chuẩn hóa base URL — .env có thể là `http://localhost:5000` hoặc `http://localhost:5000/api`. */
const getApiRoot = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return raw.replace(/\/api\/?$/, '');
};

function unwrapApiPayload<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const wrapped = payload as { data?: T };
        if (wrapped.data !== undefined && wrapped.data !== null) {
            return wrapped.data;
        }
    }
    return payload as T;
}

export function getLuyentapApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra'): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: unknown; status?: number } }).response;
        const data = response?.data;
        if (data && typeof data === 'object') {
            const payload = data as { message?: string; error?: string };
            if (payload.message) return payload.message;
            if (typeof payload.error === 'string') return payload.error;
        }
        if (response?.status) return `Lỗi máy chủ (${response.status})`;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
};

const apiClient = axios.create({
    baseURL: `${getApiRoot()}/api/luyentap`,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response || error.response.status !== 404) {
            const message = getLuyentapApiErrorMessage(error);
            console.error('API Error:', message, error.response?.data ?? '');
        }
        return Promise.reject(error);
    }
);

// Types
export type WebRequirement = {
    type: 'has-tag' | 'has-text' | 'has-style' | 'contains';
    selector?: string;
    tag?: string;
    property?: string;
    value?: string;
    text?: string;
};

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Question {
    _id?: string;
    type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'matching' | 'short-answer' | 'essay' | 'code';
    question: string;
    explanation?: string;
    points?: number;
    options?: Array<{ _id?: string; text: string; isCorrect: boolean }>;
    trueFalseOptions?: Array<{ _id?: string; text: string; isCorrect: boolean }>;
    correctAnswer?: string;
    sampleAnswer?: string;
    codeMode?: 'algorithm' | 'web';
    language?: string;
    starterCode?: string;
    testCases?: Array<{ _id?: string; input?: string; expectedOutput?: string; isSample?: boolean }>;
    webRequirements?: WebRequirement[];
    leftItems?: Array<{ _id?: string; text: string }>;
    rightItems?: Array<{ _id?: string; text: string }>;
    matchingPairs?: Array<{ leftIndex: number; rightIndex: number }>;
    groupTitle?: string;
}

export interface Exercise {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    duration: number;
    questions: Question[];
    totalPoints: number;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    tier?: 'free' | 'pro';
    difficulty?: 'easy' | 'medium' | 'hard' | 'very_hard';
    price?: number;
    discountType?: 'percent' | 'vnd';
    discountValue?: number;
    discountPrice?: number;
    allowCoinPayment?: boolean;
    passThreshold?: number;
    creationMethod?: 'editor' | 'upload';
    rejectionReason?: string;
    folderId?: string | null | { _id: string; name: string };
    grade?: string;
    examPurpose?: string;
    deliveryFrom?: string;
    deliveryTo?: string;
    examPassword?: string;
    availability?: {
        phase: 'upcoming' | 'open' | 'closed';
        canEnter: boolean;
        message: string | null;
    };
    hasExamPassword?: boolean;
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
    createdBy?: string | User;
    participantCount: number;
    maxAttempts: number;
    questionCount?: number;
    trueFalseScale?: {
        correct1?: number;
        correct2?: number;
        correct3?: number;
        correct4?: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface UserExerciseAnswer {
    _id: string;
    exerciseId: string | Exercise;
    userId: string | User;
    answers: Array<{
        questionId: string;
        selectedOption?: string;
        trueFalseAnswers?: Array<{ optionIndex: number; isTrue: boolean }>;
        shortAnswer?: string;
        isCorrect: boolean;
        points: number;
        question?: Question;
    }>;
    totalScore: number;
    percentage: number;
    coinsAwarded: number;
    timeSpent: number;
    submittedAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    userAvatar?: string;
    score?: number;
    percentage?: number;
    timeSpent?: number;
    submittedAt?: string;
    province?: string;
    school?: string;
    totalScore?: number;
    totalExercises?: number;
    totalTimeSpent?: number;
}

export interface ExerciseStatistics {
    totalParticipants: number;
    totalPoints: number;
    averageScore: number;
    medianScore: number;
    averageTimeSpent: number;
    histogram: Array<{ label: string; min: number; max: number; count: number }>;
    scoreRanges: Array<{ label: string; min: number; max: number; count: number; percent: number }>;
    userScore: number | null;
}

export interface ExerciseParticipant {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    submittedAt: string;
    percentage: number;
}

export interface ExerciseHistoryEntry {
    _id: string;
    totalScore?: number;
    percentage: number;
    coinsAwarded: number;
    timeSpent: number;
    submittedAt: string;
    startedAt?: string;
    expiresAt?: string;
    status?: 'in_progress' | 'submitted';
    activeIndex?: number;
    tabSwitchCount?: number;
}

export interface ExerciseAttempt {
    _id: string;
    status: 'in_progress' | 'submitted';
    startedAt: string;
    expiresAt: string;
    draftAnswers?: Record<string, unknown>;
    shuffleState?: {
        questionOrder?: string[];
        shuffles?: Record<string, unknown>;
        shuffleQuestions?: boolean;
        shuffleAnswers?: boolean;
    };
    activeIndex?: number;
    timeSpent?: number;
    tabSwitchCount?: number;
    essayGradingPending?: boolean;
}

export interface AdminExerciseBasicStats {
    registeredCount: number;
    totalAttempts: number;
    completionRate: number;
    inProgressCount: number;
    belowLowScoreCount: number;
    passCount: number;
    lowScoreThreshold: number;
    passScore: number;
    totalPoints: number;
    passThreshold: number;
}

export interface AdminExerciseOverview {
    exercise: Exercise & {
        createdBy?: { _id?: string; fullName?: string; name?: string; email?: string };
        folderId?: { _id?: string; name?: string } | string | null;
    };
    submissionCount: number;
    pendingEssayCount: number;
    hasEssay: boolean;
    essayQuestionCount: number;
    essayMaxPoints: number;
    basicStats: AdminExerciseBasicStats;
}

export interface AdminScoreDistributionBucket {
    label: string;
    min: number;
    max: number;
    count: number;
}

export interface AdminFrequencyBucketRow {
    label: string;
    count: number;
    percent: number;
}

export interface AdminFrequencyGroupRow {
    label: string;
    registered: number;
    participated: number;
    buckets: AdminFrequencyBucketRow[];
    aboveAverage: { count: number; percent: number };
}

export interface AdminQuestionPreview {
    _id?: string;
    type?: string;
    question?: string;
    explanation?: string;
    groupTitle?: string;
    points?: number;
    options?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    trueFalseOptions?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    correctAnswer?: string;
    leftItems?: Array<{ text: string }>;
    rightItems?: Array<{ text: string }>;
    matchingPairs?: Array<{ leftIndex: number; rightIndex: number }>;
    sampleAnswer?: string;
    language?: string;
    codeMode?: 'algorithm' | 'web';
    starterCode?: string;
    testCases?: Array<{ input?: string; expectedOutput?: string; isSample?: boolean }>;
    webRequirements?: WebRequirement[];
}

export interface AdminQuestionStatRow {
    index: number;
    questionId: string;
    questionLabel: string;
    questionHtml: string;
    questionType: string;
    groupTitle?: string;
    preview?: AdminQuestionPreview | null;
    totalParticipants: number;
    attemptedCount: number;
    notAttemptedCount: number;
    correctCount: number;
    wrongCount: number;
    incompletePercent: number;
    correctStudents: string[];
    wrongStudents: string[];
    notAttemptedStudents: string[];
}

export interface AdminDetailedStatistics {
    exerciseTitle: string;
    totalPoints: number;
    passScore: number;
    passThreshold: number;
    scoreDistribution: {
        buckets: AdminScoreDistributionBucket[];
        averageScore: number;
        modeLabel: string;
        modeCount: number;
    };
    frequencyTable: {
        passScore: number;
        groups: AdminFrequencyGroupRow[];
        total: AdminFrequencyGroupRow;
    };
    questionStats: AdminQuestionStatRow[];
}

export interface AdminSubmissionItem {
    _id: string;
    userId?: string;
    userName: string;
    userAvatar?: string;
    userEmail?: string;
    totalScore?: number | null;
    percentage?: number | null;
    timeSpent: number;
    submittedAt: string;
    tabSwitchCount?: number;
    essayGradingPending?: boolean;
    overallFeedback?: string;
    attemptNumber: number;
}

export interface AdminEssayGradingItem {
    questionId: string;
    question: string;
    points: number;
    sampleAnswer?: string;
    essayAnswer?: string;
    awardedPoints?: number;
    feedback?: string;
    needsManualGrading?: boolean;
    gradedAt?: string | null;
}

export interface AdminSubmissionDetail {
    submission: AdminSubmissionItem;
    answers?: Array<Record<string, unknown>>;
    exercise?: {
        title?: string;
        questions?: Array<Record<string, unknown>>;
    };
    essayItems: AdminEssayGradingItem[];
    totalPoints: number;
    essayMaxPoints: number;
}

// Public APIs
export const getPublicExercises = async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/public', { params });
    return unwrapApiPayload<{ exercises: Exercise[]; total: number; page: number; limit: number }>(response.data);
};

export const getExerciseBySlug = async (slug: string) => {
    const response = await apiClient.get(`/public/${slug}`);
    return unwrapApiPayload<Exercise>(response.data);
};

export const getPublicExerciseById = async (id: string) => {
    const response = await apiClient.get(`/public/id/${id}`);
    return unwrapApiPayload<Exercise>(response.data);
};

export const getOverallLeaderboard = async (limit?: number) => {
    const response = await apiClient.get('/public/leaderboard/overall', { params: { limit } });
    return response.data.data || response.data;
};

export const getExerciseLeaderboard = async (exerciseId: string, limit?: number) => {
    const response = await apiClient.get(`/${exerciseId}/leaderboard`, { params: { limit } });
    return response.data.data || response.data;
};

// User APIs
export const getExerciseForTaking = async (exerciseId: string) => {
    const response = await apiClient.get(`/${exerciseId}/take`);
    return unwrapApiPayload<Exercise>(response.data);
};

export const startExerciseAttempt = async (
    exerciseId: string,
    options?: { examPassword?: string; acknowledgePreExam?: boolean },
) => {
    const response = await apiClient.post(`/${exerciseId}/attempt`, {
        examPassword: options?.examPassword,
        acknowledgePreExam: options?.acknowledgePreExam,
    });
    const attempt = unwrapApiPayload<ExerciseAttempt>(response.data);
    if (!attempt?._id) {
        throw new Error('Không thể khởi tạo phiên làm bài');
    }
    return attempt;
};

export const getExerciseAccess = async (exerciseId: string) => {
    const response = await apiClient.get(`/me/exercises/${exerciseId}/access`);
    return unwrapApiPayload<import('@/lib/luyentap/exercise-availability.utils').ExerciseAccessStatus>(response.data);
};

export const verifyExercisePassword = async (exerciseId: string, password: string) => {
    const response = await apiClient.post(`/me/exercises/${exerciseId}/verify-password`, { password });
    return unwrapApiPayload<{ verified: boolean }>(response.data);
};

export const saveExerciseAttemptProgress = async (
    exerciseId: string,
    attemptId: string,
    data: {
        draftAnswers?: Record<string, unknown>;
        activeIndex?: number;
        timeSpent?: number;
        shuffleState?: ExerciseAttempt['shuffleState'] | null;
        tabSwitchCount?: number;
    },
) => {
    const response = await apiClient.put(`/${exerciseId}/attempt/${attemptId}`, data);
    return unwrapApiPayload<ExerciseAttempt>(response.data);
};

export const submitExerciseAnswer = async (exerciseId: string, data: {
    attemptId?: string;
    answers: Array<{
        questionId: string;
        selectedOption?: string;
        trueFalseAnswers?: Array<{ optionIndex: number; isTrue: boolean }>;
        shortAnswer?: string;
        essayAnswer?: string;
        codeAnswer?: string;
    }>;
    timeSpent: number;
}) => {
    const response = await apiClient.post(`/${exerciseId}/submit`, data);
    return response.data;
};

export const getUserAnswer = async (exerciseId: string, answerId?: string) => {
    const response = await apiClient.get(`/${exerciseId}/result`, {
        params: answerId ? { answerId } : undefined
    });
    return response.data.data || response.data;
};

export const spinExerciseCoin = async (exerciseId: string, answerId: string) => {
    const response = await apiClient.post(`/${exerciseId}/spin-coin`, { answerId });
    return unwrapApiPayload<{
        coinsAwarded: number;
        coinSpinClaimed: boolean;
        balanceAfter: number;
        message: string;
    }>(response.data);
};

export const getUserExercises = async () => {
    const response = await apiClient.get('/me/exercises');
    return response.data;
};

export const checkUserAttempts = async (exerciseId: string) => {
    const response = await apiClient.get(`/me/exercises/${exerciseId}/check-attempts`);
    return response.data.data || response.data;
};

export const getUserExerciseHistory = async (exerciseId: string) => {
    const response = await apiClient.get(`/me/exercises/${exerciseId}/history`);
    return response.data.data || response.data;
};

export const getUserPurchases = async () => {
    const response = await apiClient.get('/me/purchases');
    return unwrapApiPayload<{ exerciseIds: string[] }>(response.data);
};

export const getPurchaseStatus = async (exerciseId: string) => {
    const response = await apiClient.get(`/me/exercises/${exerciseId}/purchase-status`);
    return response.data.data || response.data;
};

export const purchaseWithCoin = async (exerciseId: string) => {
    const response = await apiClient.post(`/me/exercises/${exerciseId}/purchase/coin`);
    return response.data;
};

export const purchaseWithPayos = async (exerciseId: string) => {
    const response = await apiClient.post(`/me/exercises/${exerciseId}/purchase/payos`);
    return response.data;
};

export const getExerciseReactions = async (exerciseId: string) => {
    const response = await apiClient.get(`/${exerciseId}/reactions`);
    return unwrapApiPayload<{ reactionCounts: Record<string, number>; userReaction: string | null }>(response.data);
};

export const reactToExercise = async (exerciseId: string, type: string) => {
    const response = await apiClient.post(`/${exerciseId}/react`, { type });
    return unwrapApiPayload<{
        reacted: boolean;
        reactionType: string | null;
        reactionCounts: Record<string, number>;
    }>(response.data);
};

export const getExerciseStatistics = async (exerciseId: string) => {
    const response = await apiClient.get(`/${exerciseId}/statistics`);
    return unwrapApiPayload<ExerciseStatistics>(response.data);
};

export const getRecentParticipants = async (exerciseId: string, page = 1, limit = 10) => {
    const response = await apiClient.get(`/${exerciseId}/participants`, { params: { page, limit } });
    return unwrapApiPayload<{
        participants: ExerciseParticipant[];
        total: number;
        page: number;
        totalPages: number;
    }>(response.data);
};

// Admin APIs
export const getAdminExercises = async (params?: { page?: number; limit?: number; status?: string; search?: string; folderId?: string }) => {
    const response = await apiClient.get('/admin/list', { params });
    return response.data.data || response.data;
};

export const getAdminFolders = async () => {
    const response = await apiClient.get('/admin/folders');
    return response.data;
};

export const createAdminFolder = async (data: { name: string; description?: string; sortOrder?: number }) => {
    const response = await apiClient.post('/admin/folders', data);
    return response.data;
};

export const updateAdminFolder = async (id: string, data: { name?: string; description?: string; sortOrder?: number }) => {
    const response = await apiClient.put(`/admin/folders/${id}`, data);
    return response.data;
};

export const deleteAdminFolder = async (id: string) => {
    const response = await apiClient.delete(`/admin/folders/${id}`);
    return response.data;
};

export const approveExercise = async (id: string) => {
    const response = await apiClient.put(`/admin/${id}/approve`);
    return response.data;
};

export const rejectExercise = async (id: string, reason: string) => {
    const response = await apiClient.put(`/admin/${id}/reject`, { reason });
    return response.data;
};

// Code execution API
export const runCodeTest = async (data: {
    language: string;
    code: string;
    input?: string;
    expectedOutput?: string;
    codeMode?: 'algorithm' | 'web';
    webRequirements?: Question['webRequirements'];
}) => {
    const response = await apiClient.post('/run-code', data);
    return response.data;
};

export const getAdminExerciseById = async (id: string) => {
    const response = await apiClient.get(`/admin/${id}`);
    return response.data.data || response.data.exercise || response.data;
};

export const getAdminExerciseOverview = async (id: string) => {
    const response = await apiClient.get(`/admin/${id}/overview`);
    return unwrapApiPayload<AdminExerciseOverview>(response.data);
};

export const getAdminDetailedStatistics = async (id: string) => {
    const response = await apiClient.get(`/admin/${id}/detailed-statistics`);
    return unwrapApiPayload<AdminDetailedStatistics>(response.data);
};

export const getAdminSubmissions = async (
    id: string,
    params?: { page?: number; limit?: number; search?: string },
) => {
    const response = await apiClient.get(`/admin/${id}/submissions`, { params });
    return unwrapApiPayload<{
        submissions: AdminSubmissionItem[];
        total: number;
        page: number;
        totalPages: number;
        hasEssay: boolean;
        essayMaxPoints: number;
        totalPoints: number;
    }>(response.data);
};

export const getAdminSubmissionDetail = async (exerciseId: string, answerId: string) => {
    const response = await apiClient.get(`/admin/${exerciseId}/submissions/${answerId}`);
    return unwrapApiPayload<AdminSubmissionDetail>(response.data);
};

export const gradeAdminEssayAnswers = async (
    exerciseId: string,
    answerId: string,
    payload: {
        grades?: Array<{ questionId: string; points: number; feedback?: string }>;
        overallFeedback?: string;
    },
) => {
    const response = await apiClient.put(`/admin/${exerciseId}/submissions/${answerId}/grade-essays`, payload);
    return unwrapApiPayload(response.data);
};

export const createExercise = async (data: Partial<Exercise>) => {
    const response = await apiClient.post('/admin', data);
    return response.data;
};

export const updateExercise = async (id: string, data: Partial<Exercise>) => {
    const response = await apiClient.put(`/admin/${id}`, data);
    return response.data;
};

export const deleteExercise = async (id: string) => {
    const response = await apiClient.delete(`/admin/${id}`);
    return response.data;
};

export const scanAiExplanations = async (content: string) => {
    const response = await apiClient.post('/admin/scan-explanations', { content });
    const data = response.data.data || response.data;
    return data.explanations || [];
};

// Export as named export for easier imports
export const luyentapApi = {
    getPublicExercises,
    getPublicExerciseById,
    getExerciseBySlug,
    getOverallLeaderboard,
    getExerciseLeaderboard,
    getExerciseForTaking,
    startExerciseAttempt,
    saveExerciseAttemptProgress,
    submitExerciseAnswer,
    getUserAnswer,
    spinExerciseCoin,
    getUserExercises,
    getUserExerciseHistory,
    checkUserAttempts,
    getExerciseAccess,
    verifyExercisePassword,
    getUserPurchases,
    getPurchaseStatus,
    purchaseWithCoin,
    purchaseWithPayos,
    getExerciseReactions,
    reactToExercise,
    getExerciseStatistics,
    getRecentParticipants,
    getAdminExercises,
    getAdminExerciseById,
    getAdminExerciseOverview,
    getAdminDetailedStatistics,
    getAdminSubmissions,
    getAdminSubmissionDetail,
    gradeAdminEssayAnswers,
    createExercise,
    updateExercise,
    deleteExercise,
    runCodeTest,
    // Aliases for admin page compatibility
    adminList: getAdminExercises,
    adminListFolders: getAdminFolders,
    adminCreateFolder: createAdminFolder,
    adminUpdateFolder: updateAdminFolder,
    adminDeleteFolder: deleteAdminFolder,
    adminGetById: getAdminExerciseById,
    adminGetOverview: getAdminExerciseOverview,
    adminGetSubmissions: getAdminSubmissions,
    adminGetSubmissionDetail: getAdminSubmissionDetail,
    adminGradeEssays: gradeAdminEssayAnswers,
    adminCreate: createExercise,
    adminUpdate: updateExercise,
    adminDelete: deleteExercise,
    adminApprove: approveExercise,
    adminReject: rejectExercise,
    scanAiExplanations,
};

export default luyentapApi;
