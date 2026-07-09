'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Clock, Award, CheckCircle } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CNBOOKS_DATA } from '@/lib/data/cnbooks.data';

export default function CnBooksPage() {
    const router = useRouter();
    const { book, lessons } = CNBOOKS_DATA;

    const completedLessons = lessons.filter(l =>
        l.exercises.every(ex => ex.completed)
    ).length;

    const progress = Math.round((completedLessons / book.totalLessons) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                                <Book className="w-16 h-16 text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {book.title}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                                {book.subtitle}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {book.description}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Book className="w-4 h-4" />
                                    <span>{book.totalLessons} bài học</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>{book.estimatedTotalTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Award className="w-4 h-4" />
                                    <span className="capitalize">{book.level.replace('-', ' ')}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <span>Tiến độ học tập</span>
                                    <span>{completedLessons}/{book.totalLessons} bài</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {book.features.map((feature, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">{feature}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lessons List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Danh sách bài học
                    </h2>

                    <div className="space-y-3">
                        {lessons.map((lesson) => {
                            const isCompleted = lesson.exercises.every(ex => ex.completed);
                            const completedEx = lesson.exercises.filter(ex => ex.completed).length;

                            return (
                                <div
                                    key={lesson.id}
                                    onClick={() => router.push(`/cnbooks/${lesson.slug}`)}
                                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {lesson.order}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {lesson.title}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {lesson.duration}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {lesson.difficulty === 'beginner' ? 'Cơ bản' :
                                                    lesson.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                                            </span>
                                            <span>{completedEx}/{lesson.exercises.length} bài tập</span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        {isCompleted ? (
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                        ) : (
                                            <CustomButton>Học ngay</CustomButton>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}