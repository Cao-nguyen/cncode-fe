import type { Contest } from '@/lib/api/dautruong.api';

export type ContestRuntimeStatus = 'open' | 'upcoming' | 'closed';

export interface ContestDisplayMeta {
    runtimeStatus: ContestRuntimeStatus;
    statusLabel: string;
    statusClass: string;
    grade: string | null;
    subject: string | null;
    isVip: boolean;
    questionCount: number;
}

const SUBJECT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /vật lý|vat ly|physics/i, label: 'Lý' },
    { pattern: /toán|toan|math/i, label: 'Toán' },
    { pattern: /hóa|hoa|chemistry/i, label: 'Hóa' },
    { pattern: /sinh|biology/i, label: 'Sinh' },
    { pattern: /tin học|tin hoc|informatics/i, label: 'Tin' },
    { pattern: /tiếng anh|tieng anh|english/i, label: 'Anh' },
];

export function getContestRuntimeStatus(contest: Contest): ContestRuntimeStatus {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = contest.endTime
        ? new Date(contest.endTime)
        : new Date(start.getTime() + contest.duration * 60000);

    if (Number.isNaN(start.getTime())) return 'upcoming';
    if (now < start) return 'upcoming';
    if (now > end) return 'closed';
    return 'open';
}

export function getContestStatusPresentation(status: ContestRuntimeStatus) {
    if (status === 'open') {
        return {
            label: 'Đang mở',
            className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-800',
        };
    }
    if (status === 'upcoming') {
        return {
            label: 'Sắp diễn ra',
            className: 'bg-[var(--cn-primary-light)] text-[var(--cn-primary-hover)] ring-[var(--cn-primary)]/20',
        };
    }
    return {
        label: 'Đã đóng',
        className: 'bg-[var(--cn-bg-section)] text-[var(--cn-text-sub)] ring-[var(--cn-border)]',
    };
}

export function parseContestGrade(text: string): string | null {
    const match = text.match(/lớp\s*(\d{1,2})|lop\s*(\d{1,2})/i);
    const grade = match?.[1] || match?.[2];
    if (!grade || !['10', '11', '12'].includes(grade)) return null;
    return `Lớp ${grade}`;
}

export function parseContestSubject(text: string): string | null {
    for (const item of SUBJECT_PATTERNS) {
        if (item.pattern.test(text)) return item.label;
    }
    return null;
}

export function isContestVip(contest: Contest): boolean {
    const haystack = `${contest.title} ${contest.description || ''}`.toLowerCase();
    return haystack.includes('vip') || haystack.includes('5000 câu');
}

export function getContestQuestionCount(contest: Contest): number {
    if (Array.isArray(contest.questions) && contest.questions.length > 0) {
        return contest.questions.length;
    }
    if (contest.totalPoints > 0) {
        return Math.round(contest.totalPoints / 10);
    }
    return 0;
}

export function getContestDisplayMeta(contest: Contest): ContestDisplayMeta {
    const haystack = `${contest.title} ${contest.description || ''}`;
    const runtimeStatus = getContestRuntimeStatus(contest);
    const statusPresentation = getContestStatusPresentation(runtimeStatus);

    return {
        runtimeStatus,
        statusLabel: statusPresentation.label,
        statusClass: statusPresentation.className,
        grade: parseContestGrade(haystack),
        subject: parseContestSubject(haystack),
        isVip: isContestVip(contest),
        questionCount: getContestQuestionCount(contest),
    };
}

export function formatContestDateRange(contest: Contest): string {
    const start = new Date(contest.startTime);
    const end = contest.endTime
        ? new Date(contest.endTime)
        : new Date(start.getTime() + contest.duration * 60000);

    if (Number.isNaN(start.getTime())) return '—';

    const fmt = (date: Date, withYear = false) =>
        date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            ...(withYear ? { year: 'numeric' } : {}),
        });

    if (Number.isNaN(end.getTime())) {
        return fmt(start, true);
    }

    const sameYear = start.getFullYear() === end.getFullYear();
    return `${fmt(start)} - ${fmt(end, !sameYear || start.getMonth() !== end.getMonth())}`;
}

export const RANK_TITLES: Record<number, string> = {
    1: 'Trạng Nguyên',
    2: 'Bảng Nhãn',
    3: 'Thám Hoa',
};
