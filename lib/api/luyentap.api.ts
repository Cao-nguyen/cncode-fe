import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    baseURL: `${API_URL}/api/luyentap`,
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
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question: string;
    explanation?: string;
    options?: Array<{ _id?: string; text: string; isCorrect: boolean }>;
    trueFalseOptions?: Array<{ text: string; isCorrect: boolean }>;
    correctAnswer?: string;
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
    status: 'draft' | 'published';
    createdBy?: string | User;
    participantCount: number;
    maxAttempts: number;
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
    const result = response.data.data || response.data;
    return result;
};

export const getExerciseBySlug = async (slug: string) => {
    const response = await apiClient.get(`/public/${slug}`);
    return response.data;
};

export const getPublicExerciseById = async (id: string) => {
    const response = await apiClient.get(`/public/id/${id}`);
    return response.data.data || response.data;
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
}) => {
    try {
        const response = await apiClient.post('/run-code', data);
        return response.data;
    } catch (error) {
        // Mock response for development when backend is not available
        return {
            success: true,
            data: {
                output: 'Code execution not available in development',
                passed: false,
                error: 'Backend code execution service not configured'
            }
        };
    }
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

// Export as named export for easier imports
export const luyentapApi = {
    getPublicExercises,
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
};

export default luyentapApi;
