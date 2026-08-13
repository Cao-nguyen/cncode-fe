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

export interface CourseEnrollee {
    _id: string;
    fullName: string;
    avatar?: string | null;
}

export interface CourseDetailBySlug {
    course: Course;
    chapters: ChapterWithLessons[];
    recentEnrollees: CourseEnrollee[];
}

export interface AdminCourseOverview {
    course: Course;
    chapterCount: number;
    lessonCount: number;
    enrollCount: number;
    recentEnrollees: CourseEnrollee[];
}

export interface CourseReviewUser {
    _id: string;
    fullName?: string;
    avatar?: string | null;
}

export interface CourseReview {
    _id: string;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: CourseReviewUser | null;
}

export interface CourseReviewStats {
    average: number;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CourseReviewsResponse {
    success: boolean;
    data: CourseReview[];
    stats: CourseReviewStats;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    message?: string;
}

export interface CourseMyReviewResponse {
    success: boolean;
    data: {
        canReview: boolean;
        myReview: Pick<CourseReview, '_id' | 'rating' | 'content' | 'createdAt' | 'updatedAt'> | null;
    };
    message?: string;
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
    quizMarkdown?: string;
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
    type: 'quiz' | 'true-false' | 'short-answer' | 'ide' | 'multiple-choice' | 'multiple-select' | 'matching' | 'essay' | 'code';
    question: string;
    groupTitle?: string;
    // New format (matching QuizPopup / contest editor)
    options?: (string | ExerciseOption)[];
    correctAnswers?: string[];
    score?: number;
    explanation?: string;
    leftItems?: string[];
    rightItems?: string[];
    matchingPairs?: Array<{ left: string; right: string }>;
    codeMode?: 'algorithm' | 'web';
    webRequirements?: unknown[];
    algoRequirement?: string;
    algoInputDesc?: string;
    algoOutputDesc?: string;
    // Legacy format (for backward compatibility)
    legacyOptions?: ExerciseOption[];
    trueFalseOptions?: { text: string; isCorrect: boolean }[];
    correctAnswer?: string;
    maxLength?: number;
    language?: string;
    starterCode?: string;
    testCases?: Array<ExerciseTestCase & { isSample?: boolean }>;
}

export interface TrueFalseScale {
    correct1: number;
    correct2: number;
    correct3: number;
    correct4: number;
}

export interface Exercise {
    _id: string;
    lessonId: string;
    courseId: string;
    questionMarkdown?: string;
    trueFalseScale?: TrueFalseScale;
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

export interface MyCourse {
    _id: string;
    courseId: string;
    title: string;
    slug: string;
    thumbnail?: string;
    teacherName?: string;
    teacherAvatar?: string;
    totalLessons: number;
    completedLessons: number;
    progress: number; // 0-100
    lastAccessedLessonId?: string;
    continueLessonId?: string;
    lastAccessedAt?: string;
    enrolledAt: string;
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
    progress?: Progress | null; // Progress data added by backend in learn context
}

// ===== EXERCISE ANSWER =====

export interface ExerciseAnswerItem {
    questionId: string;
    answer: string;
}

export interface ExerciseQuestionResult {
    questionId: string;
    isCorrect: boolean;
    points: number;
    feedback?: string;
    needsManualGrading?: boolean;
}

export interface ExerciseSubmitResult {
    isCorrect: boolean;
    canProceed: boolean;
    results?: ExerciseQuestionResult[];
    totalScore?: number;
    maxScore?: number;
}

/** @deprecated Legacy single-answer shape */
export type ExerciseAnswer =
    | string
    | number
    | Record<string, boolean>;

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

// ===== NOTE =====
export interface Note {
    _id?: string;
    userId: string;
    lessonId: string;
    courseId: string;
    time: number;
    timeStr: string;
    text: string;
    createdAt: string;
    updatedAt: string;
}

export interface PayOSWebhookPayload {
    orderCode: number;
    amount: number;
    description: string;
    status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
    payosPaymentId: string;
    signature: string;
}
