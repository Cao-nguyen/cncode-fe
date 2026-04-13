import { useState, useEffect, useCallback } from "react";
import { Exercise, Subject, Difficulty } from "./exercises.types";
import { exercisesApi } from "./exercises.api";

export const useExercises = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState<Subject | "">("");
    const [difficulty, setDifficulty] = useState<Difficulty | "">("");
    const [isFree, setIsFree] = useState<boolean | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchExercises = useCallback(async () => {
        setLoading(true);
        try {
            const data = await exercisesApi.getExercises({
                search: search || undefined,
                subject: subject || undefined,
                difficulty: difficulty || undefined,
                isFree,
                page,
                limit: 12,
            });
            setExercises(data.exercises || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotal(data.pagination?.total || 0);
        } catch (error) {
            console.error("Fetch error:", error);
            setExercises([]);
        } finally {
            setLoading(false);
        }
    }, [search, subject, difficulty, isFree, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchExercises();
        }, search ? 400 : 0);
        return () => clearTimeout(timer);
    }, [fetchExercises, search]);

    const resetFilters = useCallback(() => {
        setSearch("");
        setSubject("");
        setDifficulty("");
        setIsFree(null);
        setPage(1);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return {
        exercises,
        loading,
        search,
        subject,
        difficulty,
        isFree,
        page,
        totalPages,
        total,
        setSearch,
        setSubject,
        setDifficulty,
        setIsFree,
        handlePageChange,
        resetFilters,
    };
};