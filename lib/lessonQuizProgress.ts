const STORAGE_PREFIX = 'lesson-quiz-answered:';

export const QUIZ_CHECKPOINT_TOLERANCE_SEC = 2;

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
        JSON.stringify({ answeredTimes: Array.from(answered).sort((a, b) => a - b) }),
    );
}

export function isQuizResolved(time: number, answered: Set<number>, skipped: Set<number>): boolean {
    return answered.has(time) || skipped.has(time);
}

/** Bỏ qua các câu hỏi có mốc thời gian trước vị trí hiện tại (không lưu localStorage). */
export function skipQuizzesBeforeTime(
    questions: TimedQuiz[],
    skipped: Set<number>,
    answered: Set<number>,
    beforeTime: number,
): number[] {
    const newlySkipped: number[] = [];

    for (const q of questions) {
        if (q.time < beforeTime && !isQuizResolved(q.time, answered, skipped)) {
            skipped.add(q.time);
            newlySkipped.push(q.time);
        }
    }

    return newlySkipped;
}

/** Bỏ qua câu hỏi bị tua qua khi seek/fast-forward tới afterTime. */
export function skipQuizzesBetweenTimes(
    questions: TimedQuiz[],
    skipped: Set<number>,
    answered: Set<number>,
    fromTime: number,
    toTime: number,
): number[] {
    if (toTime <= fromTime) return [];

    const newlySkipped: number[] = [];

    for (const q of questions) {
        if (
            q.time > fromTime &&
            q.time < toTime &&
            !isQuizResolved(q.time, answered, skipped)
        ) {
            skipped.add(q.time);
            newlySkipped.push(q.time);
        }
    }

    return newlySkipped;
}

/** Video đang phát tới: vừa vượt qua mốc thời gian câu hỏi (chỉ khi tiến về phía trước). */
export function getQuizCrossedDuringPlayback<T extends TimedQuiz>(
    questions: T[],
    answered: Set<number>,
    skipped: Set<number>,
    prevTime: number,
    currentTime: number,
): T | null {
    if (currentTime <= prevTime) return null;

    return (
        [...questions]
            .sort((a, b) => a.time - b.time)
            .find(
                (q) =>
                    !isQuizResolved(q.time, answered, skipped) &&
                    prevTime < q.time &&
                    currentTime >= q.time,
            ) ?? null
    );
}

export type QuizPlaybackDecision<T extends TimedQuiz> =
    | { action: 'none' }
    | { action: 'show'; quiz: T; seekTo: number };

/** Chỉ hiện quiz khi video phát tới đúng mốc — không seek ngược câu đã bỏ qua. */
export function resolveQuizDuringPlayback<T extends TimedQuiz>(
    questions: T[],
    answered: Set<number>,
    skipped: Set<number>,
    prevTime: number,
    currentTime: number,
): QuizPlaybackDecision<T> {
    const crossed = getQuizCrossedDuringPlayback(questions, answered, skipped, prevTime, currentTime);
    if (crossed) {
        return { action: 'show', quiz: crossed, seekTo: crossed.time };
    }

    return { action: 'none' };
}

/** Chuẩn bị prevTime để lần tick phát tiếp theo có thể bắt được mốc câu hỏi tại currentTime. */
export function getPlaybackPrevTimeForCrossing(currentTime: number): number {
    return Math.max(0, currentTime - 1);
}

/** Giữ tiến độ xem — không clamp về câu hỏi cũ nữa. */
export function clampWatchTime(
    watchTime: number,
    _questions: TimedQuiz[],
    _answered: Set<number>,
): number {
    return watchTime;
}
