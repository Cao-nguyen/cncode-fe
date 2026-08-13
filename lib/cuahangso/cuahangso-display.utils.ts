import type { ShopCategory } from '@/lib/api/shop.api';
import { formatVnd, getPayableAmount } from '@/lib/utils/currency.utils';

export type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc';

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'popular', label: 'Bán chạy' },
    { value: 'price-asc', label: 'Giá: Thấp đến cao' },
    { value: 'price-desc', label: 'Giá: Cao đến thấp' },
];

export function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function hasShopDescription(content?: string | null): boolean {
    if (!content?.trim()) return false;
    return stripHtml(content).length > 0;
}

export function formatShopPrice(product: { price?: number; discountPrice?: number | null }): string {
    return formatVnd(getPayableAmount(product));
}

export function formatShopOriginalPrice(price = 0): string {
    return formatVnd(price);
}

export function hasShopDiscount(product: {
    price?: number;
    discountPrice?: number | null;
}): boolean {
    const price = product.price ?? 0;
    return price > 0 && product.discountPrice != null && product.discountPrice < price;
}

export function getShopDiscountPercent(product: {
    price?: number;
    discountPrice?: number | null;
    discountType?: 'percent' | 'vnd';
    discountValue?: number;
}): number {
    if (!hasShopDiscount(product)) return 0;

    if (product.discountType === 'percent' && (product.discountValue ?? 0) > 0) {
        return Math.round(product.discountValue ?? 0);
    }

    const price = product.price ?? 0;
    const discountPrice = product.discountPrice ?? price;
    if (price <= 0) return 0;
    return Math.max(1, Math.round((1 - discountPrice / price) * 100));
}

export function getSortParams(sort: SortOption): { sortBy: string; sortOrder: 'asc' | 'desc' } {
    switch (sort) {
        case 'popular':
            return { sortBy: 'purchases', sortOrder: 'desc' };
        case 'price-asc':
            return { sortBy: 'price', sortOrder: 'asc' };
        case 'price-desc':
            return { sortBy: 'price', sortOrder: 'desc' };
        case 'newest':
        default:
            return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
}

export const CATEGORY_TABS: Array<{ value: 'all' | ShopCategory; label: string }> = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Tài liệu', label: 'Tài liệu' },
    { value: 'PowerPoint', label: 'PowerPoint' },
    { value: 'Code', label: 'Code' },
    { value: 'Khác', label: 'Khác' },
];
