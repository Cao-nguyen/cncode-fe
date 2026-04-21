// types/user.type.ts
export interface IUser {
    _id: string;
    fullName: string;
    email: string;
    username?: string;
    role: 'user' | 'teacher' | 'admin';
    requestedRole?: 'teacher' | null;
    class?: string;
    province?: string;
    school?: string;
    birthday?: string;
    bio?: string;
    avatar?: string;
    coins: number;
    streak: number;
    isOnboarded: boolean;
    lastActiveAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUserStats {
    total: number;
    teachers: number;
    admins: number;
    pendingTeachers: number;
    newThisWeek: number;
    activeToday: number;
}

export interface IUserFilters {
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}