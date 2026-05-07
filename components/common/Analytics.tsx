// components/common/Analytics.tsx
'use client';

import { User, UserCheck, TrendingUp, Eye, Shield, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

interface OnlineUser {
    userId: string;
    fullName: string;
    avatar?: string;
}

export default function Analytics({ today: propToday, guest: propGuest, online: propOnline, total: propTotal }: {
    today?: number;
    guest?: number;
    online?: number;
    total?: number;
}) {
    const { socket, isConnected, onlineUsers } = useSocket();
    const { user, token } = useAuthStore();
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0 });
    const [onlineStats, setOnlineStats] = useState({ users: 0, guests: 0 });
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const registeredRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const isAdmin = user?.role === 'admin';

    // Lấy hoặc tạo sessionId cho guest
    const getSessionId = () => {
        let sessionId = localStorage.getItem('guestSessionId');
        if (!sessionId) {
            sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('guestSessionId', sessionId);
        }
        return sessionId;
    };

    // Register với socket
    useEffect(() => {
        if (!socket || !isConnected) return;
        if (registeredRef.current) return;

        const sessionId = getSessionId();

        if (token && user?._id) {
            socket.emit('register', { userId: user._id, sessionId });
        } else {
            socket.emit('register', { sessionId });
        }

        registeredRef.current = true;
    }, [socket, isConnected, token, user?._id]);

    // Lắng nghe realtime online stats từ socket
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleOnlineStats = (data: { users: number; guests: number; total: number }) => {
            setOnlineStats({
                users: data.users || 0,
                guests: data.guests || 0
            });
        };

        socket.on('online_stats', handleOnlineStats);

        const pingInterval = setInterval(() => {
            if (socket && socket.connected) {
                socket.emit('ping');
            }
        }, 10000);

        return () => {
            socket.off('online_stats', handleOnlineStats);
            clearInterval(pingInterval);
        };
    }, [socket, isConnected]);

    // Khởi tạo data lần đầu và interval
    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            try {
                const [statsRes, onlineRes] = await Promise.all([
                    statisticApi.getPublicStats(),
                    statisticApi.getOnlineStats()
                ]);

                if (isMounted) {
                    if (statsRes.success) {
                        setStats(statsRes.data);
                    }
                    if (onlineRes && onlineRes.success) {
                        setOnlineStats(onlineRes.data);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadInitialData();

        intervalRef.current = setInterval(async () => {
            try {
                const statsRes = await statisticApi.getPublicStats();
                if (isMounted && statsRes.success) {
                    setStats(statsRes.data);
                }
            } catch (error) {
                console.error('Failed to refresh stats:', error);
            }
        }, 30000);

        return () => {
            isMounted = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const format = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    const today = propToday !== undefined ? propToday : stats.todayVisits;
    const total = propTotal !== undefined ? propTotal : stats.totalVisits;
    const guest = propGuest !== undefined ? propGuest : onlineStats.guests;
    const online = propOnline !== undefined ? propOnline : onlineStats.users;

    const items = [
        { label: 'Tổng lượt truy cập', value: total, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Hôm nay', value: today, icon: Eye, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Khách online', value: guest, icon: User, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'User online', value: online, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-50' }
    ];

    const getUserInitial = (name: string) => {
        return name?.charAt(0)?.toUpperCase() || 'U';
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#171717] border border-[#e6e6e6] dark:border-[#222] animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-16 sm:w-20 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-12 sm:w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isOnlineCard = item.label === 'User online';
                    return (
                        <div
                            key={item.label}
                            className={`group p-3 sm:p-4 rounded-xl bg-white dark:bg-[#171717] border border-[#e6e6e6] dark:border-[#222] flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${isOnlineCard && isAdmin ? 'cursor-pointer' : ''}`}
                            onClick={() => isOnlineCard && isAdmin && setShowPopup(true)}
                        >
                            <div>
                                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">{format(item.value)}</h4>
                            </div>
                            <div className={`p-1.5 sm:p-2 rounded-lg ${item.bg} group-hover:scale-105 transition-transform duration-200`}>
                                <Icon size={14} className={`sm:w-4 sm:h-4 ${item.color}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Popup hiển thị danh sách user online - chỉ admin mới thấy */}
            {isAdmin && showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPopup(false)}>
                    <div
                        className="bg-white dark:bg-[#171717] rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-purple-500" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Người dùng online ({onlineUsers.length})
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Danh sách user online */}
                        <div className="overflow-y-auto max-h-[60vh] p-2">
                            {onlineUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <UserCheck size={40} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Không có người dùng nào đang online</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {onlineUsers.map((onlineUser) => (
                                        <div
                                            key={onlineUser.userId}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            <div className="relative">
                                                {onlineUser.avatar ? (
                                                    <Image
                                                        src={onlineUser.avatar}
                                                        alt={onlineUser.fullName}
                                                        width={36}
                                                        height={36}
                                                        className="w-9 h-9 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                            {getUserInitial(onlineUser.fullName)}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5">
                                                    <span className="absolute inset-0 rounded-full bg-white dark:bg-gray-800" />
                                                    <span className="absolute inset-0.5 rounded-full bg-green-500" />
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {onlineUser.fullName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    ID: {onlineUser.userId.slice(-8)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Chỉ hiển thị với quản trị viên
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}