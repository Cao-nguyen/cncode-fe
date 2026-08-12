export interface Reply {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
        role?: string;
    };
    content: string;
    parentId?: string | null;
    createdAt: string;
}

export interface HelpProjectStats {
    total: number;
    pending: number;
    answered: number;
}

export interface HelpProject {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    title: string;
    thumbnail?: string;
    content: string;
    status: 'pending' | 'answered';
    isPublic: boolean;
    replies: Reply[];
    viewCount: number;
    commentCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHelpProjectDto {
    title: string;
    thumbnail?: string;
    content: string;
    isPublic?: boolean;
}

export interface UpdateHelpProjectDto {
    title?: string;
    thumbnail?: string;
    content?: string;
    isPublic?: boolean;
    status?: 'pending' | 'answered';
    adminNotes?: string;
}
