"use client";

import { SearchNormal, Filter, Refresh } from "iconsax-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExerciseFiltersProps {
    search: string;
    subject: string;
    difficulty: string;
    isFree: boolean;
    onSearchChange: (value: string) => void;
    onSubjectChange: (value: string) => void;
    onDifficultyChange: (value: string) => void;
    onIsFreeChange: (value: boolean) => void;
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
    return (
        <div className="space-y-4">
            <div className="relative">
                <SearchNormal size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Tìm kiếm bài tập..."
                    className="pl-10"
                />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <select
                    value={subject}
                    onChange={(e) => onSubjectChange(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                >
                    <option value="">Tất cả chủ đề</option>
                    <option value="programming">Lập trình</option>
                    <option value="ai">AI</option>
                    <option value="office">Tin học văn phòng</option>
                    <option value="highschool">THPT</option>
                    <option value="other">Khác</option>
                </select>

                <select
                    value={difficulty}
                    onChange={(e) => onDifficultyChange(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                >
                    <option value="">Tất cả độ khó</option>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                </select>

                <label className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => onIsFreeChange(e.target.checked)}
                        className="accent-primary"
                    />
                    Miễn phí
                </label>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="flex items-center gap-1"
                >
                    <Refresh size={14} variant="Outline" />
                    Đặt lại
                </Button>
            </div>
        </div>
    );
}