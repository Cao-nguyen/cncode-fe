'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    X,
    Loader2,
    Package,
    Eye,
    ShoppingCart,
    Download,
    FileText,
    ExternalLink,
    Calendar,
} from 'lucide-react';
import { shopApi, Product } from '@/lib/api/shop.api';
import { CustomButton } from '@/components/custom/CustomButton';
import StaticContent from '@/components/common/StaticContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl, getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import { formatShopPrice, formatShopOriginalPrice } from '@/lib/cuahangso/cuahangso-display.utils';
import { toShopFileLike } from '@/lib/cuahangso/shop-file.utils';
import { ShopFileActions } from '@/components/cuahangso/ShopFilePreviewModal';
import { cn } from '@/lib/utils';

const STATUS_BADGE: Record<Product['status'], string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_LABEL: Record<Product['status'], string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
};

function formatFileSize(bytes: number) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface AdminShopProductDetailModalProps {
    productId: string | null;
    onClose: () => void;
    onApprove?: (product: Product) => void;
    onReject?: (product: Product) => void;
    actionLoading?: boolean;
}

export function AdminShopProductDetailModal({
    productId,
    onClose,
    onApprove,
    onReject,
    actionLoading,
}: AdminShopProductDetailModalProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (!productId) {
            setProduct(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setSelectedImage(0);

        shopApi
            .getProduct(productId)
            .then((res) => {
                if (cancelled) return;
                if (res.success && res.data) {
                    setProduct(res.data);
                } else {
                    setProduct(null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [productId]);

    if (!productId) return null;

    const gallery = [
        ...(product?.coverImage ? [product.coverImage] : []),
        ...(product?.images || []).filter((img) => img && img !== product?.coverImage),
    ];
    const sellerName = product?.seller?.fullName || '—';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#141414]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div className="min-w-0 pr-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Chi tiết sản phẩm</p>
                        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {loading ? 'Đang tải...' : product?.title || 'Không tìm thấy sản phẩm'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
                        </div>
                    ) : !product ? (
                        <p className="py-16 text-center text-sm text-gray-400">Không thể tải thông tin sản phẩm</p>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    {product.category}
                                </span>
                                <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', STATUS_BADGE[product.status])}>
                                    {STATUS_LABEL[product.status]}
                                </span>
                                {product.allowCoinPayment === false && (
                                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                                        Không thanh toán xu
                                    </span>
                                )}
                            </div>

                            {gallery.length > 0 && (
                                <div className="space-y-3">
                                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                                        <img
                                            src={getImageUrl(gallery[selectedImage])}
                                            alt={product.title}
                                            className="mx-auto max-h-64 w-full object-contain"
                                        />
                                    </div>
                                    {gallery.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {gallery.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setSelectedImage(idx)}
                                                    className={cn(
                                                        'h-16 w-16 shrink-0 overflow-hidden rounded-lg border',
                                                        selectedImage === idx
                                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                                            : 'border-gray-200 opacity-70 hover:opacity-100',
                                                    )}
                                                >
                                                    <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                    <p className="mb-1 text-xs text-gray-400">Giá bán</p>
                                    {product.price === 0 ? (
                                        <p className="text-lg font-semibold text-emerald-600">Miễn phí</p>
                                    ) : (
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {formatShopPrice(product)}
                                            </p>
                                            {product.discountPrice != null && product.discountPrice < product.price && (
                                                <p className="mt-1 text-sm text-gray-400 line-through">
                                                    {formatShopOriginalPrice(product.price)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                    <p className="mb-1 text-xs text-gray-400">Thống kê</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="inline-flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {product.views} lượt xem
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <ShoppingCart className="h-4 w-4" />
                                            {product.purchases} đã mua
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Download className="h-4 w-4" />
                                            {product.downloads ?? 0} lượt tải
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                                    {product.seller?.avatar ? (
                                        <AvatarImage {...avatarImageProps} src={getAvatarUrl(product.seller.avatar)} />
                                    ) : null}
                                    <AvatarFallback>{sellerName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400">Người bán</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{sellerName}</p>
                                    {product.seller?.email && (
                                        <p className="truncate text-xs text-gray-500">{product.seller.email}</p>
                                    )}
                                </div>
                                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>

                            {product.rejectionReason && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/20">
                                    <p className="mb-1 text-xs font-medium text-red-600">Lý do từ chối</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{product.rejectionReason}</p>
                                </div>
                            )}

                            {product.preview?.url && (
                                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        <Eye className="h-4 w-4" />
                                        Xem trước
                                    </h4>
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                                            <span className="truncate text-sm">{product.preview.name}</span>
                                        </div>
                                        <ShopFileActions file={toShopFileLike(product.preview)} />
                                    </div>
                                </div>
                            )}

                            {product.files && product.files.length > 0 && (
                                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        <Download className="h-4 w-4" />
                                        Tài liệu đính kèm ({product.files.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {product.files.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                                    </div>
                                                </div>
                                                {file.url ? (
                                                    <ShopFileActions file={file} />
                                                ) : (
                                                    <span className="text-xs text-gray-400">Không có link</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Mô tả chi tiết</h4>
                                {product.description?.trim() ? (
                                    <StaticContent content={product.description} compact />
                                ) : (
                                    <p className="text-sm italic text-gray-400">Chưa có mô tả</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {product && (
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                        {product.slug && product.status === 'approved' && (
                            <Link
                                href={`/cuahangso/${product.slug}`}
                                target="_blank"
                                className="mr-auto inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                                Xem trang công khai
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        )}
                        <CustomButton variant="secondary" onClick={onClose}>
                            Đóng
                        </CustomButton>
                        {(product.status === 'pending' || product.status === 'approved') && onReject && (
                            <CustomButton variant="outline" onClick={() => onReject(product)} disabled={actionLoading}>
                                {product.status === 'approved' ? 'Từ chối lại' : 'Từ chối'}
                            </CustomButton>
                        )}
                        {(product.status === 'pending' || product.status === 'rejected') && onApprove && (
                            <CustomButton onClick={() => onApprove(product)} loading={actionLoading}>
                                {product.status === 'rejected' ? 'Duyệt lại sản phẩm' : 'Duyệt sản phẩm'}
                            </CustomButton>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
