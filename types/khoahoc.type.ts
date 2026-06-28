// ===== KHOA HOC (COURSE) =====

export interface Course {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    teacherId: string | { _id: string; fullName?: string; avatar?: string };
    teacherName?: string;
    teacherAvatar?: string;
    type: 'free' | 'pro';
    price: number;
    discountPrice?: number;
    discountPercent: number;
    allowCoinPayment: boolean;
    totalLessons: number;
    totalDuration: number;
    enrollCount: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden';
    rejectedReason?: string;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CourseQuery {
    type?: 'free' | 'pro';
    sort?: 'price-asc' | 'price-desc' | 'newest';
    page?: number;
    limit?: number;
}

// ===== CHUONG (CHAPTER) =====

export interface Chapter {
    _id: string;
    courseId: string;
    title: string;
    order: number;
    totalLessons: number;
    totalDuration: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChapterCreate {
    courseId: string;
    title: string;
    order?: number;
}

export interface ChapterReorder {
    chapterId: string;
    newIndex: number;
}

// ===== BAI HOC (LESSON) =====

export interface Lesson {
    _id: string;
    courseId: string;
    chapterId: string;
    title: string;
    order: number;
    type: 'video' | 'exercise';
    videoFileId?: string; // Telegram messageId
    duration?: number;
    description?: string;
    quizQuestions?: {
        time: number;
        question: string;
        options: string[];
        correctAnswer: number;
    }[];
    isPreview: boolean;
    updatedAt: string;
    createdAt: string;
}

export interface LessonCreate {
    courseId: string;
    chapterId: string;
    title: string;
    order: number;
    type: 'video' | 'exercise';
    videoFileId?: string;
    duration?: number;
    description?: string;
    isPreview?: boolean;
}

// ===== BAI TAP (EXERCISE) =====

export interface ExerciseOption {
    text: string;
    isCorrect: boolean;
}

export interface ExerciseTestCase {
    input: string;
    expectedOutput: string;
}

export interface ExerciseQuestion {
    _id?: string;
    type: 'quiz' | 'true-false' | 'short-answer' | 'ide';
    question: string;
    // Quiz options
    options?: ExerciseOption[];
    // True/false options (each option has its own isCorrect)
    trueFalseOptions?: { text: string; isCorrect: boolean }[];
    // Short answer
    correctAnswer?: string;
    maxLength?: number;
    // IDE
    language?: string;
    starterCode?: string;
    testCases?: ExerciseTestCase[];
}

export interface Exercise {
    _id: string;
    lessonId: string;
    courseId: string;
    questions: ExerciseQuestion[];
    mustPassToNext: boolean;
}

// ===== ENROLLMENT =====

export interface Enrollment {
    _id: string;
    userId: string;
    courseId: string;
    paymentMethod: 'payos' | 'coin' | 'free';
    paymentStatus: 'pending' | 'completed';
    orderCode?: number;
    enrolledAt: string;
    createdAt: string;
}

// ===== TIEN DO (PROGRESS) =====

export interface Progress {
    _id: string;
    userId: string;
    courseId: string;
    lessonId: string;
    isCompleted: boolean;
    watchedSeconds: number;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ===== CHUNG CHI (CERTIFICATE) =====

export interface Certificate {
    _id: string;
    userId: string;
    courseId: string;
    fullName: string;
    imageUrl: string;
    issuedAt: string;
    createdAt: string;
}

// ===== BINH LUAN (COMMENT) =====

export interface Comment {
    _id: string;
    userId: string;
    userName?: string;
    lessonId: string;
    courseId: string;
    content: string;
    parentId?: string;
    replies?: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface CommentCreate {
    lessonId: string;
    courseId: string;
    content: string;
    parentId?: string;
}

// ===== TEACHER COURSE =====

export interface TeacherCourseSummary {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    type: 'free' | 'pro';
    price: number;
    discountPrice?: number;
    discountPercent: number;
    totalLessons: number;
    enrollCount: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden';
    rejectedReason?: string;
    revenue?: number;
    createdAt: string;
}

// ===== TEACHER COURSE FORM =====

export interface CourseFormData {
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    type: 'free' | 'pro';
    price: number;
    discountPrice?: number;
    discountPercent: number;
    allowCoinPayment: boolean;
    chapters: ChapterWithLessons[];
}

export interface ChapterWithLessons {
    _id?: string;
    title: string;
    order: number;
    lessons: LessonWithExercise[];
}

export interface LessonWithExercise {
    _id?: string;
    title: string;
    order: number;
    type: 'video' | 'exercise';
    videoFileId?: string;
    duration?: number;
    description?: string;
    isPreview?: boolean;
    exercise?: Partial<Exercise>;
}

// ===== EXERCISE ANSWER =====

export type ExerciseAnswer =
    | string // short-answer, ide
    | number // quiz: option index
    | Record<string, boolean>; // true-false: { [optionIndex]: boolean }

// ===== PAYMENT =====

export interface PayOSPaymentRequest {
    orderId: string;
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
}

export interface PayOSPaymentLink {
    checkoutUrl?: string;
    qrCode?: string;
    paymentLinkId?: string;
    payosPaymentId?: string;
    orderCode?: number;
    enrollment?: Enrollment;
    alreadyEnrolled?: boolean;
}

// ===== WEBHOOK =====

export interface PayOSWebhookPayload {
    orderCode: number;
    amount: number;
    description: string;
    status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
    payosPaymentId: string;
    signature: string;
}
