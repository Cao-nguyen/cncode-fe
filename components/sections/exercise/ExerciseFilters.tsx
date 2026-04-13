"use client";

import { SearchNormal1 } from "iconsax-react";
import { SUBJECTS, DIFFICULTIES } from "@/features/exercises/exercises.constants";
import { Subject, Difficulty } from "@/features/exercises/exercises.types";

interface ExerciseFiltersProps {
    search: string;
    subject: Subject | "";
    difficulty: Difficulty | "";
    isFree: boolean | null;
    onSearchChange: (value: string) => void;
    onSubjectChange: (value: Subject | "") => void;
    onDifficultyChange: (value: Difficulty | "") => void;
    onIsFreeChange: (value: boolean | null) => void;
    onReset: () => void;
}

export function ExerciseFilters({
    search,
    subject,
    difficulty,
    isFree,
    onSearchChange,
    onSubjectChange,
    onDifficultyChange,
    onIsFreeChange,
    onReset,
}: ExerciseFiltersProps) {
    const hasActiveFilters = search || subject || difficulty || isFree !== null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <SearchNormal1 variant="Outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm kiếm bài tập..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl
                                   focus:outline-none focus:border-primary/50 transition"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={difficulty}
                        onChange={(e) => onDifficultyChange(e.target.value as Difficulty | "")}
                        className="text-sm px-3 py-2.5 bg-card border border-border rounded-xl
                                   focus:outline-none focus:border-primary/50 transition"
                    >
                        {DIFFICULTIES.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                    <select
                        value={isFree === null ? "" : String(isFree)}
                        onChange={(e) => {
                            const value = e.target.value;
                            onIsFreeChange(value === "" ? null : value === "true");
                        }}
                        className="text-sm px-3 py-2.5 bg-card border border-border rounded-xl
                                   focus:outline-none focus:border-primary/50 transition"
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Miễn phí</option>
                        <option value="false">Trả phí</option>
                    </select>
                    {hasActiveFilters && (
                        <button
                            onClick={onReset}
                            className="text-sm px-3 py-2.5 text-muted-foreground hover:text-foreground
                                       border border-border rounded-xl transition"
                        >
                            Xoá lọc
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {SUBJECTS.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => onSubjectChange(s.value)}
                        className={`text-sm px-4 py-2 rounded-full whitespace-nowrap border transition-all
                            ${subject === s.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-muted-foreground hover:border-primary/40"
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}