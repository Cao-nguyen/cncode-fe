'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingBag } from 'lucide-react';
import { shopApi, Product } from '@/lib/api/shop.api';
import CuaHangSoProductCard from '@/components/cuahangso/CuaHangSoProductCard';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import {
    CATEGORY_TABS,
    getSortParams,
    type SortOption,
    SORT_OPTIONS,
} from '@/lib/cuahangso/cuahangso-display.utils';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function CuaHangSoPage() {
    const router = useRouter();
    const { user, _hasHydrated } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<(typeof CATEGORY_TABS)[number]['value']>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const matchesFilters = useCallback((product: Product) => {
        if (category !== 'all' && product.category !== category) return false;
        const q = search.trim().toLowerCase();
        if (q && !product.title.toLowerCase().includes(q)) return false;
        return true;
    }, [category, search]);

    const mergeOwnProducts = useCallback((
        approved: Product[],
        ownProducts: Product[],
    ): Product[] => {
        const map = new Map<string, Product>();
        ownProducts.forEach((item) => {
            if (matchesFilters(item)) map.set(item._id, item);
        });
        approved.forEach((item) => {
            map.set(item._id, item);
        });
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return merged;
    }, [matchesFilters]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const sort = getSortParams(sortBy);
            const requests: [
                Promise<Awaited<ReturnType<typeof shopApi.getProducts>>>,
                Promise<Awaited<ReturnType<typeof shopApi.getMyProducts>> | null>,
            ] = [
                shopApi.getProducts({
                    page,
                    limit: 12,
                    search: search.trim() || undefined,
                    category: category === 'all' ? undefined : category,
                    sortBy: sort.sortBy,
                    sortOrder: sort.sortOrder,
                }),
                user?._id
                    ? shopApi.getMyProducts({ limit: 50, page: 1 })
                    : Promise.resolve(null),
            ];

            const [res, myProductsRes] = await Promise.all(requests);

            if (res.success) {
                let list = res.data || [];
                if (myProductsRes?.success && myProductsRes.data?.length) {
                    const ownDrafts = myProductsRes.data.filter(
                        (item) => item.status === 'pending' || item.status === 'rejected',
                    );
                    list = mergeOwnProducts(list, ownDrafts);
                }
                setProducts(list);
                setTotalPages(res.pagination?.pages || 1);
            } else {
                toast.error('Không thể tải danh sách sản phẩm');
            }
        } catch {
            toast.error('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    }, [page, search, category, sortBy, user?._id, mergeOwnProducts]);

    useEffect(() => {
        if (!_hasHydrated) return;
        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts, _hasHydrated]);

    const handleDeleteProduct = async (product: Product) => {
        if (!window.confirm(`Xóa sản phẩm "${product.title}"?`)) return;

        try {
            const res = await shopApi.deleteProduct(product._id);
            if (res.success) {
                toast.success(res.message || 'Đã xóa sản phẩm');
                fetchProducts();
            } else {
                toast.error('Không thể xóa sản phẩm');
            }
        } catch {
            toast.error('Lỗi khi xóa sản phẩm');
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <div className="min-h-screen pb-8 pt-16 md:pt-14 lg:pt-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-7xl px-4">
                <div className="mb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1
                                className="mb-2 flex items-center gap-2 text-3xl font-bold"
                                style={{ color: 'var(--cn-text-main)' }}
                            >
                                <ShoppingBag className="h-8 w-8" style={{ color: 'var(--cn-primary)' }} />
                                Cửa hàng số
                            </h1>
                            <p style={{ color: 'var(--cn-text-sub)' }}>
                                Mua và bán tài liệu, PowerPoint, code và sản phẩm số khác
                            </p>
                        </div>
                        {user && (
                            <CustomButton onClick={() => router.push('/cuahangso/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Đăng bán sản phẩm
                            </CustomButton>
                        )}
                    </div>
                </div>

                <div className="mb-6 rounded-xl">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex-1">
                            <CustomInputSearch
                                placeholder="Tìm kiếm sản phẩm..."
                                value={search}
                                onChange={handleSearch}
                                size="medium"
                            />
                        </div>
                        <div className="w-full md:w-44">
                            <CustomSelect
                                value={sortBy}
                                onChange={(v) => {
                                    setSortBy(v as SortOption);
                                    setPage(1);
                                }}
                                options={SORT_OPTIONS}
                            />
                        </div>
                        <div
                            className="overflow-x-auto rounded-lg p-1"
                            style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                        >
                            <div className="flex min-w-max items-center gap-1">
                                {CATEGORY_TABS.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => {
                                            setCategory(cat.value);
                                            setPage(1);
                                        }}
                                        className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                                        style={{
                                            backgroundColor: category === cat.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            color: category === cat.value ? 'var(--cn-primary)' : 'var(--cn-text-sub)',
                                        }}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-xl"
                                style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                            >
                                <div className="h-[200px] animate-pulse bg-gray-200 dark:bg-gray-700" />
                                <div className="space-y-3 p-5">
                                    <div className="flex justify-between">
                                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                    <div className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center">
                        <ShoppingBag className="mx-auto mb-4 h-16 w-16" style={{ color: 'var(--cn-border)' }} />
                        <p style={{ color: 'var(--cn-text-sub)' }}>Không tìm thấy sản phẩm nào</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <CuaHangSoProductCard
                                    key={product._id}
                                    product={product}
                                    currentUserId={user?._id}
                                    onDelete={handleDeleteProduct}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <CustomButton
                                    variant="secondary"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Trước
                                </CustomButton>
                                <span
                                    className="flex items-center px-4 py-2 text-sm"
                                    style={{ color: 'var(--cn-text-sub)' }}
                                >
                                    Trang {page} / {totalPages}
                                </span>
                                <CustomButton
                                    variant="secondary"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Sau
                                </CustomButton>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
