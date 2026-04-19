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
    xu: number;
    streak: number;
    createdAt: string;
    updatedAt: string;
}

export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface IUploadAvatarResponse {
    success: boolean;
    data: {
        url: string;
    };
    message?: string;  // Thêm message optional
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

    requestRoleChange: async (token: string): Promise<{ success: boolean; message: string }> => {
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

    changePassword: async (currentPassword: string, newPassword: string, token: string): Promise<{ success: boolean; message: string }> => {
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

    uploadAvatar: async (file: File, token: string): Promise<IUploadAvatarResponse> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${API_URL}/api/users/upload-avatar`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        return response.json();
    }
};