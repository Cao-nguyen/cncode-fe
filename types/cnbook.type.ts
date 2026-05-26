// types/cnbook.type.ts
export interface Author {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
}

export interface Exercise {
    _id: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    question: string;
    options?: string[];
    correctAnswer: string | number | boolean;
    explanation?: string;
    points: number;
    order: number;
}

export interface Lesson {
    _id: string;
    title: string;
    content: string;
    order: number;
    exercises: Exercise[];
    createdAt: string;
}

export interface Section {
    _id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export interface Book {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    authorId: Author;
    category: 'grade10' | 'grade11' | 'grade12' | 'other';
    price: number;
    discountPrice: number;
    isFree: boolean;
    isPaid: boolean;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';
    rejectReason?: string;
    viewCount: number;
    purchaseCount: number;
    rating: number;
    reviewCount: number;
    sections: Section[];
    finalPrice?: number;
    discountPercent?: number;
    createdAt: string;
    publishedAt?: string;
}

export interface UserProgress {
    progress: number;
    lastLessonId?: string;
    notes: Array<{
        _id: string;
        lessonId: string;
        content: string;
        highlight?: string;
        createdAt: string;
    }>;
    exerciseAnswers: Array<{
        exerciseId: string;
        answer: string | number | boolean;
        isCorrect: boolean;
        score: number;
        answeredAt: string;
    }>;
}

export interface ExerciseAnswerResult {
    isCorrect: boolean;
    score: number;
    correctAnswer: string | number | boolean;
}

export interface UserBook {
    _id: string;
    isPurchased: boolean;
    purchasedAt?: string;
    progress: number;
    lastLessonId?: string;
    notes: Array<{
        _id: string;
        lessonId: string;
        content: string;
        highlight?: string;
        createdAt: string;
    }>;
    exerciseAnswers: Array<{
        exerciseId: string;
        answer: string | number | boolean;
        isCorrect: boolean;
        score: number;
        answeredAt: string;
    }>;
}

export interface CreateBookDto {
    title: string;
    description?: string;
    thumbnail: string;
    category: string;
    price?: number;
    discountPrice?: number;
    isFree?: boolean;
}

export interface CreateSectionDto {
    title: string;
    order?: number;
}

export interface CreateLessonDto {
    title: string;
    content: string;
    order?: number;
}

export interface CreateExerciseDto {
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    question: string;
    options?: string[];
    correctAnswer: string | number | boolean;
    explanation?: string;
    points?: number;
    order?: number;
}

export interface BookStats {
    total: number;
    published: number;
    pending: number;
    draft: number;
    totalPurchases: number;
    categoryStats: Array<{ _id: string; count: number }>;
}

export interface ExerciseAnswerResult {
    isCorrect: boolean;
    score: number;
    correctAnswer: string | number | boolean;
}