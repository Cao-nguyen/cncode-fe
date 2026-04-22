// types/faq.type.ts
export interface IFAQ {
    _id: string;
    question: string;
    answer: string;
    category: 'general' | 'account' | 'payment' | 'course' | 'product' | 'other';
    order: number;
    isActive: boolean;
    views: number;
    helpful: number;
    notHelpful: number;
    createdAt: string;
    updatedAt: string;
}

export interface IFAQCategory {
    id: string;
    name: string;
    icon?: string;
}

export const FAQ_CATEGORIES: IFAQCategory[] = [
    { id: 'general', name: 'Chung' },
    { id: 'account', name: 'Tài khoản' },
    { id: 'payment', name: 'Thanh toán' },
    { id: 'course', name: 'Khóa học' },
    { id: 'product', name: 'Sản phẩm' },
    { id: 'other', name: 'Khác' }
];