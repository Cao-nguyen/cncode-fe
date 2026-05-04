// app/admin/affiliate/page.tsx
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

    const summaryCards = [
        { title: "Đã đăng ký", value: totals.registered.toLocaleString(), icon: <Users size={18} />, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Bài viết", value: totals.posted.toLocaleString(), icon: <FileText size={18} />, color: "text-green-500", bg: "bg-green-50" },
        { title: "Bài tập", value: totals.quizTaken.toLocaleString(), icon: <TrendingUp size={18} />, color: "text-purple-500", bg: "bg-purple-50" },
        { title: "Xu kiếm được", value: totals.coins.toLocaleString(), icon: <Coins size={18} />, color: "text-yellow-500", bg: "bg-yellow-50" },
        { title: "Tổng click", value: totals.clicks.toLocaleString(), icon: <MousePointerClick size={18} />, color: "text-gray-500", bg: "bg-gray-100" },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--cn-text-main)]">Tiếp thị liên kết</h1>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-0.5">
                        Quản lý link giới thiệu của người dùng • Tổng {total} người
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cn-text-muted)]" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tìm theo email hoặc tên..."
                            className="pl-9 pr-3 py-1.5 text-sm border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 outline-none bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] w-52"
                        />
                    </div>
                    <button onClick={handleSearch} className="px-3 py-1.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] text-sm hover:bg-[var(--cn-primary-hover)] transition">
                        Tìm
                    </button>
                </div>
            </div>

            {/* Summary Cards - Custom không dùng DashboardCard */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {summaryCards.map((card) => (
                    <div key={card.title} className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-3 sm:p-4 border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-lg ${card.bg}`}>
                                <div className={card.color}>{card.icon}</div>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--cn-text-muted)]">{card.title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-[var(--cn-text-main)] mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] shadow-[var(--cn-shadow-sm)] border border-[var(--cn-border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-[var(--cn-primary)]/5 border-b border-[var(--cn-border)]">
                            <tr>
                                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Người dùng</th>
                                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Mã & Link</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Click</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Đăng ký</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Bài viết</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Bài tập</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Xu</th>
                                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--cn-border)]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-12">
                                        <Loading text="Đang tải" />
                                    </td>
                                </tr>
                            ) : stats.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-[var(--cn-text-muted)]">
                                        <div className="flex flex-col items-center gap-2">
                                            <TrendingUp size={40} className="text-[var(--cn-text-muted)]" />
                                            <p className="text-sm">Chưa có dữ liệu affiliate</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                stats.map((stat) => (
                                    <tr key={stat._id} className="hover:bg-[var(--cn-hover)] transition">
                                        <td className="p-3 sm:p-4">
                                            <div>
                                                <p className="font-medium text-sm text-[var(--cn-text-main)]">{stat.user?.fullName || 'N/A'}</p>
                                                <p className="text-xs text-[var(--cn-text-muted)]">{stat.user?.email}</p>
                                                {stat.user?.username && <p className="text-xs text-[var(--cn-primary)]">@{stat.user.username}</p>}
                                            </div>
                                        </td>
                                        <td className="p-3 sm:p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <code className="text-xs font-mono font-semibold text-[var(--cn-primary)] bg-[var(--cn-primary)]/5 px-2 py-0.5 rounded">
                                                        {stat.code}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopy(stat.code, `code-${stat._id}`)}
                                                        className="p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] transition"
                                                        title="Copy mã"
                                                    >
                                                        {copiedId === `code-${stat._id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-[var(--cn-text-muted)] truncate max-w-[140px]">{stat.link}</span>
                                                    <button
                                                        onClick={() => handleCopy(stat.link, `link-${stat._id}`)}
                                                        className="p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] transition flex-shrink-0"
                                                        title="Copy link"
                                                    >
                                                        {copiedId === `link-${stat._id}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 sm:p-4 text-center text-sm text-[var(--cn-text-sub)]">{stat.clicks.toLocaleString()}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-blue-600">{stat.totalRegistered}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-green-600">{stat.totalPosted}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-purple-600">{stat.totalTakenQuiz}</td>
                                        <td className="p-3 sm:p-4 text-center font-semibold text-sm text-[var(--cn-primary)]">{stat.totalCoinsEarned.toLocaleString()}</td>
                                        <td className="p-3 sm:p-4 text-center text-xs text-[var(--cn-text-muted)]">
                                            {format(new Date(stat.createdAt), 'dd/MM/yyyy')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="border-t border-[var(--cn-border)] px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-[var(--cn-text-muted)]">Tổng {total} người dùng có affiliate</div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                            >
                                <ChevronLeft size={16} className="text-[var(--cn-text-sub)]" />
                            </button>
                            <span className="px-3 text-sm font-medium text-[var(--cn-text-main)]">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                            >
                                <ChevronRight size={16} className="text-[var(--cn-text-sub)]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}