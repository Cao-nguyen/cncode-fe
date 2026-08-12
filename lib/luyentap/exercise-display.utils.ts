/** Hiển thị tiêu đề nhóm câu (Phần I, Phần 1, ...). */
export function formatGroupTitleDisplay(title: string): string {
    const t = title.trim();
    if (!t) return '';
    if (/^Phần\s/i.test(t)) return t;
    const match = t.match(/^([IVXLC]+)\.\s*(.*)$/);
    if (match) return `Phần ${match[1]}. ${match[2]}`;
    return t;
}

export function formatScoreValue(score: number): string {
    const rounded = Math.round(score * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Ví dụ: (9/10 điểm) */
export function formatScoreScaleLabel(
    score: number | null | undefined,
    totalPoints: number,
): string {
    if (score == null || Number.isNaN(score) || totalPoints <= 0) return '';
    return `(${formatScoreValue(score)}/${totalPoints} điểm)`;
}

export function resolveAttemptScore(
    entry: { totalScore?: number; percentage?: number },
    totalPoints: number,
): number | null {
    if (entry.totalScore != null && !Number.isNaN(entry.totalScore)) {
        return entry.totalScore;
    }
    if (totalPoints > 0 && entry.percentage != null && !Number.isNaN(entry.percentage)) {
        return (entry.percentage / 100) * totalPoints;
    }
    if (entry.percentage != null && !Number.isNaN(entry.percentage)) {
        return entry.percentage;
    }
    return null;
}

export function resolveEssayMaxPoints(exercise?: {
    questions?: Array<{ type?: string; points?: number }>;
} | null): number {
    if (!Array.isArray(exercise?.questions)) return 0;
    return exercise.questions
        .filter((q) => q.type === 'essay')
        .reduce((sum, q) => sum + (Number(q.points) || 10), 0);
}

export function resolveEffectivePercentage(
    totalScore: number | null | undefined,
    totalPoints: number,
    percentage?: number | null,
): number {
    if (totalPoints > 0 && totalScore != null && !Number.isNaN(totalScore)) {
        return (totalScore / totalPoints) * 100;
    }
    return Number(percentage) || 0;
}

export function resolveExercisePassPercentage(
    totalScore: number | null | undefined,
    totalPoints: number,
    options?: {
        percentage?: number | null;
        essayGradingPending?: boolean;
        essayMaxPoints?: number;
    },
): number {
    const score = Number(totalScore);
    if (!Number.isNaN(score)) {
        const essayMaxPoints = options?.essayMaxPoints ?? 0;
        if (options?.essayGradingPending && essayMaxPoints > 0) {
            const gradableTotal = Math.max(1, totalPoints - essayMaxPoints);
            return (score / gradableTotal) * 100;
        }
        if (totalPoints > 0) {
            return (score / totalPoints) * 100;
        }
    }
    return Number(options?.percentage) || 0;
}

export function formatPercentageValue(value: number): string {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function isExercisePassed(
    totalScore: number | null | undefined,
    totalPoints: number,
    passThreshold: number = 80,
    options?: number | null | {
        percentage?: number | null;
        essayGradingPending?: boolean;
        essayMaxPoints?: number;
    },
): boolean {
    const normalizedOptions = typeof options === 'number' || options == null
        ? { percentage: options }
        : options;
    const effective = resolveExercisePassPercentage(totalScore, totalPoints, normalizedOptions);
    return effective >= passThreshold;
}

export function resolveExerciseTotalPoints(exercise?: {
    totalPoints?: number;
    questions?: Array<{ points?: number }>;
} | null): number {
    const fromField = Number(exercise?.totalPoints) || 0;
    if (fromField > 0) return fromField;
    if (!Array.isArray(exercise?.questions) || !exercise.questions.length) return 0;
    return exercise.questions.reduce((sum, question) => sum + (Number(question.points) || 10), 0);
}
