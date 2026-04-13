import { User } from "@/store/userSlice";

export interface OnboardingFormData {
    username: string;
    class: string;      // lớp (dropdown)
    province: string;   // tỉnh (dropdown)
    school: string;     // trường
    birthday: string;   // sinh nhật
    bio: string;        // bio
}

export interface UpdateProfileResponse {
    success: boolean;
    user: User;
    message?: string;
}

export interface CheckUsernameResponse {
    available: boolean;
    message?: string;
}

export interface ValidationErrors {
    username?: string;
    class?: string;
    province?: string;
    school?: string;
    birthday?: string;
    bio?: string;
}

export type OnboardingField = keyof OnboardingFormData;