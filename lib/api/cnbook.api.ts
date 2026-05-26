// lib/api/cnbook.api.ts
import {
    Book, UserBook, CreateBookDto, CreateSectionDto,
    CreateLessonDto, CreateExerciseDto, BookStats, ExerciseAnswerResult,
    Exercise,
    Lesson
} from '@/types/cnbook.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const cnbookApi = {
    // ============ PUBLIC ============
    getBooks: async (params: { page?: number; limit?: number; category?: string; search?: string; sort?: string } = {}): Promise<{ success: boolean; books: Book[]; total: number; totalPages: number }> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.category) query.append('category', params.category);
        if (params.search) query.append('search', params.search);
        if (params.sort) query.append('sort', params.sort);

        const response = await fetch(`${API_URL}/api/cnbooks?${query.toString()}`);
        return response.json();
    },

    getBookById: async (id: string): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/detail/${id}`, {  // 👈 THÊM /detail/
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Sửa getUserBooks URL
    getUserBooks: async (params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<{ success: boolean; books: Book[]; total: number; totalPages: number }> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);
        if (params.search) query.append('search', params.search);

        const response = await fetch(`${API_URL}/api/cnbooks/user/books?${query.toString()}`, {  // 👈 THÊM /user/books
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getBookBySlug: async (slug: string): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/${slug}`);
        return response.json();
    },

    // ============ USER (cần đăng nhập) ============
    purchaseBook: async (bookId: string, useCoins: boolean = false): Promise<{ success: boolean; data: UserBook; message?: string }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/purchase`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ bookId, useCoins })
        });
        return response.json();
    },

    getUserBook: async (bookId: string): Promise<{ success: boolean; data: { book: Book; userBook: UserBook } }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/learn/${bookId}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    saveNote: async (bookId: string, lessonId: string, content: string, highlight?: string): Promise<{ success: boolean; data: { _id: string; content: string; createdAt: string } }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/note`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ bookId, lessonId, content, highlight })
        });
        return response.json();
    },

    saveExerciseAnswer: async (bookId: string, exerciseId: string, answer: string | number | boolean): Promise<{ success: boolean; data: ExerciseAnswerResult }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/exercise-answer`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ bookId, exerciseId, answer })
        });
        return response.json();
    },

    updateProgress: async (bookId: string, lessonId: string, progress: number): Promise<{ success: boolean; data: UserBook }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/progress`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ bookId, lessonId, progress })
        });
        return response.json();
    },

    getUserProgress: async (bookId: string): Promise<{ success: boolean; data: { progress: number; lastLessonId: string | null; notes: UserBook['notes']; exerciseAnswers: UserBook['exerciseAnswers'] } }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/progress/${bookId}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // ============ AUTHOR (tạo/sửa sách) ============
    createBook: async (data: CreateBookDto): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateBook: async (id: string, data: Partial<CreateBookDto>): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteBook: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Sections
    addSection: async (bookId: string, data: CreateSectionDto): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/${bookId}/sections`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateSection: async (bookId: string, sectionId: string, data: Partial<CreateSectionDto>): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/${bookId}/sections/${sectionId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteSection: async (bookId: string, sectionId: string): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/${bookId}/sections/${sectionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Lessons
    addLesson: async (bookId: string, sectionId: string, data: CreateLessonDto): Promise<{ success: boolean; data: Lesson }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/${bookId}/sections/${sectionId}/lessons`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateLesson: async (lessonId: string, data: Partial<CreateLessonDto>): Promise<{ success: boolean; data: Lesson }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/lessons/${lessonId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteLesson: async (lessonId: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/lessons/${lessonId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Exercises
    addExercise: async (lessonId: string, data: CreateExerciseDto): Promise<{ success: boolean; data: Exercise }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/lessons/${lessonId}/exercises`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateExercise: async (exerciseId: string, data: Partial<CreateExerciseDto>): Promise<{ success: boolean; data: Exercise }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/exercises/${exerciseId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteExercise: async (exerciseId: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/exercises/${exerciseId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // ============ ADMIN ============
    getAdminBooks: async (params: { page?: number; limit?: number; status?: string; search?: string; category?: string } = {}): Promise<{ success: boolean; books: Book[]; total: number; totalPages: number }> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);
        if (params.search) query.append('search', params.search);
        if (params.category) query.append('category', params.category);

        const response = await fetch(`${API_URL}/api/cnbooks/admin/list?${query.toString()}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getStatistics: async (): Promise<{ success: boolean; data: BookStats }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/admin/statistics`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    approveBook: async (id: string, status: string, rejectReason?: string): Promise<{ success: boolean; data: Book }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/admin/${id}/approve`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, rejectReason })
        });
        return response.json();
    },

    adminDeleteBook: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/api/cnbooks/admin/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    }
};