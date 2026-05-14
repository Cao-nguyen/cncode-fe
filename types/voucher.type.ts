// types/voucher.type.ts

export type DiscountType = 'percentage' | 'fixed' | 'freeship';
export type VoucherStatus = 'active' | 'inactive' | 'expired';
export type UserVoucherStatus = 'available' | 'used' | 'expired';

export interface IVoucher {
    _id: string;
    title: string;
    description: string;
    code: string;
    discountValue: number;
    discountType: DiscountType;
    category: string;
    minOrder: number;
    maxDiscount?: number;
    expiryDate: string;
    usageLimit: number;
    usedCount: number;
    assignedUsers: string[];
    isGlobal: boolean;
    status: VoucherStatus;
    createdBy: {
        _id: string;
        fullName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IUserVoucher {
    _id: string;
    voucherId: IVoucher;
    userId: string;
    code: string;
    status: UserVoucherStatus;
    usedAt?: string;
    assignedAt: string;
    expiresAt: string;
}

export interface ICreateVoucherDto {
    title: string;
    description: string;
    code: string;
    discountValue: number;
    discountType: DiscountType;
    category: string;
    minOrder: number;
    maxDiscount?: number;
    expiryDate: string;
    usageLimit: number;
    assignedUsers?: string[];
    isGlobal?: boolean;
}

export interface IUpdateVoucherDto extends Partial<ICreateVoucherDto> {
    status?: VoucherStatus;
}

export interface IAssignVoucherDto {
    voucherId: string;
    userIds: string[];
}

export interface IApplyVoucherDto {
    code: string;
    orderTotal: number;
}