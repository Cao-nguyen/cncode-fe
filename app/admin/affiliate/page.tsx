// app/admin/affiliate/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { affiliateApi } from '@/lib/api/affiliate.api';
import { IAffiliateStat } from '@/types/affiliate.type';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    Users,
    FileText,
    Coins,
    TrendingUp,
    MousePointerClick,
    Copy,
    Check,
    Link2,
    Eye,
    X,
    Tag,
    Calendar,
    Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';

const PAGE_SIZE = 10;

export default function AdminAffiliatePage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [stats, setStats] = useState<IAffiliateStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedStat, setSelectedStat] = useState<IAffiliateStat | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const [totals, setTotals] = useState({
        registered: 0,
        posted: 0,
        quizTaken: 0,
        coins: 0,
        clicks: 0,
    });

    // Responsive
    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await affiliateApi.getAdminStats({ page, limit: PAGE_SIZE, search }, token);
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
            console.error('Fetch stats error:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [token, page, search]);

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token, page, search, fetchStats]);

    // Socket realtime
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleAffiliateUpdated = () => {
            fetchStats();
        };

        socket.on('affiliate_updated', handleAffiliateUpdated);
        return () => {
            socket.off('affiliate_updated', handleAffiliateUpdated);
        };
    }, [socket, isConnected, fetchStats]);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openDetailModal = (stat: IAffiliateStat) => {
        setSelectedStat(stat);
        setShowDetailModal(true);
    };

    const getUserInitial = (stat: IAffiliateStat) => {
        const name = stat.user?.fullName || 'N/A';
        return name.charAt(0).toUpperCase();
    };

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = isMobile ? 3 : 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= (isMobile ? 2 : 3)) {
                for (let i = 1; i <= maxVisible; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - (isMobile ? 1 : 2)) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - (maxVisible - 1); i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = page - (isMobile ? 0 : 1); i <= page + (isMobile ? 0 : 1); i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const cardConfigs = [
        { key: 'registered', title: 'Đã đăng ký', value: totals.registered.toLocaleString(), icon: <Users size={18} />, iconBgColor: '#EFF6FF', iconColor: '#3B82F6' },
        { key: 'posted', title: 'Bài viết', value: totals.posted.toLocaleString(), icon: <FileText size={18} />, iconBgColor: '#F0FDF4', iconColor: '#22C55E' },
        { key: 'quizTaken', title: 'Bài tập', value: totals.quizTaken.toLocaleString(), icon: <TrendingUp size={18} />, iconBgColor: '#F3E8FF', iconColor: '#9333EA' },
        { key: 'coins', title: 'Xu kiếm được', value: totals.coins.toLocaleString(), icon: <Coins size={18} />, iconBgColor: '#FEF3C7', iconColor: '#D97706' },
        { key: 'clicks', title: 'Tổng click', value: totals.clicks.toLocaleString(), icon: <MousePointerClick size={18} />, iconBgColor: '#F1F5F9', iconColor: '#64748B' },
    ];

    if (loading && stats.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">Tiếp thị liên kết</h1>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-1">Quản lý link giới thiệu của người dùng</p>
                </div>
                <div className="bg-[var(--cn-primary)]/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-[var(--cn-primary)]">Tổng: {total} người</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {cardConfigs.map((card) => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                        change={0}
                        trend="neutral"
                    />
                ))}
            </div>


            {/* Filters */}
            <div className="bg-[var(--cn-bg-card)] rounded-xl p-4 shadow-sm border border-[var(--cn-border)]">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <CustomInputSearch
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchInput}
                            onChange={setSearchInput}
                            onSearch={(value) => { setSearchInput(value); setSearch(value); setPage(1); }}
                            size="medium"
                            variant="default"
                        />
                    </div>
                    <button onClick={() => fetchStats()} className="px-5 py-2.5 bg-[var(--cn-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--cn-primary-hover)] transition flex items-center gap-2">
                        <Search size={16} /> Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--cn-bg-card)] rounded-xl shadow-sm border border-[var(--cn-border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-[var(--cn-primary)]/5 border-b border-[var(--cn-border)]">
                            <tr>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Người dùng</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Mã & Link</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Click</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Đăng ký</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Bài viết</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Bài tập</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Xu</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--cn-border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)] mx-auto" />
                                        <p className="text-sm text-[var(--cn-text-muted)] mt-3">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : stats.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-2">
                                            <Link2 size={48} className="text-[var(--cn-text-muted)]" />
                                            <p className="text-sm text-[var(--cn-text-muted)]">Chưa có dữ liệu affiliate</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                stats.map((stat) => (
                                    <tr key={stat._id} className="hover:bg-[var(--cn-hover)] transition cursor-pointer group" onClick={() => openDetailModal(stat)}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-[var(--cn-primary)]">{getUserInitial(stat)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--cn-text-main)]">{stat.user?.fullName || 'N/A'}</p>
                                                    <p className="text-xs text-[var(--cn-text-muted)]">{stat.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <code className="text-xs font-mono font-semibold text-[var(--cn-primary)] bg-[var(--cn-primary)]/5 px-2 py-0.5 rounded">
                                                        {stat.code}
                                                    </code>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleCopy(stat.code, `code-${stat._id}`); }}
                                                        className="p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] transition"
                                                        title="Copy mã"
                                                    >
                                                        {copiedId === `code-${stat._id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[11px] text-[var(--cn-text-muted)] truncate max-w-[150px]">{stat.link}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleCopy(stat.link, `link-${stat._id}`); }}
                                                        className="p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] transition flex-shrink-0"
                                                        title="Copy link"
                                                    >
                                                        {copiedId === `link-${stat._id}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap"><span className="text-sm text-[var(--cn-text-sub)]">{stat.clicks.toLocaleString()}</span></td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap"><span className="font-semibold text-sm text-blue-600">{stat.totalRegistered}</span></td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap"><span className="font-semibold text-sm text-green-600">{stat.totalPosted}</span></td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap"><span className="font-semibold text-sm text-purple-600">{stat.totalTakenQuiz}</span></td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap"><span className="font-semibold text-sm text-[var(--cn-primary)]">{stat.totalCoinsEarned.toLocaleString()}</span></td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => openDetailModal(stat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Xem chi tiết"><Eye size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-[var(--cn-border)] px-5 py-4 flex items-center justify-between">
                        <div className="text-sm text-[var(--cn-text-muted)]">
                            Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} trên {total}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronsLeft size={16} /></button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronLeft size={16} /></button>
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((pageNum, idx) => (
                                    pageNum === '...' ? (
                                        <span key={idx} className="px-2 text-[var(--cn-text-muted)]">...</span>
                                    ) : (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum as number)}
                                            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition ${page === pageNum
                                                ? 'bg-[var(--cn-primary)] text-white'
                                                : 'hover:bg-[var(--cn-hover)] text-[var(--cn-text-sub)]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                ))}
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronRight size={16} /></button>
                            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronsRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedStat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[var(--cn-bg-card)] px-6 py-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[var(--cn-text-main)]">Chi tiết liên kết</h3>
                            <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition"><X size={18} className="text-[var(--cn-text-muted)]" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* User Info */}
                            <div className="flex items-center gap-4 p-4 bg-[var(--cn-bg-section)] rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-[var(--cn-primary)]/20 flex items-center justify-center">
                                    <span className="text-xl font-bold text-[var(--cn-primary)]">{getUserInitial(selectedStat)}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--cn-text-main)] text-lg">{selectedStat.user?.fullName || 'N/A'}</p>
                                    <p className="text-sm text-[var(--cn-text-muted)]">{selectedStat.user?.email}</p>
                                    {selectedStat.user?.username && <p className="text-xs text-[var(--cn-primary)]">@{selectedStat.user.username}</p>}
                                </div>
                            </div>

                            {/* Info Tags */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--cn-bg-section)] rounded-full">
                                    <Tag size={14} className="text-[var(--cn-primary)]" />
                                    <span className="text-sm text-[var(--cn-text-sub)]">Mã: {selectedStat.code}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--cn-bg-section)] rounded-full">
                                    <Calendar size={14} className="text-[var(--cn-primary)]" />
                                    <span className="text-sm text-[var(--cn-text-sub)]">{formatDate(selectedStat.createdAt)}</span>
                                </div>
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">LINK GIỚI THIỆU</label>
                                <div className="p-3 bg-[var(--cn-bg-section)] rounded-xl flex items-center justify-between gap-2">
                                    <code className="text-sm text-[var(--cn-text-main)] break-all">{selectedStat.link}</code>
                                    <button onClick={() => handleCopy(selectedStat.link, `detail-link-${selectedStat._id}`)} className="p-1.5 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] transition flex-shrink-0">
                                        {copiedId === `detail-link-${selectedStat._id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">THỐNG KÊ</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-3 bg-[var(--cn-bg-section)] rounded-xl text-center">
                                        <p className="text-2xl font-bold text-[var(--cn-primary)]">{selectedStat.clicks.toLocaleString()}</p>
                                        <p className="text-xs text-[var(--cn-text-muted)]">Lượt click</p>
                                    </div>
                                    <div className="p-3 bg-[var(--cn-bg-section)] rounded-xl text-center">
                                        <p className="text-2xl font-bold text-blue-600">{selectedStat.totalRegistered}</p>
                                        <p className="text-xs text-[var(--cn-text-muted)]">Đăng ký</p>
                                    </div>
                                    <div className="p-3 bg-[var(--cn-bg-section)] rounded-xl text-center">
                                        <p className="text-2xl font-bold text-green-600">{selectedStat.totalPosted}</p>
                                        <p className="text-xs text-[var(--cn-text-muted)]">Bài viết</p>
                                    </div>
                                    <div className="p-3 bg-[var(--cn-bg-section)] rounded-xl text-center">
                                        <p className="text-2xl font-bold text-yellow-600">{selectedStat.totalCoinsEarned.toLocaleString()}</p>
                                        <p className="text-xs text-[var(--cn-text-muted)]">Xu kiếm được</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}