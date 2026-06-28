// ===== LƯU VỊ TRÍ BÀI HỌC CUỐI CÙNG (localStorage) =====
// Mỗi user chỉ có 1 bản ghi: array { courseId, lessonId }
// Key: 'course-last-lessons'

export interface CourseLastLesson {
    courseId: string;
    lessonId: string;
}

const STORAGE_KEY = 'course-last-lessons';

export function getCourseLastLesson(courseId: string): string | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const list: CourseLastLesson[] = JSON.parse(raw);
        const found = list.find(item => item.courseId === courseId);
        return found?.lessonId ?? null;
    } catch {
        return null;
    }
}

export function setCourseLastLesson(courseId: string, lessonId: string): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list: CourseLastLesson[] = raw ? JSON.parse(raw) : [];
        const existing = list.findIndex(item => item.courseId === courseId);
        if (existing >= 0) {
            list[existing].lessonId = lessonId;
        } else {
            list.push({ courseId, lessonId });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
        // ignore
    }
}
