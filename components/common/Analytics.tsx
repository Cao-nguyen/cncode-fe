'use client';

import { User, UserCheck, TrendingUp, Eye, Shield, X, Smartphone, Monitor, Laptop } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

interface OnlineUser {
    userId: string;
    fullName: string;
    avatar?: string;
    role?: string;
    device?: string;
}

// 1. Khai báo hàm check thiết bị ở đây
const getDeviceInfo = () => {
    if (typeof window === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/windows/i.test(ua)) return 'Windows';
    if (/mac/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Web/Other';
};

const getDeviceIcon = (deviceStr?: string) => {
    if (!deviceStr) return <Monitor size={14} className="text-gray-400" />;
    const d = deviceStr.toLowerCase();
    if (d.includes('android') || d.includes('ios')) return <Smartphone size={14} className="text-green-500" />;
    if (d.includes('mac') || d.includes('windows')) return <Laptop size={14} className="text-blue-500" />;
    return <Monitor size={14} className="text-gray-400" />;
};

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
    const reconnectAttemptsRef = useRef(0);

    const isAdmin = user?.role === 'admin';

    const getSessionId = () => {
        let sessionId = localStorage.getItem('guestSessionId');
        if (!sessionId) {
            sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('guestSessionId', sessionId);
        }
        return sessionId;
    };

    // 2. Sửa lại hàm này: Bổ sung thêm device và role khi gửi emit('register')
    const registerWithSocket = useCallback(() => {
        if (!socket || !isConnected) {
            setTimeout(() => registerWithSocket(), 2000);
            return;
        }
        if (registeredRef.current) return;

        const sessionId = getSessionId();
        const device = getDeviceInfo(); // Lấy thông tin thiết bị

        if (token && user?._id) {
            // Đã bổ sung role và device ở đây
            socket.emit('register', { userId: user._id, sessionId, role: user.role, device });
            console.log('📡 Analytics registered user:', user._id);
        } else {
            // Đã bổ sung device ở đây
            socket.emit('register', { sessionId, device });
            console.log('📡 Analytics registered guest:', sessionId);
        }
        registeredRef.current = true;
        reconnectAttemptsRef.current = 0;
    }, [socket, isConnected, token, user?._id, user?.role]);

    // ==============================================
    // GIỮ NGUYÊN TOÀN BỘ PHẦN CODE CÒN LẠI BÊN DƯỚI
    // ==============================================

    useEffect(() => {
        if (socket && isConnected && !registeredRef.current) {
            registerWithSocket();
        }
    }, [socket, isConnected, registerWithSocket]);

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
        }, 15000);

        return () => {
            socket.off('online_stats', handleOnlineStats);
            clearInterval(pingInterval);
        };
    }, [socket, isConnected]);

    useEffect(() => {
        let isMounted = true;
        let retryCount = 0;

        const loadInitialData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));

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
                    retryCount = 0;
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
                if (isMounted && retryCount < 3) {
                    retryCount++;
                    setTimeout(loadInitialData, 2000 * retryCount);
                } else if (isMounted) {
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

            {isAdmin && showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPopup(false)}>
                    <div
                        className="bg-white dark:bg-[#171717] rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
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
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            <div className="flex items-center gap-3">
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
                                                        <span className="absolute inset-0 rounded-full bg-white dark:bg-[#171717]" />
                                                        <span className="absolute inset-0.5 rounded-full bg-green-500 animate-pulse" />
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {onlineUser.fullName}
                                                        </p>
                                                        {onlineUser.role && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${onlineUser.role === 'admin'
                                                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                                                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                                                }`}>
                                                                {onlineUser.role.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                        ID: {onlineUser.userId.slice(-8)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                                    {getDeviceIcon(onlineUser.device)}
                                                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                                                        {onlineUser.device || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

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