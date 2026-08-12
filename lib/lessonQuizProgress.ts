const STORAGE_PREFIX = 'lesson-quiz-answered:';

export interface TimedQuiz {
    time: number;
}

function storageKey(lessonId: string): string {
    return `${STORAGE_PREFIX}${lessonId}`;
}

export function getAnsweredQuizTimes(lessonId: string): Set<number> {
    if (typeof window === 'undefined' || !lessonId) return new Set();

    try {
        const raw = localStorage.getItem(storageKey(lessonId));
        if (!raw) return new Set();

        const parsed = JSON.parse(raw) as { answeredTimes?: number[] };
        return new Set(Array.isArray(parsed.answeredTimes) ? parsed.answeredTimes : []);
    } catch {
        return new Set();
    }
}

export function markQuizAnswered(lessonId: string, time: number): void {
    if (typeof window === 'undefined' || !lessonId) return;

    const answered = getAnsweredQuizTimes(lessonId);
    answered.add(time);

    localStorage.setItem(
        storageKey(lessonId),
        JSON.stringify({ answeredTimes: Array.from(answered).sort((a, b) => a - b) })
    );
}

export function getNextUnansweredQuiz<T extends TimedQuiz>(
    questions: T[],
    answered: Set<number>
): T | null {
    return [...questions]
        .sort((a, b) => a.time - b.time)
        .find(q => !answered.has(q.time)) ?? null;
}

/** Câu hỏi chưa trả lời mà user đã xem qua (watchTime >= quiz.time). */
export function getEarliestPendingQuiz<T extends TimedQuiz>(
    questions: T[],
    answered: Set<number>,
    watchTime: number
): T | null {
    return [...questions]
        .sort((a, b) => a.time - b.time)
        .find(q => !answered.has(q.time) && watchTime >= q.time) ?? null;
}

/** Giới hạn thời gian xem — không vượt qua câu hỏi chưa trả lời. */
export function clampWatchTime(
    watchTime: number,
    questions: TimedQuiz[],
    answered: Set<number>
): number {
    const pending = getEarliestPendingQuiz(questions, answered, watchTime);
    if (pending) return pending.time;
    return watchTime;
}

/** Câu hỏi cần hiện tại thời điểm phát (currentTime >= quiz.time). */
export function getQuizToShowAtTime<T extends TimedQuiz>(
    questions: T[],
    answered: Set<number>,
    currentTime: number
): T | null {
    return getEarliestPendingQuiz(questions, answered, currentTime);
}
