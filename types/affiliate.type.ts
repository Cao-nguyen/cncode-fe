// types/affiliate.type.ts

export interface IAffiliateUser {
    _id: string;
    fullName: string;
    email: string;
    username: string;
    avatar?: string;
}

export interface IAffiliateStat {
    _id: string;
    user: IAffiliateUser;
    code: string;
    link: string;
    clicks: number;
    totalRegistered: number;
    totalPosted: number;
    totalTakenQuiz: number;
    totalCoinsEarned: number;
    createdAt: string;
    updatedAt?: string;
}

export interface IAffiliateStatsResponse {
    stats: IAffiliateStat[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

export interface IAffiliateApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
}

export interface IAffiliateFilters {
    page: number;
    limit: number;
    search?: string;
}

export interface IMyAffiliateInfo {
    code: string;
    link: string;
    clicks: number;
    totalRegistered: number;
    totalPosted: number;
    totalTakenQuiz: number;
    totalCoinsEarned: number;
    createdAt: string;
    referredUsers: IReferredUser[];
}

export interface IReferredUser {
    name: string;
    email: string;
    registeredAt: string;
    hasPosted: boolean;
    hasTakenQuiz: boolean;
    coinsEarned: number;
}

export interface ILeaderboardUser {
    _id: string;
    totalRegistered: number;
    totalPosted: number;
    totalTakenQuiz: number;
    totalCoins: number;
    user: {
        fullName: string;
        avatar: string;
        username: string;
    };
}

export interface ILeaderboardResponse {
    leaderboard: ILeaderboardUser[];
}