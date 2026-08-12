export interface Review {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        avatar?: string;
    };
    rating: number;
    content: string;
    status: 'active' | 'deleted';
    createdAt: string;
    updatedAt: string;
}

export type ReviewStar = 1 | 2 | 3 | 4 | 5;

export interface ReviewStats {
    average: number;
    total: number;
    distribution: Record<ReviewStar, number>;
}

export interface ReviewsResponse {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: ReviewStats;
}
