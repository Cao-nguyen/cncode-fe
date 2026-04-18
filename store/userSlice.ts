import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string | null;
    username: string | null;
    birthday: string | null;
    province: string | null;
    className: string | null;
    school: string | null;
    bio: string | null;
    role: "user" | "teacher" | "admin";
    plan: "basic" | "pro";
    cncoins: number;
    streak: number;
    referralCode: string;
    isProfileCompleted: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SafeUserStorage {
    _id: string;
    name: string;
    avatar: string | null;
    role: "user" | "teacher" | "admin";
    plan: "basic" | "pro";
    cncoins: number;
    streak: number;
    username: string | null;
}

interface UserState {
    user: User | null;
    token: string | null;
    isLoaded: boolean;
}

const getInitialState = (): UserState => {
    if (typeof window === "undefined") {
        return { user: null, token: null, isLoaded: false };
    }

    try {
        const token = localStorage.getItem("token");
        const safeUserStr = localStorage.getItem("user_safe");

        if (token && safeUserStr) {
            const safeUser = JSON.parse(safeUserStr) as SafeUserStorage;
            const partialUser: User = {
                _id: safeUser._id,
                name: safeUser.name,
                email: "",
                avatar: safeUser.avatar,
                username: safeUser.username,
                birthday: null,
                province: null,
                className: null,
                school: null,
                bio: null,
                role: safeUser.role,
                plan: safeUser.plan,
                cncoins: safeUser.cncoins,
                streak: safeUser.streak,
                referralCode: "",
                isProfileCompleted: false,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            };
            return { user: partialUser, token, isLoaded: true };
        }
    } catch (error) {
        console.error("Failed to load user from localStorage:", error);
    }

    return { user: null, token: null, isLoaded: false };
};

const initialState: UserState = getInitialState();

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isLoaded = true;

            if (typeof window !== "undefined") {
                localStorage.setItem("token", action.payload.token);

                const safeUser: SafeUserStorage = {
                    _id: action.payload.user._id,
                    name: action.payload.user.name,
                    avatar: action.payload.user.avatar,
                    role: action.payload.user.role,
                    plan: action.payload.user.plan,
                    cncoins: action.payload.user.cncoins,
                    streak: action.payload.user.streak,
                    username: action.payload.user.username,
                };
                localStorage.setItem("user_safe", JSON.stringify(safeUser));
            }
        },

        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                if (typeof window !== "undefined") {
                    const safeUser: SafeUserStorage = {
                        _id: state.user._id,
                        name: state.user.name,
                        avatar: state.user.avatar,
                        role: state.user.role,
                        plan: state.user.plan,
                        cncoins: state.user.cncoins,
                        streak: state.user.streak,
                        username: state.user.username,
                    };
                    localStorage.setItem("user_safe", JSON.stringify(safeUser));
                }
            }
        },

        updateUserStats: (state, action: PayloadAction<{ cncoins?: number; streak?: number }>) => {
            if (state.user) {
                if (action.payload.cncoins !== undefined) {
                    state.user.cncoins = action.payload.cncoins;
                }
                if (action.payload.streak !== undefined) {
                    state.user.streak = action.payload.streak;
                }
                if (typeof window !== "undefined") {
                    const safeUser: SafeUserStorage = {
                        _id: state.user._id,
                        name: state.user.name,
                        avatar: state.user.avatar,
                        role: state.user.role,
                        plan: state.user.plan,
                        cncoins: state.user.cncoins,
                        streak: state.user.streak,
                        username: state.user.username,
                    };
                    localStorage.setItem("user_safe", JSON.stringify(safeUser));
                }
            }
        },

        setUserFromSafe: (state, action: PayloadAction<SafeUserStorage>) => {
            const safeUser = action.payload;
            const partialUser: User = {
                _id: safeUser._id,
                name: safeUser.name,
                email: "",
                avatar: safeUser.avatar,
                username: safeUser.username,
                birthday: null,
                province: null,
                className: null,
                school: null,
                bio: null,
                role: safeUser.role,
                plan: safeUser.plan,
                cncoins: safeUser.cncoins,
                streak: safeUser.streak,
                referralCode: "",
                isProfileCompleted: false,
                isActive: true,
                createdAt: "",
                updatedAt: "",
            };
            state.user = partialUser;
            state.isLoaded = true;
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isLoaded = true;

            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user_safe");
            }
        },

        setLoaded: (state) => {
            state.isLoaded = true;
        },
    },
});

export const {
    setUser,
    updateUser,
    updateUserStats,
    setUserFromSafe,
    logout,
    setLoaded,
} = userSlice.actions;

export default userSlice.reducer;

export const selectUser = (state: RootState) => state.user.user;
export const selectToken = (state: RootState) => state.user.token;
export const selectIsLoaded = (state: RootState) => state.user.isLoaded;
export const selectIsAuthenticated = (state: RootState) => !!state.user.user && !!state.user.token;
export const selectUserRole = (state: RootState) => state.user.user?.role || "user";
export const selectIsAdmin = (state: RootState) => state.user.user?.role === "admin";
export const selectIsTeacher = (state: RootState) => state.user.user?.role === "teacher";
export const selectUserStats = (state: RootState) => ({
    cncoins: state.user.user?.cncoins || 0,
    streak: state.user.user?.streak || 0,
    plan: state.user.user?.plan || "basic",
});