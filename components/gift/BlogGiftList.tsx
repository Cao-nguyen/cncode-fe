'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Loader2, Coins } from 'lucide-react';
import { giftApi, IGiftTransaction } from '@/lib/api/gift.api';
import { useSocket } from '@/providers/socket.provider';
import { useAuthStore } from '@/store/auth.store';
import Image from 'next/image';

interface BlogGiftListProps {
    blogId: string;
}

export function BlogGiftList({ blogId }: BlogGiftListProps) {
    const [transactions, setTransactions] = useState<IGiftTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const { socket, isConnected } = useSocket();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchGifts();
    }, [blogId]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewGift = (data: { transaction: IGiftTransaction; sender: any }) => {
            // Only add if the gift is for this blog post and not from current user
            if (data.transaction.targetId === blogId && data.transaction.targetType === 'post') {
                // Don't add if current user is the sender (they already see it from local event)
                if (user && data.transaction.sender._id === user._id) {
                    return;
                }
                setTransactions(prev => {
                    // Check if transaction already exists
                    if (prev.some(t => t._id === data.transaction._id)) {
                        return prev;
                    }
                    return [data.transaction, ...prev];
                });
            }
        };

        socket.on('gift-sent', handleNewGift);

        return () => {
            socket.off('gift-sent', handleNewGift);
        };
    }, [socket, isConnected, blogId, user]);

    useEffect(() => {
        const handleLocalGiftSent = (event: CustomEvent) => {
            const data = event.detail;
            // Only add if the gift is for this blog post
            if (data.targetId === blogId && data.targetType === 'post') {
                // Create a mock transaction object
                const mockTransaction: IGiftTransaction = {
                    _id: `local-${Date.now()}-${Math.random()}`,
                    sender: {
                        _id: data.sender._id,
                        fullName: data.sender.fullName,
                        username: data.sender.username,
                        avatar: data.sender.avatar
                    },
                    recipient: {
                        _id: data.recipientId,
                        fullName: '',
                        username: '',
                        avatar: ''
                    },
                    gift: data.gift,
                    targetType: data.targetType,
                    targetId: data.targetId,
                    message: data.message,
                    coinsSpent: data.gift.priceInXu,
                    xuReceived: Math.floor(data.gift.priceInXu * 0.9),
                    createdAt: new Date().toISOString()
                };
                setTransactions(prev => [mockTransaction, ...prev]);
            }
        };

        window.addEventListener('gift-sent-local', handleLocalGiftSent as EventListener);

        return () => {
            window.removeEventListener('gift-sent-local', handleLocalGiftSent as EventListener);
        };
    }, [blogId]);

    const fetchGifts = async () => {
        try {
            setLoading(true);
            const result = await giftApi.getGiftsForTarget('post', blogId, 1, 10);
            console.log('Blog gifts:', result.transactions);
            setTransactions(result.transactions);
        } catch (error) {
            console.error('Error fetching blog gifts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return null;
    }

    const displayTransactions = showAll ? transactions : transactions.slice(0, 3);

    return (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/[0.06]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Quà tặng cho bài viết ({transactions.length})
            </h3>
            <div className="space-y-3">
                {displayTransactions.map((transaction) => (
                    <div
                        key={transaction._id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/[0.05] rounded-lg"
                    >
                        {transaction.gift.image ? (
                            <Image
                                src={transaction.gift.image}
                                alt={transaction.gift.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg object-cover"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Gift className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {transaction.gift.name}
                                </span>
                                <span className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold flex items-center gap-1">
                                    <Coins className="h-3 w-3" />
                                    {(transaction.gift.priceInXu || 0).toLocaleString()} xu
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {transaction.sender.fullName}
                                {transaction.message && `: "${transaction.message}"`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {transactions.length > 3 && !showAll && (
                <button
                    onClick={() => setShowAll(true)}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                    Xem thêm {transactions.length - 3} quà tặng
                </button>
            )}
        </div>
    );
}
