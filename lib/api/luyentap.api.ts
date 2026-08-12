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
};

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
            console.error('API Error:', error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);

// Types
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
    webRequirements?: Array<{
        type: string;
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
    difficulty?: 'easy' | 'medium' | 'hard';
    price?: number;
    discountType?: 'percent' | 'vnd';
    discountValue?: number;
    discountPrice?: number;
    allowCoinPayment?: boolean;
    passThreshold?: number;
    creationMethod?: 'editor' | 'upload';
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
    timeSpent?: number;
    submittedAt?: string;
    totalScore?: number;
    totalExercises?: number;
    totalTimeSpent?: number;
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
    return response.data.data || response.data;
};

export const submitExerciseAnswer = async (exerciseId: string, data: {
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

// Admin APIs
export const getAdminExercises = async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await apiClient.get('/admin/list', { params });
    return response.data.data || response.data;
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
    submitExerciseAnswer,
    getUserAnswer,
    getUserExercises,
    getUserExerciseHistory,
    checkUserAttempts,
    getAdminExercises,
    getAdminExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    runCodeTest,
    // Aliases for admin page compatibility
    adminList: getAdminExercises,
    adminGetById: getAdminExerciseById,
    adminCreate: createExercise,
    adminUpdate: updateExercise,
    adminDelete: deleteExercise,
    adminApprove: approveExercise,
    adminReject: rejectExercise,
    scanAiExplanations,
};

export default luyentapApi;
