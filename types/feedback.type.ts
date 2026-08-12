export type FeedbackCategory = 'bug' | 'ui_ux' | 'feature_request' | 'performance' | 'security' | 'other';
export type FeedbackStatus = 'pending' | 'viewed' | 'approved' | 'improving' | 'completed' | 'rejected';
export type FeedbackPriority = 'low' | 'medium' | 'high';

export interface FeedbackUser {
    _id: string;
    fullName: string;
    email?: string;
    avatar?: string;
    username?: string;
}

export interface Feedback {
    _id: string;
    userId: FeedbackUser | null;
    title: string;
    content: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    priority: FeedbackPriority;
    adminResponse: string;
    reactCount: number;
    userLiked?: boolean;
    viewCount: number;
    commentCount: number;
    isPinned: boolean;
    isLocked: boolean;
    reviewedBy?: { _id: string; fullName: string };
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FeedbackStats {
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
}

export interface FeedbackAdminStats {
    statusStats: Record<string, number>;
    categoryStats: Record<string, number>;
    priorityStats: Record<FeedbackPriority, number>;
    total: number;
}

export interface FeedbackListResponse {
    success: boolean;
    data: Feedback[];
    stats?: FeedbackStats;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

export interface FeedbackDetailResponse {
    success: boolean;
    data: Feedback;
    message?: string;
}

export interface CreateFeedbackDto {
    title: string;
    content: string;
    category?: FeedbackCategory;
    priority?: FeedbackPriority;
}

export interface UpdateFeedbackDto {
    title?: string;
    content?: string;
    category?: FeedbackCategory;
    priority?: FeedbackPriority;
}

export interface ReactFeedbackResult {
    reactCount: number;
    liked: boolean;
    action: 'liked' | 'unliked';
}

export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
    bug: 'Lỗi/Bug',
    ui_ux: 'UI/UX',
    feature_request: 'Tính năng mới',
    performance: 'Hiệu năng',
    security: 'Bảo mật',
    other: 'Khác',
};

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
    pending: 'Chờ xử lý',
    viewed: 'Đã xem',
    approved: 'Đã duyệt',
    improving: 'Đang cải tiến',
    completed: 'Hoàn thành',
    rejected: 'Từ chối',
};

export const PRIORITY_LABELS: Record<FeedbackPriority, string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
};

export const STATUS_COLORS: Record<FeedbackStatus, string> = {
    pending: 'bg-amber-50 text-amber-700',
    viewed: 'bg-blue-50 text-blue-700',
    approved: 'bg-emerald-50 text-emerald-700',
    improving: 'bg-purple-50 text-purple-700',
    completed: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
};

export const CATEGORY_COLORS: Record<FeedbackCategory, string> = {
    bug: 'bg-red-50 text-red-700',
    ui_ux: 'bg-purple-50 text-purple-700',
    feature_request: 'bg-emerald-50 text-emerald-700',
    performance: 'bg-yellow-50 text-yellow-700',
    security: 'bg-orange-50 text-orange-700',
    other: 'bg-gray-100 text-gray-700',
};

export const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export const PRIORITY_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
];

export const PUBLIC_STATUS_FILTERS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'improving', label: 'Đang cải tiến' },
    { value: 'completed', label: 'Hoàn thành' },
];

export const CREATE_CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export const CREATE_PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export interface ReleaseVersion {
    _id: string;
    version: string;
    changes: string[];
    isPublished: boolean;
    releasedAt: string;
    createdBy?: { _id: string; fullName?: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface ReleaseVersionDto {
    version: string;
    changes: string[];
    isPublished?: boolean;
    releasedAt?: string;
}

export interface ReleaseVersionListResponse {
    success: boolean;
    data: ReleaseVersion[];
    message?: string;
}
