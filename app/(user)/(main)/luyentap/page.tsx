'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react';
import { LUYENTAP_DATA } from '@/lib/data/luyentap.data';
import { CustomButton } from '@/components/custom/CustomButton';

export default function LuyentapPage() {
    const exercises = LUYENTAP_DATA;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Luyện tập
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Rèn luyện kỹ năng qua các bài tập thực hành
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercises.map((exercise) => (
                        <Link
                            key={exercise._id}
                            href={`/luyentap/${exercise._id}`}
                            className="block group"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-600">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                            {exercise.tier === 'tin11' ? 'Tin 11' : 'Tin 10'}
                                        </span>
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            {exercise.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {exercise.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {exercise.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{exercise.questions.length} câu</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{exercise.duration} phút</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600">
                                    <CustomButton
                                        variant="outline"
                                        className="w-full group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all"
                                    >
                                        Bắt đầu làm bài
                                    </CustomButton>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {exercises.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">
                            Chưa có bài tập nào
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}