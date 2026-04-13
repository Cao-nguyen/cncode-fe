"use client";

import { ArrowLeft, ArrowRight } from "iconsax-react";
import { useExercises } from "@/features/exercises/exercises.hooks";
import { ExerciseCard } from "@/components/sections/exercise/ExerciseCard";
import { ExerciseCardSkeleton } from "@/components/sections/exercise/ExerciseCardSkeleton";
import { ExerciseFilters } from "@/components/sections/exercise/ExerciseFilters";

export default function LuyenTapPage() {
    const {
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
    } = useExercises();

    return (
        <div className="min-h-screen bg-background">
            <div className="relative border-b border-border bg-linear-to-b from-primary/5 to-background">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Luyện tập
                        </h1>
                        <p className="text-muted-foreground">
                            {total} bài tập từ cơ bản đến nâng cao — trắc nghiệm, tự luận, lập trình
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <ExerciseFilters
                    search={search}
                    subject={subject}
                    difficulty={difficulty}
                    isFree={isFree}
                    onSearchChange={setSearch}
                    onSubjectChange={setSubject}
                    onDifficultyChange={setDifficulty}
                    onIsFreeChange={setIsFree}
                    onReset={resetFilters}
                />

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                        {Array(8).fill(0).map((_, i) => (
                            <ExerciseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4">📭</p>
                        <p className="text-muted-foreground">Không tìm thấy bài tập phù hợp</p>
                        <button
                            onClick={resetFilters}
                            className="mt-4 text-sm text-primary hover:underline"
                        >
                            Xoá bộ lọc
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                            {exercises.map((ex) => (
                                <ExerciseCard key={ex._id} exercise={ex} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm border border-border rounded-xl
                                               disabled:opacity-40 hover:border-primary/40 transition
                                               flex items-center gap-1"
                                >
                                    <ArrowLeft size={16} variant="Outline" />
                                    Trước
                                </button>
                                <span className="text-sm text-muted-foreground">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 text-sm border border-border rounded-xl
                                               disabled:opacity-40 hover:border-primary/40 transition
                                               flex items-center gap-1"
                                >
                                    Sau
                                    <ArrowRight size={16} variant="Outline" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}