// types/dashboard.type.ts
export interface IUser {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    coins: number;
    streak: number;
    role: 'user' | 'teacher' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface IPost {
    _id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    thumbnail: string;
    author: IUser;
    views: number;
    likes: number;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface IDigitalProduct {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    thumbnail: string;
    downloadCount: number;
    rating: number;
    reviewCount: number;
    status: 'draft' | 'published';
    author: IUser;
    createdAt: string;
}

export interface IRevenueData {
    month: string;
    revenue: number;
    orders: number;
}

export interface IUserGrowthData {
    month: string;
    users: number;
    teachers: number;
    total: number;
}

export interface IContentData {
    month: string;
    products: number;
    posts: number;
}

export interface ICategoryStat {
    _id: string;
    count: number;
    totalDownloads: number;
    avgRating: number;
}

export interface IAdminDashboard {
    overview: {
        users: {
            total: number;
            today: number;
            thisWeek: number;
            thisMonth: number;
            thisYear: number;
            teachers: number;
            activeToday: number;
        };
        content: {
            products: {
                total: number;
                published: number;
                newThisMonth: number;
            };
            posts: {
                total: number;
                published: number;
                newThisMonth: number;
            };
        };
        revenue: {
            total: number;
            thisMonth: number;
            totalOrders: number;
            ordersThisMonth: number;
            xuSpentThisMonth: number;
        };
    };
    charts: {
        revenue: IRevenueData[];
        userGrowth: IUserGrowthData[];
        content: IContentData[];
    };
    topProducts: IDigitalProduct[];
    topPosts: IPost[];
    categoryStats: ICategoryStat[];
}

export interface IUserDashboard {
    user: {
        name: string;
        email: string;
        avatar: string;
        coins: number;
        streak: number;
        joinedAt: string;
    };
    stats: {
        posts: {
            total: number;
            totalViews: number;
            totalLikes: number;
            published: number;
        };
        products: {
            total: number;
            totalDownloads: number;
            published: number;
        };
        payments: {
            totalSpent: number;
            totalTransactions: number;
        };
    };
}