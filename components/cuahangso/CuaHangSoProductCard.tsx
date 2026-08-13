'use client';

import Link from 'next/link';
import { Clock, Download, Eye, Pencil, ShoppingBag, Trash2 } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Product } from '@/lib/api/shop.api';
import { getImageUrl, getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import {
    formatShopOriginalPrice,
    formatShopPrice,
    getShopDiscountPercent,
    hasShopDescription,
    hasShopDiscount,
} from '@/lib/cuahangso/cuahangso-display.utils';

const CATEGORY_LABELS: Record<string, string> = {
    'Tài liệu': 'Tài liệu',
    PowerPoint: 'PowerPoint',
    Code: 'Code',
    Khác: 'Khác',
};

interface CuaHangSoProductCardProps {
    product: Product;
    currentUserId?: string | null;
    onDelete?: (product: Product) => void;
}

export default function CuaHangSoProductCard({ product, currentUserId, onDelete }: CuaHangSoProductCardProps) {
    const href = `/cuahangso/${product.slug || product._id}`;
    const showDescription = hasShopDescription(product.description);
    const hasDiscount = hasShopDiscount(product);
    const discountPercent = getShopDiscountPercent(product);
    const sellerName = product.seller?.fullName || 'Ẩn danh';
    const isOwner =
        !!currentUserId && String(product.seller?._id) === String(currentUserId);
    const isOwnerPending = isOwner && product.status === 'pending';
    const isOwnerRejected = isOwner && product.status === 'rejected';
    const isOwnerApproved = isOwner && product.status === 'approved';

    return (
        <div
            className="group flex flex-col overflow-hidden rounded-xl transition"
            style={{
                backgroundColor: 'var(--cn-bg-card)',
                border: '1px solid var(--cn-border)',
                boxShadow: 'var(--cn-shadow-sm)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--cn-shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--cn-shadow-sm)'; }}
        >
            <Link href={href} className="flex flex-1 cursor-pointer flex-col">
                <div
                    className="relative h-[200px] w-full overflow-hidden"
                    style={{ backgroundColor: 'var(--cn-bg-section)' }}
                >
                    {product.coverImage || product.images?.[0] ? (
                        <img
                            src={getImageUrl(product.coverImage || product.images[0])}
                            alt={product.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-12 w-12" style={{ color: 'var(--cn-text-muted)' }} />
                        </div>
                    )}
                    <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
                        {isOwnerPending && (
                            <span className="whitespace-nowrap rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
                                Chờ duyệt
                            </span>
                        )}
                        {isOwnerRejected && (
                            <span className="whitespace-nowrap rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                                Từ chối
                            </span>
                        )}
                        {isOwnerApproved && (
                            <span className="whitespace-nowrap rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
                                Đã duyệt
                            </span>
                        )}
                        <span
                            className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.9)', color: 'white' }}
                        >
                            {CATEGORY_LABELS[product.category] || product.category}
                        </span>
                    </div>
                    <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
                        {product.price === 0 && (
                            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
                                Miễn phí
                            </span>
                        )}
                        {hasDiscount && discountPercent > 0 && (
                            <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                                -{discountPercent}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {product.views}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Download className="h-3.5 w-3.5" />
                                {product.downloads ?? 0}
                            </span>
                        </div>
                    </div>

                    <div className="mb-3 flex flex-col gap-2">
                        <h3
                            className="line-clamp-2 text-lg font-semibold leading-snug transition group-hover:text-[var(--cn-primary)]"
                            style={{ color: 'var(--cn-text-main)' }}
                        >
                            {product.title}
                        </h3>

                        {showDescription && (
                            <div
                                className="shop-card-description overflow-hidden text-sm leading-relaxed"
                                style={{ color: 'var(--cn-text-sub)' }}
                            >
                                <StaticContent content={product.description} compact />
                            </div>
                        )}
                    </div>

                    <style jsx global>{`
                        .shop-card-description .static-editor {
                            display: -webkit-box;
                            -webkit-box-orient: vertical;
                            -webkit-line-clamp: 3;
                            overflow: hidden;
                            color: inherit;
                        }

                        .shop-card-description .static-editor p,
                        .shop-card-description .static-editor li {
                            margin: 0 !important;
                        }

                        .shop-card-description .static-editor p + p,
                        .shop-card-description .static-editor p + ul,
                        .shop-card-description .static-editor ul + p {
                            margin-top: 0.35em !important;
                        }
                    `}</style>

                    <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--cn-border)' }}>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2 text-sm" style={{ color: 'var(--cn-text-main)' }}>
                                <Avatar className="h-8 w-8 shrink-0 border border-[var(--cn-border)]">
                                    {product.seller?.avatar ? (
                                        <AvatarImage
                                            {...avatarImageProps}
                                            src={getAvatarUrl(product.seller.avatar)}
                                            alt={sellerName}
                                        />
                                    ) : null}
                                    <AvatarFallback className="text-xs font-medium">
                                        {sellerName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate font-medium">{sellerName}</span>
                            </div>
                            <div className="shrink-0 text-right">
                                {product.price === 0 ? (
                                    <span className="text-base font-bold text-emerald-500">Miễn phí</span>
                                ) : (
                                    <div className="flex flex-col items-end gap-0.5">
                                        {hasDiscount && (
                                            <span
                                                className="text-xs line-through"
                                                style={{ color: 'var(--cn-text-muted)' }}
                                            >
                                                {formatShopOriginalPrice(product.price)}
                                            </span>
                                        )}
                                        <span className="text-base font-bold" style={{ color: 'var(--cn-primary)' }}>
                                            {formatShopPrice(product)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {isOwnerRejected && product.rejectionReason && (
                <div className="border-t border-red-200 bg-red-50 px-5 py-3 dark:border-red-900/40 dark:bg-red-900/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
                        Lý do từ chối
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-red-700 dark:text-red-200">
                        {product.rejectionReason}
                    </p>
                </div>
            )}

            {isOwnerApproved && (
                <div
                    className="flex items-center justify-end gap-1 border-t px-3 py-2"
                    style={{ borderColor: 'var(--cn-border)' }}
                >
                    <Link
                        href={`/cuahangso/create?edit=${product._id}`}
                        title="Sửa"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80"
                        style={{ color: 'var(--cn-primary)' }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        title="Xóa"
                        onClick={() => onDelete?.(product)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}

            {(isOwnerPending || isOwnerRejected) && (
                <div
                    className="flex items-center gap-2 border-t px-5 py-3"
                    style={{ borderColor: 'var(--cn-border)', backgroundColor: 'var(--cn-bg-section)' }}
                >
                    <Link
                        href={`/cuahangso/create?edit=${product._id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-90"
                        style={{ backgroundColor: 'var(--cn-bg-card)', color: 'var(--cn-primary)', border: '1px solid var(--cn-border)' }}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete?.(product)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                        style={{ border: '1px solid var(--cn-border)' }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                    </button>
                </div>
            )}
        </div>
    );
}
