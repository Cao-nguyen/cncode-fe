'use client';

import { useEffect, useState } from 'react';
import { useShortLinkStore } from '@/store/shortlink.store';
import { Link2, MousePointerClick, TrendingUp, Calendar } from 'lucide-react';
import { ClickStatsChart } from './ClickStatsChart';

export function UserStatsOverview() {
    const { links, fetchMyLinks } = useShortLinkStore();
    const [selectedShortCode, setSelectedShortCode] = useState<string | null>(null);
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        fetchMyLinks(1);
    }, [fetchMyLinks]);

    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
    const totalLinks = links.length;
    const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

    if (links.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Thống kê tổng quan
                </h2>
                {selectedShortCode && (
                    <button
                        onClick={() => {
                            setSelectedShortCode(null);
                            setShowChart(false);
                        }}
                        className="text-xs text-[var(--cn-primary)] hover:underline"
                    >
                        Quay lại tổng quan
                    </button>
                )}
            </div>

            {!selectedShortCode ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Link2 size={14} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase">Tổng link</span>
                            </div>
                            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                {totalLinks}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-1.5 mb-1">
                                <MousePointerClick size={14} className="text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase">Tổng clicks</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                {totalClicks.toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-1.5 mb-1">
                                <TrendingUp size={14} className="text-purple-600 dark:text-purple-400" />
                                <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 uppercase">Trung bình</span>
                            </div>
                            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                {avgClicks}
                            </p>
                        </div>
                    </div>

                    {/* Top Links */}
                    {links.length > 0 && (
                        <div>
                            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Link hoạt động tốt nhất
                            </h3>
                            <div className="space-y-2">
                                {links.slice(0, 3).map((link) => (
                                    <button
                                        key={link.shortCode}
                                        onClick={() => {
                                            setSelectedShortCode(link.shortCode);
                                            setShowChart(true);
                                        }}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                                <Link2 size={14} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {link.shortCode}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {link.originalUrl}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {link.clicks.toLocaleString('vi-VN')}
                                                </p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">clicks</p>
                                            </div>
                                            <Calendar size={14} className="text-gray-400 group-hover:text-[var(--cn-primary)] transition-colors" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <ClickStatsChart shortCode={selectedShortCode} isAdmin={false} />
            )}
        </div>
    );
}
