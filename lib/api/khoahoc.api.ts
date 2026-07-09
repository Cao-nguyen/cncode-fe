import axios from 'axios';
import {
    Course,
    CourseQuery,
    Chapter,
    ChapterCreate,
    ChapterWithLessons,
    Lesson,
    LessonCreate,
    Exercise,
    ExerciseQuestion,
    Enrollment,
    Progress,
    Certificate,
    Comment,
    CommentCreate,
    PayOSPaymentLink,
    ExerciseAnswer,
    Note,
} from '../../types/khoahoc.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
};

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interfaces
export interface CoursesResponse {
    success: boolean;
    data: Course[];
    message?: string;
}

export interface CourseResponse {
    success: boolean;
    data: Course;
    message?: string;
}

export interface ChaptersResponse {
    success: boolean;
    data: Chapter[];
    message?: string;
}

export interface ChapterResponse {
    success: boolean;
    data: Chapter;
    message?: string;
}

export interface LessonsResponse {
    success: boolean;
    data: Lesson[];
    message?: string;
}

export interface LessonResponse {
    success: boolean;
    data: Lesson;
    message?: string;
}

export interface ExerciseResponse {
    success: boolean;
    data: Exercise;
    message?: string;
}

export const khoahocApi = {
    // ===== PUBLIC APIs =====
    getCourses: async (params?: CourseQuery): Promise<Course[]> => {
        const response = await apiClient.get('/khoahoc', { params });
        return response.data.data;
    },

    getCourseBySlug: async (slug: string): Promise<Course> => {
        const response = await apiClient.get(`/khoahoc/${slug}`);
        return response.data.data;
    },

    getCourseLearnData: async (courseId: string): Promise<{ chapters: ChapterWithLessons[] }> => {
        const response = await apiClient.get(`/khoahoc/${courseId}/learn`);
        return response.data.data;
    },

    // ===== TEACHER APIs =====
    createTeacherCourse: async (data: Partial<Course>): Promise<Course> => {
        const response = await apiClient.post('/teacher/khoahoc', data);
        return response.data.data;
    },

    updateTeacherCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
        const response = await apiClient.put(`/teacher/khoahoc/${id}`, data);
        return response.data.data;
    },

    submitCourseForReview: async (id: string): Promise<Course> => {
        const response = await apiClient.put(`/teacher/khoahoc/${id}/submit`);
        return response.data.data;
    },

    toggleCourseHide: async (id: string, hide: boolean): Promise<Course> => {
        const response = await apiClient.put(`/teacher/khoahoc/${id}/toggle-hide`, { hide });
        return response.data.data;
    },

    deleteTeacherCourse: async (id: string): Promise<void> => {
        await apiClient.delete(`/teacher/khoahoc/${id}`);
    },

    getCourseChapters: async (courseId: string): Promise<Chapter[]> => {
        const response = await apiClient.get(`/teacher/khoahoc/${courseId}/chapters`);
        return response.data.data;
    },

    createChapter: async (courseId: string, data: ChapterCreate): Promise<Chapter> => {
        const response = await apiClient.post(`/teacher/khoahoc/${courseId}/chapters`, data);
        return response.data.data;
    },

    reorderChapters: async (courseId: string, order: string[]): Promise<void> => {
        await apiClient.put(`/teacher/khoahoc/${courseId}/chapters/reorder`, { order });
    },

    updateChapter: async (chapterId: string, data: Partial<Chapter>): Promise<Chapter> => {
        const response = await apiClient.put(`/teacher/chapters/${chapterId}`, data);
        return response.data.data;
    },

    deleteChapter: async (chapterId: string): Promise<void> => {
        await apiClient.delete(`/teacher/chapters/${chapterId}`);
    },

    createLesson: async (chapterId: string, data: LessonCreate): Promise<Lesson> => {
        const response = await apiClient.post(`/teacher/chapters/${chapterId}/lessons`, data);
        return response.data.data;
    },

    reorderLessons: async (chapterId: string, order: string[]): Promise<void> => {
        await apiClient.put(`/teacher/chapters/${chapterId}/lessons/reorder`, { order });
    },

    updateLesson: async (lessonId: string, data: Partial<Lesson>): Promise<Lesson> => {
        const response = await apiClient.put(`/teacher/lessons/${lessonId}`, data);
        return response.data.data;
    },

    deleteLesson: async (lessonId: string): Promise<void> => {
        await apiClient.delete(`/teacher/lessons/${lessonId}`);
    },

    createExercise: async (lessonId: string, data: Partial<Exercise>): Promise<Exercise> => {
        const response = await apiClient.post(`/teacher/lessons/${lessonId}/exercise`, data);
        return response.data.data;
    },

    updateExercise: async (exerciseId: string, data: Partial<Exercise>): Promise<Exercise> => {
        const response = await apiClient.put(`/teacher/exercises/${exerciseId}`, data);
        return response.data.data;
    },

    // ===== ADMIN APIs =====
    getAdminCourses: async (status?: string): Promise<Course[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await apiClient.get(`/admin/khoahoc/khoahoc${params}`);
        return response.data.data.courses;
    },

    getAdminStats: async (): Promise<{
        totalCourses: number;
        totalStudents: number;
        monthlyRevenue: number;
        coursesByMonth: { month: string; count: number }[];
        revenueByMonth: { month: string; revenue: number }[];
    }> => {
        const response = await apiClient.get('/admin/khoahoc/khoahoc/stats');
        const data = response.data.data;
        return {
            totalCourses: data.totalCourses,
            totalStudents: data.totalEnrollments,
            monthlyRevenue: data.thisMonthRevenue,
            coursesByMonth: (data.coursesByMonth || []).map((item: { _id: { year: number; month: number }; count: number }) => ({
                month: `${item._id.month}/${item._id.year}`,
                count: item.count,
            })),
            revenueByMonth: (data.revenueByMonth || []).map((item: { _id: { year: number; month: number }; revenue: number }) => ({
                month: `${item._id.month}/${item._id.year}`,
                revenue: item.revenue,
            })),
        };
    },

    createAdminCourse: async (data: Partial<Course>): Promise<Course> => {
        const response = await apiClient.post('/admin/khoahoc/khoahoc', data);
        return response.data.data;
    },

    approveCourse: async (id: string): Promise<Course> => {
        const response = await apiClient.put(`/admin/khoahoc/khoahoc/${id}/approve`);
        return response.data.data;
    },

    rejectCourse: async (id: string, reason: string): Promise<Course> => {
        const response = await apiClient.put(`/admin/khoahoc/khoahoc/${id}/reject`, { reason });
        return response.data.data;
    },

    updateAdminCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
        const response = await apiClient.put(`/admin/khoahoc/khoahoc/${id}`, data);
        return response.data.data;
    },

    deleteAdminCourse: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/khoahoc/khoahoc/${id}`);
    },

    getAdminCourseChapters: async (courseId: string): Promise<Chapter[]> => {
        const response = await apiClient.get(`/admin/khoahoc/${courseId}/chapters`);
        return response.data.data;
    },

    createAdminChapter: async (courseId: string, data: ChapterCreate): Promise<Chapter> => {
        const response = await apiClient.post(`/admin/khoahoc/${courseId}/chapters`, data);
        return response.data.data;
    },

    updateAdminChapter: async (chapterId: string, data: Partial<Chapter>): Promise<Chapter> => {
        const response = await apiClient.put(`/admin/khoahoc/chapters/${chapterId}`, data);
        return response.data.data;
    },

    deleteAdminChapter: async (chapterId: string): Promise<void> => {
        await apiClient.delete(`/admin/khoahoc/chapters/${chapterId}`);
    },

    reorderAdminChapters: async (courseId: string, chapters: { _id: string; order: number }[]): Promise<void> => {
        await apiClient.put(`/admin/khoahoc/${courseId}/chapters/reorder`, { chapters });
    },

    createAdminLesson: async (chapterId: string, data: LessonCreate): Promise<Lesson> => {
        const response = await apiClient.post(`/admin/khoahoc/chapters/${chapterId}/lessons`, data);
        return response.data.data;
    },

    updateAdminLesson: async (lessonId: string, data: Partial<Lesson>): Promise<Lesson> => {
        const response = await apiClient.put(`/admin/khoahoc/lessons/${lessonId}`, data);
        return response.data.data;
    },

    deleteAdminLesson: async (lessonId: string): Promise<void> => {
        await apiClient.delete(`/admin/khoahoc/lessons/${lessonId}`);
    },

    reorderAdminLessons: async (chapterId: string, lessons: { _id: string; order: number }[]): Promise<void> => {
        await apiClient.put(`/admin/khoahoc/chapters/${chapterId}/lessons/reorder`, { lessons });
    },

    createAdminExercise: async (lessonId: string, data: Partial<Exercise>): Promise<Exercise> => {
        const response = await apiClient.post(`/admin/khoahoc/lessons/${lessonId}/exercise`, data);
        return response.data.data || response.data;
    },

    updateAdminExercise: async (exerciseId: string, data: Partial<Exercise>): Promise<Exercise> => {
        const response = await apiClient.put(`/admin/khoahoc/exercises/${exerciseId}`, data);
        return response.data.data || response.data;
    },

    // Baitap module APIs (for new exercise system)
    createBaitapExercise: async (lessonId: string, data: { courseId: string; questions: ExerciseQuestion[]; mustPassToNext?: boolean }): Promise<Exercise> => {
        const response = await apiClient.post(`/baitap/lesson/${lessonId}`, data);
        return response.data;
    },

    updateBaitapExercise: async (exerciseId: string, data: { questions: ExerciseQuestion[] }): Promise<Exercise> => {
        const response = await apiClient.put(`/baitap/${exerciseId}`, data);
        return response.data;
    },

    // ===== STUDENT APIs =====
    enrollPayOS: async (courseId: string): Promise<PayOSPaymentLink> => {
        const response = await apiClient.post(`/payment/khoahoc/${courseId}/payos`);
        return response.data.data;
    },

    enrollCoin: async (courseId: string): Promise<Enrollment> => {
        const response = await apiClient.post(`/payment/khoahoc/${courseId}/coin`);
        return response.data.data;
    },

    getEnrollmentStatus: async (courseId: string): Promise<Enrollment> => {
        const response = await apiClient.get(`/payment/khoahoc/${courseId}/status`);
        return response.data.data;
    },

    getLesson: async (lessonId: string): Promise<Lesson> => {
        const response = await apiClient.get(`/baihoc/${lessonId}`);
        return response.data.data;
    },

    getExerciseByLessonId: async (lessonId: string): Promise<Exercise | null> => {
        try {
            const response = await apiClient.get(`/baitap/lesson/${lessonId}`);
            return response.data.data || response.data;
        } catch {
            return null;
        }
    },

    submitLessonProgress: async (lessonId: string, payload: { watchedSeconds: number; isCompleted: boolean }): Promise<Progress> => {
        const response = await apiClient.post(`/tiendo/lesson/${lessonId}`, payload);
        return response.data.data;
    },

    getLessonProgress: async (lessonId: string): Promise<Progress> => {
        const response = await apiClient.get(`/tiendo/lesson/${lessonId}`);
        return response.data.data;
    },

    getCourseProgress: async (courseId: string): Promise<{ total: number; completed: number; percent: number; progresses: Progress[] }> => {
        const response = await apiClient.get(`/tiendo/course/${courseId}`);
        return response.data.data;
    },

    // ===== NOTES APIs =====
    createNote: async (data: { lessonId: string; courseId: string; time: number; timeStr: string; text: string }): Promise<Note> => {
        const response = await apiClient.post('/notes', data);
        return response.data.data;
    },

    getNotesByLesson: async (lessonId: string): Promise<Note[]> => {
        const response = await apiClient.get(`/notes/lesson/${lessonId}`);
        return response.data.data;
    },

    getNotesByCourse: async (courseId: string): Promise<Note[]> => {
        const response = await apiClient.get(`/notes/course/${courseId}`);
        return response.data.data;
    },

    updateNote: async (noteId: string, text: string): Promise<Note> => {
        const response = await apiClient.put(`/notes/${noteId}`, { text });
        return response.data.data;
    },

    deleteNote: async (noteId: string): Promise<void> => {
        await apiClient.delete(`/notes/${noteId}`);
    },

    submitExercise: async (exerciseId: string, payload: { answer: ExerciseAnswer }): Promise<{ isCorrect: boolean; canProceed: boolean }> => {
        const response = await apiClient.post(`/baitap/${exerciseId}/submit`, payload);
        return response.data.data;
    },

    // ===== CERTIFICATE APIs =====
    checkCertificate: async (courseId: string): Promise<{ eligible: boolean }> => {
        const response = await apiClient.get(`/khoahoc/${courseId}/certificate/check`);
        return response.data.data;
    },

    requestCertificate: async (courseId: string, fullName: string): Promise<Certificate> => {
        const response = await apiClient.post(`/khoahoc/${courseId}/certificate`, { fullName });
        return response.data.data;
    },

    getCertificate: async (courseId: string): Promise<Certificate> => {
        const response = await apiClient.get(`/khoahoc/${courseId}/certificate`);
        return response.data.data;
    },

    // ===== COMMENT APIs =====
    getComments: async (lessonId: string): Promise<Comment[]> => {
        const response = await apiClient.get(`/comments/lesson/${lessonId}`);
        return response.data.data;
    },

    postComment: async (lessonId: string, data: CommentCreate): Promise<Comment> => {
        const response = await apiClient.post(`/comments`, { ...data, lessonId });
        return response.data.data;
    },

    replyComment: async (commentId: string, data: { content: string }): Promise<Comment> => {
        const response = await apiClient.post(`/comments/${commentId}/reply`, data);
        return response.data.data;
    },

    deleteComment: async (commentId: string): Promise<void> => {
        await apiClient.delete(`/comments/${commentId}`);
    },

    confirmPayOSPayment: async (orderCode: string): Promise<Enrollment> => {
        const response = await apiClient.post(`/payment/payos/confirm`, { orderCode });
        return response.data.data;
    },

    getPayOSLink: async (courseId: string): Promise<PayOSPaymentLink> => {
        const response = await apiClient.post(`/payment/khoahoc/${courseId}/payos`);
        return response.data.data;
    },

    getMyCourses: async (): Promise<Course[]> => {
        const response = await apiClient.get('/enrollment/me');
        return response.data.data;
    },
};

// Backward compatibility exports
export const getCourses = khoahocApi.getCourses;
export const getCourseBySlug = khoahocApi.getCourseBySlug;
export const createTeacherCourse = khoahocApi.createTeacherCourse;
export const updateTeacherCourse = khoahocApi.updateTeacherCourse;
export const submitCourseForReview = khoahocApi.submitCourseForReview;
export const toggleCourseHide = khoahocApi.toggleCourseHide;
export const deleteTeacherCourse = khoahocApi.deleteTeacherCourse;
export const getCourseChapters = khoahocApi.getCourseChapters;
export const createChapter = khoahocApi.createChapter;
export const reorderChapters = khoahocApi.reorderChapters;
export const updateChapter = khoahocApi.updateChapter;
export const deleteChapter = khoahocApi.deleteChapter;
export const createLesson = khoahocApi.createLesson;
export const reorderLessons = khoahocApi.reorderLessons;
export const updateLesson = khoahocApi.updateLesson;
export const deleteLesson = khoahocApi.deleteLesson;
export const createExercise = khoahocApi.createExercise;
export const updateExercise = khoahocApi.updateExercise;
export const enrollPayOS = khoahocApi.enrollPayOS;
export const enrollCoin = khoahocApi.enrollCoin;
export const getEnrollmentStatus = khoahocApi.getEnrollmentStatus;
export const getLesson = khoahocApi.getLesson;
export const getLessonDetail = khoahocApi.getLesson;
export const getExerciseByLessonId = khoahocApi.getExerciseByLessonId;
export const getCourseLearnData = khoahocApi.getCourseLearnData;
export const submitLessonProgress = khoahocApi.submitLessonProgress;
export const saveProgress = khoahocApi.submitLessonProgress;
export const getLessonProgress = khoahocApi.getLessonProgress;
export const getProgress = khoahocApi.getLessonProgress;
export const getCourseProgress = khoahocApi.getCourseProgress;
export const createNote = khoahocApi.createNote;
export const getNotesByLesson = khoahocApi.getNotesByLesson;
export const getNotesByCourse = khoahocApi.getNotesByCourse;
export const updateNote = khoahocApi.updateNote;
export const deleteNote = khoahocApi.deleteNote;
export const submitExercise = khoahocApi.submitExercise;
export const checkCertificate = khoahocApi.checkCertificate;
export const requestCertificate = khoahocApi.requestCertificate;
export const getCertificate = khoahocApi.getCertificate;
export const getComments = khoahocApi.getComments;
export const postComment = khoahocApi.postComment;
export const createComment = khoahocApi.postComment;
export const replyComment = khoahocApi.replyComment;
export const deleteComment = khoahocApi.deleteComment;
export const confirmPayOSPayment = khoahocApi.confirmPayOSPayment;
export const getPayOSLink = khoahocApi.getPayOSLink;
export const getAdminCourses = khoahocApi.getAdminCourses;
export const getAdminStats = khoahocApi.getAdminStats;
export const createAdminCourse = khoahocApi.createAdminCourse;
export const approveCourse = khoahocApi.approveCourse;
export const rejectCourse = khoahocApi.rejectCourse;
export const updateAdminCourse = khoahocApi.updateAdminCourse;
export const deleteAdminCourse = khoahocApi.deleteAdminCourse;
export const getAdminCourseChapters = khoahocApi.getAdminCourseChapters;
export const createAdminChapter = khoahocApi.createAdminChapter;
export const updateAdminChapter = khoahocApi.updateAdminChapter;
export const deleteAdminChapter = khoahocApi.deleteAdminChapter;
export const reorderAdminChapters = khoahocApi.reorderAdminChapters;
export const createAdminLesson = khoahocApi.createAdminLesson;
export const updateAdminLesson = khoahocApi.updateAdminLesson;
export const deleteAdminLesson = khoahocApi.deleteAdminLesson;
export const reorderAdminLessons = khoahocApi.reorderAdminLessons;
export const createAdminExercise = khoahocApi.createAdminExercise;
export const updateAdminExercise = khoahocApi.updateAdminExercise;
export const getMyCourses = khoahocApi.getMyCourses;

export type { Course };
