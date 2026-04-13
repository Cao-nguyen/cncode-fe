import { ExercisesResponse, Subject, Difficulty } from "./exercises.types";

const API = process.env.NEXT_PUBLIC_API_URL;

export const exercisesApi = {
    getExercises: async (params: {
        search?: string;
        subject?: Subject | "";
        difficulty?: Difficulty | "";
        isFree?: boolean | null;
        page: number;
        limit: number;
    }): Promise<ExercisesResponse> => {
        const urlParams = new URLSearchParams();
        if (params.search) urlParams.set("search", params.search);
        if (params.subject) urlParams.set("subject", params.subject);
        if (params.difficulty) urlParams.set("difficulty", params.difficulty);
        if (params.isFree !== null && params.isFree !== undefined) {
            urlParams.set("isFree", String(params.isFree));
        }
        urlParams.set("page", String(params.page));
        urlParams.set("limit", String(params.limit));

        const res = await fetch(`${API}/api/exercises?${urlParams}`);
        const data = await res.json();
        return data;
    },
};