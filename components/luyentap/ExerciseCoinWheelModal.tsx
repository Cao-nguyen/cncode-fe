'use client';

import React, { useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { luyentapApi, getLuyentapApiErrorMessage } from '@/lib/api/luyentap.api';
import { CustomButton } from '@/components/custom/CustomButton';
import {
    EXERCISE_COIN_WHEEL_SEGMENTS,
    computeWheelSpinRotation,
    findWheelSegmentIndex,
    formatCoinSpinResult,
    getSegmentLabelRotate,
    getWheelSegmentAngle,
} from '@/lib/luyentap/exercise-coin-wheel.utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface ExerciseCoinWheelModalProps {
    open: boolean;
    onClose: () => void;
    slug: string;
    answerId: string;
    onSpun: (coinsAwarded: number) => void;
}

export default function ExerciseCoinWheelModal({
    open,
    onClose,
    slug,
    answerId,
    onSpun,
}: ExerciseCoinWheelModalProps) {
    const { updateCoins } = useAuthStore();
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<number | null>(null);
    const [resultMessage, setResultMessage] = useState('');
    const [error, setError] = useState('');

    const segmentCount = EXERCISE_COIN_WHEEL_SEGMENTS.length;
    const segmentAngle = getWheelSegmentAngle(segmentCount);

    const wheelGradient = useMemo(() => {
        const stops = EXERCISE_COIN_WHEEL_SEGMENTS.map((segment, index) => {
            const start = index * segmentAngle;
            const end = (index + 1) * segmentAngle;
            return `${segment.color} ${start}deg ${end}deg`;
        });
        return `conic-gradient(from -${segmentAngle / 2}deg, ${stops.join(', ')})`;
    }, [segmentAngle]);

    const handleSpin = async () => {
        if (spinning || result != null) return;
        setSpinning(true);
        setError('');

        try {
            const data = await luyentapApi.spinExerciseCoin(slug, answerId);
            const coinsAwarded = Number(data.coinsAwarded) || 0;
            const targetIndex = findWheelSegmentIndex(coinsAwarded);
            const nextRotation = computeWheelSpinRotation(rotation, targetIndex, segmentCount);

            setRotation(nextRotation);
            setResultMessage(data.message || formatCoinSpinResult(coinsAwarded));

            window.setTimeout(() => {
                setResult(coinsAwarded);
                setSpinning(false);
                if (coinsAwarded > 0) {
                    updateCoins(coinsAwarded);
                }
                onSpun(coinsAwarded);
            }, 4200);
        } catch (err) {
            setSpinning(false);
            setError(getLuyentapApiErrorMessage(err, 'Không thể quay xu'));
        }
    };

    const handleClose = () => {
        if (spinning) return;
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-2xl">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={spinning}
                    className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-[var(--cn-text-muted)] transition hover:bg-[var(--cn-bg-section)] hover:text-[var(--cn-text-main)] disabled:opacity-50"
                    aria-label="Đóng"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="border-b border-[var(--cn-border)] px-5 py-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--cn-text-main)]">Vòng quay may mắn</h2>
                    <p className="mt-1 text-sm text-[var(--cn-text-sub)]">
                        Bấm nút giữa để quay — nhận xu từ 0 đến 50
                    </p>
                </div>

                <div className="px-5 py-6">
                    <div className="relative mx-auto h-[280px] w-[280px]">
                        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
                            <div className="h-0 w-0 border-x-[12px] border-x-transparent border-t-[22px] border-t-amber-500 drop-shadow" />
                        </div>

                        <div
                            className="absolute inset-4 rounded-full border-4 border-white shadow-xl transition-transform duration-[4000ms] ease-out"
                            style={{
                                background: wheelGradient,
                                transform: `rotate(${rotation}deg)`,
                            }}
                        >
                            {EXERCISE_COIN_WHEEL_SEGMENTS.map((segment, index) => (
                                    <div
                                        key={segment.value}
                                        className="absolute left-1/2 top-1/2 w-[42%] origin-left -translate-y-1/2"
                                        style={{ transform: `rotate(${getSegmentLabelRotate(index, segmentCount)}deg)` }}
                                    >
                                        <span className="block whitespace-pre-line text-center text-[11px] font-bold leading-tight text-white drop-shadow">
                                            {segment.label}
                                        </span>
                                    </div>
                                ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleSpin()}
                            disabled={spinning || result != null}
                            aria-label="Quay vòng quay"
                            className={cn(
                                'absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[var(--cn-bg-card)] text-xs font-bold text-[var(--cn-primary)] shadow-lg transition',
                                spinning || result != null
                                    ? 'cursor-default opacity-80'
                                    : 'cursor-pointer hover:scale-105 hover:shadow-xl active:scale-95',
                            )}
                        >
                            {spinning ? '…' : 'CN'}
                        </button>
                    </div>

                    {error && (
                        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
                    )}

                    {result != null && (
                        <div className="mt-5 rounded-xl bg-[var(--cn-bg-section)] px-4 py-4 text-center">
                            <p className={cn(
                                'text-lg font-bold',
                                result > 0 ? 'text-emerald-600' : 'text-[var(--cn-text-sub)]',
                            )}>
                                {resultMessage}
                            </p>
                            {result > 0 && (
                                <p className="mt-1 text-xs text-[var(--cn-text-muted)]">
                                    Xu đã được cộng vào tài khoản và lưu trong Lịch sử giao dịch
                                </p>
                            )}
                            <CustomButton className="mt-4 w-full" onClick={handleClose}>
                                Đóng
                            </CustomButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
