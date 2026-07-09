export type JobType = 'recruitment' | 'skill-sale';

export interface CNJob {
    id: string;
    type: JobType;
    title: string;
    company?: string; // For recruitment
    sellerName?: string; // For skill sale
    description: string;
    requirements?: string[]; // For recruitment
    skills?: string[]; // For skill sale
    salary?: string; // For recruitment
    price?: string; // For skill sale
    location?: string;
    workType?: 'remote' | 'onsite' | 'hybrid';
    experience?: string;
    deadline?: string;
    contactInfo: {
        email?: string;
        phone?: string;
        zalo?: string;
        other?: string;
    };
    tags: string[];
    postedBy: {
        userId: string;
        username: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
    views: number;
    applications: number;
}

export interface CNJobFormData {
    type: JobType;
    title: string;
    company?: string;
    sellerName?: string;
    description: string;
    requirements?: string[];
    skills?: string[];
    salary?: string;
    price?: string;
    location?: string;
    workType?: 'remote' | 'onsite' | 'hybrid';
    experience?: string;
    deadline?: string;
    contactInfo: {
        email?: string;
        phone?: string;
        zalo?: string;
        other?: string;
    };
    tags: string[];
}