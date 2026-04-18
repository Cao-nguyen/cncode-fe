// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string | null;
    username: string | null;
    role: 'user' | 'teacher' | 'admin';
    plan: 'basic' | 'pro';
    cncoins: number;
    streak: number;
    isProfileCompleted: boolean;
    birthday: string | null;
    province: string | null;
    className: string | null;
    school: string | null;
    bio: string | null;
    referralCode: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: User;
    };
}

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Gửi cookie cùng request
});

// Interceptor: Tự động thêm token vào mọi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor: Xử lý lỗi toàn cục
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('user_safe');
            // Chuyển về trang login nếu không phải đang ở trang login
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    // Đăng nhập bằng Google
    googleLogin: async (credentialToken: string): Promise<{ token: string; user: User }> => {
        const response = await axiosInstance.post<LoginResponse>('/api/user/google', {
            token: credentialToken
        });
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Đăng nhập thất bại');
        }
        
        return response.data.data;
    },

    // Kiểm tra token và lấy thông tin user
    checkAuth: async (token: string): Promise<User> => {
        const response = await axiosInstance.get<{ success: boolean; data: User }>('/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data.success) {
            throw new Error('Xác thực thất bại');
        }
        
        return response.data.data;
    },

    // Đăng xuất
    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post('/api/user/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        }
    },

    // Cập nhật profile (onboarding)
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await axiosInstance.post('/api/user/onboarding', data);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Cập nhật thất bại');
        }
        return response.data.data;
    }
};

export default axiosInstance;