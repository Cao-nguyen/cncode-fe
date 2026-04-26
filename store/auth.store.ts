import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    AuthState,
    User,
    LoginCredentials,
    RegisterCredentials,
    ChangePasswordData,
    ForgotPasswordData,
    ResetPasswordData,
} from '@/types/auth.type';

const initialState = {
    user: null,
    token: null,
    coins: 0,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setAuth: (user: User | null, token: string | null): void => {
                set({
                    user,
                    token,
                    coins: user?.coins ?? 0,
                    isAuthenticated: !!user && !!token,
                    isLoading: false,
                    error: null,
                });
            },

            login: async (credentials: LoginCredentials): Promise<void> => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(credentials),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Đăng nhập thất bại');
                    }

                    const data = await response.json();
                    const userData = data.user;
                    const tokenData = data.token;

                    set({
                        user: userData,
                        token: tokenData,
                        coins: userData?.coins ?? 0,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    console.log('Login success - coins:', userData?.coins);
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
                    });
                    throw error;
                }
            },

            googleLogin: async (credential: string): Promise<void> => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credential }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Đăng nhập với Google thất bại');
                    }

                    const data = await response.json();
                    const userData = data.user;
                    const tokenData = data.token;

                    set({
                        user: userData,
                        token: tokenData,
                        coins: userData?.coins ?? 0,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    console.log('Google login success - coins:', userData?.coins);
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Đăng nhập với Google thất bại',
                    });
                    throw error;
                }
            },

            register: async (data: RegisterCredentials): Promise<void> => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Đăng ký thất bại');
                    }

                    const result = await response.json();
                    const userData = result.user;
                    const tokenData = result.token;

                    set({
                        user: userData,
                        token: tokenData,
                        coins: userData?.coins ?? 0,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    console.log('Register success - coins:', userData?.coins);
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Đăng ký thất bại',
                    });
                    throw error;
                }
            },

            logout: async (): Promise<void> => {
                set({ isLoading: true });
                try {
                    const token = get().token;
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    set({
                        ...initialState,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        ...initialState,
                        isLoading: false,
                    });
                }
            },

            updateProfile: async (userData: Partial<User>): Promise<void> => {
                set({ isLoading: true, error: null });
                try {
                    const token = get().token;
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(userData),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Cập nhật thất bại');
                    }

                    const data = await response.json();
                    const updatedUser = data.user;

                    set({
                        user: updatedUser,
                        coins: updatedUser?.coins ?? get().coins,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Cập nhật thất bại',
                    });
                    throw error;
                }
            },

            changePassword: async (data: ChangePasswordData): Promise<void> => {
                set({ isLoading: true, error: null });
                try {
                    const token = get().token;
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Đổi mật khẩu thất bại');
                    }

                    set({ isLoading: false, error: null });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Đổi mật khẩu thất bại',
                    });
                    throw error;
                }
            },

            forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Gửi yêu cầu thất bại');
                    }

                    set({ isLoading: false, error: null });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Gửi yêu cầu thất bại',
                    });
                    throw error;
                }
            },

            resetPassword: async (data: ResetPasswordData): Promise<void> => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Đặt lại mật khẩu thất bại');
                    }

                    set({ isLoading: false, error: null });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Đặt lại mật khẩu thất bại',
                    });
                    throw error;
                }
            },

            updateCoins: (amount: number): void => {
                const currentCoins = get().coins;
                const newCoins = currentCoins + amount;
                const finalCoins = newCoins >= 0 ? newCoins : 0;

                set({ coins: finalCoins });

                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: { ...currentUser, coins: finalCoins },
                    });
                }
            },

            updateStreak: (streak: number): void => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: { ...currentUser, streak },
                    });
                }
            },

            clearError: (): void => {
                set({ error: null });
            },

            setUser: (user: User | null): void => {
                set({
                    user,
                    coins: user?.coins ?? 0,
                    isAuthenticated: !!user && !!get().token,
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                coins: state.coins,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);