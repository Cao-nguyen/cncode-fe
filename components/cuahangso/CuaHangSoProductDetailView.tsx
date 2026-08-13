'use client';

import React, { useMemo } from 'react';
import {
    ShoppingCart,
    Eye,
    Download,
    FileText,
    Loader2,
    ShieldCheck,
    Zap,
    Lock,
    CheckCircle2,
    Clock,
    ChevronRight,
    Tag,
    Star,
} from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomButton } from '@/components/custom/CustomButton';
import type { Product, ShopReviewStats } from '@/lib/api/shop.api';
import { getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import { toShopFileLike } from '@/lib/cuahangso/shop-file.utils';
import {
    formatShopPrice,
    formatShopOriginalPrice,
    getShopDiscountPercent,
    hasShopDiscount,
} from '@/lib/cuahangso/cuahangso-display.utils';
import { getPayableAmount } from '@/lib/utils/currency.utils';
import { ShopFileActions } from '@/components/cuahangso/ShopFilePreviewModal';
import { ShopProductReviews } from '@/components/cuahangso/ShopProductReviews';
import { ShopProductGallery } from '@/components/cuahangso/ShopProductGallery';

const CATEGORY_ACCENT: Record<string, string> = {
    'Tài liệu': '#2563EB',
    PowerPoint: '#EA580C',
    Code: '#7C3AED',
    Khác: '#64748B',
};

function formatFileSize(bytes: number) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface CuaHangSoProductDetailViewProps {
    product: Product;
    owned: boolean;
    isSeller: boolean;
    buying: boolean;
    reviewStats: ShopReviewStats;
    selectedImage: number;
    onSelectImage: (idx: number) => void;
    onBuy: () => void;
    onOpenPurchase: () => void;
    onReviewStatsChange: (stats: ShopReviewStats) => void;
    onDownloadsChange?: (downloads: number) => void;
}

export function CuaHangSoProductDetailView({
    product,
    owned,
    isSeller,
    buying,
    reviewStats,
    selectedImage,
    onSelectImage,
    onBuy,
    onOpenPurchase,
    onReviewStatsChange,
    onDownloadsChange,
}: CuaHangSoProductDetailViewProps) {
    const accent = CATEGORY_ACCENT[product.category] || CATEGORY_ACCENT['Khác'];
    const canDownload = owned || isSeller;
    const payableAmount = getPayableAmount(product);
    const hasDiscount = hasShopDiscount(product);
    const discountPercent = getShopDiscountPercent(product);
    const sellerName = product.seller?.fullName || 'Ẩn danh';
    const fileCount = product.files?.length || 0;

    const gallery = useMemo(
        () => [
            ...(product.coverImage ? [product.coverImage] : []),
            ...(product.images || []).filter((img) => img && img !== product.coverImage),
        ],
        [product],
    );

    const scrollToReviews = () => {
        document.getElementById('danh-gia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="pb-24 lg:pb-10">
            <div className="mx-auto max-w-7xl px-[60px]">
                {/* ── Product shell ── */}
                <div
                    className="overflow-hidden rounded-3xl"
                    style={{
                        backgroundColor: 'var(--cn-bg-card)',
                        border: '1px solid var(--cn-border)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.04)',
                    }}
                >
                    <div className="grid lg:grid-cols-[1fr_380px]">
                        {/* Gallery column */}
                        <div className="p-5 sm:p-7 lg:border-r" style={{ borderColor: 'var(--cn-border)' }}>
                            <ShopProductGallery
                                images={gallery}
                                alt={product.title}
                                selectedIndex={selectedImage}
                                onSelectIndex={onSelectImage}
                            />
                        </div>

                        {/* Info column */}
                        <div className="flex flex-col self-start p-5 sm:p-7">
                            <div className="mb-1 flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5" style={{ color: accent }} />
                                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                                    {product.category}
                                </span>
                            </div>

                            <h1
                                className="text-xl font-bold leading-snug tracking-tight sm:text-2xl"
                                style={{ color: 'var(--cn-text-main)' }}
                            >
                                {product.title}
                            </h1>

                            {/* Stats pills */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {[
                                    { icon: Eye, text: `${product.views} xem` },
                                    { icon: ShoppingCart, text: `${product.purchases} mua` },
                                    { icon: Download, text: `${product.downloads ?? 0} tải` },
                                    { icon: FileText, text: `${fileCount} file` },
                                ].map(({ icon: Icon, text }) => (
                                    <span
                                        key={text}
                                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                        style={{ backgroundColor: 'var(--cn-bg-section)', color: 'var(--cn-text-sub)' }}
                                    >
                                        <Icon className="h-3 w-3" />
                                        {text}
                                    </span>
                                ))}
                                <button
                                    type="button"
                                    onClick={scrollToReviews}
                                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80"
                                    style={{ backgroundColor: 'var(--cn-bg-section)', color: 'var(--cn-text-sub)' }}
                                >
                                    <Star
                                        className={`h-3 w-3 ${reviewStats.total > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                        data-filled={reviewStats.total > 0}
                                    />
                                    {reviewStats.total > 0
                                        ? `${reviewStats.average.toFixed(1)} sao`
                                        : '0 sao'}
                                </button>
                            </div>

                            <div className="my-4 h-px" style={{ backgroundColor: 'var(--cn-border)' }} />

                            {/* Price + buy */}
                            <div className="space-y-4">
                                {payableAmount === 0 ? (
                                    <p className="text-3xl font-bold text-emerald-600">Miễn phí</p>
                                ) : (
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold tracking-tight" style={{ color: 'var(--cn-text-main)' }}>
                                                {formatShopPrice(product)}
                                            </span>
                                            {hasDiscount && (
                                                <span className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                                    -{discountPercent}%
                                                </span>
                                            )}
                                        </div>
                                        {hasDiscount && (
                                            <p className="mt-0.5 text-sm line-through" style={{ color: 'var(--cn-text-muted)' }}>
                                                {formatShopOriginalPrice(product.price)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {canDownload ? (
                                    <div
                                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400"
                                        style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
                                    >
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        {isSeller ? 'Sản phẩm của bạn' : 'Đã sở hữu — cuộn xuống tải file'}
                                    </div>
                                ) : (
                                    <CustomButton
                                        onClick={payableAmount === 0 ? onBuy : onOpenPurchase}
                                        disabled={buying}
                                        fullWidth
                                        className="h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
                                    >
                                        {buying ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                {payableAmount === 0 ? 'Nhận miễn phí' : `Mua ngay · ${formatShopPrice(product)}`}
                                            </>
                                        )}
                                    </CustomButton>
                                )}

                                <div className="grid grid-cols-2 gap-2 text-[11px]" style={{ color: 'var(--cn-text-muted)' }}>
                                    <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-2" style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                                        <Zap className="h-3.5 w-3.5" style={{ color: accent }} /> Tải ngay
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-2" style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                                        <ShieldCheck className="h-3.5 w-3.5" style={{ color: accent }} /> An toàn
                                    </span>
                                </div>

                                {/* Seller */}
                                <div
                                    className="flex items-center gap-3 rounded-xl p-3"
                                    style={{ backgroundColor: 'var(--cn-bg-section)' }}
                                >
                                    <Avatar className="h-9 w-9">
                                        {product.seller?.avatar ? (
                                            <AvatarImage {...avatarImageProps} src={getAvatarUrl(product.seller.avatar)} alt={sellerName} />
                                        ) : null}
                                        <AvatarFallback className="text-xs">{sellerName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold" style={{ color: 'var(--cn-text-main)' }}>{sellerName}</p>
                                        <p className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--cn-text-muted)' }}>
                                            <Clock className="h-3 w-3" />
                                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="mt-10 space-y-10">
                    {product.preview?.url && (
                        <div
                            className="flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
                            style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                        >
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>Xem trước miễn phí</p>
                                <p className="font-medium" style={{ color: 'var(--cn-text-main)' }}>{product.preview.name}</p>
                            </div>
                            <ShopFileActions file={toShopFileLike(product.preview)} />
                        </div>
                    )}

                    <section id="mo-ta" className="scroll-mt-28">
                        <h2 className="mb-4 text-base font-bold uppercase tracking-wider" style={{ color: 'var(--cn-text-muted)' }}>
                            Mô tả
                        </h2>
                        <div
                            className="rounded-2xl p-6 sm:p-8 leading-relaxed"
                            style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)', color: 'var(--cn-text-sub)' }}
                        >
                            <StaticContent content={product.description} />
                        </div>
                    </section>

                    {fileCount > 0 && (
                        <section id="tai-lieu" className="scroll-mt-28">
                            <h2 className="mb-4 text-base font-bold uppercase tracking-wider" style={{ color: 'var(--cn-text-muted)' }}>
                                Tài liệu đính kèm
                            </h2>
                            <div className="space-y-2">
                                {product.files!.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                                        style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <FileText className="h-4 w-4 shrink-0" style={{ color: canDownload && file.url ? accent : 'var(--cn-text-muted)' }} />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>{file.name}</p>
                                                <p className="text-xs" style={{ color: 'var(--cn-text-muted)' }}>{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        {canDownload && file.url ? (
                                            <ShopFileActions
                                                file={file}
                                                productId={product._id}
                                                fileIndex={idx}
                                                onDownloadRecorded={onDownloadsChange}
                                            />
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--cn-text-muted)' }}>
                                                <Lock className="h-3 w-3" /> Mua để tải
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {!canDownload && (
                                <button type="button" onClick={onBuy} className="mt-3 flex items-center gap-1 text-sm font-semibold" style={{ color: accent }}>
                                    Mua để mở khóa <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </section>
                    )}

                    <ShopProductReviews
                        productId={product._id}
                        accent={accent}
                        accentBg={`${accent}14`}
                        onStatsChange={onReviewStatsChange}
                    />
                </div>
            </div>

            {/* Mobile buy bar */}
            {!canDownload && (
                <div
                    className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t px-[60px] py-3 backdrop-blur-xl lg:hidden"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--cn-bg-card) 95%, transparent)', borderColor: 'var(--cn-border)' }}
                >
                    <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold" style={{ color: 'var(--cn-text-main)' }}>
                            {payableAmount === 0 ? 'Miễn phí' : formatShopPrice(product)}
                        </p>
                    </div>
                    <CustomButton
                        onClick={payableAmount === 0 ? onBuy : onOpenPurchase}
                        disabled={buying}
                        className="shrink-0 px-8"
                    >
                        {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mua ngay'}
                    </CustomButton>
                </div>
            )}
        </div>
    );
}
