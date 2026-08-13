'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    ChevronRight,
    Home,
    Medal,
    Presentation,
    Search,
    Swords,
} from 'lucide-react';
import * as dautruongApi from '@/lib/api/dautruong.api';
import type { Contest, LeaderboardEntry } from '@/lib/api/dautruong.api';
import DauTruongContestCard from '@/components/dautruong/DauTruongContestCard';
import DauTruongLeaderboardPanel from '@/components/dautruong/DauTruongLeaderboardPanel';
import { CustomInput } from '@/components/custom/CustomInput';
import { FeedbackCardSkeleton } from '@/components/ui/skeleton';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAuthStore } from '@/store/auth.store';
import {
    getContestDisplayMeta,
    parseContestGrade,
    type ContestRuntimeStatus,
} from '@/lib/dautruong/contest-display.utils';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'vip' | ContestRuntimeStatus;
type GradeFilter = 'all' | '10' | '11' | '12';

const GRADE_FILTERS: Array<{ value: GradeFilter; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: '12', label: 'Lớp 12', icon: Medal },
    { value: '11', label: 'Lớp 11', icon: Presentation },
    { value: '10', label: 'Lớp 10', icon: BookOpen },
];

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: 'Tất cả' },
    { value: 'vip', label: 'Vip' },
    { value: 'open', label: 'Đang mở' },
    { value: 'upcoming', label: 'Sắp diễn ra' },
    { value: 'closed', label: 'Đã đóng' },
];

function normalizeContestsResponse(res: unknown): Contest[] {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
        const data = res as { contests?: Contest[]; data?: Contest[] };
        if (Array.isArray(data.contests)) return data.contests;
        if (Array.isArray(data.data)) return data.data;
    }
    return [];
}

