// components/common/Analytics.tsx
'use client';

import React, { useEffect, useState } from "react";
import { User as UserIcon, UserCheck, TrendingUp, Eye, Shield, X, Monitor, Smartphone } from "lucide-react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useSocket, type OnlineUser, type OnlineStatsPayload } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

interface VisitStats {
    totalVisits: number;
    todayVisits: number;
}

export default function Analytics(): React.ReactNode {
    const { socket, isConnected, onlineUsers } = useSocket();
    const { user } = useAuthStore();

    const [stats, setStats] = useState<VisitStats>({ totalVisits: 0, todayVisits: 0 });
    const [onlineCount, setOnlineCount] = useState<OnlineStatsPayload>({ users: 0, guests: 0 });
    const [showPopup, setShowPopup] = useState<boolean>(false);

    useEffect((): (() => void) | void => {
        if (!socket || !isConnected) return;

        const handleStats = (data: OnlineStatsPayload): void => {
            setOnlineCount(data);
        };

        socket.on('online_stats', handleStats);
        return () => { socket.off('online_stats', handleStats); };
    }, [socket, isConnected]);

    useEffect((): void => {
        const fetchInitial = async (): Promise<void> => {
            const res = await statisticApi.getPublicStats();
            if (res.success) setStats(res.data);
        };
        fetchInitial();
    }, []);

    const isAdmin: boolean = user?.role?.toLowerCase() === 'admin';
    const format = (n: number): string => new Intl.NumberFormat('vi-VN').format(n);

    return (
        <React.Fragment>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng truy cập', value: stats.totalVisits, icon: TrendingUp },
                    { label: 'Hôm nay', value: stats.todayVisits, icon: Eye },
                    { label: 'Khách online', value: onlineCount.guests, icon: UserIcon },
                    { label: 'User online', value: onlineCount.users, icon: UserCheck }
                ].map((item) => {
                    const isUserOnlineCard: boolean = item.label === 'User online';
                    return (
                        <div
                            key={item.label}
                            onClick={(): void => { if (isUserOnlineCard && isAdmin) setShowPopup(true); }}
                            className={`p-4 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] flex items-center justify-between transition-all duration-200 shadow-[var(--cn-shadow-sm)]
                                ${isUserOnlineCard && isAdmin ? 'cursor-pointer hover:border-[var(--cn-primary)] active:scale-95' : ''}`}
                        >
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium text-[var(--cn-text-sub)] uppercase tracking-tight">{item.label}</p>
                                <h4 className="text-lg font-bold text-[var(--cn-text-main)] mt-0.5">{format(item.value)}</h4>
                            </div>
                            <div className="p-2.5 bg-[var(--cn-primary-light)] rounded-[var(--cn-radius-sm)] flex items-center justify-center">
                                <item.icon size={20} className="text-[var(--cn-primary)]" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {isAdmin && showPopup && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 shadow-2xl" onClick={(): void => setShowPopup(false)}>
                    <div
                        className="bg-white rounded-[var(--cn-radius-lg)] w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-[var(--cn-border)]"
                        onClick={(e: React.MouseEvent): void => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[var(--cn-border)] flex justify-between items-center bg-[var(--cn-bg-main)]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[var(--cn-primary-light)] rounded-full flex items-center justify-center">
                                    <Shield size={18} className="text-[var(--cn-primary)]" />
                                </div>
                                <h3 className="font-bold text-[var(--cn-text-main)] text-sm uppercase tracking-wide">
                                    Danh sách trực tuyến ({onlineUsers.length})
                                </h3>
                            </div>
                            <button onClick={(): void => setShowPopup(false)} className="p-2 hover:bg-[var(--cn-hover)] rounded-full transition-colors text-[var(--cn-text-sub)]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {onlineUsers.length === 0 ? (
                                <div className="text-center py-12 text-[var(--cn-text-muted)] font-medium">Hiện tại không có thành viên nào online.</div>
                            ) : (
                                onlineUsers.map((u: OnlineUser, index: number) => (
                                    <div
                                        key={`${u.userId}-${index}`}
                                        className="flex items-center gap-4 p-3 border border-transparent hover:border-[var(--cn-border)] hover:bg-[var(--cn-bg-main)] rounded-[var(--cn-radius-md)] transition-all"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--cn-border)] bg-[var(--cn-bg-section)] shadow-sm">
                                                {u.avatar ? (
                                                    <Image src={u.avatar} alt={u.fullName} width={48} height={48} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[var(--cn-primary)] text-white font-bold text-lg uppercase">
                                                        {u.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--cn-success)] border-2 border-white rounded-full shadow-sm" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[15px] font-bold text-[var(--cn-text-main)] truncate">{u.fullName}</p>
                                                <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black tracking-wider uppercase text-white shadow-sm ${u.role?.toUpperCase() === 'ADMIN' ? 'bg-[#EF4444]' :
                                                    u.role?.toUpperCase() === 'TEACHER' ? 'bg-[#3BA4E8]' :
                                                        'bg-[#64748B]'
                                                    }`}>
                                                    {u.role || 'USER'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-[var(--cn-text-sub)] text-[12px] font-medium leading-none">
                                                {u.device.toLowerCase().includes('mobile') ? <Smartphone size={14} /> : <Monitor size={14} />}
                                                <span className="mt-0.5">{u.device}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 bg-[var(--cn-bg-section)] border-t border-[var(--cn-border)] text-center">
                            <p className="text-[10px] text-[var(--cn-text-muted)] font-bold uppercase tracking-[0.2em]">CNCODE ANALYTICS SYSTEM</p>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}