export const BUILDER_STORAGE_KEY = 'courseBuilderOpen';

export type BuilderOverlayState = {
    courseId: string;
    courseName: string;
};

export type BuilderActiveTarget = {
    chapterId: string;
    lessonId: string;
    type: 'lesson' | 'exercise';
};

export const builderActiveKey = (courseId: string) => `courseBuilderActive:${courseId}`;

export function readBuilderOverlay(): BuilderOverlayState | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as BuilderOverlayState;
        if (parsed?.courseId && parsed?.courseName) return parsed;
    } catch {
        /* ignore */
    }
    return null;
}

export function writeBuilderOverlay(state: BuilderOverlayState | null) {
    if (typeof window === 'undefined') return;
    if (state) {
        localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(state));
    } else {
        localStorage.removeItem(BUILDER_STORAGE_KEY);
    }
}

export function readBuilderActive(courseId: string): BuilderActiveTarget | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(builderActiveKey(courseId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as BuilderActiveTarget;
        if (parsed?.chapterId && parsed?.lessonId && parsed?.type) return parsed;
    } catch {
        /* ignore */
    }
    return null;
}

export function writeBuilderActive(courseId: string, target: BuilderActiveTarget | null) {
    if (typeof window === 'undefined') return;
    if (target) {
        localStorage.setItem(builderActiveKey(courseId), JSON.stringify(target));
    } else {
        localStorage.removeItem(builderActiveKey(courseId));
    }
}

export const builderQuizOpenKey = (courseId: string, targetId: string) =>
    `courseBuilderQuizOpen:${courseId}:${targetId}`;

export function readBuilderQuizOpen(courseId: string, targetId: string): boolean {
    if (typeof window === 'undefined' || !courseId || !targetId) return false;
    try {
        return localStorage.getItem(builderQuizOpenKey(courseId, targetId)) === '1';
    } catch {
        return false;
    }
}

export function writeBuilderQuizOpen(courseId: string, targetId: string, open: boolean) {
    if (typeof window === 'undefined' || !courseId || !targetId) return;
    if (open) {
        localStorage.setItem(builderQuizOpenKey(courseId, targetId), '1');
    } else {
        localStorage.removeItem(builderQuizOpenKey(courseId, targetId));
    }
}
