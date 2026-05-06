import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials, RegisterCredentials, ChangePasswordData, ForgotPasswordData, ResetPasswordData } from '@/types/auth.type';

const initialState = {
    user: null,
    token: null,
    coins: 0,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    _hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Thêm method để set hydrated
            setHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

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

            forceLogout: (): void => {
                localStorage.removeItem('token');
                localStorage.removeItem('auth-storage');
                set({ ...initialState, _hasHydrated: true }); // Giữ lại _hasHydrated = true
            },

            checkAndSync: async (): Promise<void> => {
                const token = get().token;
                if (!token) return;

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!response.ok) {
                        get().forceLogout();
                        return;
                    }

                    const data = await response.json();
                    const userData = data.user ?? data.data;
                    set({
                        user: userData,
                        coins: userData?.coins ?? 0,
                        isAuthenticated: true,
                    });
                } catch {
                    get().forceLogout();
                }
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
                    set({
                        user: data.user,
                        token: data.token,
                        coins: data.user?.coins ?? 0,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    localStorage.setItem('token', data.token);
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
                    set({
                        user: data.user,
                        token: data.token,
                        coins: data.user?.coins ?? 0,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    localStorage.setItem('token', data.token);
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
                    set({
                        user: result.user,
                        token: result.token,
                        coins: result.user?.coins ?? 0,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    localStorage.setItem('token', result.token);
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
                    if (token) {
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        });
                    }
                } catch {
                    // ignore
                } finally {
                    localStorage.removeItem('token');
                    localStorage.removeItem('auth-storage');
                    set({ ...initialState, _hasHydrated: true });
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
                    set({
                        user: data.user,
                        coins: data.user?.coins ?? get().coins,
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
                const finalCoins = Math.max(0, currentCoins + amount);
                set({ coins: finalCoins });
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, coins: finalCoins } });
                }
            },

            updateStreak: (streak: number): void => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, streak } });
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

            setIsOnboarded: (value: boolean): void => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, isOnboarded: value } });
                }
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
            onRehydrateStorage: () => (state) => {
                console.log('onRehydrateStorage called:', state);
                if (state) {
                    // Cách 1: Dùng setTimeout để đảm bảo setState sau khi rehydrate
                    setTimeout(() => {
                        useAuthStore.setState({ _hasHydrated: true });
                        console.log('_hasHydrated set to true');
                    }, 0);
                } else {
                    // Nếu không có state, cũng set hydrated = true
                    setTimeout(() => {
                        useAuthStore.setState({ _hasHydrated: true });
                    }, 0);
                }
            },
        }
    )
);