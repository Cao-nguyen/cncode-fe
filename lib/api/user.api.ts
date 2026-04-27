// lib/api/user.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
        adminId?: string;
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

export interface IProvinceStatsResponse {
    stats: IProvinceStat[];
    totalWithProvince: number;
    totalWithoutProvince: number;
    totalUsers: number;
}

export interface IUserFilters {
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface IApiResponse<T = unknown> {
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

async function handleResponse<T>(response: Response): Promise<IApiResponse<T>> {
    if (!response.ok) {
        let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // Không thể parse JSON
        }
        return {
            success: false,
            data: null as T,
            message: errorMessage,
        };
    }

    const data = await response.json();
    return data;
}

export const userApi = {
    // User APIs
    getProfile: async (token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IUser>(response);
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
        return handleResponse<IUser>(response);
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
        return handleResponse<null>(response);
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
        return handleResponse<null>(response);
    },

    uploadAvatar: async (file: File, token: string): Promise<IApiResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await fetch(`${API_URL}/api/users/upload-avatar`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        return handleResponse<{ url: string }>(response);
    },

    // Admin APIs
    getAllUsers: async (token: string, filters: IUserFilters, page: number, limit: number): Promise<IApiResponse<IUser[]>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters.search && { search: filters.search }),
            ...(filters.role && filters.role !== 'all' && { role: filters.role }),
            ...(filters.status && filters.status !== 'all' && { status: filters.status }),
            ...(filters.sortBy && { sortBy: filters.sortBy }),
            ...(filters.sortOrder && { sortOrder: filters.sortOrder })
        });
        const response = await fetch(`${API_URL}/api/users/admin/users?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IUser[]>(response);
    },

    getUserById: async (userId: string, token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IUser>(response);
    },

    updateUserByAdmin: async (userId: string, data: Partial<IUser>, token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return handleResponse<IUser>(response);
    },

    getUserStats: async (token: string): Promise<IApiResponse<IUserStats>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/stats`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IUserStats>(response);
    },

    getUserStatsByProvince: async (token: string): Promise<IApiResponse<IProvinceStatsResponse>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/stats/province`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IProvinceStatsResponse>(response);
    },

    getPendingTeachers: async (token: string): Promise<IApiResponse<IUser[]>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/pending-teachers`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IUser[]>(response);
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
        return handleResponse<{ role: string }>(response);
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
        return handleResponse<IUser>(response);
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
        return handleResponse<IUser>(response);
    },

    removeViolation: async (userId: string, violationId: string, token: string): Promise<IApiResponse<IUser>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/violations/${violationId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IUser>(response);
    },

    getViolatedUsers: async (token: string): Promise<IApiResponse<IUser[]>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/violations/list`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IUser[]>(response);
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
        return handleResponse<{ coins: number }>(response);
    },

    deleteUser: async (userId: string, token: string): Promise<IApiResponse<null>> => {
        const response = await fetch(`${API_URL}/api/users/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<null>(response);
    }
};