export interface Blog {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    author: {
        _id: string;
        fullName: string;
        avatar: string;
        email: string;
    };
    isPublished: boolean;
    publishedAt: string | null;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    rejectionReason?: string;
    needsReview?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBlogData {
    title: string;
    thumbnail?: string;
    excerpt?: string;
    content: string;
    category: string;
    tags?: string[];
    isPublished?: boolean;
    publishedAt?: string;
}

export interface UpdateBlogData {
    title?: string;
    thumbnail?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    publishedAt?: string;
    rejectionReason?: string;
    needsReview?: boolean;
}

export interface BlogStats {
    total: number;
    published: number;
    draft: number;
    totalViews: number;
}

export interface BlogGrowthData {
    date: string;
    count: number;
}

export interface TopBlogData {
    _id: string;
    title: string;
    viewCount?: number;
    likeCount?: number;
    thumbnail?: string;
}

export interface GetBlogsParams {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
}

export interface GetBlogsAdminParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isPublished?: string;
}

export interface BlogPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: BlogPagination;
}