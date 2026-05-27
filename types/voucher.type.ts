export interface Voucher {
    _id: string;
    code: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue: number;
    maxUsage: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    applicableTo: 'all' | 'course' | 'product' | 'service';
    assignType: 'all' | 'selected';
    assignedUsers: Array<{ _id: string; fullName: string; email: string }>;
    isActive: boolean;
    statusText?: string;
    createdAt: string;
}

export interface UserVoucher {
    id: string;
    code: string;
    isUsed: boolean;
    receivedAt: string;
    usedAt?: string;
    voucher: {
        _id: string;
        name: string;
        description: string;
        discountType: string;
        discountValue: number;
        maxDiscount?: number;
        minOrderValue: number;
        endDate: string;
    };
    isExpired: boolean;
    isAvailable: boolean;
}

export interface CreateVoucherDto {
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    maxUsage?: number;
    startDate: string;
    endDate: string;
    applicableTo?: string;
    assignType: 'all' | 'selected';
    assignedUsers?: string[];
}
