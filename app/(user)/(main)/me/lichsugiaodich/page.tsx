'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Coins,
    Landmark,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    Search,
    ArrowUpDown,
    Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { transactionApi, type CoinTransactionRow, type PayOSTransactionRow } from '@/lib/api/transaction.api';
import { toast } from 'sonner';

type TabType = 'xu' | 'payos';

const PAGE_SIZE = 10;

const STATUS_MAP = {
    completed: { label: 'Thành công', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300' },
    pending: { label: 'Đang xử lý', icon: Clock, className: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300' },
    failed: { label: 'Thất bại', icon: XCircle, className: 'text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300' },
} as const;

const CATEGORY_LABELS: Record<PayOSTransactionRow['category'], string> = {
    course: 'Khóa học',
    luyentap: 'Luyện tập',
};

function fmtDate(s: string) {
    return new Date(s).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function fmtVnd(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: 'up' | 'down' }) {
    return (
        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-4 py-3.5">
            <p className="text-xs font-medium text-[var(--cn-text-muted)]">{label}</p>
            <div className="mt-1 flex items-center gap-2">
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                <p className="text-xl font-bold tabular-nums text-[var(--cn-text-main)]">{value}</p>
            </div>
            {sub && <p className="mt-0.5 text-[11px] text-[var(--cn-text-sub)]">{sub}</p>}
        </div>
    );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={cn(
            'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--cn-text-muted)] whitespace-nowrap',
            className
        )}>
            <span className="inline-flex items-center gap-1">
                {children}
                <ArrowUpDown className="h-3 w-3 opacity-40" />
            </span>
        </th>
    );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <td className={cn('px-4 py-3.5 text-sm text-[var(--cn-text-main)] align-middle', className)}>
            {children}
        </td>
    );
}

function paginate<T>(items: T[], page: number, pageSize: number) {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
        items: items.slice(start, start + pageSize),
        total,
        totalPages,
        page: safePage,
        start: total === 0 ? 0 : start + 1,
        end: Math.min(start + pageSize, total),
    };
}

