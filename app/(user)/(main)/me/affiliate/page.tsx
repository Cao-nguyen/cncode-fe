// app/(user)/(main)/affiliate/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, FileText, GraduationCap, Trophy, CheckCircle, XCircle, Gift, TrendingUp, Crown, Medal, Coins, Copy, Check, UserPlus, BookOpen, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { affiliateApi } from '@/lib/api/affiliate.api';
import { toast } from 'sonner';
import Image from 'next/image';
import type { IMyAffiliateInfo, ILeaderboardUser } from '@/types/affiliate.type';
import { DashboardCard } from '@/components/custom/DashboardCard';

const TOAST_MESSAGES: Record<string, string> = {
    new_registration: '🎉 Có người vừa đăng ký qua link của bạn!',
    post_created: '📝 Người được giới thiệu vừa đăng bài viết mới!',
    quiz_taken: '🎓 Người được giới thiệu vừa hoàn thành bài kiểm tra!',
    referred_user_deleted: '⚠️ Một người dùng được giới thiệu đã bị xóa khỏi hệ thống',
    user_deleted: '⚠️ Dữ liệu affiliate của bạn đã được cập nhật',
};

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--cn-radius-sm)] bg-[var(--cn-primary)] text-white text-xs font-medium shrink-0 transition hover:bg-[var(--cn-primary-hover)]"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
    );
}

