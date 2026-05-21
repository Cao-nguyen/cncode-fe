// components/common/Analytics.tsx
'use client';

import React, { useEffect, useState, useCallback } from "react";
import { User as UserIcon, UserCheck, TrendingUp, Eye, Shield, X, Monitor, Smartphone, Laptop, Activity, CircleDot } from "lucide-react";
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

interface OnlineStatsData {
    users: number;
    guests: number;
}

interface VisitStatsData {
    totalVisits: number;
    todayVisits: number;
}

export default function Analytics() {
    const { socket, isConnected } = useSocket();
    const { user } = useAuthStore();

    const [stats, setStats] = useState<VisitStatsData>({ totalVisits: 0, todayVisits: 0 });
    const [onlineStats, setOnlineStats] = useState<OnlineStatsData>({ users: 0, guests: 0 });
    const [onlineUsersList, setOnlineUsersList] = useState<OnlineUser[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const isAdmin: boolean = user?.role?.toLowerCase() === 'admin';

    const getDeviceName = (): string => {
        if (typeof window === 'undefined') return "Unknown";
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return "Android";
        if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
        if (/windows/i.test(ua)) return "Windows";
        if (/macintosh/i.test(ua)) return "MacOS";
        return "Linux/Web";
    };

    const register = useCallback(() => {
        if (!socket || !isConnected) return;

        let sid = localStorage.getItem('guestSessionId');
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

    useEffect(() => {
        register();
    }, [register]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const heartbeatInterval = setInterval(() => {
            socket.emit('heartbeat');
        }, 30000);

        socket.on('online_stats', (data: OnlineStatsData) => {
            setOnlineStats(data);
        });

        socket.on('online_users_list', (data: OnlineUser[]) => {
            if (isAdmin) setOnlineUsersList(data);
        });

        socket.on('connect', register);

        return () => {
            clearInterval(heartbeatInterval);
            socket.off('online_stats');
            socket.off('online_users_list');
            socket.off('connect');
        };
    }, [socket, isConnected, isAdmin, register]);

    useEffect(() => {
        const initData = async () => {
            try {
                const [sRes, oRes] = await Promise.all([
                    statisticApi.getPublicStats(),
                    statisticApi.getOnlineStats()
                ]);
                if (sRes.success) setStats(sRes.data);
                if (oRes.success) setOnlineStats(oRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    const getDeviceIcon = (device: string): React.ReactNode => {
        const d = device.toLowerCase();
        if (d.includes('android') || d.includes('ios')) return <Smartphone size={12} />;
        if (d.includes('windows') || d.includes('mac')) return <Monitor size={12} />;
        return <Laptop size={12} />;
    };

    const formatNumber = (n: number): string => new Intl.NumberFormat('vi-VN').format(n);

    if (loading) return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] animate-pulse" />
            ))}
        </div>
    );

    return (
        <React.Fragment>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng truy cập', value: stats.totalVisits, icon: TrendingUp },
                    { label: 'Hôm nay', value: stats.todayVisits, icon: Eye },
                    { label: 'Khách online', value: onlineStats.guests, icon: UserIcon },
                    { label: 'User online', value: onlineStats.users, icon: UserCheck }
                ].map((item) => {
                    const isUserCard = item.label === 'User online';
                    return (
                        <div
                            key={item.label}
                            onClick={() => { if (isUserCard && isAdmin) setShowPopup(true); }}
                            className={`p-4 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] transition-all duration-200 shadow-[var(--cn-shadow-sm)]
                                ${isUserCard && isAdmin ? 'cursor-pointer hover:shadow-[var(--cn-shadow-md)] hover:border-[var(--cn-primary)]' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[var(--cn-text-muted)] uppercase tracking-wide">
                                        {item.label}
                                    </p>
                                    <p className="text-2xl font-bold text-[var(--cn-text-main)] mt-1">
                                        {formatNumber(item.value)}
                                    </p>
                                </div>
                                <div className="p-2.5 bg-[var(--cn-primary-light)] rounded-[var(--cn-radius-sm)]">
                                    <item.icon size={18} className="text-[var(--cn-primary)]" />
                                </div>
                            </div>
                            {isUserCard && isAdmin && (
                                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--cn-primary)]">
                                    <Activity size={10} />
                                    <span className="font-medium">Click để xem danh sách</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Online Users Popup */}
            {isAdmin && showPopup && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setShowPopup(false)}
                >
                    <div
                        className="bg-[var(--cn-bg-card)] rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-[var(--cn-shadow-lg)] animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--cn-border)] bg-gradient-to-r from-[var(--cn-primary-light)]/30 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-[var(--cn-primary-light)] rounded-full flex items-center justify-center">
                                        <Shield size={16} className="text-[var(--cn-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--cn-text-main)] text-sm">
                                            Người dùng trực tuyến
                                        </h3>
                                        <p className="text-[11px] text-[var(--cn-text-muted)]">
                                            {onlineUsersList.length} người đang hoạt động
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="p-1.5 hover:bg-[var(--cn-hover)] rounded-full transition-colors text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)]"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {onlineUsersList.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-14 h-14 bg-[var(--cn-bg-section)] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <UserIcon size={24} className="text-[var(--cn-text-muted)]" />
                                    </div>
                                    <p className="text-sm text-[var(--cn-text-muted)]">Không có người dùng trực tuyến</p>
                                </div>
                            ) : (
                                onlineUsersList.map((u, index) => {
                                    const roleUpper = u.role?.toUpperCase() || 'USER';
                                    const roleConfig = {
                                        ADMIN: { bg: '#FEF2F2', text: '#EF4444', label: 'ADMIN' },
                                        TEACHER: { bg: '#E6F4FB', text: '#3BA4E8', label: 'TEACHER' },
                                        USER: { bg: '#F1F5F9', text: '#64748B', label: 'USER' }
                                    };
                                    const config = roleConfig[roleUpper as keyof typeof roleConfig] || roleConfig.USER;

                                    return (
                                        <div
                                            key={`${u.userId}-${index}`}
                                            className="flex items-center gap-3 p-3 rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-hover)] transition-all duration-200 cursor-default"
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
                                                {/* Online dot */}
                                                <span
                                                    className="border-white border-2 absolute bottom-0 right-0 w-3 h-3 rounded-full shadow-sm"
                                                    style={{ backgroundColor: 'var(--cn-success)' }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-[var(--cn-text-main)] truncate">
                                                        {u.fullName || 'Người dùng'}
                                                    </p>
                                                    <span
                                                        className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wide"
                                                        style={{ backgroundColor: config.bg, color: config.text }}
                                                    >
                                                        {config.label}
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
                            <p className="text-[9px] text-[var(--cn-text-muted)] font-bold uppercase tracking-widest">
                                CNCODE ANALYTICS · DỮ LIỆU THỜI GIAN THỰC
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}