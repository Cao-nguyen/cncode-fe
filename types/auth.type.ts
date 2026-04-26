export type UserRole = 'user' | 'teacher' | 'admin';

export interface User {
    _id: string;
    email: string;
    username?: string;
    fullName: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    isOnboarded?: boolean;
    createdAt: Date;
    updatedAt: Date;
    coins: number;
    bio?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    streak?: number;
    socialLinks?: {
        facebook?: string;
        github?: string;
        linkedin?: string;
        twitter?: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterCredentials {
    email: string;
    username: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    role?: UserRole;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
    token?: string;
    coins?: number;
}

export interface AuthError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    coins: number;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    setAuth: (user: User | null, token: string | null) => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    register: (data: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<void>;
    changePassword: (data: ChangePasswordData) => Promise<void>;
    forgotPassword: (data: ForgotPasswordData) => Promise<void>;
    resetPassword: (data: ResetPasswordData) => Promise<void>;
    updateCoins: (amount: number) => void;
    updateStreak: (streak: number) => void;
    clearError: () => void;
    setUser: (user: User | null) => void;
    setIsOnboarded: (value: boolean) => void;
}

export interface IGoogleLoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
        isNewUser: boolean;
    };
}

export interface IOnboardingData {
    username: string;
    class: string;
    province: string;
    school: string;
    birthday: string;
    bio: string;
}

export interface IOnboardingResponse {
    success: boolean;
    message: string;
    data: User;
}