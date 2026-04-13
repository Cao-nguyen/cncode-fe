"use client";

import Link from "next/link";
import Image from "next/image";
import { Exercise } from "@/features/exercises/exercises.types";
import { difficultyConfig, subjectLabel } from "@/features/exercises/exercises.constants";
import { Book, Clock, UserOctagon, Star1, Lock, Flash } from "iconsax-react";

interface ExerciseCardProps {
    exercise: Exercise;
}

const getSubjectEmoji = (subject: string): string => {
    const emojiMap: Record<string, string> = {
        programming: "💻",
        ai: "🤖",
        office: "📊",
        highschool: "🏫",
        other: "🌟",
    };
    return emojiMap[subject] || "📚";
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
    const diff = difficultyConfig[exercise.difficulty];
    const subjectEmoji = getSubjectEmoji(exercise.subject);
    const tags = exercise.tags ?? [];
    const questionsCount = exercise.questions?.length ?? 0;

    return (
        <Link href={`/luyentap/${exercise._id}`}>
            <div className="group relative bg-card border border-border rounded-2xl overflow-hidden
                            hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5
                            transition-all duration-300 cursor-pointer h-full flex flex-col">
                <div className="relative h-40 bg-linear-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
                    {exercise.thumbnail ? (
                        <Image
                            src={exercise.thumbnail}
                            alt={exercise.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl opacity-30">{subjectEmoji}</span>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${diff.cls}`}>
                            {diff.label}
                        </span>
                        {!exercise.isFree && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border
                                            bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex items-center gap-1">
                                <Lock size={10} variant="Outline" />
                                {exercise.costCoins} xu
                            </span>
                        )}
                        {exercise.isSpinnable && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border
                                            bg-purple-500/10 text-purple-400 border-purple-500/20 flex items-center gap-1">
                                <Flash size={10} variant="Outline" />
                                Quay
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1 gap-3">
                    <div>
                        <p className="text-[11px] text-muted-foreground mb-1">
                            {subjectLabel[exercise.subject]}
                        </p>
                        <h3 className="font-semibold text-sm text-foreground line-clamp-2
                                       group-hover:text-primary transition-colors">
                            {exercise.title}
                        </h3>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                        {exercise.description}
                    </p>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {tags.slice(0, 3).map((tag) => (
                                <span key={tag}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2
                                    border-t border-border mt-auto">
                        <span className="flex items-center gap-1">
                            <Book size={12} variant="Outline" />
                            {questionsCount} câu
                        </span>
                        {exercise.timeLimit && (
                            <span className="flex items-center gap-1">
                                <Clock size={12} variant="Outline" />
                                {exercise.timeLimit} phút
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <UserOctagon size={12} variant="Outline" />
                            {exercise.totalAttempts}
                        </span>
                        {exercise.averageScore > 0 && (
                            <span className="flex items-center gap-1 ml-auto">
                                <Star1 size={12} variant="Bold" className="text-yellow-500" />
                                {exercise.averageScore}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}