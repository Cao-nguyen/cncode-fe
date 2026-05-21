// components/common/Analytics.tsx
'use client';

import { User as UserIcon, UserCheck, TrendingUp, Eye, Shield, X, Monitor, Smartphone, Laptop, Activity, Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

interface OnlineUser {
    userId: string;
    fullName: string;
    avatar: string | null;
    role: string;
    device: string;
}

interface OnlineStats {
    users: number;
    guests: number;
}

interface VisitStats {
    totalVisits: number;
    todayVisits: number;
}

export default function Analytics() {
    const { socket, isConnected } = useSocket();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<VisitStats>({ totalVisits: 0, todayVisits: 0 });
    const [onlineStats, setOnlineStats] = useState<OnlineStats>({ users: 0, guests: 0 });
    const [onlineUsersList, setOnlineUsersList] = useState<OnlineUser[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const isAdmin: boolean = user?.role === 'admin';

    const getDeviceName = (): string => {
        const ua = typeof window !== 'undefined' ? navigator.userAgent : '';
        if (/android/i.test(ua)) return "Android";
        if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
        if (/windows/i.test(ua)) return "Windows";
        if (/macintosh/i.test(ua)) return "MacOS";
        return "Linux/Web";
    };

    const register = useCallback((): void => {
        if (!socket || !isConnected) return;

        let sid: string | null = localStorage.getItem('guestSessionId');
        if (!sid) {
            sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('guestSessionId', sid);
        }

        socket.emit('register', {
            userId: user?._id,
            sessionId: sid,
            role: user?.role?.toUpperCase() || 'GUEST',
            device: getDeviceName()
        });
    }, [socket, isConnected, user?._id, user?.role]);

    useEffect((): void => {
        register();
    }, [register]);

    useEffect((): (() => void) | void => {
        if (!socket || !isConnected) return;

        socket.on('online_stats', (data: OnlineStats): void => {
            setOnlineStats(data);
        });

        socket.on('online_users_list', (data: OnlineUser[]): void => {
            if (user?.role === 'admin') {
                setOnlineUsersList(data);
            }
        });

        return (): void => {
            socket.off('online_stats');
            socket.off('online_users_list');
        };
    }, [socket, isConnected, user?.role]);

    useEffect((): void => {
        const initData = async (): Promise<void> => {
            try {
                const [sRes, oRes] = await Promise.all([
                    statisticApi.getPublicStats(),
                    statisticApi.getOnlineStats()
                ]);
                if (sRes.success) setStats(sRes.data);
                if (oRes.success) setOnlineStats(oRes.data);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    const format = (n: number): string => new Intl.NumberFormat('vi-VN').format(n);

    const getDeviceIcon = (device: string) => {
        const d = device.toLowerCase();
        if (d.includes('android') || d.includes('ios')) return <Smartphone size={12} />;
        if (d.includes('windows') || d.includes('mac')) return <Monitor size={12} />;
        return <Laptop size={12} />;
    };

    const statsCards = [
        { label: 'Tổng truy cập', value: stats.totalVisits, icon: TrendingUp, color: '#3BA4E8', bg: '#E6F4FB' },
        { label: 'Hôm nay', value: stats.todayVisits, icon: Eye, color: '#22C55E', bg: '#F0FDF4' },
        { label: 'Khách online', value: onlineStats.guests, icon: UserIcon, color: '#F59E0B', bg: '#FFF7ED' },
        { label: 'User online', value: onlineStats.users, icon: UserCheck, color: '#8B5CF6', bg: '#F5F3FF' },
    ];

    if (loading) return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] animate-pulse" />
            ))}
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {statsCards.map((item) => (
                    <div
                        key={item.label}
                        onClick={(): void => { if (item.label === 'User online' && isAdmin) setShowPopup(true) }}
                        className={`group p-4 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] transition-all duration-200 shadow-[var(--cn-shadow-sm)] hover:shadow-[var(--cn-shadow-md)]
                            ${item.label === 'User online' && isAdmin ? 'cursor-pointer hover:border-[var(--cn-primary)]' : ''}`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[var(--cn-text-muted)] uppercase tracking-wider">
                                    {item.label}
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-[var(--cn-text-main)] mt-1">
                                    {format(item.value)}
                                </p>
                            </div>
                            <div
                                className="p-2 rounded-[var(--cn-radius-sm)] transition-all duration-200 group-hover:scale-105"
                                style={{ backgroundColor: item.bg }}
                            >
                                <item.icon size={18} style={{ color: item.color }} />
                            </div>
                        </div>
                        {item.label === 'User online' && isAdmin && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--cn-text-muted)]">
                                <Activity size={10} />
                                <span>Click để xem danh sách</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Admin Popup */}
            {isAdmin && showPopup && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
                    onClick={(): void => setShowPopup(false)}
                >
                    <div
                        className="bg-[var(--cn-bg-card)] rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-[var(--cn-shadow-lg)] border border-[var(--cn-border)] animate-slideUp"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--cn-border)] flex justify-between items-center bg-gradient-to-r from-[var(--cn-primary)]/5 to-transparent">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[var(--cn-primary-light)] rounded-full flex items-center justify-center">
                                    <Users size={16} className="text-[var(--cn-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--cn-text-main)] text-sm">
                                        Người dùng trực tuyến
                                    </h3>
                                    <p className="text-[10px] text-[var(--cn-text-muted)]">
                                        {onlineUsersList.length} người đang hoạt động
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(): void => setShowPopup(false)}
                                className="p-2 hover:bg-[var(--cn-hover)] rounded-full transition-colors text-[var(--cn-text-muted)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {onlineUsersList.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 rounded-full bg-[var(--cn-bg-section)] flex items-center justify-center mx-auto mb-3">
                                        <Users size={24} className="text-[var(--cn-text-muted)]" />
                                    </div>
                                    <p className="text-sm text-[var(--cn-text-muted)]">Không có người dùng nào trực tuyến</p>
                                </div>
                            ) : (
                                onlineUsersList.map((u: OnlineUser, index: number) => {
                                    const roleName = u.role ? u.role.toUpperCase() : 'USER';
                                    const roleColor = roleName === 'ADMIN' ? '#EF4444' : roleName === 'TEACHER' ? '#3BA4E8' : '#64748B';
                                    const roleBg = roleName === 'ADMIN' ? '#FEF2F2' : roleName === 'TEACHER' ? '#E6F4FB' : '#F1F5F9';

                                    return (
                                        <div
                                            key={`${u.userId}-${index}`}
                                            className="flex items-center gap-3 p-3 rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-hover)] transition-all duration-200"
                                        >
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[var(--cn-primary)]/20 to-[var(--cn-primary)]/5 flex items-center justify-center">
                                                    {u.avatar ? (
                                                        <Image src={u.avatar} alt={u.fullName} width={40} height={40} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <span className="text-base font-bold text-[var(--cn-primary)]">
                                                            {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* ONLINE DOT - FIXED VERSION */}
                                                <span
                                                    className="border-2 border-white absolute -bottom-0.5 -right-1 w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: 'var(--cn-success)' }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-[var(--cn-text-main)] truncate">
                                                        {u.fullName}
                                                    </p>
                                                    <span
                                                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                                                        style={{ backgroundColor: roleBg, color: roleColor }}
                                                    >
                                                        {roleName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 text-[var(--cn-text-muted)]">
                                                    {getDeviceIcon(u.device)}
                                                    <span className="text-[11px]">{u.device}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-[var(--cn-bg-section)] border-t border-[var(--cn-border)] text-center">
                            <p className="text-[9px] text-[var(--cn-text-muted)] font-medium uppercase tracking-wider">
                                DỮ LIỆU THỜI GIAN THỰC
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}