'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Coins, Landmark, TrendingUp, TrendingDown, CheckCircle2, Clock, XCircle,
    Loader2, ChevronLeft, ChevronRight, Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import {
    transactionApi,
    type AdminCoinTransactionRow,
    type AdminPayOSTransactionRow,
    type AdminTransactionStats,
} from '@/lib/api/transaction.api';

type TabType = 'xu' | 'payos';
const PAGE_SIZE = 10;

const STATUS_MAP = {
    completed: { label: 'Thành công', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50' },
    pending: { label: 'Đang xử lý', icon: Clock, className: 'text-amber-700 bg-amber-50' },
    failed: { label: 'Thất bại', icon: XCircle, className: 'text-red-700 bg-red-50' },
} as const;

const CATEGORY_LABELS = {
    course: 'Khóa học',
    luyentap: 'Luyện tập',
} as const;

function fmtDate(value: string) {
    return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function fmtVnd(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function UserCell({ user }: { user?: { fullName?: string; email?: string; username?: string } | null }) {
    const name = user?.fullName || user?.username || 'Người dùng';
    return (
        <div className="min-w-[160px]">
            <p className="truncate text-sm font-medium text-[var(--cn-text-main)]">{name}</p>
            <p className="truncate text-xs text-[var(--cn-text-muted)]">{user?.email || '—'}</p>
        </div>
    );
}

export default function AdminTransactionHistoryPage() {
    const [tab, setTab] = useState<TabType>('xu');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [coinRows, setCoinRows] = useState<AdminCoinTransactionRow[]>([]);
    const [payosRows, setPayosRows] = useState<AdminPayOSTransactionRow[]>([]);
    const [stats, setStats] = useState<AdminTransactionStats | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchInput]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await transactionApi.getAdminHistory({
                type: tab,
                page,
                limit: PAGE_SIZE,
                search: search.trim() || undefined,
            });
            setStats(res.stats);
            setPagination(res.pagination);
            if (tab === 'xu') {
                setCoinRows(res.items as AdminCoinTransactionRow[]);
            } else {
                setPayosRows(res.items as AdminPayOSTransactionRow[]);
            }
        } catch {
            toast.error('Không tải được lịch sử giao dịch');
        } finally {
            setLoading(false);
        }
    }, [tab, page, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleTabChange = (next: TabType) => {
        setTab(next);
        setPage(1);
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--cn-text-main)] md:text-2xl">Lịch sử giao dịch</h1>
                <p className="mt-1 text-sm text-[var(--cn-text-sub)]">
                    Theo dõi toàn bộ giao dịch xu và PayOS trên hệ thống
                </p>
            </div>

            {stats && (
                <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <DashboardCard title="Giao dịch xu" value={stats.totalCoinCount} icon={<Coins size={18} />} iconBgColor="#EFF6FF" iconColor="#2563EB" />
                    <DashboardCard title="Xu phát sinh" value={`+${stats.coinCreditTotal.toLocaleString()}`} icon={<TrendingUp size={18} />} iconBgColor="#ECFDF5" iconColor="#059669" />
                    <DashboardCard title="Xu tiêu" value={`−${stats.coinDebitTotal.toLocaleString()}`} icon={<TrendingDown size={18} />} iconBgColor="#FEF2F2" iconColor="#DC2626" />
                    <DashboardCard title="PayOS thành công" value={fmtVnd(stats.payosCompletedTotal)} icon={<Receipt size={18} />} iconBgColor="#F5F3FF" iconColor="#7C3AED" description={`${stats.payosCompletedCount} giao dịch`} />
                </div>
            )}

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex w-fit rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-section)] p-0.5">
                    <button
                        type="button"
                        onClick={() => handleTabChange('xu')}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
                            tab === 'xu' ? 'bg-[var(--cn-bg-card)] shadow-sm' : 'text-[var(--cn-text-sub)]',
                        )}
                    >
                        <Coins className="h-4 w-4" /> Xu
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('payos')}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
                            tab === 'payos' ? 'bg-[var(--cn-bg-card)] shadow-sm' : 'text-[var(--cn-text-sub)]',
                        )}
                    >
                        <Landmark className="h-4 w-4" /> PayOS
                    </button>
                </div>
                <div className="w-full lg:w-72">
                    <CustomInputSearch
                        placeholder={tab === 'xu' ? 'Tìm nội dung, email...' : 'Tìm mã đơn, dịch vụ...'}
                        value={searchInput}
                        onChange={setSearchInput}
                        size="medium"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : tab === 'xu' ? (
                        <table className="w-full min-w-[880px] text-sm">
                            <thead>
                                <tr className="border-b border-[var(--cn-border)] bg-[var(--cn-bg-section)]/80 text-left text-xs font-semibold uppercase tracking-wide text-[var(--cn-text-muted)]">
                                    <th className="px-4 py-3">Người dùng</th>
                                    <th className="px-4 py-3">Thời gian</th>
                                    <th className="px-4 py-3">Loại</th>
                                    <th className="px-4 py-3">Nội dung</th>
                                    <th className="px-4 py-3 text-right">Số tiền</th>
                                    <th className="px-4 py-3 text-right">Số dư sau</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coinRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-16 text-center text-[var(--cn-text-muted)]">
                                            Không có giao dịch xu
                                        </td>
                                    </tr>
                                ) : coinRows.map((row) => {
                                    const isIn = row.type === 'credit';
                                    return (
                                        <tr key={row.id} className="border-b border-[var(--cn-border)]/70 hover:bg-[var(--cn-hover)]/40">
                                            <td className="px-4 py-3"><UserCell user={row.user} /></td>
                                            <td className="px-4 py-3 text-[var(--cn-text-sub)] whitespace-nowrap">{fmtDate(row.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                                                    {isIn ? 'Nhận xu' : 'Chi xu'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium">{row.reason}</td>
                                            <td className={cn('px-4 py-3 text-right font-bold tabular-nums', isIn ? 'text-emerald-600' : 'text-[var(--cn-text-main)]')}>
                                                {isIn ? '+' : '−'}{row.amount.toLocaleString()} xu
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-[var(--cn-text-sub)]">
                                                {row.balanceAfter.toLocaleString()} xu
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full min-w-[960px] text-sm">
                            <thead>
                                <tr className="border-b border-[var(--cn-border)] bg-[var(--cn-bg-section)]/80 text-left text-xs font-semibold uppercase tracking-wide text-[var(--cn-text-muted)]">
                                    <th className="px-4 py-3">Người dùng</th>
                                    <th className="px-4 py-3">Mã đơn</th>
                                    <th className="px-4 py-3">Thời gian</th>
                                    <th className="px-4 py-3">Loại</th>
                                    <th className="px-4 py-3">Dịch vụ</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payosRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center text-[var(--cn-text-muted)]">
                                            Không có giao dịch PayOS
                                        </td>
                                    </tr>
                                ) : payosRows.map((row) => {
                                    const st = STATUS_MAP[row.status];
                                    const Icon = st.icon;
                                    return (
                                        <tr key={row.id} className="border-b border-[var(--cn-border)]/70 hover:bg-[var(--cn-hover)]/40">
                                            <td className="px-4 py-3"><UserCell user={row.user} /></td>
                                            <td className="px-4 py-3 font-mono text-xs font-medium text-[var(--cn-primary)]">{row.orderCode}</td>
                                            <td className="px-4 py-3 text-[var(--cn-text-sub)] whitespace-nowrap">{fmtDate(row.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-md bg-[var(--cn-bg-section)] px-2 py-0.5 text-xs font-medium">
                                                    {CATEGORY_LABELS[row.category]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium">{row.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold', st.className)}>
                                                    <Icon className="h-3 w-3" /> {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold tabular-nums">{fmtVnd(row.amount)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--cn-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-[var(--cn-text-muted)]">
                        {pagination.total === 0
                            ? 'Không có giao dịch'
                            : `Trang ${pagination.page} / ${pagination.totalPages} · ${pagination.total} giao dịch`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || loading}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--cn-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" /> Trước
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={page >= pagination.totalPages || loading}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--cn-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                        >
                            Sau <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
