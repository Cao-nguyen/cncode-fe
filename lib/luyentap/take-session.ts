import type { QuestionShuffleMap } from '@/lib/luyentap/take-shuffle';

export interface LuyentapTakeSession {
    attemptId?: string;
    startedAt: number;
    durationSeconds: number;
    answers: Record<string, unknown>;
    activeIndex: number;
    questionOrder?: string[];
    shuffles?: Record<string, QuestionShuffleMap>;
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    tabSwitchCount?: number;
}

const storageKey = (slug: string) => `luyentap:take:${slug}`;

export function loadTakeSession(slug: string): LuyentapTakeSession | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(storageKey(slug));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as LuyentapTakeSession;
        if (
            typeof parsed.startedAt !== 'number'
            || typeof parsed.durationSeconds !== 'number'
            || !parsed.answers
            || typeof parsed.activeIndex !== 'number'
        ) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function saveTakeSession(slug: string, session: LuyentapTakeSession) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(storageKey(slug), JSON.stringify(session));
}

export function clearTakeSession(slug: string) {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(storageKey(slug));
}

export function resolveTimeLeft(session: LuyentapTakeSession): number {
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    return Math.max(0, session.durationSeconds - elapsed);
}
