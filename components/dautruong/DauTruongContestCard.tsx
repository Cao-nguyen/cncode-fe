'use client';

import Link from 'next/link';
import { Calendar, HelpCircle, Users } from 'lucide-react';
import type { Contest } from '@/lib/api/dautruong.api';
import {
    formatContestDateRange,
    getContestDisplayMeta,
} from '@/lib/dautruong/contest-display.utils';
import { cn } from '@/lib/utils';

interface DauTruongContestCardProps {
    contest: Contest;
}

export default function DauTruongContestCard({ contest }: DauTruongContestCardProps) {
    const meta = getContestDisplayMeta(contest);
    const subjectLabel = meta.subject || 'Đề thi';

    return (
        <Link
            href={`/dautruonghoctap/${contest._id}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm transition hover:border-[var(--cn-primary)]/40 hover:shadow-md"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--cn-bg-section)]">
                {contest.thumbnail ? (
                    <img
                        src={contest.thumbnail}
                        alt={contest.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cn-bg-card)] text-2xl font-black text-[var(--cn-primary)] shadow-sm">
                            M
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[var(--cn-text-sub)]">
                            {subjectLabel === 'Lý' ? 'Vật lý' : subjectLabel}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-[var(--cn-text-main)] transition group-hover:text-[var(--cn-primary)] md:text-base">
                    {contest.title}
                </h3>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', meta.statusClass)}>
                        {meta.statusLabel}
                    </span>
                    <span className="inline-flex rounded-full bg-[var(--cn-primary-light)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--cn-primary-hover)] ring-1 ring-inset ring-[var(--cn-primary)]/15">
                        {subjectLabel}
                    </span>
                    {meta.grade && (
                        <span className="inline-flex rounded-full bg-[var(--cn-hover-blue)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--cn-primary)] ring-1 ring-inset ring-[var(--cn-primary)]/20">
                            {meta.grade}
                        </span>
                    )}
                    {meta.isVip && (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                            VIP
                        </span>
                    )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--cn-border)] pt-3 text-xs text-[var(--cn-text-sub)]">
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatContestDateRange(contest)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                        {meta.questionCount} câu
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {contest.participantCount || 0}
                    </span>
                </div>
            </div>
        </Link>
    );
}
