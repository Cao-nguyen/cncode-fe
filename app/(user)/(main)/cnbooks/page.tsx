'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Clock, Award, ChevronRight, BookOpen, Highlighter, StickyNote } from 'lucide-react';
import { CNBOOKS_DATA } from '@/lib/data/cnbooks.data';

export default function CnBooksPage() {
    const router = useRouter();
    const { book, lessons } = CNBOOKS_DATA;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
                <p className="text-blue-600 text-xs uppercase tracking-[0.25em] mb-2 font-medium">
                    Thư viện CNbooks
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {book.title}
                </h1>
                <p className="text-gray-500 max-w-2xl mb-10">{book.subtitle}</p>

                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Book cover */}
                    <div className="flex-shrink-0 flex justify-center md:justify-start">
                        <div
                            className="relative cursor-pointer group"
                            onClick={() =>
                                lessons[0] &&
                                router.push(`/cnbooks/${lessons[0].slug}`)
                            }
                        >
                            <div className="w-44 h-60 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl flex flex-col items-center justify-center p-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">
                                <Book className="w-11 h-11 text-white/90 mb-4" />
                                <h2 className="text-center text-white text-lg font-bold leading-tight">
                                    Python
                                </h2>
                                <p className="text-center text-blue-100 text-xs mt-2">
                                    Cơ bản cho người mới
                                </p>
                                <div className="mt-auto pt-4 border-t border-white/20 w-full text-center">
                                    <span className="text-[10px] text-blue-100 uppercase tracking-widest">
                                        CNbooks
                                    </span>
                                </div>
                            </div>
                            <div className="w-48 h-2 bg-gray-200 rounded-full mt-3 mx-auto" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-5">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {book.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                {book.totalLessons} bài học
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-blue-500" />
                                {book.estimatedTotalTime}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-blue-500" />
                                {book.level.replace('-', ' → ')}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {book.features.slice(0, 3).map((feature, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                            <button
                                onClick={() =>
                                    lessons[0] &&
                                    router.push(`/cnbooks/${lessons[0].slug}`)
                                }
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Mở sách
                            </button>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Highlighter className="w-3.5 h-3.5" />
                                    Highlight
                                </span>
                                <span className="flex items-center gap-1">
                                    <StickyNote className="w-3.5 h-3.5" />
                                    Ghi chú
                                </span>
                                <span>Lưu trên trình duyệt</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table of contents */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Mục lục</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {lessons.map((lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => router.push(`/cnbooks/${lesson.slug}`)}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                            >
                                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-600 group-hover:text-blue-700 text-sm font-semibold transition-colors">
                                    {lesson.order}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                        {lesson.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                        <span>{lesson.duration}</span>
                                        <span>
                                            {lesson.difficulty === 'beginner'
                                                ? 'Cơ bản'
                                                : lesson.difficulty === 'intermediate'
                                                  ? 'Trung bình'
                                                  : 'Nâng cao'}
                                        </span>
                                        <span>{lesson.exercises.length} bài tập</span>
                                    </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
