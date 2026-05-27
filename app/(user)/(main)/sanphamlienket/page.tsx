
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ImageIcon } from 'lucide-react';
import { linkedProductApi } from '@/lib/api/linkedProduct.api';
import { LinkedProduct } from '@/types/linkedProduct.type';

export default function SanPhamLienKetPage() {
    const [products, setProducts] = useState<LinkedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await linkedProductApi.getPublicProducts();
            setProducts(res.products);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--cn-bg-main)] py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--cn-text-main)] mb-2">
                        Sản Phẩm Hệ Sinh Thái
                    </h1>
                    <p className="text-sm text-[var(--cn-text-sub)]">
                        Các sản phẩm và dịch vụ từ CNCode
                    </p>
                </div>

                {}
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <ImageIcon className="w-16 h-16 mx-auto text-[var(--cn-text-muted)] mb-4" />
                        <p className="text-[var(--cn-text-sub)]">Chưa có sản phẩm nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] overflow-hidden border border-[var(--cn-border)] hover:shadow-[var(--cn-shadow-md)] transition-all duration-300"
                            >
                                {}
                                <div className="relative aspect-[3/2] bg-[var(--cn-bg-section)]">
                                    {product.thumbnailUrl ? (
                                        <Image
                                            src={product.thumbnailUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-[var(--cn-text-muted)]" />
                                        </div>
                                    )}
                                </div>

                                {}
                                <div className="p-3">
                                    <h3 className="text-sm font-semibold text-[var(--cn-text-main)] text-center line-clamp-2 mb-3 min-h-[40px]">
                                        {product.name}
                                    </h3>

                                    {}
                                    <Link
                                        href={product.productUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] text-xs font-medium hover:bg-[var(--cn-primary-hover)] transition-colors"
                                    >
                                        <span>Truy cập</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
