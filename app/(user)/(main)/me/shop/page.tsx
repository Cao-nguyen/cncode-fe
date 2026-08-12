'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { giftApi, IGiftTransaction } from '@/lib/api/gift.api';
import { toast } from 'sonner';
import {
    Gift,
    Loader2,
    Coins,
    Sparkles,
    ArrowRightLeft,
    Package,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { CustomButton } from '@/components/custom/CustomButton';
import { getAvatarUrl, avatarImageProps, getImageUrl } from '@/lib/utils/imageUrl';
import { GiftShopPageSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type TabType = 'received' | 'convert';

type GroupedGift = {
    gift: IGiftTransaction['gift'];
    quantity: number;
    senders: Array<{ name: string; avatar?: string; message?: string; date: string }>;
    totalXu: number;
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function GiftImage({ image, name, size = 'md' }: { image?: string; name: string; size?: 'md' | 'lg' }) {
    const sizeClass = size === 'lg' ? 'h-24 w-24' : 'h-20 w-20';

    if (!image) {
        return (
            <div className={cn(sizeClass, 'rounded-xl bg-gradient-to-br from-pink-100 to-amber-100 dark:from-pink-950/40 dark:to-amber-950/40 flex items-center justify-center shrink-0')}>
                <Gift className="h-8 w-8 text-pink-500 dark:text-pink-400" />
            </div>
        );
    }

    return (
        <img
            src={getImageUrl(image)}
            alt={name}
            className={cn(sizeClass, 'rounded-xl object-cover bg-gray-100 dark:bg-white/10 shrink-0 ring-2 ring-white dark:ring-white/10 shadow-sm')}
            onError={(e) => {
                e.currentTarget.src = '/images/blog.png';
            }}
        />
    );
}

function SenderAvatar({ name, avatar }: { name: string; avatar?: string }) {
    const [imgError, setImgError] = useState(false);
    const initials = name?.charAt(0)?.toUpperCase() || '?';

    if (avatar && !imgError) {
        return (
            <img
                src={getAvatarUrl(avatar)}
                alt={name}
                className="h-9 w-9 rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-white/10"
                {...avatarImageProps}
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cn-primary)] text-sm font-semibold text-white ring-2 ring-white dark:ring-white/10">
            {initials}
        </div>
    );
}

function ReceivedGiftCard({ item }: { item: GroupedGift }) {
    return (
        <div className="rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--cn-border)] bg-pink-50/50 dark:bg-pink-950/10 px-4 py-3">
                <GiftImage image={item.gift.image} name={item.gift.name} size="md" />
                <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--cn-text-main)] truncate">{item.gift.name}</h3>
                    <p className="text-xs text-[var(--cn-text-sub)]">{item.quantity} lượt tặng</p>
                </div>
            </div>

            <ul className="divide-y divide-[var(--cn-border)]">
                {item.senders.map((sender, index) => (
                    <li key={`${sender.name}-${sender.date}-${index}`} className="flex gap-3 px-4 py-3">
                        <SenderAvatar name={sender.name} avatar={sender.avatar} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-[var(--cn-text-main)] truncate">{sender.name}</p>
                                <span className="shrink-0 text-[11px] text-[var(--cn-text-muted)]">{formatDate(sender.date)}</span>
                            </div>
                            {sender.message ? (
                                <p className="mt-1 text-sm text-[var(--cn-text-sub)] leading-relaxed">
                                    &ldquo;{sender.message}&rdquo;
                                </p>
                            ) : (
                                <p className="mt-1 text-xs italic text-[var(--cn-text-muted)]">Không có lời nhắn</p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function EmptyState({ tab }: { tab: TabType }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
            <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-pink-200/50 dark:bg-pink-900/20 blur-2xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 shadow-lg">
                    <Gift className="h-10 w-10 text-white" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-[var(--cn-text-main)] mb-2">
                {tab === 'received' ? 'Chưa nhận quà nào' : 'Chưa có quà để quy đổi'}
            </h3>
            <p className="text-sm text-[var(--cn-text-sub)] text-center max-w-sm leading-relaxed">
                {tab === 'received'
                    ? 'Khi ai đó tặng quà cho bạn qua blog hoặc hồ sơ, quà sẽ xuất hiện tại đây.'
                    : 'Nhận quà từ cộng đồng CNcode rồi quay lại để đổi thành xu.'}
            </p>
        </div>
    );
}

function groupTransactions(transactions: IGiftTransaction[]): GroupedGift[] {
    const grouped = transactions.reduce((acc, transaction) => {
        const key = transaction.gift._id;
        if (!acc[key]) {
            acc[key] = {
                gift: transaction.gift,
                quantity: 0,
                senders: [],
                totalXu: 0,
            };
        }
        acc[key].quantity += 1;
        acc[key].totalXu += transaction.gift.priceInXu || 0;
        acc[key].senders.push({
            name: transaction.sender.fullName,
            avatar: transaction.sender.avatar,
            message: transaction.message,
            date: transaction.createdAt,
        });
        return acc;
    }, {} as Record<string, GroupedGift>);

    return Object.values(grouped).map((item) => ({
        ...item,
        senders: [...item.senders].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
    }));
}

function MyShopPageContent() {
    const { token, user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('received');
    const [receivedGifts, setReceivedGifts] = useState<IGiftTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchReceivedGifts();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchReceivedGifts = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await giftApi.getReceivedGifts(1, 50);
            setReceivedGifts(result.data || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi tải quà đã nhận';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const markGiftAsConverted = (giftId: string) => {
        setReceivedGifts((prev) =>
            prev.map((transaction) =>
                transaction.gift._id === giftId
                    ? { ...transaction, isConverted: true, convertedAt: new Date().toISOString() }
                    : transaction
            )
        );
    };

    const historyGroupedList = useMemo(
        () => groupTransactions(receivedGifts),
        [receivedGifts]
    );

    const convertibleTransactions = useMemo(
        () => receivedGifts.filter((t) => !t.isConverted),
        [receivedGifts]
    );

    const convertibleGroupedList = useMemo(
        () => groupTransactions(convertibleTransactions),
        [convertibleTransactions]
    );

    const totalGifts = receivedGifts.length;
    const totalTypes = historyGroupedList.length;
    const availableCount = convertibleTransactions.length;

    const handleConvert = async (giftId: string) => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để quy đổi quà');
            return;
        }

        setConverting(giftId);

        try {
            const result = await giftApi.convertGifts(giftId);
            if (result.success) {
                useAuthStore.getState().updateCoins(result.xuReceived);
                markGiftAsConverted(giftId);
                toast.success(result.message);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi quy đổi quà tặng';
            toast.error(message);
        } finally {
            setConverting(null);
        }
    };

    const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: 'received', label: 'Quà đã nhận', icon: Package },
        { id: 'convert', label: 'Quy đổi sang xu', icon: ArrowRightLeft },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {loading ? (
                <GiftShopPageSkeleton />
            ) : (
                <>
                            {/* Hero */}
                            <div className="relative overflow-hidden rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-6 md:p-8 mb-8">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-200/40 via-amber-100/30 to-transparent dark:from-pink-900/20 dark:via-amber-900/10 rounded-bl-full pointer-events-none" />
                                <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 dark:bg-pink-900/30 px-3 py-1 text-xs font-medium text-pink-700 dark:text-pink-300 mb-3">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Kho quà tặng cá nhân
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--cn-text-main)] mb-2">
                                            Kho quà của tôi
                                        </h1>
                                        <p className="text-[var(--cn-text-sub)] max-w-lg">
                                            Quản lý quà đã nhận, xem người tặng và quy đổi thành xu để sử dụng trên CNcode.
                                        </p>
                                    </div>
                                    {user && (
                                        <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3 shadow-md shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25">
                                                <Coins className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-white/90">Số dư hiện tại</p>
                                                <p className="text-xl font-bold text-white">{user.coins.toLocaleString()} xu</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--cn-border)]">
                                    <div>
                                        <p className="text-2xl font-bold text-[var(--cn-text-main)]">{totalGifts}</p>
                                        <p className="text-xs text-[var(--cn-text-sub)] mt-0.5">Tổng quà nhận</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[var(--cn-text-main)]">{totalTypes}</p>
                                        <p className="text-xs text-[var(--cn-text-sub)] mt-0.5">Loại quà</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[var(--cn-text-main)]">{availableCount}</p>
                                        <p className="text-xs text-[var(--cn-text-sub)] mt-0.5">Có thể quy đổi</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 p-1 mb-6 rounded-xl bg-[var(--cn-bg-card)] border border-[var(--cn-border)] max-w-md">
                                {tabs.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setActiveTab(id)}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                                            activeTab === id
                                                ? 'bg-[var(--cn-primary)] text-white shadow-sm'
                                                : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-black/5 dark:hover:bg-white/5'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{label}</span>
                                        <span className="sm:hidden">{id === 'received' ? 'Quà' : 'Đổi xu'}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            {activeTab === 'received' && (
                                historyGroupedList.length === 0 ? (
                                    <EmptyState tab="received" />
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {historyGroupedList.map((item) => (
                                            <ReceivedGiftCard key={item.gift._id} item={item} />
                                        ))}
                                    </div>
                                )
                            )}

                            {activeTab === 'convert' && (
                                convertibleGroupedList.length === 0 ? (
                                    <EmptyState tab="convert" />
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {convertibleGroupedList.map((item) => {
                                            const convertXu = Math.floor(item.gift.priceInXu * 0.9 * item.quantity);
                                            return (
                                                <div
                                                    key={item.gift._id}
                                                    className="rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] overflow-hidden shadow-sm"
                                                >
                                                    <div className="p-5 md:p-6">
                                                        <div className="flex items-center gap-4 mb-5">
                                                            <GiftImage image={item.gift.image} name={item.gift.name} size="lg" />
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-[var(--cn-text-main)]">{item.gift.name}</h3>
                                                                <p className="text-sm text-[var(--cn-text-sub)] mt-1">SL hiện có: {item.quantity}</p>
                                                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1">
                                                                    {item.gift.priceInXu.toLocaleString()} xu / quà
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-900/40 p-4 mb-5">
                                                            <p className="text-sm text-amber-900 dark:text-amber-200">
                                                                Quy đổi <strong>{item.quantity}</strong> quà → nhận{' '}
                                                                <strong className="text-lg">{convertXu.toLocaleString()} xu</strong>
                                                            </p>
                                                            <p className="text-xs text-amber-700/80 dark:text-amber-300/70 mt-1">
                                                                Phí quy đổi 10% đã được trừ
                                                            </p>
                                                        </div>

                                                        <CustomButton
                                                            onClick={() => handleConvert(item.gift._id)}
                                                            disabled={converting === item.gift._id}
                                                            className="w-full"
                                                        >
                                                            {converting === item.gift._id ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                    Đang quy đổi...
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                                                                    Quy đổi ngay
                                                                </>
                                                            )}
                                                        </CustomButton>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                </>
            )}
        </div>
    );
}

export default MyShopPageContent;