export default function DauTruongHocTapPage() {
    const { token } = useAuthStore();
    const [contests, setContests] = useState<Contest[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
    const [registeredOnly, setRegisteredOnly] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [contestsRes, leaderboardRes] = await Promise.all([
                dautruongApi.getPublicContests({ page: 1, limit: 50 }),
                dautruongApi.getOverallLeaderboard(50),
            ]);

            setContests(normalizeContestsResponse(contestsRes));
            setLeaderboard(Array.isArray(leaderboardRes) ? leaderboardRes : []);

            if (token) {
                try {
                    const userContests = await dautruongApi.getUserContests();
                    const ids = new Set<string>();
                    (Array.isArray(userContests) ? userContests : []).forEach((item: { contestId?: string | { _id?: string } }) => {
                        const contestId = typeof item.contestId === 'string'
                            ? item.contestId
                            : item.contestId?._id;
                        if (contestId) ids.add(contestId);
                    });
                    setRegisteredIds(ids);
                } catch {
                    setRegisteredIds(new Set());
                }
            } else {
                setRegisteredIds(new Set());
            }
        } catch {
            setContests([]);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredContests = useMemo(() => {
        const q = searchInput.trim().toLowerCase();

        return contests.filter((contest) => {
            const meta = getContestDisplayMeta(contest);
            const haystack = `${contest.title} ${contest.description || ''}`.toLowerCase();
            const grade = parseContestGrade(`${contest.title} ${contest.description || ''}`);

            if (q && !haystack.includes(q)) return false;
            if (registeredOnly && !registeredIds.has(contest._id)) return false;
            if (gradeFilter !== 'all' && grade !== `Lớp ${gradeFilter}`) return false;
            if (statusFilter === 'vip' && !meta.isVip) return false;
            if (statusFilter !== 'all' && statusFilter !== 'vip' && meta.runtimeStatus !== statusFilter) return false;

            return true;
        });
    }, [contests, gradeFilter, registeredIds, registeredOnly, searchInput, statusFilter]);

    return (
        <div className="min-h-screen pb-8 pt-4 md:pt-6" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-[1400px] px-3 sm:px-4">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/" className="inline-flex items-center gap-1 text-[var(--cn-text-sub)]">
                                <Home className="h-3.5 w-3.5" />
                                Trang chủ
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Đấu trường lý thuyết</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                    <main className="min-w-0 flex-1">
                        <section className="overflow-hidden rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                            <div className="border-b border-[var(--cn-border)] px-4 py-4 sm:px-5">
                                <h1 className="flex items-center gap-2 text-lg font-black uppercase tracking-wide text-[var(--cn-primary)] sm:text-xl">
                                    <Swords className="h-6 w-6 shrink-0" />
                                    Đấu trường lý thuyết
                                </h1>
                            </div>

                            <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
                                <Link
                                    href="/dautruonghoctap"
                                    className="flex min-h-[72px] items-center justify-between rounded-xl bg-[var(--cn-btn-primary)] px-4 py-3 text-[var(--cn-text-white)] shadow-sm transition hover:bg-[var(--cn-btn-primary-hover)]"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">Kho đấu trường</p>
                                        <p className="text-xs text-white/80">Xem tất cả cuộc thi luyện tập</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                                        Xem tất cả
                                        <ChevronRight className="h-4 w-4" />
                                    </span>
                                </Link>

                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-[var(--cn-warning)] px-4 py-3 text-[var(--cn-text-white)] shadow-sm">
                                    <span className="absolute right-3 top-3 rounded bg-white px-2 py-0.5 text-[10px] font-black uppercase text-amber-600">
                                        VIP
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-xl font-black">
                                            M
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-wide">Kho 5000 câu hỏi</p>
                                            <p className="text-xs text-white/85">Ngân hàng câu hỏi luyện thi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[var(--cn-border)] px-4 py-4 sm:px-5">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {GRADE_FILTERS.map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setGradeFilter((prev) => (prev === value ? 'all' : value))}
                                            className={cn(
                                                'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition',
                                                gradeFilter === value
                                                    ? 'border-[var(--cn-primary)] bg-[var(--cn-primary-light)] text-[var(--cn-primary-hover)] shadow-sm'
                                                    : 'border-[var(--cn-border)] bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] hover:border-[var(--cn-primary)]/30 hover:bg-[var(--cn-hover-blue)]',
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-[var(--cn-border)] px-4 py-3 sm:px-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="admin-scroll-x flex gap-4 overflow-x-auto pb-1">
                                        {STATUS_TABS.map((tab) => (
                                            <button
                                                key={tab.value}
                                                type="button"
                                                onClick={() => setStatusFilter(tab.value)}
                                                className={cn(
                                                    'shrink-0 border-b-2 pb-2 text-sm font-semibold transition',
                                                    statusFilter === tab.value
                                                        ? 'border-[var(--cn-primary)] text-[var(--cn-primary)]'
                                                        : 'border-transparent text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]',
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <button
                                            type="button"
                                            onClick={() => setRegisteredOnly((v) => !v)}
                                            className={cn(
                                                'rounded-lg px-4 py-2 text-sm font-semibold transition',
                                                registeredOnly
                                                    ? 'bg-[var(--cn-btn-primary)] text-[var(--cn-text-white)] ring-2 ring-[var(--cn-primary)]/30'
                                                    : 'border border-[var(--cn-primary)] bg-[var(--cn-bg-card)] text-[var(--cn-primary)] hover:bg-[var(--cn-hover-blue)]',
                                            )}
                                        >
                                            Đã đăng ký
                                        </button>
                                        <div className="min-w-0 sm:w-56">
                                            <CustomInput
                                                placeholder="Tìm kiếm..."
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                                icon={<Search className="h-4 w-4" />}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[var(--cn-border)] p-4 sm:p-5">
                                {loading ? (
                                    <FeedbackCardSkeleton count={4} />
                                ) : filteredContests.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[var(--cn-border)] bg-[var(--cn-bg-section)] py-16 text-center">
                                        <Swords className="mx-auto mb-3 h-12 w-12 text-[var(--cn-text-muted)]/30" />
                                        <p className="text-sm text-[var(--cn-text-sub)]">
                                            {searchInput || statusFilter !== 'all' || gradeFilter !== 'all' || registeredOnly
                                                ? 'Không tìm thấy đấu trường phù hợp'
                                                : 'Chưa có cuộc thi nào'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {filteredContests.map((contest) => (
                                            <DauTruongContestCard key={contest._id} contest={contest} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>

                    <div className="w-full shrink-0 xl:w-[320px]">
                        <div className="xl:sticky xl:top-[76px]">
                            <DauTruongLeaderboardPanel entries={leaderboard} loading={loading} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
