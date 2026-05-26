// app/quanly/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Settings, ChevronRight } from 'lucide-react';

export default function ManagementPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Settings className="w-6 h-6 text-blue-600" />
                        Hệ thống quản lý
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Quản lý nội dung và tài nguyên hệ thống</p>
                </div>

                {/* Grid Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                    {/* Card CNbooks */}
                    <Link href="/quanly/cnbooks" className="group">
                        <div className="relative h-48 bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 overflow-hidden">

                            {/* Nền họa tiết ẩn */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BookOpen className="w-24 h-24" />
                            </div>

                            <div className="h-full p-6 flex flex-col justify-between relative z-10">
                                {/* Icon Header */}
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Title & Meta */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                        CNbooks
                                    </h3>
                                    <div className="flex items-center text-xs text-gray-400 mt-1 font-medium">
                                        <span>Quản lý kho sách</span>
                                        <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>

                            {/* Border Bottom Hoạt họa */}
                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
                        </div>
                    </Link>

                    {/* Bạn có thể thêm các card quản lý khác ở đây trong tương lai */}
                    {/* <Link href="/quanly/users" className="group">...</Link> */}

                </div>
            </div>
        </div>
    );
}