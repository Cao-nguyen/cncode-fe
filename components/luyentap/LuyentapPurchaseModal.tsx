'use client';

import React, { useMemo, useState } from 'react';
import { X, Loader2, Coins, CreditCard, BookOpen, Clock, Crown } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DIFFICULTY_LABELS } from '@/lib/luyentap/exercise-config.constants';
import type { PracticeSet } from '@/types/luyentap.type';

export type PurchaseExercise = Pick<
    PracticeSet,
    '_id' | 'title' | 'description' | 'tier' | 'price' | 'discountPrice' | 'discountType' | 'discountValue' | 'allowCoinPayment' | 'timeLimit' | 'questionCount' | 'questions'
> & {
    duration?: number;
    difficulty?: string;
};

interface LuyentapPurchaseModalProps {
    exercise: PurchaseExercise | null;
    open: boolean;
    onClose: () => void;
    onSuccess?: (exerciseId: string) => void;
}

function fmtVnd(value?: number) {
    return `${(value || 0).toLocaleString('vi-VN')}đ`;
}

export default function LuyentapPurchaseModal({
    exercise,
    open,
    onClose,
    onSuccess,
}: LuyentapPurchaseModalProps) {
    const { token, user, coins, updateCoins } = useAuthStore();
    const [payingMethod, setPayingMethod] = useState<'payos' | 'coin' | null>(null);

    const payableAmount = useMemo(() => {
        if (!exercise) return 0;
        return exercise.discountPrice ?? exercise.price ?? 0;
    }, [exercise]);

    const originalPrice = exercise?.price || 0;
    const hasDiscount = payableAmount > 0 && originalPrice > payableAmount;
    const questionCount = exercise?.questionCount || exercise?.questions?.length || 0;
    const duration = exercise?.duration || exercise?.timeLimit || 0;

    if (!open || !exercise) return null;

    const handlePayos = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để mua đề');
            return;
        }
        setPayingMethod('payos');
        try {
            const res = await luyentapApi.purchaseWithPayos(exercise._id);
            const data = res.data || res;
            if (data.alreadyOwned) {
                toast.success('Bạn đã sở hữu đề này');
                onSuccess?.(exercise._id);
                onClose();
                return;
            }
            const checkoutUrl = data.checkoutUrl || data.paymentLink?.checkoutUrl;
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
                return;
            }
            toast.error('Không nhận được liên kết thanh toán');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || 'Không tạo được thanh toán');
        } finally {
            setPayingMethod(null);
        }
    };

    const handleCoin = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để mua đề');
            return;
        }
        if (payableAmount > (coins ?? user?.coins ?? 0)) {
            toast.error(`Không đủ xu. Cần ${payableAmount.toLocaleString('vi-VN')} xu`);
            return;
        }
        setPayingMethod('coin');
        try {
            const res = await luyentapApi.purchaseWithCoin(exercise._id);
            const data = res.data || res;
            if (typeof data.coins === 'number') {
                updateCoins(data.coins - (coins ?? user?.coins ?? 0));
            } else if (payableAmount > 0) {
                updateCoins(-payableAmount);
            }
            toast.success(data.alreadyOwned ? 'Bạn đã sở hữu đề này' : 'Mua đề thành công');
            onSuccess?.(exercise._id);
            onClose();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || 'Không thể mua bằng xu');
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
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            <Crown className="h-3.5 w-3.5" />
                            Đề VIP
                        </div>
                        <h2 className="text-lg font-bold text-[var(--cn-text-main)]">{exercise.title}</h2>
                        {exercise.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-[var(--cn-text-sub)]">{exercise.description}</p>
                        )}
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--cn-hover)]">
                        <X className="h-5 w-5 text-[var(--cn-text-muted)]" />
                    </button>
                </div>

                <div className="space-y-4 px-5 py-4">
                    <div className="flex flex-wrap gap-3 text-sm text-[var(--cn-text-sub)]">
                        <span className="inline-flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            {questionCount} câu
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {duration} phút
                        </span>
                        {exercise.difficulty && (
                            <span className="rounded-md bg-[var(--cn-bg-section)] px-2 py-0.5 text-xs">
                                {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
                            </span>
                        )}
                    </div>

                    <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-section)]/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--cn-text-muted)]">Giá đề thi</p>
                        <div className="mt-2 flex items-end gap-2">
                            <span className="text-2xl font-bold text-[var(--cn-primary)]">{fmtVnd(payableAmount)}</span>
                            {hasDiscount && (
                                <span className="pb-0.5 text-sm text-[var(--cn-text-muted)] line-through">{fmtVnd(originalPrice)}</span>
                            )}
                        </div>
                        {token && (
                            <p className="mt-2 text-xs text-[var(--cn-text-sub)]">
                                Số dư xu: <span className="font-semibold text-[var(--cn-text-main)]">{(coins ?? user?.coins ?? 0).toLocaleString('vi-VN')}</span>
                            </p>
                        )}
                    </div>

                    {!token ? (
                        <CustomButton className="w-full" onClick={() => { window.location.href = '/login'; }}>
                            Đăng nhập để mua
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
                                Thanh toán PayOS
                            </CustomButton>
                            {exercise.allowCoinPayment && (
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
                                    Mua bằng {payableAmount.toLocaleString('vi-VN')} xu
                                </CustomButton>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
