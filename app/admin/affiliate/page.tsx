// app/admin/affiliate/page.tsx
// FIX issue 10: trang affiliate admin hiển thị đầy đủ dữ liệu
// FIX issue 11: dùng affiliate.api.ts và affiliate.type.ts riêng

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Users, FileText, Coins, TrendingUp, MousePointerClick, Copy, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { affiliateApi } from '@/lib/api/affiliate.api';
import type { IAffiliateStat } from '@/types/affiliate.type';
import Loading from '@/components/common/Loading';
import { format } from 'date-fns';

export default function AdminAffiliatePage() {
    const { token } = useAuthStore();
    const [stats, setStats] = useState<IAffiliateStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Summary totals
    const [totals, setTotals] = useState({
        registered: 0,
        posted: 0,
        quizTaken: 0,
        coins: 0,
        clicks: 0,
    });

    const fetchStats = useCallback(async (p: number, s: string) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const result = await affiliateApi.getAdminStats({ page: p, limit: 20, search: s }, token);
            if (result.success && result.data) {
                const { stats: data, total: t, totalPages: tp } = result.data;
                setStats(data);
                setTotal(t);
                setTotalPages(tp);

                // Tính tổng từ current page (nếu muốn tổng toàn bộ thì cần API riêng)
                setTotals({
                    registered: data.reduce((a, b) => a + b.totalRegistered, 0),
                    posted: data.reduce((a, b) => a + b.totalPosted, 0),
                    quizTaken: data.reduce((a, b) => a + b.totalTakenQuiz, 0),
                    coins: data.reduce((a, b) => a + b.totalCoinsEarned, 0),
                    clicks: data.reduce((a, b) => a + b.clicks, 0),
                });
            }
        } catch (error) {
            console.error('Fetch affiliate stats error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStats(page, search);
    }, [page, search, fetchStats]);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading && stats.length === 0) {
        return <Loading text="Đang tải dữ liệu" />;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Tiếp thị liên kết</h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Quản lý link giới thiệu của người dùng • Tổng {total} người
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tìm theo email hoặc tên..."
                            className="pl-9 pr-3 py-1.5 text-sm border border-main/30 rounded-lg focus:border-main focus:ring-2 focus:ring-main/20 outline-none bg-white dark:bg-gray-900 dark:text-white w-52"
                        />
                    </div>
                    <button onClick={handleSearch} className="px-3 py-1.5 bg-main text-white rounded-lg text-sm hover:bg-main/80 transition">
                        Tìm
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-900 border border-main/20 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                        <Users size={16} />
                        <span className="text-xs text-gray-500">Đã đăng ký</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{totals.registered.toLocaleString()}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-900 border border-green-200 shadow-sm">
                    <div className="flex items-center gap-2 text-green-500 mb-1">
                        <FileText size={16} />
                        <span className="text-xs text-gray-500">Bài viết</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">{totals.posted.toLocaleString()}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-900 border border-purple-200 shadow-sm">
                    <div className="flex items-center gap-2 text-purple-500 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs text-gray-500">Bài tập</span>
                    </div>
                    <p className="text-xl font-bold text-purple-600">{totals.quizTaken.toLocaleString()}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-900 border border-main/20 shadow-sm">
                    <div className="flex items-center gap-2 text-main mb-1">
                        <Coins size={16} />
                        <span className="text-xs text-gray-500">Xu kiếm được</span>
                    </div>
                    <p className="text-xl font-bold text-main">{totals.coins.toLocaleString()}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-900 border border-gray-200 shadow-sm col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <MousePointerClick size={16} />
                        <span className="text-xs text-gray-500">Tổng click</span>
                    </div>
                    <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{totals.clicks.toLocaleString()}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-main/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-main/5 border-b border-main/20">
                            <tr>
                                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Người dùng</th>
                                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Mã & Link</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Click</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Đăng ký</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Bài viết</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Bài tập</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Xu</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-main">Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-main/10">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-12">
                                        <Loading text="Đang tải" />
                                    </td>
                                </tr>
                            ) : stats.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <TrendingUp size={40} className="text-gray-300" />
                                            <p className="text-sm">Chưa có dữ liệu affiliate</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                stats.map((stat) => (
                                    <tr key={stat._id} className="hover:bg-main/5 transition">
                                        <td className="p-3 sm:p-4">
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{stat.user?.fullName || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{stat.user?.email}</p>
                                                {stat.user?.username && <p className="text-xs text-main">@{stat.user.username}</p>}
                                            </div>
                                        </td>
                                        <td className="p-3 sm:p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <code className="text-xs font-mono font-semibold text-main bg-main/5 px-2 py-0.5 rounded">
                                                        {stat.code}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopy(stat.code, `code-${stat._id}`)}
                                                        className="p-1 text-gray-400 hover:text-main transition"
                                                        title="Copy mã"
                                                    >
                                                        {copiedId === `code-${stat._id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[140px]">{stat.link}</span>
                                                    <button
                                                        onClick={() => handleCopy(stat.link, `link-${stat._id}`)}
                                                        className="p-1 text-gray-400 hover:text-main transition flex-shrink-0"
                                                        title="Copy link"
                                                    >
                                                        {copiedId === `link-${stat._id}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 sm:p-4 text-center text-sm text-gray-600 dark:text-gray-400">{stat.clicks.toLocaleString()}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-blue-600">{stat.totalRegistered}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-green-600">{stat.totalPosted}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-purple-600">{stat.totalTakenQuiz}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-main">{stat.totalCoinsEarned.toLocaleString()}</td>
                                        <td className="p-3 sm:p-4 text-center text-xs text-gray-500">
                                            {format(new Date(stat.createdAt), 'dd/MM/yyyy')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="border-t border-main/20 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-gray-500">Tổng {total} người dùng có affiliate</div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 text-sm font-medium">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1.5 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}