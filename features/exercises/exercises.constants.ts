import { Subject, Difficulty } from "./exercises.types";

export const SUBJECTS: { value: Subject | ""; label: string }[] = [
    { value: "", label: "Tất cả" },
    { value: "programming", label: "Lập trình" },
    { value: "ai", label: "AI" },
    { value: "office", label: "Tin học VP" },
    { value: "highschool", label: "THPT" },
    { value: "other", label: "Khác" },
];

export const DIFFICULTIES: { value: Difficulty | ""; label: string; color: string }[] = [
    { value: "", label: "Tất cả", color: "text-foreground" },
    { value: "easy", label: "Dễ", color: "text-emerald-500" },
    { value: "medium", label: "Trung bình", color: "text-amber-500" },
    { value: "hard", label: "Khó", color: "text-red-500" },
];

export const difficultyConfig: Record<Difficulty, { label: string; cls: string }> = {
    easy: { label: "Dễ", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    medium: { label: "Trung bình", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    hard: { label: "Khó", cls: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export const subjectLabel: Record<Subject, string> = {
    programming: "Lập trình",
    ai: "AI",
    office: "Tin học VP",
    highschool: "THPT",
    other: "Khác",
};