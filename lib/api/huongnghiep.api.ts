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

export interface TrainingPlace {
    _id: string;
    logo: string;
    name: string;
    region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
    province: string;
    type: 'Công lập' | 'Tư thục';
    description: string;
    createdBy: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
        username?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Industry {
    _id: string;
    image: string;
    name: string;
    basicInfo: string;
    careerPath: string;
    expertAdvice: string;
    salary: string;
    createdBy: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
        username?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IndustryDetail {
    _id: string;
    name: string;
    slug: string;
    thumbnail?: string;
    group: string;
    overview?: {
        introduction?: string;
        careerPath?: string;
        salary?: string;
    };
    expertAdvice?: string;
    updatedAt: string;
}

export interface CreateIndustryData {
    image?: string;
    name: string;
    basicInfo: string;
    careerPath: string;
    expertAdvice: string;
    salary: string;
}

export interface UpdateIndustryData {
    image?: string;
    name?: string;
    basicInfo?: string;
    careerPath?: string;
    expertAdvice?: string;
    salary?: string;
}

export interface IndustriesResponse {
    success: boolean;
    data: Industry[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

export interface IndustryDetailResponse {
    success: boolean;
    data: IndustryDetail;
    message?: string;
}

export interface IndustryResponse {
    success: boolean;
    data: Industry;
    message?: string;
}

export interface CreateTrainingPlaceData {
    logo?: string;
    name: string;
    region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
    province: string;
    type: 'Công lập' | 'Tư thục';
    description: string;
}

export interface UpdateTrainingPlaceData {
    logo?: string;
    name?: string;
    region?: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
    province?: string;
    type?: 'Công lập' | 'Tư thục';
    description?: string;
}

export interface TrainingPlacesResponse {
    success: boolean;
    data: TrainingPlace[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

export interface TrainingPlaceResponse {
    success: boolean;
    data: TrainingPlace;
    message?: string;
}

export const huongnghiepApi = {
    // Admin APIs - Training Places
    getAllTrainingPlaces: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        region?: string;
        province?: string;
    }): Promise<TrainingPlacesResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.region) queryParams.append('region', params.region);
        if (params?.province) queryParams.append('province', params.province);

        const response = await apiClient.get(`/admin/huongnghiep/all?${queryParams.toString()}`);
        return response.data;
    },

    getTrainingPlaceById: async (id: string): Promise<TrainingPlaceResponse> => {
        const response = await apiClient.get(`/admin/huongnghiep/${id}`);
        return response.data;
    },

    createTrainingPlace: async (data: CreateTrainingPlaceData): Promise<TrainingPlaceResponse> => {
        console.log('API createTrainingPlace called with data:', data);
        const response = await apiClient.post('/admin/huongnghiep', data);
        return response.data;
    },

    updateTrainingPlace: async (id: string, data: UpdateTrainingPlaceData): Promise<TrainingPlaceResponse> => {
        const response = await apiClient.put(`/admin/huongnghiep/${id}`, data);
        return response.data;
    },

    deleteTrainingPlace: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/admin/huongnghiep/${id}`);
        return response.data;
    },

    // Admin APIs - Industries
    getAllIndustries: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<IndustriesResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const response = await apiClient.get(`/admin/huongnghiep/industries/all?${queryParams.toString()}`);
        return response.data;
    },

    getIndustryById: async (id: string): Promise<IndustryResponse> => {
        const response = await apiClient.get(`/admin/huongnghiep/industries/${id}`);
        return response.data;
    },

    createIndustry: async (data: CreateIndustryData): Promise<IndustryResponse> => {
        const response = await apiClient.post('/admin/huongnghiep/industries', data);
        return response.data;
    },

    updateIndustry: async (id: string, data: UpdateIndustryData): Promise<IndustryResponse> => {
        const response = await apiClient.put(`/admin/huongnghiep/industries/${id}`, data);
        return response.data;
    },

    deleteIndustry: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/admin/huongnghiep/industries/${id}`);
        return response.data;
    },

    // Public APIs - Industry Details
    getIndustryBySlug: async (slug: string): Promise<IndustryDetailResponse> => {
        const response = await apiClient.get(`/huongnghiep/${slug}`);
        return response.data;
    },

    getAllIndustryDetails: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ success: boolean; data: IndustryDetail[]; message?: string }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const response = await apiClient.get(`/huongnghiep/all?${queryParams.toString()}`);
        return response.data;
    },
};
