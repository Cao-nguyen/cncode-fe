// types/transaction.type.ts
export interface ITransactionUser {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    phone?: string;
}

export interface ITransactionProduct {
    _id: string;
    name: string;
    thumbnail: string;
    price: number;
    description?: string;
}

export interface ITransaction {
    _id: string;
    user: ITransactionUser;
    product: ITransactionProduct;
    paymentMethod: 'xu' | 'banking';
    amount: number;
    xuAmount: number;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    transactionId: string;
    payosOrderId?: string;
    checkoutUrl?: string;
    qrCode?: string;
    adminNote?: string;
    createdAt: string;
    updatedAt: string;  // ✅ Thêm dòng này
}

export interface ITransactionStats {
    totalRevenue: number;
    totalXuSpent: number;
    totalOrders: number;
    pendingOrders: number;
    todayRevenue: number;
}

export interface ITransactionResponse {
    success: boolean;
    data: ITransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats: ITransactionStats;
    message?: string;
}