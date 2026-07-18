
'use client';

import React from 'react';
import { ImageIcon } from 'lucide-react';
import { useLinkedProducts } from '@/hooks/linkedProduct/useLinkedProducts';
import { ProductCard } from '@/components/linkedProduct/ProductCard';

export default function SanPhamLienKetPage() {
    const { products, loading } = useLinkedProducts();

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--cn-bg-main)] pt-16 pb-8 md:py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--cn-text-main)] mb-2">
                        Sản Phẩm Hệ Sinh Thái
                    </h1>
                    <p className="text-sm text-[var(--cn-text-sub)]">
                        Các sản phẩm và dịch vụ từ CNCode
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <ImageIcon className="w-16 h-16 mx-auto text-[var(--cn-text-muted)] mb-4" />
                        <p className="text-[var(--cn-text-sub)]">Chưa có sản phẩm nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
