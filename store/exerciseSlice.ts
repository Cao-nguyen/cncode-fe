import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

export interface Exercise {
    _id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    subject: string;
    difficulty: string;
    tags: string[];
    isFree: boolean;
    costCoins: number;
    timeLimit: number | null;
    totalAttempts: number;
    totalCompletions: number;
    averageScore: number;
    author: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Submission {
    _id: string;
    exercise: Exercise;
    totalScore: number;
    maxScore: number;
    percentage: number;
    timeTaken: number;
    completedAt: string;
}

interface ExerciseState {
    exercises: Exercise[];
    currentExercise: Exercise | null;
    submissions: Submission[];
    isLoading: boolean;
    totalPages: number;
    currentPage: number;
}

const initialState: ExerciseState = {
    exercises: [],
    currentExercise: null,
    submissions: [],
    isLoading: false,
    totalPages: 0,
    currentPage: 1,
};

const exerciseSlice = createSlice({
    name: "exercise",
    initialState,
    reducers: {
        setExercises: (state, action: PayloadAction<{ exercises: Exercise[]; totalPages: number; currentPage: number }>) => {
            state.exercises = action.payload.exercises;
            state.totalPages = action.payload.totalPages;
            state.currentPage = action.payload.currentPage;
        },

        setCurrentExercise: (state, action: PayloadAction<Exercise | null>) => {
            state.currentExercise = action.payload;
        },

        setSubmissions: (state, action: PayloadAction<Submission[]>) => {
            state.submissions = action.payload;
        },

        addSubmission: (state, action: PayloadAction<Submission>) => {
            state.submissions.unshift(action.payload);
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setExercises,
    setCurrentExercise,
    setSubmissions,
    addSubmission,
    setLoading,
} = exerciseSlice.actions;

export default exerciseSlice.reducer;

export const selectExercises = (state: RootState) => state.exercise.exercises;
export const selectCurrentExercise = (state: RootState) => state.exercise.currentExercise;
export const selectSubmissions = (state: RootState) => state.exercise.submissions;
export const selectExerciseLoading = (state: RootState) => state.exercise.isLoading;
export const selectExercisePagination = (state: RootState) => ({
    totalPages: state.exercise.totalPages,
    currentPage: state.exercise.currentPage,
});