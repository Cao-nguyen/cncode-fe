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
    baseURL: `${API_URL}/api`,
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

export interface HuongNghiepStats {
    A: number;
    B: number;
    C: number;
    D: number;
    total: number;
}

export interface Workplace {
    _id?: string;
    image: string;
    name: string;
    address: string;
}

export interface TrainingPlace {
    _id?: string;
    logo: string;
    name: string;
    strengths: string;
    location: string;
    region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
    type: 'Tư thục' | 'Công lập';
    majorsCount: number;
    tuitionMin: number;
    tuitionMax: number;
}

export interface HuongNghiep {
    _id: string;
    name: string;
    slug: string;
    group: 'A' | 'B' | 'C' | 'D';
    overview: {
        introduction: string;
        salaryMin: number | string;
        salaryMax: number | string;
        demandLevel: 'Không cao' | 'Bình thường' | 'Cao' | 'Rất cao';
        trainingDurationMin: number | string;
        trainingDurationMax: number | string;
        whatIndustryDoes: string[];
    };
    knowledge: string[];
    requirements: string[];
    skills: string[];
    expertAdvice: string;
    jobOpportunities: Workplace[];
    trainingPlaces: TrainingPlace[];
    thumbnail: string;
    isPublished: boolean;
    publishedAt?: Date;
    createdBy: {
        _id: string;
        fullName: string;
        avatar?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateHuongNghiepData {
    name: string;
    group: 'A' | 'B' | 'C' | 'D';
    thumbnail?: string;
    overview: {
        introduction: string;
        salaryMin: number | string;
        salaryMax: number | string;
        demandLevel: 'Không cao' | 'Bình thường' | 'Cao' | 'Rất cao';
        trainingDurationMin: number | string;
        trainingDurationMax: number | string;
        whatIndustryDoes: string[];
    };
    knowledge: string[];
    requirements: string[];
    skills: string[];
    expertAdvice: string;
    jobOpportunities?: Workplace[];
    trainingPlaces?: TrainingPlace[];
}

export interface UpdateHuongNghiepData extends Partial<CreateHuongNghiepData> {}

export interface HuongNghiepPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface HuongNghiepResponse {
    success: boolean;
    data: HuongNghiep;
    message?: string;
}

export interface HuongNghiepListResponse {
    success: boolean;
    data: HuongNghiep[];
    pagination: HuongNghiepPagination;
    message?: string;
}

export interface StatsResponse {
    success: boolean;
    data: HuongNghiepStats;
}

export const huongnghiepApi = {
    // Admin APIs
    getStats: async (): Promise<StatsResponse> => {
        const response = await apiClient.get('/huongnghiep/admin/stats');
        return response.data;
    },

    getAllIndustries: async (params?: {
        page?: number;
        limit?: number;
        group?: string;
        search?: string;
        isPublished?: boolean;
    }): Promise<HuongNghiepListResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.group) queryParams.append('group', params.group);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.isPublished !== undefined) queryParams.append('isPublished', params.isPublished.toString());

        const response = await apiClient.get(`/huongnghiep/admin/all?${queryParams.toString()}`);
        return response.data;
    },

    getIndustryById: async (id: string): Promise<HuongNghiepResponse> => {
        const response = await apiClient.get(`/huongnghiep/admin/${id}`);
        return response.data;
    },

    createIndustry: async (data: CreateHuongNghiepData): Promise<HuongNghiepResponse> => {
        const response = await apiClient.post('/huongnghiep/admin', data);
        return response.data;
    },

    updateIndustry: async (id: string, data: UpdateHuongNghiepData): Promise<HuongNghiepResponse> => {
        const response = await apiClient.put(`/huongnghiep/admin/${id}`, data);
        return response.data;
    },

    deleteIndustry: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/huongnghiep/admin/${id}`);
        return response.data;
    },

    togglePublish: async (id: string): Promise<HuongNghiepResponse> => {
        const response = await apiClient.patch(`/huongnghiep/admin/${id}/publish`);
        return response.data;
    },

    // Public APIs
    getIndustriesByGroup: async (group: string, limit?: number): Promise<HuongNghiepListResponse> => {
        const response = await apiClient.get(`/huongnghiep/group/${group}${limit ? `?limit=${limit}` : ''}`);
        return response.data;
    },

    getIndustryBySlug: async (slug: string): Promise<HuongNghiepResponse> => {
        const response = await apiClient.get(`/huongnghiep/slug/${slug}`);
        return response.data;
    },

    // Workplace APIs
    getAllWorkplaces: async (): Promise<{ success: boolean; data: Workplace[] }> => {
        const response = await apiClient.get('/huongnghiep/admin/workplaces');
        return response.data;
    },

    createWorkplace: async (data: Workplace): Promise<{ success: boolean; data: Workplace; message: string }> => {
        const response = await apiClient.post('/huongnghiep/admin/workplaces', data);
        return response.data;
    },

    updateWorkplace: async (id: string, data: Partial<Workplace>): Promise<{ success: boolean; data: Workplace; message: string }> => {
        const response = await apiClient.put(`/huongnghiep/admin/workplaces/${id}`, data);
        return response.data;
    },

    deleteWorkplace: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/huongnghiep/admin/workplaces/${id}`);
        return response.data;
    },

    // Training Place APIs
    getAllTrainingPlaces: async (): Promise<{ success: boolean; data: TrainingPlace[] }> => {
        const response = await apiClient.get('/huongnghiep/admin/training-places');
        return response.data;
    },

    createTrainingPlace: async (data: TrainingPlace): Promise<{ success: boolean; data: TrainingPlace; message: string }> => {
        const response = await apiClient.post('/huongnghiep/admin/training-places', data);
        return response.data;
    },

    updateTrainingPlace: async (id: string, data: Partial<TrainingPlace>): Promise<{ success: boolean; data: TrainingPlace; message: string }> => {
        const response = await apiClient.put(`/huongnghiep/admin/training-places/${id}`, data);
        return response.data;
    },

    deleteTrainingPlace: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/huongnghiep/admin/training-places/${id}`);
        return response.data;
    },
};
