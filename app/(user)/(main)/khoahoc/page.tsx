// app/khoahoc/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, CheckCircle2, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

const COURSES_DATA = [
    {
        id: 1,
        title: 'Làm website với Google Site',
        desc: 'Khám phá cách xây dựng website chuyên nghiệp, hiện đại mà không cần biết lập trình. Khóa học hướng dẫn chi tiết từ việc lên ý tưởng, bố cục đến khi xuất bản trang web của riêng bạn chỉ trong vài giờ.',
        thumbnail: 'https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmExNWIzNTZjNzRjODE5MWE5NDU3Zjk2YTMyZDU2MDQ6ZmlsZV8wMDAwMDAwMDlmNDA3MjBiYWMxZDllYjYyYmJjYTAxMiIsInRzIjoiMjA1OTkiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImM4MTVhYjNhZDk0YmZiMTQxZDNkYzg0NDQzN2JlNTRjMjU0MmY1NjUyYTY5ZTkxYzIzZTlmYjg2ZDU0NDViOTIiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0=',
        price: 'Miễn phí',
        duration: 'Chưa xác định',
        lessons: 14,
        link: '/khoahoc/learn'
    }
];

export default function CoursesPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                        Khoá học trực tuyến
                    </h1>
                    <p className="text-gray-500 mt-2">Nâng cao kỹ năng mỗi ngày cùng CNcode</p>
                </div>

                {/* Grid Khóa học */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {COURSES_DATA.map((course) => (
                        <div
                            key={course.id}
                            className="group bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-[15/10] overflow-hidden">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-4 py-1.5 bg-green-500 text-white text-[11px] font-bold uppercase rounded-full shadow-lg shadow-green-500/20">
                                        {course.price}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                        {course.duration}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                        {course.lessons} bài học
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h2>

                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-8">
                                    {course.desc}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <Link href={course.link} className="w-full">
                                        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group/btn shadow-xl shadow-gray-200">
                                            <PlayCircle className="w-5 h-5" />
                                            Xem khoá học
                                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}