'use client';

import React, { useState, useEffect } from 'react';
import { giftApi, IGiftTransaction } from '@/lib/api/gift.api';
import { toast } from 'sonner';
import { Gift, Loader2, Coins } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import Header from '@/components/layouts/header';
import Footer from '@/components/layouts/footer';
import { CustomButton } from '@/components/custom/CustomButton';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/imageUrl';

type TabType = 'received' | 'convert';

function MyShopPageContent() {
    const { token, user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('received');
    const [receivedGifts, setReceivedGifts] = useState<IGiftTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [converting, setConverting] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchReceivedGifts();
        }
    }, [token]);

    const fetchReceivedGifts = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await giftApi.getReceivedGifts(token, 1, 50);
            console.log('Received gifts:', result.transactions);
            setReceivedGifts(result.transactions);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi tải quà đã nhận';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Group gifts by giftId and count quantity
    const groupedGifts = receivedGifts.reduce((acc, transaction) => {
        const key = transaction.gift._id;
        if (!acc[key]) {
            acc[key] = {
                gift: transaction.gift,
                quantity: 0,
                senders: [] as Array<{ name: string; message?: string; date: string }>,
                totalXu: 0
            };
        }
        acc[key].quantity += 1;
        acc[key].totalXu += transaction.gift.priceInXu || 0;
        acc[key].senders.push({
            name: transaction.sender.fullName,
            message: transaction.message,
            date: transaction.createdAt
        });
        return acc;
    }, {} as Record<string, { gift: IGiftTransaction['gift']; quantity: number; senders: Array<{ name: string; message?: string; date: string }>; totalXu: number }>);

    const handleConvert = async (giftId: string, quantity: number, priceInXu: number) => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để quy đổi quà');
            return;
        }

        setConverting(giftId);

        try {
            const result = await giftApi.convertGifts(giftId, token);
            if (result.success) {
                useAuthStore.getState().updateCoins(result.xuReceived);
                toast.success(result.message);

                // Refresh the gifts list
                await fetchReceivedGifts();
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi quy đổi quà tặng';
            toast.error(message);
        } finally {
            setConverting(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            <Header />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kho Quà của tôi</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý quà tặng đã nhận
                        </p>
                        {user && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                                    {user.coins.toLocaleString()} xu
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/[0.06]">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'received'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Quà đã nhận
                        </button>
                        <button
                            onClick={() => setActiveTab('convert')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'convert'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Quy đổi sang xu
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'received' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : receivedGifts.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa nhận quà nào</p>
                                </div>
                            ) : (
                                Object.values(groupedGifts).map((item) => (
                                    <div
                                        key={item.gift._id}
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-[#0f0f0f] rounded-xl shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.06]"
                                    >
                                        {item.gift.image ? (
                                            <Image
                                                src={getImageUrl(item.gift.image)}
                                                alt={item.gift.name}
                                                width={64}
                                                height={64}
                                                className="w-16 h-16 rounded-lg object-cover"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <Gift className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {item.gift.name}
                                                </span>
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2 py-1 rounded-full">
                                                    x{item.quantity}
                                                </span>
                                                <span className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold flex items-center gap-1">
                                                    <Coins className="h-3 w-3" />
                                                    {item.totalXu.toLocaleString()} xu
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Từ {item.senders.length} người
                                            </p>
                                        </div>
                                        <CustomButton
                                            onClick={() => handleConvert(item.gift._id, item.quantity, item.gift.priceInXu)}
                                            disabled={converting === item.gift._id}
                                        >
                                            {converting === item.gift._id ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Đang quy đổi...
                                                </span>
                                            ) : (
                                                'Quy đổi'
                                            )}
                                        </CustomButton>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'convert' && (
                        <div className="space-y-4">
                            {Object.keys(groupedGifts).length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa có quà nào để quy đổi</p>
                                </div>
                            ) : (
                                Object.values(groupedGifts).map((item) => (
                                    <div
                                        key={item.gift._id}
                                        className="p-6 bg-white dark:bg-[#0f0f0f] rounded-xl shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.06]"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <img
                                                src={getImageUrl(item.gift.image)}
                                                alt={item.gift.name}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.gift.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Số lượng: {item.quantity}
                                                </p>
                                                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                                                    {item.gift.priceInXu.toLocaleString()} xu/quà
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                Quy đổi {item.quantity} quà sẽ nhận được: <strong>{Math.floor(item.gift.priceInXu * 0.9 * item.quantity).toLocaleString()} xu</strong>
                                                <br />
                                                <span className="text-xs">(Phí quy đổi: 10%)</span>
                                            </p>
                                        </div>

                                        <CustomButton
                                            onClick={() => handleConvert(item.gift._id, item.quantity, item.gift.priceInXu)}
                                            className="w-full"
                                        >
                                            Quy đổi ngay
                                        </CustomButton>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default MyShopPageContent;
