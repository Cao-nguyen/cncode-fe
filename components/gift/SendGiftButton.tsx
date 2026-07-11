'use client';

import React, { useState } from 'react';
import { Gift, Loader2, Coins, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { giftApi, IGift } from '@/lib/api/gift.api';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import confetti from 'canvas-confetti';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface SendGiftButtonProps {
    recipientId: string;
    recipientName?: string;
    targetType?: 'user' | 'post';
    targetId?: string;
}

export function SendGiftButton({ 
    recipientId, 
    recipientName,
    targetType = 'user',
    targetId = recipientId
}: SendGiftButtonProps) {
    const { token, user } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [gifts, setGifts] = useState<IGift[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedGift, setSelectedGift] = useState<IGift | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');

    const openModal = async () => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để gửi quà tặng');
            return;
        }

        // Check if trying to send gift to self
        if (user && recipientId === user._id) {
            toast.error('Bạn không thể tự tặng quà cho chính mình');
            return;
        }
        
        try {
            setLoading(true);
            const data = await giftApi.getActiveGifts();
            setGifts(data);
            setShowModal(true);
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi tải danh sách quà tặng');
        } finally {
            setLoading(false);
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999
        };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const handleSendGift = async () => {
        if (!selectedGift || !token) return;

        const totalPrice = selectedGift.priceInXu * quantity;
        if (user && user.coins < totalPrice) {
            toast.error('Bạn không đủ xu để mua quà tặng này');
            return;
        }

        try {
            setSending(true);
            
            // Gửi từng quà (nếu số lượng > 1)
            for (let i = 0; i < quantity; i++) {
                await giftApi.sendGift({
                    giftId: selectedGift._id,
                    recipientId,
                    targetType,
                    targetId,
                    message: message || undefined
                }, token);
            }

            toast.success(`Đã gửi ${quantity} ${selectedGift.name} thành công!`);
            setShowModal(false);
            setSelectedGift(null);
            setQuantity(1);
            setMessage('');
            
            // Update local coins
            useAuthStore.getState().updateCoins(-totalPrice);

            // Trigger confetti effect
            triggerConfetti();

            // Emit custom event for BlogGiftList to update
            window.dispatchEvent(new CustomEvent('gift-sent-local', {
                detail: {
                    giftId: selectedGift._id,
                    gift: selectedGift,
                    recipientId,
                    targetType,
                    targetId,
                    quantity,
                    message,
                    sender: user
                }
            }));
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi gửi quà tặng');
        } finally {
            setSending(false);
        }
    };

    const totalPrice = selectedGift ? selectedGift.priceInXu * quantity : 0;

    return (
        <>
            <CustomButton
                variant="outline"
                onClick={openModal}
                disabled={loading}
                className="flex items-center gap-2"
            >
                <Gift className="w-5 h-5" />
                Gửi quà
            </CustomButton>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-[#0f0f0f] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.06]">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Gửi quà tặng {targetType === 'post' ? 'cho bài viết' : `cho ${recipientName || 'người dùng'}`}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedGift(null);
                                    setQuantity(1);
                                    setMessage('');
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {!selectedGift ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {gifts.map((gift) => (
                                        <button
                                            key={gift._id}
                                            onClick={() => setSelectedGift(gift)}
                                            className="p-4 border border-gray-200 dark:border-white/[0.1] rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
                                        >
                                            <img
                                                src={getImageUrl(gift.image)}
                                                alt={gift.name}
                                                className="w-full aspect-square object-cover rounded-lg mb-2"
                                            />
                                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">{gift.name}</h3>
                                            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold">
                                                {gift.priceInXu.toLocaleString()} xu
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.05] rounded-lg">
                                        <img
                                            src={getImageUrl(selectedGift.image)}
                                            alt={selectedGift.name}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{selectedGift.name}</h3>
                                            <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                                {selectedGift.priceInXu.toLocaleString()} xu
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedGift(null);
                                                setQuantity(1);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <CustomInput
                                        label="Số lượng"
                                        type="number"
                                        value={quantity.toString()}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                                    />

                                    <CustomTextarea
                                        label="Lời nhắn (tùy chọn)"
                                        placeholder="Viết lời nhắn kèm theo quà..."
                                        value={message}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                                        rows={3}
                                        maxLength={200}
                                    />

                                    {user && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                Bạn sẽ tiêu tốn <strong>{totalPrice.toLocaleString()} xu</strong>
                                                <br />
                                                Người nhận sẽ nhận được <strong>{Math.floor(totalPrice * 0.9).toLocaleString()} xu</strong> (phí 10%)
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <CustomButton
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedGift(null);
                                                setQuantity(1);
                                            }}
                                            disabled={sending}
                                            className="flex-1"
                                        >
                                            Quay lại
                                        </CustomButton>
                                        <CustomButton
                                            onClick={handleSendGift}
                                            disabled={sending}
                                            className="flex-1"
                                        >
                                            {sending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                `Gửi ${quantity} quà`
                                            )}
                                        </CustomButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
