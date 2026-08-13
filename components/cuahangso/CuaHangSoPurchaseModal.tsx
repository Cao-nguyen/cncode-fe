'use client';

import React, { useMemo, useState } from 'react';
import { X, Loader2, Coins, CreditCard, ShoppingBag } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { shopApi, Product } from '@/lib/api/shop.api';
import { useAuthStore } from '@/store/auth.store';
import { formatShopOriginalPrice, formatShopPrice, hasShopDiscount } from '@/lib/cuahangso/cuahangso-display.utils';
import { formatXu, getPayableAmount } from '@/lib/utils/currency.utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CuaHangSoPurchaseModalProps {
    product: Product | null;
    open: boolean;
    onClose: () => void;
    onSuccess?: (product: Product) => void;
}

export function CuaHangSoPurchaseModal({
    product,
    open,
    onClose,
    onSuccess,
}: CuaHangSoPurchaseModalProps) {
    const { user, coins, checkAndSync } = useAuthStore();
    const [payingMethod, setPayingMethod] = useState<'payos' | 'coin' | null>(null);

    const payableAmount = useMemo(() => getPayableAmount(product), [product]);
    const hasDiscount = product ? hasShopDiscount(product) : false;
    const allowCoin = product?.allowCoinPayment !== false;

    if (!open || !product) return null;

    const handlePayos = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để mua sản phẩm');
            return;
        }
        setPayingMethod('payos');
        try {
            const res = await shopApi.purchaseProductWithPayos(product._id);
            if (res.success && res.data?.alreadyOwned && res.data.product) {
                toast.success('Bạn đã sở hữu sản phẩm này');
                onSuccess?.(res.data.product);
                onClose();
                return;
            }
            const checkoutUrl = res.data?.checkoutUrl;
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
                return;
            }
            toast.error(res.message || 'Không nhận được liên kết thanh toán');
        } catch {
            toast.error('Không tạo được thanh toán');
        } finally {
            setPayingMethod(null);
        }
    };

    const handleCoin = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để mua sản phẩm');
            return;
        }
        const balance = coins ?? user.coins ?? 0;
        if (payableAmount > balance) {
            toast.error(`Không đủ xu. Cần ${payableAmount.toLocaleString('vi-VN')} xu`);
            return;
        }
        setPayingMethod('coin');
        try {
            const res = await shopApi.purchaseProduct(product._id);
            if (res.success && res.data?.product) {
                toast.success(res.message || 'Mua sản phẩm thành công');
                if (res.data.coins !== undefined) {
                    useAuthStore.setState({ coins: res.data.coins });
                    checkAndSync?.();
                }
                onSuccess?.(res.data.product);
                onClose();
            } else {
                toast.error(res.message || 'Không thể mua sản phẩm');
            }
        } catch {
            toast.error('Không thể mua sản phẩm');
        } finally {
            setPayingMethod(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--cn-bg-card)] shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-[var(--cn-border)] px-5 py-4">
                    <div className="min-w-0 pr-3">
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Cửa hàng số
                        </div>
                        <h2 className="text-lg font-bold text-[var(--cn-text-main)]">{product.title}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--cn-hover)]">
                        <X className="h-5 w-5 text-[var(--cn-text-muted)]" />
                    </button>
                </div>

                <div className="space-y-4 px-5 py-4">
                    <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-section)]/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--cn-text-muted)]">Giá sản phẩm</p>
                        <div className="mt-2 flex items-end gap-2">
                            <span className="text-2xl font-bold text-[var(--cn-primary)]">
                                {payableAmount === 0 ? 'Miễn phí' : formatShopPrice(product)}
                            </span>
                            {hasDiscount && (
                                <span className="pb-0.5 text-sm text-[var(--cn-text-muted)] line-through">
                                    {formatShopOriginalPrice(product.price)}
                                </span>
                            )}
                        </div>
                        {payableAmount > 0 && (
                            <p className="mt-1 text-xs text-[var(--cn-text-sub)]">{formatXu(payableAmount)} · 1 xu = 1 VNĐ</p>
                        )}
                        {user && payableAmount > 0 && allowCoin && (
                            <p className="mt-2 text-xs text-[var(--cn-text-sub)]">
                                Số dư xu:{' '}
                                <span className="font-semibold text-[var(--cn-text-main)]">
                                    {(coins ?? user.coins ?? 0).toLocaleString('vi-VN')}
                                </span>
                            </p>
                        )}
                    </div>

                    {!user ? (
                        <CustomButton className="w-full" onClick={() => { window.location.href = '/login'; }}>
                            Đăng nhập để mua
                        </CustomButton>
                    ) : payableAmount === 0 ? (
                        <CustomButton className="w-full" onClick={handleCoin} loading={payingMethod === 'coin'}>
                            Nhận miễn phí
                        </CustomButton>
                    ) : (
                        <div className="space-y-2">
                            <CustomButton
                                className="w-full"
                                onClick={handlePayos}
                                loading={payingMethod === 'payos'}
                                disabled={!!payingMethod}
                            >
                                <CreditCard className="h-4 w-4" />
                                Thanh toán bằng ngân hàng
                            </CustomButton>
                            {allowCoin && (
                                <CustomButton
                                    variant="secondary"
                                    className={cn(
                                        'w-full border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
                                    )}
                                    onClick={handleCoin}
                                    loading={payingMethod === 'coin'}
                                    disabled={!!payingMethod}
                                >
                                    <Coins className="h-4 w-4" />
                                    Thanh toán bằng xu
                                </CustomButton>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
