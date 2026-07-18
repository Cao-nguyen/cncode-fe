'use client';

import React from 'react';
import { Info, FileText, Shield, Settings, Wallet, Lock } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';

interface SystemSettingsPageProps {
    content: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    loading?: boolean;
}

const pageIcons: Record<string, React.ReactNode> = {
    gioithieu: <Info className="w-8 h-8" />,
    dieukhoansudung: <FileText className="w-8 h-8" />,
    antoanbaomat: <Shield className="w-8 h-8" />,
    quytrinhsudung: <Settings className="w-8 h-8" />,
    huongdanthanhtoan: <Wallet className="w-8 h-8" />,
    chinhsachbaohanh: <Lock className="w-8 h-8" />,
};

const pageColors: Record<string, string> = {
    gioithieu: 'from-blue-500 to-cyan-500',
    dieukhoansudung: 'from-purple-500 to-pink-500',
    antoanbaomat: 'from-green-500 to-emerald-500',
    quytrinhsudung: 'from-orange-500 to-amber-500',
    huongdanthanhtoan: 'from-indigo-500 to-violet-500',
    chinhsachbaohanh: 'from-rose-500 to-red-500',
};

export default function SystemSettingsPage({
    content,
    title,
    description,
    icon,
    loading = false,
}: SystemSettingsPageProps) {
    const pageKey = Object.keys(pageIcons).find(key => title.toLowerCase().includes(key)) || 'gioithieu';
    const gradientClass = pageColors[pageKey] || pageColors.gioithieu;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-7xl mx-auto px-3 lg:px-6 py-12">
                    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
                        <div className="animate-pulse">
                            <div className="h-12 w-64 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl mb-6" />
                            <div className="h-6 w-96 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl mb-8" />
                            <div className="space-y-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Mobile spacer for fixed header */}
            <div className="h-8 md:hidden" />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-3 lg:px-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg shadow-black/20`}>
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
                                {title}
                            </h1>
                            <p className="text-slate-300 text-lg lg:text-xl">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-3 lg:px-6 py-12 -mt-8">
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 lg:p-12 border border-slate-100">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
                    
                    <div className="relative">
                        <StaticContent content={content} className="text-slate-700" />
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="max-w-7xl mx-auto px-3 lg:px-6 pb-12">
                <div className="text-center text-slate-400 text-sm">
                    <p>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
        </div>
    );
}
