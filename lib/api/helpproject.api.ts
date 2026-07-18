import { HelpProject, CreateHelpProjectDto, UpdateHelpProjectDto } from '@/types/helpproject.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const helpProjectApi = {
    createProject: async (data: CreateHelpProjectDto) => {
        const response = await fetch(`${API_URL}/api/helpproject`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getUserProjects: async (
        params: { page?: number; limit?: number; status?: string; search?: string } = {}
    ) => {
        const query = new URLSearchParams();

        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);
        if (params.search) query.append('search', params.search);

        const url = `${API_URL}/api/helpproject/my-projects${query.toString() ? `?${query}` : ''}`;

        const response = await fetch(url, { headers: getAuthHeaders() });
        return response.json();
    },

    getProjectById: async (id: string) => {
        const response = await fetch(`${API_URL}/api/helpproject/${id}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    updateProject: async (id: string, data: UpdateHelpProjectDto) => {
        const response = await fetch(`${API_URL}/api/helpproject/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteProject: async (id: string) => {
        const response = await fetch(`${API_URL}/api/helpproject/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getAllProjects: async (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);
        if (params.search) query.append('search', params.search);

        const url = `${API_URL}/api/admin/helpproject/all${query.toString() ? `?${query}` : ''}`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        return response.json();
    },

    getStatistics: async () => {
        const response = await fetch(`${API_URL}/api/admin/helpproject/statistics`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    addReply: async (id: string, content: string) => {
        const response = await fetch(`${API_URL}/api/helpproject/${id}/reply`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    adminAddReply: async (id: string, content: string) => {
        const response = await fetch(`${API_URL}/api/helpproject/${id}/reply`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    updateStatus: async (id: string, status: string) => {
        const response = await fetch(`${API_URL}/api/admin/helpproject/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        return response.json();
    },

    adminDeleteProject: async (id: string) => {
        const response = await fetch(`${API_URL}/api/admin/helpproject/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    }
};
