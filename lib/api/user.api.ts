// lib/api/user.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IUser {
    _id: string;
    fullName: string;
    email: string;
    username?: string;
    role: 'user' | 'teacher' | 'admin';
    requestedRole?: 'teacher' | null;
    class?: string;
    province?: string;
    school?: string;
    birthday?: string;
    bio?: string;
    avatar?: string;
    coins: number;
    streak: number;
    isOnboarded: boolean;
    lastActiveAt: string;
    createdAt: string;
    updatedAt: string;
    isBanned?: boolean;
    isMuted?: boolean;
    violations?: Array<{
        _id: string;
        reason: string;
        action: string;
        createdAt: string;
    }>;
}

export interface IUserStats {
    total: number;
    teachers: number;
    admins: number;
    pendingTeachers: number;
    newThisWeek: number;
    activeToday: number;
}

export interface IProvinceStat {
    _id: string;
    count: number;
}

export interface IUserFilters {
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const userApi = {
    getProfile: async (token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    updateProfile: async (data: Partial<IUser>, token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    requestRoleChange: async (token: string): Promise<IApiResponse<null>> => {
        const response = await fetch(`${API_URL}/api/users/request-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ requestedRole: 'teacher' })
        });
        return response.json();
    },

    changePassword: async (currentPassword: string, newPassword: string, token: string): Promise<IApiResponse<null>> => {
        const response = await fetch(`${API_URL}/api/users/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return response.json();
    },

    uploadAvatar: async (file: File, token: string): Promise<IApiResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await fetch(`${API_URL}/api/users/upload-avatar`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        return response.json();
    },

    // Admin APIs
    getAllUsers: async (token: string, filters: IUserFilters, page: number, limit: number): Promise<IApiResponse<IUser[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters.search && { search: filters.search }),
            ...(filters.role && { role: filters.role }),
            ...(filters.sortBy && { sortBy: filters.sortBy }),
            ...(filters.sortOrder && { sortOrder: filters.sortOrder })
        });
        const response = await fetch(`${API_URL}/api/users/admin/users?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    getUserStats: async (token: string): Promise<IApiResponse<IUserStats>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    getUserStatsByProvince: async (token: string): Promise<IApiResponse<{ stats: IProvinceStat[] }>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/stats/province`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    getPendingTeachers: async (token: string): Promise<IApiResponse<IUser[]>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/pending-teachers`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    approveTeacherRequest: async (userId: string, approved: boolean, token: string): Promise<IApiResponse<{ role: string }>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/approve-teacher`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ approved })
        });
        return response.json();
    },

    changeUserRole: async (userId: string, role: string, token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ role })
        });
        return response.json();
    },

    markViolation: async (userId: string, reason: string, action: string, token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/violations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ reason, action })
        });
        return response.json();
    },

    adjustUserCoins: async (userId: string, amount: number, reason: string, token: string): Promise<IApiResponse<{ coins: number }>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/coins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ amount, reason })
        });
        return response.json();
    },

    deleteUser: async (userId: string, token: string): Promise<IApiResponse<null>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    }
};