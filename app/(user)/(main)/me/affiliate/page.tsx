// app/(user)/(main)/affiliate/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, FileText, GraduationCap, Trophy, CheckCircle, XCircle, Gift, TrendingUp, Crown, Medal, Coins } from 'lucide-react';
import { CopyButton } from '@/components/common/CopyButton';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { toast } from 'sonner';
import Image from 'next/image';

interface ReferredUser {
    name: string;
    email: string;
    registeredAt: string;
    hasPosted: boolean;
    hasTakenQuiz: boolean;
    coinsEarned: number;
}

interface AffiliateData {
    code: string;
    link: string;
    clicks: number;
    totalRegistered: number;
    totalPosted: number;
    totalTakenQuiz: number;
    totalCoinsEarned: number;
    referredUsers: ReferredUser[];
}

interface LeaderboardUser {
    _id: string;
    totalRegistered: number;
    totalPosted: number;
    totalTakenQuiz: number;
    totalCoins: number;
    user: {
        fullName: string;
        avatar: string;
        username: string;
    };
}

const TOAST_MESSAGES: Record<string, string> = {
    new_registration: '🎉 Có người vừa đăng ký qua link của bạn!',
    post_created: '📝 Người được giới thiệu vừa đăng bài viết mới!',
    quiz_taken: '🎓 Người được giới thiệu vừa hoàn thành bài kiểm tra!',
    referred_user_deleted: '⚠️ Một người dùng được giới thiệu đã bị xóa khỏi hệ thống',
    user_deleted: '⚠️ Dữ liệu affiliate của bạn đã được cập nhật',
};

