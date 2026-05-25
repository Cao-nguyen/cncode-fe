// types/linkedProduct.type.ts
export interface LinkedProduct {
    _id: string;
    userId: string;
    name: string;
    thumbnailUrl?: string;
    productUrl: string;
    status: 'active' | 'inactive' | 'deleted';
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLinkedProductDto {
    name: string;
    thumbnailUrl?: string;
    productUrl: string;
}

export interface UpdateLinkedProductDto extends Partial<CreateLinkedProductDto> {
    status?: LinkedProduct['status'];
    sortOrder?: number;
}

export interface ProductsResponse {
    success: boolean;
    products: LinkedProduct[];
    total: number;
    page: number;
    totalPages: number;
}