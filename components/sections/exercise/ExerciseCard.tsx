"use client";

import Link from "next/link";
import { Clock, DocumentCode, Eye, Lock } from "iconsax-react";
import { Exercise } from "@/types/exercise.types";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardProps {
    exercise: Exercise;
}

const difficultyColors = {
    easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const subjectLabels = {
    programming: "Lập trình",
    ai: "AI",
    office: "Tin học văn phòng",
    highschool: "THPT",
    other: "Khác",
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
    const isLocked = !exercise.isFree && exercise.costCoins > 0;

    return (
        <Link href={`/luyentap/${exercise._id}`} className="group block">
            <div className="relative bg-card border border-border rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {isLocked && (
                    <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                            <Lock size={12} variant="Bold" />
                            {exercise.costCoins} xu
                        </div>
                    </div>
                )}

                <div className="flex items-start justify-between mb-3">
                    <Badge className={difficultyColors[exercise.difficulty]}>
                        {exercise.difficulty === "easy" ? "Dễ" : exercise.difficulty === "medium" ? "Trung bình" : "Khó"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {subjectLabels[exercise.subject as keyof typeof subjectLabels]}
                    </span>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {exercise.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {exercise.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <DocumentCode size={14} variant="Outline" />
                            {exercise.questions?.length || 0} câu
                        </span>
                        {exercise.timeLimit && (
                            <span className="flex items-center gap-1">
                                <Clock size={14} variant="Outline" />
                                {exercise.timeLimit} phút
                            </span>
                        )}
                    </div>
                    <span className="flex items-center gap-1 group-hover:text-primary transition">
                        Làm bài
                        <Eye size={14} variant="Outline" />
                    </span>
                </div>
            </div>
        </Link>
    );
}