export default function TransactionHistoryPage() {
    const { user, token } = useAuthStore();
    const [tab, setTab] = useState<TabType>('xu');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [coinRows, setCoinRows] = useState<CoinTransactionRow[]>([]);
    const [payosRows, setPayosRows] = useState<PayOSTransactionRow[]>([]);
    const [stats, setStats] = useState({
        coinsBalance: 0,
        coinCreditTotal: 0,
        coinDebitTotal: 0,
        payosCompletedTotal: 0,
        payosCompletedCount: 0,
    });

    const fetchHistory = useCallback(async () => {
        if (!token) {
            setCoinRows([]);
            setPayosRows([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await transactionApi.getMyHistory();
            setCoinRows(data.coinTransactions || []);
            setPayosRows(data.payosTransactions || []);
            setStats(data.stats || {
                coinsBalance: user?.coins ?? 0,
                coinCreditTotal: 0,
                coinDebitTotal: 0,
                payosCompletedTotal: 0,
                payosCompletedCount: 0,
            });
        } catch {
            toast.error('Không tải được lịch sử giao dịch');
        } finally {
            setLoading(false);
        }
    }, [token, user?.coins]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    useEffect(() => { setPage(1); }, [tab, query]);

    const filteredXu = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return coinRows;
        return coinRows.filter((r) => r.reason.toLowerCase().includes(q));
    }, [coinRows, query]);

    const filteredPayos = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return payosRows;
        return payosRows.filter(
            (r) => r.title.toLowerCase().includes(q)
                || r.orderCode.toLowerCase().includes(q)
                || CATEGORY_LABELS[r.category].toLowerCase().includes(q)
        );
    }, [payosRows, query]);

    const xuPage = useMemo(() => paginate(filteredXu, page, PAGE_SIZE), [filteredXu, page]);
    const payosPage = useMemo(() => paginate(filteredPayos, page, PAGE_SIZE), [filteredPayos, page]);
    const activePage = tab === 'xu' ? xuPage : payosPage;

    if (!token) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-16 text-center">
                <p className="text-[var(--cn-text-sub)]">Vui lòng đăng nhập để xem lịch sử giao dịch</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--cn-text-main)] md:text-3xl">
                        Lịch sử giao dịch
                    </h1>
                    <p className="mt-1 text-sm text-[var(--cn-text-sub)]">
                        Quản lý biến động xu và thanh toán chuyển khoản PayOS
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-4 py-2 text-sm font-medium text-[var(--cn-text-main)] transition hover:bg-[var(--cn-hover)]"
                >
                    <Download className="h-4 w-4" />
                    Xuất báo cáo
                </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Số dư xu" value={`${(stats.coinsBalance ?? user?.coins ?? 0).toLocaleString()} xu`} />
                <StatCard label="Xu nhận" value={`+${stats.coinCreditTotal.toLocaleString()}`} trend="up" sub="Tổng cộng" />
                <StatCard label="Xu chi" value={`−${stats.coinDebitTotal.toLocaleString()}`} trend="down" sub="Tổng cộng" />
                <StatCard
                    label="PayOS thành công"
                    value={fmtVnd(stats.payosCompletedTotal)}
                    sub={`${stats.payosCompletedCount} giao dịch`}
                />
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-section)] p-0.5">
                    <button
                        type="button"
                        onClick={() => setTab('xu')}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                            tab === 'xu'
                                ? 'bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] shadow-sm'
                                : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                        )}
                    >
                        <Coins className="h-4 w-4" />
                        Xu
                        <span className="rounded-full bg-[var(--cn-bg-section)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--cn-text-muted)]">
                            {coinRows.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('payos')}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                            tab === 'payos'
                                ? 'bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] shadow-sm'
                                : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                        )}
                    >
                        <Landmark className="h-4 w-4" />
                        PayOS
                        <span className="rounded-full bg-[var(--cn-bg-section)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--cn-text-muted)]">
                            {payosRows.length}
                        </span>
                    </button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cn-text-muted)]" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={tab === 'xu' ? 'Tìm theo nội dung...' : 'Tìm mã đơn, dịch vụ...'}
                        className="w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-2 pl-9 pr-3 text-sm text-[var(--cn-text-main)] outline-none transition focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
                        </div>
                    ) : tab === 'xu' ? (
                        <table className="w-full min-w-[640px] border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--cn-border)] bg-[var(--cn-bg-section)]/80">
                                    <Th>Mã GD</Th>
                                    <Th>Thời gian</Th>
                                    <Th>Loại</Th>
                                    <Th>Nội dung</Th>
                                    <Th className="text-right">Số tiền</Th>
                                    <Th className="text-right">Số dư sau</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--cn-border)]/70">
                                {xuPage.total === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-16 text-center text-sm text-[var(--cn-text-muted)]">
                                            Không tìm thấy giao dịch xu
                                        </td>
                                    </tr>
                                ) : (
                                    xuPage.items.map((row, i) => {
                                        const isIn = row.type === 'credit';
                                        return (
                                            <tr
                                                key={row.id}
                                                className={cn(
                                                    'transition-colors hover:bg-[var(--cn-hover)]/50',
                                                    i % 2 === 1 && 'bg-[var(--cn-bg-section)]/30'
                                                )}
                                            >
                                                <Td>
                                                    <span className="font-mono text-xs text-[var(--cn-text-muted)]">
                                                        #{row.id.slice(-8).toUpperCase()}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span className="text-[var(--cn-text-sub)] whitespace-nowrap">{fmtDate(row.createdAt)}</span>
                                                </Td>
                                                <Td>
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-md px-2 py-0.5 text-xs font-semibold',
                                                            isIn
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                                        )}
                                                    >
                                                        {isIn ? 'Nhận xu' : 'Chi xu'}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span className="font-medium">{row.reason}</span>
                                                </Td>
                                                <Td className="text-right">
                                                    <span
                                                        className={cn(
                                                            'font-bold tabular-nums',
                                                            isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--cn-text-main)]'
                                                        )}
                                                    >
                                                        {isIn ? '+' : '−'}{row.amount.toLocaleString()} xu
                                                    </span>
                                                </Td>
                                                <Td className="text-right">
                                                    <span className="tabular-nums text-[var(--cn-text-sub)]">
                                                        {row.balanceAfter.toLocaleString()} xu
                                                    </span>
                                                </Td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full min-w-[720px] border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--cn-border)] bg-[var(--cn-bg-section)]/80">
                                    <Th>Mã đơn</Th>
                                    <Th>Thời gian</Th>
                                    <Th>Loại</Th>
                                    <Th>Dịch vụ</Th>
                                    <Th>Trạng thái</Th>
                                    <Th className="text-right">Số tiền</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--cn-border)]/70">
                                {payosPage.total === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-16 text-center text-sm text-[var(--cn-text-muted)]">
                                            Không tìm thấy giao dịch PayOS
                                        </td>
                                    </tr>
                                ) : (
                                    payosPage.items.map((row, i) => {
                                        const st = STATUS_MAP[row.status];
                                        const Icon = st.icon;
                                        return (
                                            <tr
                                                key={row.id}
                                                className={cn(
                                                    'transition-colors hover:bg-[var(--cn-hover)]/50',
                                                    i % 2 === 1 && 'bg-[var(--cn-bg-section)]/30'
                                                )}
                                            >
                                                <Td>
                                                    <span className="font-mono text-xs font-medium text-[var(--cn-primary)]">
                                                        {row.orderCode}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span className="text-[var(--cn-text-sub)] whitespace-nowrap">{fmtDate(row.createdAt)}</span>
                                                </Td>
                                                <Td>
                                                    <span className="rounded-md bg-[var(--cn-bg-section)] px-2 py-0.5 text-xs font-medium text-[var(--cn-text-sub)]">
                                                        {CATEGORY_LABELS[row.category]}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span className="font-medium">{row.title}</span>
                                                </Td>
                                                <Td>
                                                    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold', st.className)}>
                                                        <Icon className="h-3 w-3" />
                                                        {st.label}
                                                    </span>
                                                </Td>
                                                <Td className="text-right">
                                                    <span className="font-bold tabular-nums">{fmtVnd(row.amount)}</span>
                                                </Td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--cn-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-[var(--cn-text-muted)]">
                        {activePage.total === 0
                            ? 'Không có giao dịch'
                            : `Hiển thị ${activePage.start}–${activePage.end} / ${activePage.total} giao dịch`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={activePage.page <= 1 || loading}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Trước
                        </button>
                        <span className="rounded-md bg-[var(--cn-primary)] px-2.5 py-1 text-xs font-semibold text-white">
                            {activePage.page}
                        </span>
                        <span className="px-1 text-xs text-[var(--cn-text-muted)]">/ {activePage.totalPages}</span>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(activePage.totalPages, p + 1))}
                            disabled={activePage.page >= activePage.totalPages || loading}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
