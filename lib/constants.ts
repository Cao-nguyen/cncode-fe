export const API_ENDPOINTS = {
    AUTH: {
        GOOGLE: "/user/google",
        ONBOARDING: "/user/onboarding",
        ME: "/user/me",
    },
    ADMIN: {
        STATS: "/admin/stats",
        USER_GROWTH: "/admin/user-growth",
        RECENT_ACTIVITIES: "/admin/recent-activities",
        TOP_EXERCISES: "/admin/top-exercises",
    },
    COURSE: {
        LIST: "/courses",
        DETAIL: (id: string) => `/courses/${id}`,
        CREATE: "/courses",
        UPDATE: (id: string) => `/courses/${id}`,
        DELETE: (id: string) => `/courses/${id}`,
    },
    EXERCISE: {
        LIST: "/exercises",
        DETAIL: (id: string) => `/exercises/${id}`,
        SUBMIT: (id: string) => `/exercises/${id}/submit`,
        CHECK_ACCESS: (id: string) => `/exercises/${id}/check-access`,
        MY_SUBMISSIONS: "/exercises/my-submissions",
        SPIN: (submissionId: string) => `/exercises/submissions/${submissionId}/spin`,
    },
    FORUM: {
        POSTS: "/posts",
        POST_DETAIL: (id: string) => `/posts/${id}`,
        COMMENTS: (postId: string) => `/posts/${postId}/comments`,
    },
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
};

export const USER_ROLES = {
    USER: "user",
    TEACHER: "teacher",
    ADMIN: "admin",
} as const;

export const EXERCISE_DIFFICULTY = {
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
} as const;

export const EXERCISE_SUBJECT = {
    PROGRAMMING: "programming",
    AI: "ai",
    OFFICE: "office",
    HIGHSCHOOL: "highschool",
    OTHER: "other",
} as const;

export const QUESTION_TYPE = {
    MULTIPLE_CHOICE: "multiple_choice",
    MULTI_SELECT: "multi_select",
    SHORT_ANSWER: "short_answer",
    ESSAY: "essay",
    CODE: "code",
} as const;

export const STORAGE_KEYS = {
    TOKEN: "token",
    USER_SAFE: "user_safe",
    THEME: "theme",
};

export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/auth/register",
    ONBOARDING: "/auth/onboarding",
    ADMIN: {
        DASHBOARD: "/admin/dashboard",
        USERS: "/admin/users",
        COURSES: "/admin/courses",
        EXERCISES: "/admin/exercises",
    },
    COURSES: "/courses",
    EXERCISES: "/exercises",
    FORUM: "/forum",
    BLOG: "/blog",
    STORE: "/store",
    PROFILE: (id: string) => `/profile/${id}`,
    SETTINGS: "/settings",
};