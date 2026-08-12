'use client';

import { GitBranch, Plus } from 'lucide-react';
import { ReleaseVersion } from '@/types/feedback.type';

function fmtDate(date: string) {
    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function FeedbackVersionList({ versions }: { versions: ReleaseVersion[] }) {
    if (versions.length === 0) {
        return (
            <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-16 text-center">
                <GitBranch className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="font-medium text-[var(--cn-text-main)]">Chưa có cập nhật phiên bản</p>
                <p className="mt-1 text-sm text-[var(--cn-text-sub)]">Các thay đổi mới sẽ được hiển thị tại đây</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {versions.map((item) => (
                <article
                    key={item._id}
                    className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cn-border)] bg-emerald-50/40 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <GitBranch className="h-4 w-4" />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--cn-text-main)]">Version {item.version}</h2>
                                <p className="text-xs text-[var(--cn-text-muted)]">{fmtDate(item.releasedAt)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <p className="mb-3 text-sm font-medium text-[var(--cn-text-sub)]">Những thay đổi ở phiên bản này</p>
                        <ul className="space-y-2">
                            {item.changes.map((change, index) => (
                                <li key={`${item._id}-${index}`} className="flex gap-2 text-sm leading-relaxed text-[var(--cn-text-main)]">
                                    <Plus className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{change}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>
            ))}
        </div>
    );
}
