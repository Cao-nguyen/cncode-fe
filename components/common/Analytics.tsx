// components/common/Analytics.tsx
'use client';

import React, { useEffect, useState, useCallback } from "react";
import { User as UserIcon, UserCheck, TrendingUp, Eye, Shield, X, Monitor, Smartphone, Laptop } from "lucide-react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

// ========== INTERFACES ==========
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
    total: number;
}

interface VisitStatsData {
    totalVisits: number;
    todayVisits: number;
}

export default function Analytics() {
    const { socket, isConnected } = useSocket();
    const { user } = useAuthStore();

    const [stats, setStats] = useState<VisitStatsData>({ totalVisits: 0, todayVisits: 0 });
    const [onlineStats, setOnlineStats] = useState<OnlineStatsData>({ users: 0, guests: 0, total: 0 });
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

    const getDeviceIcon = (device: string): React.ReactNode => {
        const d = device.toLowerCase();
        if (d.includes('android') || d.includes('ios')) return <Smartphone size={14} className="text-[var(--cn-text-sub)]" />;
        if (d.includes('windows') || d.includes('mac')) return <Monitor size={14} className="text-[var(--cn-text-sub)]" />;
        return <Laptop size={14} className="text-[var(--cn-text-sub)]" />;
    };

    // Hàm đăng ký được tối ưu hóa
    const register = useCallback(() => {
        if (!socket || !isConnected) return;

        let sid = localStorage.getItem('guestSessionId');
        if (!sid) {
            sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('guestSessionId', sid);
        }

        console.log('📡 [Analytics] Registering with SID:', sid);
        socket.emit('register', {
            userId: user?._id,
            sessionId: sid,
            role: user?.role?.toUpperCase() || 'GUEST',
            device: getDeviceName()
        });
    }, [socket, isConnected, user?._id, user?.role]);

    // Đăng ký khi kết nối hoặc user thay đổi
    useEffect(() => {
        register();
    }, [register]);

    // Quản lý các sự kiện socket
    useEffect(() => {
        if (!socket || !isConnected) return;

        const heartbeat = setInterval(() => {
            socket.emit('heartbeat');
        }, 25000);

        socket.on('online_stats', (data: OnlineStatsData) => {
            console.log('📊 [Analytics] Stats:', data);
            setOnlineStats(data);
        });

        socket.on('online_users_list', (data: OnlineUser[]) => {
            console.log('👥 [Analytics] List length:', data.length);
            setOnlineUsersList(data);
        });

        // Tự động báo danh lại nếu server restart
        socket.on('connect', register);

        return () => {
            clearInterval(heartbeat);
            socket.off('online_stats');
            socket.off('online_users_list');
            socket.off('connect');
        };
    }, [socket, isConnected, register]);

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [sRes, oRes] = await Promise.all([
                    statisticApi.getPublicStats(),
                    statisticApi.getOnlineStats()
                ]);
                if (sRes.success) setStats(sRes.data);
                if (oRes.success) setOnlineStats(oRes.data);
            } catch (err) {
                console.error("Init Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const format = (n: number): string => new Intl.NumberFormat('vi-VN').format(n);

    if (loading) return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white border border-[var(--cn-border)] rounded-md" />)}
        </div>
    );

    return (
        <React.Fragment>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng truy cập', value: stats.totalVisits, icon: TrendingUp },
                    { label: 'Hôm nay', value: stats.todayVisits, icon: Eye },
                    { label: 'Khách online', value: onlineStats.guests, icon: UserIcon },
                    { label: 'User online', value: onlineStats.users, icon: UserCheck }
                ].map((item) => (
                    <div
                        key={item.label}
                        onClick={() => { if (item.label === 'User online' && isAdmin) setShowPopup(true) }}
                        className={`p-4 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] flex items-center justify-between transition-all duration-200 shadow-[var(--cn-shadow-sm)]
                            ${item.label === 'User online' && isAdmin ? 'cursor-pointer hover:border-[var(--cn-primary)] active:scale-95' : ''}`}
                    >
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-[var(--cn-text-sub)] uppercase tracking-tight">{item.label}</p>
                            <h4 className="text-lg font-bold text-[var(--cn-text-main)] mt-0.5">{format(item.value)}</h4>
                        </div>
                        <div className="p-2.5 bg-[var(--cn-primary-light)] rounded-[var(--cn-radius-sm)] flex items-center justify-center">
                            <item.icon size={20} className="text-[var(--cn-primary)]" />
                        </div>
                    </div>
                ))}
            </div>

            {isAdmin && showPopup && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPopup(false)}>
                    <div className="bg-white rounded-[var(--cn-radius-lg)] w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-[var(--cn-border)]" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-[var(--cn-border)] flex justify-between items-center bg-[var(--cn-bg-main)]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[var(--cn-primary-light)] rounded-full flex items-center justify-center">
                                    <Shield size={18} className="text-[var(--cn-primary)]" />
                                </div>
                                <h3 className="font-bold text-[var(--cn-text-main)] text-sm uppercase tracking-wide">
                                    Danh sách trực tuyến ({onlineUsersList.length})
                                </h3>
                            </div>
                            <button onClick={() => setShowPopup(false)} className="p-2 hover:bg-[var(--cn-hover)] rounded-full transition-colors text-[var(--cn-text-sub)]"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {onlineUsersList.length === 0 ? (
                                <div className="text-center py-12 text-[var(--cn-text-muted)] font-medium">Hiện tại không có thành viên nào online.</div>
                            ) : (
                                onlineUsersList.map((u, index) => (
                                    <div key={`${u.userId}-${index}`} className="flex items-center gap-4 p-3 border border-transparent hover:border-[var(--cn-border)] hover:bg-[var(--cn-bg-main)] rounded-[var(--cn-radius-md)] transition-all">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--cn-border)] bg-[var(--cn-bg-section)] shadow-sm">
                                                {u.avatar ? (
                                                    <Image src={u.avatar} alt={u.fullName} width={48} height={48} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[var(--cn-primary)] text-white font-bold text-lg uppercase">{u.fullName.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--cn-success)] border-2 border-white rounded-full" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[15px] font-bold text-[var(--cn-text-main)] truncate">{u.fullName}</p>
                                                <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black tracking-wider uppercase text-white ${u.role?.toUpperCase() === 'ADMIN' ? 'bg-[#EF4444]' :
                                                    u.role?.toUpperCase() === 'TEACHER' ? 'bg-[#3BA4E8]' :
                                                        'bg-[#64748B]'
                                                    }`}>
                                                    {u.role || 'USER'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1.5 text-[var(--cn-text-sub)] text-[12px] font-medium leading-none">
                                                    {getDeviceIcon(u.device)}
                                                    <span className="mt-0.5">{u.device}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 bg-[var(--cn-bg-section)] border-t border-[var(--cn-border)] text-center text-[10px] text-[var(--cn-text-muted)] font-bold uppercase tracking-widest">CNCODE ANALYTICS SYSTEM</div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}