'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Eye, Plus } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { getProducts, ShopProduct } from '@/lib/utils/shopHistory';
import { initializeShopData } from '@/lib/data/shop.data';
import { useAuthStore } from '@/store/auth.store';

const CATEGORIES = ['Tài liệu', 'Bài thuyết trình', 'Code', 'Thiết kế', 'Khác'];
const CATEGORY_OPTIONS = [
    { value: '', label: 'Tất cả danh mục' },
    ...CATEGORIES.map(cat => ({ value: cat, label: cat }))
];

export default function ShopPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const allProducts = useMemo(() => {
        initializeShopData();
        return getProducts();
    }, []);

    const products = useMemo(() => {
        return allProducts.filter(p => p.status === 'approved');
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = !search ||
                product.title.toLowerCase().includes(search.toLowerCase()) ||
                product.description.toLowerCase().includes(search.toLowerCase()) ||
                product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory = !categoryFilter || product.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, categoryFilter]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cửa hàng số</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Mua và bán tài liệu, code, thiết kế số
                    </p>
                </div>
                {user && (
                    <CustomButton
                        onClick={() => router.push('/cuahangso/dang-san-pham')}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Đăng bán sản phẩm
                    </CustomButton>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <CustomInputSearch
                            placeholder="Tìm kiếm sản phẩm..."
                            value={search}
                            onChange={setSearch}
                        />
                    </div>
                    <div className="sm:w-64">
                        <CustomSelect
                            options={CATEGORY_OPTIONS}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            placeholder="Chọn danh mục"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tìm thấy <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> sản phẩm
                </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Không tìm thấy sản phẩm
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <Link
                            key={product._id}
                            href={`/cuahangso/${product._id}`}
                            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Product Image */}
                            <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <ShoppingCart className="w-16 h-16 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-800">
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                    {product.description}
                                </p>

                                {/* Price */}
                                <div className="mb-3">
                                    {product.price === 0 ? (
                                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            Miễn phí
                                        </span>
                                    ) : (
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        <span>{product.views}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>{product.purchases} đã mua</span>
                                    </div>
                                </div>

                                {/* Seller */}
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Người bán: <span className="font-medium text-gray-700 dark:text-gray-300">{product.sellerName}</span>
                                    </p>
                                </div>

                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {product.tags.slice(0, 3).map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}