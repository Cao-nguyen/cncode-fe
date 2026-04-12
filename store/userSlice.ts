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
}

interface UserState {
    user: User | null;
    token: string | null;
    isLoaded: boolean;
}

const initialState: UserState = {
    user: null,
    token: null,
    isLoaded: false,
};

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
            }
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isLoaded = true;

            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
            }
        },

        setLoaded: (state) => {
            state.isLoaded = true;
        },
    },
});

export const { setUser, logout, setLoaded } = userSlice.actions;
export default userSlice.reducer;

/* ===== SELECTORS ===== */
export const selectUser = (state: RootState) => state.user.user;
export const selectToken = (state: RootState) => state.user.token;
export const selectIsLoaded = (state: RootState) => state.user.isLoaded;