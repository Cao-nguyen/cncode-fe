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
    createdAt: string;
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
    replies: Reply[];
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHelpProjectDto {
    title: string;
    thumbnail?: string;
    content: string;
}

export interface UpdateHelpProjectDto {
    title?: string;
    thumbnail?: string;
    content?: string;
    status?: 'pending' | 'answered';
    adminNotes?: string;
}
