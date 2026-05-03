// app/(user)/(main)/affiliate/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, FileText, GraduationCap, Trophy, CheckCircle, XCircle, Gift, TrendingUp, Crown, Medal, Coins, Copy, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { affiliateApi } from '@/lib/api/affiliate.api';
import { toast } from 'sonner';
import Image from 'next/image';
import type { IMyAffiliateInfo, ILeaderboardUser } from '@/types/affiliate.type';

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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-main text-white text-xs font-medium shrink-0 transition hover:bg-main/80"
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

    // Keep latest token/user accessible inside async callbacks without re-running effects
    const tokenRef = useRef(token);
    const userRef = useRef(user);
    useEffect(() => { tokenRef.current = token; }, [token]);
    useEffect(() => { userRef.current = user; }, [user]);

    // Stable ref for the refresh function used by the socket handler
    const refreshAll = useRef(async () => {
        const lbResult = await affiliateApi.getLeaderboard(10);
        if (lbResult.success && lbResult.data) setLeaderboard(lbResult.data);

        if (!tokenRef.current) return;
        const affResult = await affiliateApi.getMyInfo(tokenRef.current);
        if (affResult.success && affResult.data) setAffiliate(affResult.data);
    });

    // Initial load — async function defined and called inside the effect
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty — runs once on mount

    // Socket subscription — setState only called inside the async callback, never synchronously
    useEffect(() => {
        if (!socket || !isConnected || !user?._id) return;

        const handleAffiliateUpdated = (data: { type: string; coinsEarned?: number }) => {
            // refreshAll is async — setState calls happen inside the promise, not synchronously
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
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-main border-t-transparent" />
            </div>
        );
    }

    const top3 = leaderboard.slice(0, 3);
    const restLeaderboard = leaderboard.slice(3);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-main">Tiếp thị liên kết</h1>
                <p className="text-sm text-gray-500 mt-2">
                    Chia sẻ link giới thiệu và nhận xu khi bạn bè hoàn thành nhiệm vụ
                </p>
            </div>

            {token && user ? (
                affiliate ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cột trái - Link và thống kê */}
                        <div className="lg:col-span-1 space-y-5">
                            {/* Link giới thiệu */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-main/10 flex items-center justify-center">
                                        <Gift size={18} className="text-main" />
                                    </div>
                                    <h2 className="font-semibold text-gray-900">Link giới thiệu</h2>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-600 break-all">{affiliate.link}</p>
                                    </div>
                                    <CopyButton text={affiliate.link} />
                                </div>
                                <p className="text-xs text-gray-400 mt-3">
                                    Mã: <span className="font-mono font-semibold text-main">{affiliate.code}</span>
                                </p>
                            </div>

                            {/* Cơ chế thưởng */}
                            <div className="bg-gradient-to-r from-main/10 to-main/5 rounded-xl p-5 border border-main/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp size={18} className="text-main" />
                                    <h2 className="font-semibold text-gray-900">Cơ chế thưởng</h2>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { icon: <Users size={16} className="text-blue-500" />, label: 'Đăng ký mới', reward: '+100 xu' },
                                        { icon: <FileText size={16} className="text-green-500" />, label: 'Đăng bài viết', reward: '+30 xu' },
                                        { icon: <GraduationCap size={16} className="text-purple-500" />, label: 'Làm bài tập', reward: '+20 xu' },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium text-gray-700">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Coins size={16} className="text-yellow-500" />
                                                <span className="font-bold text-main">{item.reward}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cột phải - Thống kê và bảng xếp hạng */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { icon: <Users size={20} className="text-blue-500" />, bg: 'bg-blue-100', value: affiliate.totalRegistered || 0, label: 'Lượt đăng ký' },
                                    { icon: <FileText size={20} className="text-green-500" />, bg: 'bg-green-100', value: affiliate.totalPosted || 0, label: 'Bài viết' },
                                    { icon: <GraduationCap size={20} className="text-purple-500" />, bg: 'bg-purple-100', value: affiliate.totalTakenQuiz || 0, label: 'Bài tập' },
                                    { icon: <Coins size={20} className="text-yellow-500" />, bg: 'bg-yellow-100', value: affiliate.totalCoinsEarned?.toLocaleString() || 0, label: 'Tổng xu' },
                                ].map((s) => (
                                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 text-center transition-all hover:shadow-md">
                                        <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                                            {s.icon}
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Leaderboard */}
                            {leaderboard.length > 0 && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Trophy size={22} className="text-yellow-500" />
                                        <h2 className="text-lg font-semibold text-gray-900">Bảng xếp hạng</h2>
                                    </div>

                                    {/* Top 3 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                        {top3.map((item, idx) => {
                                            const rank = idx + 1;
                                            const rankColors: Record<number, string> = {
                                                1: 'from-yellow-400 to-yellow-600 ring-yellow-500',
                                                2: 'from-gray-300 to-gray-500 ring-gray-400',
                                                3: 'from-amber-500 to-amber-700 ring-amber-600',
                                            };
                                            const rankIcons: Record<number, React.ReactNode> = {
                                                1: <Crown size={28} className="text-yellow-500" />,
                                                2: <Medal size={28} className="text-gray-400" />,
                                                3: <Medal size={28} className="text-amber-600" />,
                                            };
                                            return (
                                                <div key={item._id} className="flex flex-col items-center text-center">
                                                    <div className="relative mb-3">
                                                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${rankColors[rank]} p-1 ring-2 ${rankColors[rank].split(' ')[2]} mx-auto`}>
                                                            <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                                                {item.user.avatar ? (
                                                                    <Image src={item.user.avatar} alt={item.user.fullName} width={94} height={94} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-main">
                                                                        {item.user.fullName?.charAt(0) || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="absolute -top-2 -right-2">{rankIcons[rank]}</div>
                                                    </div>
                                                    <p className="font-semibold text-gray-900">{item.user.fullName}</p>
                                                    <p className="text-xs text-gray-400">@{item.user.username}</p>
                                                    <p className="text-sm font-bold text-main mt-2">{item.totalRegistered} người</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Coins size={14} className="text-yellow-500" />
                                                        <span className="text-xs text-gray-500">{item.totalCoins.toLocaleString()} xu</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Còn lại */}
                                    {restLeaderboard.length > 0 && (
                                        <div className="space-y-2 pt-4 border-t border-gray-100">
                                            {restLeaderboard.map((item, idx) => (
                                                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-7 text-sm font-bold text-gray-400">#{idx + 4}</span>
                                                        <div className="w-10 h-10 rounded-full bg-main/10 overflow-hidden">
                                                            {item.user.avatar ? (
                                                                <Image src={item.user.avatar} alt={item.user.fullName} width={40} height={40} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-main">
                                                                    {item.user.fullName?.charAt(0) || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.user.fullName}</p>
                                                            <p className="text-xs text-gray-400">@{item.user.username}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-main">{item.totalRegistered} người</p>
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
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        📋 Danh sách người đã đăng ký ({affiliate.referredUsers.length})
                                    </h2>
                                    <div className="space-y-2">
                                        {affiliate.referredUsers.map((referredUser, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-sm font-bold text-main">
                                                        {referredUser.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{referredUser.name}</p>
                                                        <p className="text-xs text-gray-400">{referredUser.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${referredUser.hasPosted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                                        {referredUser.hasPosted ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                        <span>Bài viết</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${referredUser.hasTakenQuiz ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                                        {referredUser.hasTakenQuiz ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                        <span>Bài tập</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-200 text-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <Users size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có người đăng ký</h3>
                                    <p className="text-sm text-gray-500">Chia sẻ link giới thiệu để bắt đầu nhận xu</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-main border-t-transparent mx-auto" />
                    </div>
                )
            ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200 max-w-md mx-auto">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Gift size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Đăng nhập để nhận link giới thiệu</h3>
                    <p className="text-sm text-gray-500 mb-6">Đăng nhập để có link giới thiệu riêng và bắt đầu kiếm xu</p>
                    <a href="/login" className="inline-block px-6 py-2.5 bg-main text-white rounded-lg hover:bg-main/80 transition">
                        Đăng nhập ngay
                    </a>
                </div>
            )}
        </div>
    );
}