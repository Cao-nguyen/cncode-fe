export type ExerciseAvailabilityPhase = 'upcoming' | 'open' | 'closed';

export interface ExerciseAvailability {
    phase: ExerciseAvailabilityPhase;
    canEnter: boolean;
    message: string | null;
}

export interface ExerciseAccessStatus {
    availability: ExerciseAvailability;
    hasExamPassword: boolean;
    hideLeaderboard: boolean;
    preExamNoticeEnabled: boolean;
    preExamNotice: string;
    attemptCount: number;
    maxAttempts: number;
    canAttempt: boolean;
    remainingAttempts: number | null;
}

export function resolveExerciseAvailability(exercise?: {
    deliveryFrom?: string | null;
    deliveryTo?: string | null;
    availability?: ExerciseAvailability;
} | null, now = Date.now()): ExerciseAvailability {
    if (exercise?.availability) return exercise.availability;

    const from = exercise?.deliveryFrom ? new Date(exercise.deliveryFrom).getTime() : null;
    const to = exercise?.deliveryTo ? new Date(exercise.deliveryTo).getTime() : null;

    if (from && !Number.isNaN(from) && now < from) {
        return { phase: 'upcoming', canEnter: false, message: 'Chưa đến thời gian mở đề' };
    }
    if (to && !Number.isNaN(to) && now > to) {
        return { phase: 'closed', canEnter: false, message: 'Đã kết thúc' };
    }
    return { phase: 'open', canEnter: true, message: null };
}

export function getExamPasswordStorageKey(slug: string) {
    return `luyentap-exam-password:${slug}`;
}

export function readStoredExamPassword(slug: string) {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(getExamPasswordStorageKey(slug)) || '';
}

export function storeExamPassword(slug: string, password: string) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(getExamPasswordStorageKey(slug), password);
}

export function resolveEnterExamButtonLabel(options: {
    needsPurchase: boolean;
    availability: ExerciseAvailability;
    canAttempt: boolean;
}): { label: string; disabled: boolean } {
    if (options.needsPurchase) {
        return { label: 'Mua ngay', disabled: false };
    }
    if (!options.availability.canEnter) {
        if (options.availability.phase === 'closed') {
            return { label: 'Đã kết thúc', disabled: true };
        }
        return { label: 'Chưa mở đề', disabled: true };
    }
    if (!options.canAttempt) {
        return { label: 'Đã hết lượt', disabled: true };
    }
    return { label: 'Vào phòng thi', disabled: false };
}
