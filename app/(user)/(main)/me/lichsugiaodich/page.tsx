'use client';

import React, { useMemo, useState } from 'react';
import {
    Coins,
    Landmark,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    Filter,
    Search,
    ArrowUpDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

type TabType = 'xu' | 'payos';

type XuRow = {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    reason: string;
    balanceAfter: number;
    createdAt: string;
};

type PayOSRow = {
    id: string;
    title: string;
    amount: number;
    orderCode: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
};

const MOCK_XU: XuRow[] = [
    { id: '1', type: 'credit', amount: 108, reason: 'Quy đổi quà tặng', balanceAfter: 1250, createdAt: '2026-08-12T09:30:00' },
    { id: '2', type: 'debit', amount: 50, reason: 'Tặng quà cho bài viết', balanceAfter: 1142, createdAt: '2026-08-12T08:10:00' },
    { id: '3', type: 'debit', amount: 200, reason: 'Mua khóa học bằng xu', balanceAfter: 1192, createdAt: '2026-08-11T14:00:00' },
    { id: '4', type: 'credit', amount: 500, reason: 'Nhận quà từ cộng đồng', balanceAfter: 1392, createdAt: '2026-08-09T11:45:00' },
    { id: '5', type: 'credit', amount: 100, reason: 'Thưởng hoàn thành bài tập', balanceAfter: 892, createdAt: '2026-08-05T08:20:00' },
    { id: '6', type: 'debit', amount: 30, reason: 'Tặng quà hồ sơ cá nhân', balanceAfter: 792, createdAt: '2026-08-03T19:22:00' },
];

const MOCK_PAYOS: PayOSRow[] = [
    { id: '1', title: 'Lập trình Python cơ bản', amount: 299000, orderCode: 'DH20260812001', status: 'completed', createdAt: '2026-08-12T10:05:00' },
    { id: '2', title: 'Web Fullstack với Next.js', amount: 499000, orderCode: 'DH20260810002', status: 'pending', createdAt: '2026-08-10T16:30:00' },
    { id: '3', title: 'Tin học 12 nâng cao', amount: 199000, orderCode: 'DH20260805003', status: 'completed', createdAt: '2026-08-05T09:12:00' },
    { id: '4', title: 'AI cho học sinh', amount: 349000, orderCode: 'DH20260728004', status: 'failed', createdAt: '2026-07-28T21:40:00' },
    { id: '5', title: 'Excel nâng cao', amount: 149000, orderCode: 'DH20260715005', status: 'completed', createdAt: '2026-07-15T11:00:00' },
];

const STATUS_MAP = {
    completed: { label: 'Thành công', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300' },
    pending: { label: 'Đang xử lý', icon: Clock, className: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300' },
    failed: { label: 'Thất bại', icon: XCircle, className: 'text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300' },
} as const;

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

export default function TransactionHistoryPage() {
    const { user } = useAuthStore();
    const [tab, setTab] = useState<TabType>('xu');
    const [query, setQuery] = useState('');

    const xuIn = MOCK_XU.filter((r) => r.type === 'credit').reduce((s, r) => s + r.amount, 0);
    const xuOut = MOCK_XU.filter((r) => r.type === 'debit').reduce((s, r) => s + r.amount, 0);
    const payosTotal = MOCK_PAYOS.filter((r) => r.status === 'completed').reduce((s, r) => s + r.amount, 0);

    const filteredXu = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return MOCK_XU;
        return MOCK_XU.filter((r) => r.reason.toLowerCase().includes(q));
    }, [query]);

    const filteredPayos = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return MOCK_PAYOS;
        return MOCK_PAYOS.filter(
            (r) => r.title.toLowerCase().includes(q) || r.orderCode.toLowerCase().includes(q)
        );
    }, [query]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
            {/* Header */}
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

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Số dư xu" value={`${(user?.coins ?? 1250).toLocaleString()} xu`} />
                <StatCard label="Xu nhận" value={`+${xuIn.toLocaleString()}`} trend="up" sub="Trong kỳ" />
                <StatCard label="Xu chi" value={`−${xuOut.toLocaleString()}`} trend="down" sub="Trong kỳ" />
                <StatCard label="PayOS thành công" value={fmtVnd(payosTotal)} sub={`${MOCK_PAYOS.filter((r) => r.status === 'completed').length} giao dịch`} />
            </div>

            {/* Toolbar */}
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
                            {MOCK_XU.length}
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
                            {MOCK_PAYOS.length}
                        </span>
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cn-text-muted)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={tab === 'xu' ? 'Tìm theo nội dung...' : 'Tìm mã đơn, khóa học...'}
                            className="w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-2 pl-9 pr-3 text-sm text-[var(--cn-text-main)] outline-none transition focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20"
                        />
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-3 py-2 text-sm text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)]"
                    >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Lọc</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                <div className="overflow-x-auto">
                    {tab === 'xu' ? (
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
                                {filteredXu.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-16 text-center text-sm text-[var(--cn-text-muted)]">
                                            Không tìm thấy giao dịch xu
                                        </td>
                                    </tr>
                                ) : (
                                    filteredXu.map((row, i) => {
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
                                                        #XU{row.id.padStart(4, '0')}
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
                                    <Th>Khóa học / Dịch vụ</Th>
                                    <Th>Trạng thái</Th>
                                    <Th className="text-right">Số tiền</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--cn-border)]/70">
                                {filteredPayos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-16 text-center text-sm text-[var(--cn-text-muted)]">
                                            Không tìm thấy giao dịch PayOS
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayos.map((row, i) => {
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

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[var(--cn-border)] px-4 py-3 text-xs text-[var(--cn-text-muted)]">
                    <span>
                        Hiển thị {tab === 'xu' ? filteredXu.length : filteredPayos.length} /{' '}
                        {tab === 'xu' ? MOCK_XU.length : MOCK_PAYOS.length} giao dịch
                    </span>
                    <div className="flex items-center gap-1">
                        <button type="button" className="rounded-md px-2.5 py-1 hover:bg-[var(--cn-hover)] disabled:opacity-40" disabled>
                            Trước
                        </button>
                        <span className="rounded-md bg-[var(--cn-primary)] px-2.5 py-1 font-semibold text-white">1</span>
                        <button type="button" className="rounded-md px-2.5 py-1 hover:bg-[var(--cn-hover)] disabled:opacity-40" disabled>
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
