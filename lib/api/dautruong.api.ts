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
    baseURL: `${API_URL}/api/dautruong`,
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
        // Only log non-404 errors for public endpoints (404 is expected if contest not found)
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

export interface Contest {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    startTime: string;
    endTime: string;
    duration: number;
    questions: Question[];
    totalPoints: number;
    status: 'draft' | 'published' | 'ended';
    createdBy?: string | User;
    participantCount: number;
    maxAttempts: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserAnswer {
    _id: string;
    contestId: string | Contest;
    userId: string | User;
    answers: Array<{
        questionId: string;
        selectedOption?: string;
        trueFalseAnswers?: Array<{ optionIndex: number; isTrue: boolean }>;
        shortAnswer?: string;
        isCorrect: boolean;
        points: number;
    }>;
    totalScore: number;
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
    totalContests?: number;
    totalTimeSpent?: number;
}

// Public APIs
export const getPublicContests = async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/public', { params });
    console.log('getPublicContests full response:', response);
    console.log('getPublicContests response.data:', response.data);
    const result = response.data.data || response.data;
    console.log('getPublicContests result:', result);
    return result;
};

export const getContestBySlug = async (slug: string) => {
    const response = await apiClient.get(`/public/${slug}`);
    return response.data;
};

export const getPublicContestById = async (id: string) => {
    const response = await apiClient.get(`/public/id/${id}`);
    return response.data.data || response.data;
};

export const getOverallLeaderboard = async (limit?: number) => {
    const response = await apiClient.get('/public/leaderboard/overall', { params: { limit } });
    console.log('getOverallLeaderboard response:', response.data);
    return response.data.data || response.data;
};

export const getContestLeaderboard = async (contestId: string, limit?: number) => {
    const response = await apiClient.get(`/${contestId}/leaderboard`, { params: { limit } });
    console.log('getContestLeaderboard response:', response.data);
    return response.data.data || response.data;
};

// User APIs
export const getContestForTaking = async (contestId: string) => {
    const response = await apiClient.get(`/${contestId}/take`);
    return response.data.data || response.data;
};

export const submitContestAnswer = async (contestId: string, data: {
    answers: Array<{
        questionId: string;
        selectedOption?: string;
        trueFalseAnswers?: Array<{ optionIndex: number; isTrue: boolean }>;
        shortAnswer?: string;
    }>;
    timeSpent: number;
}) => {
    const response = await apiClient.post(`/${contestId}/submit`, data);
    return response.data;
};

export const getUserAnswer = async (contestId: string) => {
    const response = await apiClient.get(`/${contestId}/result`);
    return response.data.data || response.data;
};

export const getUserContests = async () => {
    const response = await apiClient.get('/me/contests');
    return response.data;
};

export const checkUserAttempts = async (contestId: string) => {
    const response = await apiClient.get(`/me/contests/${contestId}/check-attempts`);
    return response.data.data || response.data;
};

export const getUserContestHistory = async (contestId: string) => {
    const response = await apiClient.get(`/me/contests/${contestId}/history`);
    return response.data.data || response.data;
};

// Admin APIs
export const getAdminContests = async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get('/admin/list', { params });
    return response.data.data || response.data;
};

export const getAdminContestById = async (id: string) => {
    const response = await apiClient.get(`/admin/${id}`);
    console.log('getAdminContestById response:', response.data);
    return response.data.data || response.data.contest || response.data;
};

export const createContest = async (data: Partial<Contest>) => {
    const response = await apiClient.post('/admin', data);
    return response.data;
};

export const updateContest = async (id: string, data: Partial<Contest>) => {
    console.log('updateContest called with id:', id, 'data:', data);
    const response = await apiClient.put(`/admin/${id}`, data);
    console.log('updateContest response:', response.data);
    return response.data;
};

export const deleteContest = async (id: string) => {
    const response = await apiClient.delete(`/admin/${id}`);
    return response.data;
};

export default {
    getPublicContests,
    getContestBySlug,
    getOverallLeaderboard,
    getContestLeaderboard,
    getContestForTaking,
    submitContestAnswer,
    getUserAnswer,
    getUserContests,
    getAdminContests,
    getAdminContestById,
    createContest,
    updateContest,
    deleteContest,
};