export default function AffiliatePage() {
    const { user, token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [affiliate, setAffiliate] = useState<IMyAffiliateInfo | null>(null);
    const [leaderboard, setLeaderboard] = useState<ILeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllReferred, setShowAllReferred] = useState(false);

    const tokenRef = useRef(token);
    const userRef = useRef(user);
    useEffect(() => { tokenRef.current = token; }, [token]);
    useEffect(() => { userRef.current = user; }, [user]);

    const refreshAll = useRef(async () => {
        const lbResult = await affiliateApi.getLeaderboard(10);
        if (lbResult.success && lbResult.data) setLeaderboard(lbResult.data);

        if (!tokenRef.current) return;
        const affResult = await affiliateApi.getMyInfo(tokenRef.current);
        if (affResult.success && affResult.data) setAffiliate(affResult.data);
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const lbResult = await affiliateApi.getLeaderboard(10);
            if (!cancelled && lbResult.success && lbResult.data) {
                setLeaderboard(lbResult.data);
            }

            if (!tokenRef.current || !userRef.current) {
                if (!cancelled) setIsLoading(false);
                return;
            }

            const affResult = await affiliateApi.getMyInfo(tokenRef.current);
            if (!cancelled && affResult.success && affResult.data) {
                setAffiliate(affResult.data);
            }
            if (!cancelled) setIsLoading(false);
        }

        load();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!socket || !isConnected || !user?._id) return;

        const handleAffiliateUpdated = (data: { type: string; coinsEarned?: number }) => {
            refreshAll.current();

            const message = TOAST_MESSAGES[data.type];
            if (message) {
                const isWarning = data.type === 'referred_user_deleted' || data.type === 'user_deleted';
                if (isWarning) toast.warning(message);
                else toast.success(message, { description: data.coinsEarned ? `+${data.coinsEarned} xu` : undefined });
            }
        };

        socket.on('affiliate_updated', handleAffiliateUpdated);
        return () => { socket.off('affiliate_updated', handleAffiliateUpdated); };
    }, [socket, isConnected, user?._id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-[var(--cn-primary)] border-t-transparent" />
            </div>
        );
    }

    const top3 = leaderboard.slice(0, 3);
    const restLeaderboard = leaderboard.slice(3);
    const referredUsers = affiliate?.referredUsers || [];
    const displayedUsers = showAllReferred ? referredUsers : referredUsers.slice(0, 5);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--cn-primary)]">Tiếp thị liên kết</h1>
                <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1 sm:mt-2">
                    Chia sẻ link giới thiệu và nhận xu khi bạn bè hoàn thành nhiệm vụ
                </p>
            </div>

            {token && user ? (
                affiliate ? (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Link giới thiệu - Full width trên mobile */}
                        <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-4 sm:p-5 border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)]">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center">
                                    <Gift size={16} className="text-[var(--cn-primary)] sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <h2 className="font-semibold text-sm sm:text-base text-[var(--cn-text-main)]">Link giới thiệu</h2>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="flex-1 w-full p-2.5 sm:p-3 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)]">
                                    <p className="text-xs sm:text-sm text-[var(--cn-text-sub)] break-all">{affiliate.link}</p>
                                </div>
                                <CopyButton text={affiliate.link} />
                            </div>
                            <p className="text-[10px] sm:text-xs text-[var(--cn-text-muted)] mt-2 sm:mt-3">
                                Mã: <span className="font-mono font-semibold text-[var(--cn-primary)]">{affiliate.code}</span>
                            </p>
                        </div>

                        {/* Stats Cards - Grid 2x2 trên mobile, 4x1 trên desktop */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <DashboardCard
                                title="Lượt đăng ký"
                                value={affiliate.totalRegistered || 0}
                                icon={<UserPlus size={16} className="text-blue-500" />}
                            />
                            <DashboardCard
                                title="Bài viết"
                                value={affiliate.totalPosted || 0}
                                icon={<BookOpen size={16} className="text-green-500" />}
                            />
                            <DashboardCard
                                title="Bài tập"
                                value={affiliate.totalTakenQuiz || 0}
                                icon={<ClipboardList size={16} className="text-purple-500" />}
                            />
                            <DashboardCard
                                title="Tổng xu"
                                value={affiliate.totalCoinsEarned?.toLocaleString() || 0}
                                icon={<Coins size={16} className="text-yellow-500" />}
                            />
                        </div>

                        {/* Cơ chế thưởng */}
                        <div className="bg-gradient-to-r from-[var(--cn-primary)]/10 to-[var(--cn-primary)]/5 rounded-[var(--cn-radius-md)] p-4 sm:p-5 border border-[var(--cn-primary)]/20">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <TrendingUp size={16} className="text-[var(--cn-primary)] sm:w-[18px] sm:h-[18px]" />
                                <h2 className="font-semibold text-sm sm:text-base text-[var(--cn-text-main)]">Cơ chế thưởng</h2>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-gray-900 rounded-[var(--cn-radius-sm)]">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--cn-bg-section)] flex items-center justify-center">
                                            <UserPlus size={14} className="text-blue-500 sm:w-4 sm:h-4" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-[var(--cn-text-sub)]">Đăng ký mới</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                        <Coins size={14} className="text-yellow-500 sm:w-4 sm:h-4" />
                                        <span className="text-xs sm:text-sm font-bold text-[var(--cn-primary)]">+100 xu</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-gray-900 rounded-[var(--cn-radius-sm)]">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--cn-bg-section)] flex items-center justify-center">
                                            <BookOpen size={14} className="text-green-500 sm:w-4 sm:h-4" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-[var(--cn-text-sub)]">Đăng bài viết</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                        <Coins size={14} className="text-yellow-500 sm:w-4 sm:h-4" />
                                        <span className="text-xs sm:text-sm font-bold text-[var(--cn-primary)]">+30 xu</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-gray-900 rounded-[var(--cn-radius-sm)]">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--cn-bg-section)] flex items-center justify-center">
                                            <ClipboardList size={14} className="text-purple-500 sm:w-4 sm:h-4" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-[var(--cn-text-sub)]">Làm bài tập</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                        <Coins size={14} className="text-yellow-500 sm:w-4 sm:h-4" />
                                        <span className="text-xs sm:text-sm font-bold text-[var(--cn-primary)]">+20 xu</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        {leaderboard.length > 0 && (
                            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-4 sm:p-5 border border-[var(--cn-border)]">
                                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                    <Trophy size={18} className="text-yellow-500 sm:w-[22px] sm:h-[22px]" />
                                    <h2 className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)]">Bảng xếp hạng</h2>
                                </div>

                                {/* Top 3 - Stack trên mobile, row trên tablet */}
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
                                    {top3.map((item, idx) => {
                                        const rank = idx + 1;
                                        const rankColors: Record<number, string> = {
                                            1: 'from-yellow-400 to-yellow-600 ring-yellow-500',
                                            2: 'from-gray-300 to-gray-500 ring-gray-400',
                                            3: 'from-amber-500 to-amber-700 ring-amber-600',
                                        };
                                        const rankIcons: Record<number, React.ReactNode> = {
                                            1: <Crown size={20} className="text-yellow-500 sm:w-7 sm:h-7" />,
                                            2: <Medal size={20} className="text-gray-400 sm:w-7 sm:h-7" />,
                                            3: <Medal size={20} className="text-amber-600 sm:w-7 sm:h-7" />,
                                        };
                                        return (
                                            <div key={item._id} className="flex-1 flex flex-col items-center text-center">
                                                <div className="relative mb-2 sm:mb-3">
                                                    <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${rankColors[rank]} p-1 ring-2 ${rankColors[rank].split(' ')[2]} mx-auto`}>
                                                        <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                                            {item.user.avatar ? (
                                                                <Image src={item.user.avatar} alt={item.user.fullName} width={94} height={94} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-lg sm:text-2xl font-bold text-[var(--cn-primary)]">
                                                                    {item.user.fullName?.charAt(0) || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">{rankIcons[rank]}</div>
                                                </div>
                                                <p className="font-semibold text-sm sm:text-base text-[var(--cn-text-main)]">{item.user.fullName}</p>
                                                <p className="text-[10px] sm:text-xs text-[var(--cn-text-muted)]">@{item.user.username}</p>
                                                <p className="text-xs sm:text-sm font-bold text-[var(--cn-primary)] mt-1 sm:mt-2">{item.totalRegistered} người</p>
                                                <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                                                    <Coins size={12} className="text-yellow-500 sm:w-3.5 sm:h-3.5" />
                                                    <span className="text-[10px] sm:text-xs text-[var(--cn-text-muted)]">{item.totalCoins.toLocaleString()} xu</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Còn lại */}
                                {restLeaderboard.length > 0 && (
                                    <div className="space-y-2 pt-3 sm:pt-4 border-t border-[var(--cn-border)]">
                                        {restLeaderboard.map((item, idx) => (
                                            <div key={item._id} className="flex items-center justify-between p-2.5 sm:p-3 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-hover)] transition">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="w-5 sm:w-7 text-[10px] sm:text-sm font-bold text-[var(--cn-text-muted)]">#{idx + 4}</span>
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden">
                                                        {item.user.avatar ? (
                                                            <Image src={item.user.avatar} alt={item.user.fullName} width={40} height={40} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">
                                                                {item.user.fullName?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-medium text-[var(--cn-text-main)]">{item.user.fullName}</p>
                                                        <p className="text-[10px] sm:text-xs text-[var(--cn-text-muted)]">@{item.user.username}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs sm:text-sm font-semibold text-[var(--cn-primary)]">{item.totalRegistered} người</p>
                                                    <div className="flex items-center gap-1 justify-end">
                                                        <Coins size={10} className="text-yellow-500 sm:w-3 sm:h-3" />
                                                        <span className="text-[9px] sm:text-xs text-[var(--cn-text-muted)]">{item.totalCoins.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Danh sách người đã đăng ký */}
                        {referredUsers.length > 0 ? (
                            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-4 sm:p-5 border border-[var(--cn-border)]">
                                <h2 className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)] mb-3 sm:mb-4">
                                    📋 Danh sách người đã đăng ký ({referredUsers.length})
                                </h2>
                                <div className="space-y-2 sm:space-y-3">
                                    {displayedUsers.map((referredUser, idx) => (
                                        <div key={idx} className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-hover)] transition">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center text-xs sm:text-sm font-bold text-[var(--cn-primary)]">
                                                    {referredUser.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-[var(--cn-text-main)]">{referredUser.name}</p>
                                                    <p className="text-[10px] sm:text-xs text-[var(--cn-text-muted)]">{referredUser.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 sm:gap-2">
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-xs font-medium ${referredUser.hasPosted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                                    {referredUser.hasPosted ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                    <span className="hidden xs:inline">Bài viết</span>
                                                    <span className="xs:hidden">📝</span>
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-xs font-medium ${referredUser.hasTakenQuiz ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                                    {referredUser.hasTakenQuiz ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                    <span className="hidden xs:inline">Bài tập</span>
                                                    <span className="xs:hidden">📚</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Xem thêm / Thu gọn */}
                                {referredUsers.length > 5 && (
                                    <button
                                        onClick={() => setShowAllReferred(!showAllReferred)}
                                        className="w-full mt-3 text-center text-xs sm:text-sm text-[var(--cn-primary)] hover:underline py-2"
                                    >
                                        {showAllReferred ? 'Thu gọn' : `Xem thêm ${referredUsers.length - 5} người`}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-8 sm:p-12 border-2 border-dashed border-[var(--cn-border)] text-center">
                                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-[var(--cn-bg-section)] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <UserPlus size={24} className="text-[var(--cn-text-muted)] sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-base sm:text-lg font-medium text-[var(--cn-text-main)] mb-1 sm:mb-2">Chưa có người đăng ký</h3>
                                <p className="text-xs sm:text-sm text-[var(--cn-text-muted)]">Chia sẻ link giới thiệu để bắt đầu nhận xu</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-8 sm:p-12 text-center border border-[var(--cn-border)]">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-[var(--cn-primary)] border-t-transparent mx-auto" />
                    </div>
                )
            ) : (
                <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-8 sm:p-12 text-center border border-[var(--cn-border)] max-w-md mx-auto">
                    <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-[var(--cn-bg-section)] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Gift size={24} className="text-[var(--cn-text-muted)] sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-[var(--cn-text-main)] mb-1 sm:mb-2">Đăng nhập để nhận link giới thiệu</h3>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mb-4 sm:mb-6">Đăng nhập để có link giới thiệu riêng và bắt đầu kiếm xu</p>
                    <a href="/login" className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-primary-hover)] transition text-sm">
                        Đăng nhập ngay
                    </a>
                </div>
            )}
        </div>
    );
}