export default function AffiliatePage() {
    const { user, token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ─── Fetch functions ───────────────────────────────────────────
    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliate/leaderboard?limit=10`);
            const data = await res.json();
            if (data.success) setLeaderboard(data.data);
        } catch (error) {
            console.error('Fetch leaderboard error:', error);
        }
    }, []);

    const fetchMyAffiliate = useCallback(async () => {
        if (!token || !user) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliate/my-affiliate`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setAffiliate(data.data);
        } catch (error) {
            console.error('Fetch affiliate error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token, user]);

    // ─── Initial fetch ─────────────────────────────────────────────
    useEffect(() => {
        fetchLeaderboard();
        fetchMyAffiliate();
    }, [fetchLeaderboard, fetchMyAffiliate]);

    // ─── Socket: lắng nghe affiliate_updated (1 listener duy nhất) ─
    useEffect(() => {
        if (!socket || !isConnected || !user?._id) return;

        const handleAffiliateUpdated = (data: { type: string; targetName?: string; coinsEarned?: number }) => {
            console.log('📡 Affiliate updated:', data);

            // Re-fetch cả hai để đồng bộ
            fetchMyAffiliate();
            fetchLeaderboard();

            // Toast thông báo tương ứng
            const message = TOAST_MESSAGES[data.type];
            if (message) {
                const isError = data.type === 'referred_user_deleted' || data.type === 'user_deleted';
                if (isError) {
                    toast.warning(message);
                } else {
                    toast.success(message, {
                        description: data.coinsEarned ? `+${data.coinsEarned} xu` : undefined,
                    });
                }
            }
        };

        socket.on('affiliate_updated', handleAffiliateUpdated);
        return () => { socket.off('affiliate_updated', handleAffiliateUpdated); };
    }, [socket, isConnected, user?._id, fetchMyAffiliate, fetchLeaderboard]);

    // ─── Loading state ─────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-main border-t-transparent" />
            </div>
        );
    }

    const top3 = leaderboard.slice(0, 3);
    const restLeaderboard = leaderboard.slice(3);

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
            <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-main">Tiếp thị liên kết</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Chia sẻ link giới thiệu và nhận xu khi bạn bè hoàn thành nhiệm vụ
                </p>
            </div>

            {token && user ? (
                affiliate ? (
                    <>
                        {/* Link giới thiệu */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-main/10 flex items-center justify-center">
                                    <Gift size={18} className="text-main" />
                                </div>
                                <h2 className="font-semibold text-gray-900">Link giới thiệu của bạn</h2>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs sm:text-sm text-gray-600 break-all">{affiliate.link}</p>
                                </div>
                                <CopyButton text={affiliate.link} />
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                Mã giới thiệu:{' '}
                                <span className="font-mono font-semibold text-main">{affiliate.code}</span>
                            </p>
                        </div>

                        {/* Cơ chế thưởng */}
                        <div className="bg-gradient-to-r from-main/10 to-main/5 rounded-xl p-4 sm:p-6 border border-main/20">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-main" />
                                <h2 className="font-semibold text-gray-900">Cơ chế thưởng</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-center justify-between sm:flex-col sm:text-center p-3 bg-white rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-blue-500" />
                                        <span className="text-sm text-gray-600">Đăng ký mới</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Coins size={16} className="text-yellow-500" />
                                        <span className="font-bold text-main">+100 xu</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:text-center p-3 bg-white rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-green-500" />
                                        <span className="text-sm text-gray-600">Đăng bài viết</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Coins size={16} className="text-yellow-500" />
                                        <span className="font-bold text-main">+30 xu</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:text-center p-3 bg-white rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={16} className="text-purple-500" />
                                        <span className="text-sm text-gray-600">Làm bài tập</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Coins size={16} className="text-yellow-500" />
                                        <span className="font-bold text-main">+20 xu</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 text-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                                    <Users size={16} className="text-blue-500" />
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{affiliate.totalRegistered || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Lượt đăng ký</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 text-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                                    <FileText size={16} className="text-green-500" />
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{affiliate.totalPosted || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Bài viết</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 text-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                                    <GraduationCap size={16} className="text-purple-500" />
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{affiliate.totalTakenQuiz || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Bài tập</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 sm:p-4 border border-main/20 bg-main/5 text-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-main/20 flex items-center justify-center mx-auto mb-2">
                                    <Coins size={20} className="text-yellow-500" />
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-main">
                                    {affiliate.totalCoinsEarned?.toLocaleString() || 0}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Tổng xu</p>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        {leaderboard.length > 0 && (
                            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Trophy size={20} className="text-yellow-500" />
                                    <h2 className="font-semibold text-gray-900">Bảng xếp hạng - Top người giới thiệu</h2>
                                </div>

                                {/* Top 3 */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    {top3.map((item, idx) => {
                                        const rank = idx + 1;
                                        const rankColors: Record<number, string> = {
                                            1: 'from-yellow-400 to-yellow-600',
                                            2: 'from-gray-300 to-gray-500',
                                            3: 'from-amber-600 to-amber-800',
                                        };
                                        const rankIcons: Record<number, React.ReactNode> = {
                                            1: <Crown size={24} className="text-yellow-500" />,
                                            2: <Medal size={24} className="text-gray-400" />,
                                            3: <Medal size={24} className="text-amber-600" />,
                                        };

                                        return (
                                            <div key={item._id} className="text-center">
                                                <div className="relative inline-block mx-auto mb-3">
                                                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${rankColors[rank]} p-0.5 mx-auto`}>
                                                        <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                                            {item.user.avatar ? (
                                                                <Image
                                                                    src={item.user.avatar}
                                                                    alt={item.user.fullName}
                                                                    width={76}
                                                                    height={76}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-main">
                                                                    {item.user.fullName?.charAt(0) || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="absolute -top-2 -right-2">{rankIcons[rank]}</div>
                                                </div>
                                                <p className="font-semibold text-gray-900 text-sm">{item.user.fullName}</p>
                                                <p className="text-xs text-gray-400">@{item.user.username}</p>
                                                <p className="text-sm font-bold text-main mt-1">{item.totalRegistered} người</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Còn lại */}
                                {restLeaderboard.length > 0 && (
                                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                                        {restLeaderboard.map((item, idx) => (
                                            <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 text-sm font-bold text-gray-400">#{idx + 4}</span>
                                                    <div className="w-8 h-8 rounded-full bg-main/10 overflow-hidden">
                                                        {item.user.avatar ? (
                                                            <Image
                                                                src={item.user.avatar}
                                                                alt={item.user.fullName}
                                                                width={32}
                                                                height={32}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-main">
                                                                {item.user.fullName?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                                            {item.user.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">@{item.user.username}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-main">{item.totalRegistered} người</p>
                                                    <div className="flex items-center gap-1 justify-end">
                                                        <Coins size={12} className="text-yellow-500" />
                                                        <span className="text-xs text-gray-500">{item.totalCoins.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Danh sách người đã đăng ký */}
                        {affiliate.referredUsers && affiliate.referredUsers.length > 0 ? (
                            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                                <h2 className="font-semibold text-gray-900 mb-4">Danh sách người đã đăng ký</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[500px]">
                                        <thead className="bg-main/5">
                                            <tr>
                                                <th className="text-left p-3 font-semibold text-main">Người dùng</th>
                                                <th className="text-left p-3 font-semibold text-main">Email</th>
                                                <th className="text-center p-3 font-semibold text-main">Bài viết</th>
                                                <th className="text-center p-3 font-semibold text-main">Bài tập</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {affiliate.referredUsers.map((referredUser, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="p-3 font-medium text-gray-900">{referredUser.name}</td>
                                                    <td className="p-3 text-gray-500">{referredUser.email}</td>
                                                    <td className="p-3 text-center">
                                                        {referredUser.hasPosted ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                                <CheckCircle size={16} /> Đã làm
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-500">
                                                                <XCircle size={16} /> Chưa làm
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {referredUser.hasTakenQuiz ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                                <CheckCircle size={16} /> Đã làm
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-500">
                                                                <XCircle size={16} /> Chưa làm
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-8 sm:p-12 border-2 border-dashed border-gray-200 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <Users size={28} className="text-gray-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">Chưa có người đăng ký</h3>
                                <p className="text-xs sm:text-sm text-gray-500">Chia sẻ link giới thiệu để bắt đầu nhận xu</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Gift size={28} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500">Đang tải thông tin...</p>
                    </div>
                )
            ) : (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Gift size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Đăng nhập để nhận link giới thiệu</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Đăng nhập để có link giới thiệu riêng và bắt đầu kiếm xu
                    </p>
                    <a
                        href="/login"
                        className="inline-block px-6 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition"
                    >
                        Đăng nhập ngay
                    </a>
                </div>
            )}
        </div>
    );
}