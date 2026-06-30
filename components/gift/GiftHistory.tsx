'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Loader2, Coins } from 'lucide-react';
import { giftApi, IGiftTransaction } from '@/lib/api/gift.api';
import { useAuthStore } from '@/store/auth.store';

interface GiftHistoryProps {
    userId: string;
    isOwnProfile?: boolean;
}

export function GiftHistory({ userId, isOwnProfile = false }: GiftHistoryProps) {
    const { token } = useAuthStore();
    const [transactions, setTransactions] = useState<IGiftTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (isOwnProfile && token) {
            fetchReceivedGifts();
        } else if (!isOwnProfile) {
            fetchUserGifts();
        }
    }, [userId, isOwnProfile, token]);

    const fetchReceivedGifts = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await giftApi.getReceivedGifts(token, page, 10);
            setTransactions(result.transactions);
            setHasMore(page < result.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching received gifts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserGifts = async () => {
        try {
            setLoading(true);
            const result = await giftApi.getGiftsForTarget('user', userId, page, 10);
            setTransactions(result.transactions);
            setHasMore(page < result.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching user gifts:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có quà tặng nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {transactions.map((transaction) => (
                <div
                    key={transaction._id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.05] rounded-lg"
                >
                    <img
                        src={transaction.gift.image}
                        alt={transaction.gift.name}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                                {transaction.gift.name}
                            </span>
                            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold flex items-center gap-1">
                                <Coins className="h-3 w-3" />
                                {transaction.gift.priceInXu.toLocaleString()} xu
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Từ <span className="font-medium">{transaction.sender.fullName}</span>
                            {transaction.message && (
                                <span className="block text-xs mt-1 italic">"{transaction.message}"</span>
                            )}
                        </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                </div>
            ))}

            {hasMore && (
                <button
                    onClick={loadMore}
                    className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                    Xem thêm
                </button>
            )}
        </div>
    );
}
