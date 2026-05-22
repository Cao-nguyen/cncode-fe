'use client';

import React, { useState, useEffect } from "react";
import { User, UserCheck, TrendingUp, Eye, Shield, X, Monitor, Smartphone, Laptop, Activity } from "lucide-react";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import { statisticApi } from "@/lib/api/statistic.api";
import Image from "next/image";

interface OnlineUser {
    userId: string;
    fullName: string;
    avatar?: string;
    role?: string;
    device?: string;
}

interface OnlineStatsData {
    users: number;
    guests: number;
}

export default function Analytics() {
    const { socket, isConnected, onlineUsers } = useSocket();
    const { user } = useAuthStore();

    const [showPopup, setShowPopup] = useState(false);
    const [onlineStats, setOnlineStats] = useState<OnlineStatsData>({ users: 0, guests: 0 });
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0 });
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    // Lấy thống kê từ API
    useEffect(() => {
        const loadStats = async () => {
            try {
                const [publicRes, onlineRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/public/stats`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/online-stats`).then(r => r.json())
                ]);
                if (publicRes.success) setStats(publicRes.data);
                if (onlineRes.success) setOnlineStats(onlineRes.data);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    // Lắng nghe online_stats từ socket
    useEffect(() => {
        if (!socket) return;

        const handleOnlineStats = (data: OnlineStatsData) => {
            setOnlineStats({ users: data.users || 0, guests: data.guests || 0 });
        };

        socket.on('online_stats', handleOnlineStats);

        return () => {
            socket.off('online_stats', handleOnlineStats);
        };
    }, [socket]);

    const formatNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    const getDeviceIcon = (device?: string) => {
        if (!device) return <Laptop size={12} />;
        const d = device.toLowerCase();
        if (d.includes('android') || d.includes('ios')) return <Smartphone size={12} />;
        if (d.includes('windows') || d.includes('mac')) return <Monitor size={12} />;
        return <Laptop size={12} />;
    };

    const getUserInitial = (name: string) => {
        return name?.charAt(0)?.toUpperCase() || 'U';
    };

    const statsCards = [
        { label: 'Tổng truy cập', value: stats.totalVisits, icon: TrendingUp, color: '#3BA4E8', bg: '#E6F4FB' },
        { label: 'Hôm nay', value: stats.todayVisits, icon: Eye, color: '#22C55E', bg: '#F0FDF4' },
        { label: 'Khách online', value: onlineStats.guests, icon: User, color: '#F59E0B', bg: '#FFF7ED' },
        { label: 'User online', value: onlineStats.users, icon: UserCheck, color: '#8B5CF6', bg: '#F5F3FF' }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-white border border-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statsCards.map((item) => {
                    const Icon = item.icon;
                    const isUserCard = item.label === 'User online';

                    return (
                        <div
                            key={item.label}
                            onClick={() => isUserCard && isAdmin && setShowPopup(true)}
                            className={`p-4 bg-white border border-gray-200 rounded-lg transition-all hover:shadow-md
                                ${isUserCard && isAdmin ? 'cursor-pointer hover:border-blue-400' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        {item.label}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {formatNumber(item.value)}
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-lg" style={{ backgroundColor: item.bg }}>
                                    <Icon size={18} style={{ color: item.color }} />
                                </div>
                            </div>
                            {isUserCard && isAdmin && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-blue-500">
                                    <Activity size={10} />
                                    <span>Click để xem danh sách</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Popup danh sách user online */}
            {isAdmin && showPopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowPopup(false)}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Shield size={16} className="text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm">
                                        Người dùng trực tuyến
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {onlineUsers.length} người đang hoạt động
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Danh sách user */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {onlineUsers.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <UserCheck size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">Không có người dùng trực tuyến</p>
                                    {!isConnected && (
                                        <p className="text-xs text-red-400 mt-2">Đang kết nối lại...</p>
                                    )}
                                </div>
                            ) : (
                                onlineUsers.map((userItem, idx) => {
                                    const roleName = (userItem.role || 'USER').toUpperCase();
                                    const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
                                        ADMIN: { bg: '#FEF2F2', text: '#EF4444', label: 'ADMIN' },
                                        TEACHER: { bg: '#E6F4FB', text: '#3BA4E8', label: 'TEACHER' },
                                        USER: { bg: '#F1F5F9', text: '#64748B', label: 'USER' }
                                    };
                                    const config = roleConfig[roleName] || roleConfig.USER;

                                    return (
                                        <div
                                            key={userItem.userId || idx}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                                        >
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                                    {userItem.avatar ? (
                                                        <Image
                                                            src={userItem.avatar}
                                                            alt={userItem.fullName}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <span className="text-base font-bold text-blue-500">
                                                            {getUserInitial(userItem.fullName)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span
                                                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white"
                                                    style={{ backgroundColor: '#22C55E' }}
                                                />
                                            </div>

                                            {/* Thông tin */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                        {userItem.fullName}
                                                    </p>
                                                    <span
                                                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                                                        style={{ backgroundColor: config.bg, color: config.text }}
                                                    >
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                                                    {getDeviceIcon(userItem.device)}
                                                    <span className="text-[11px]">{userItem.device || 'Unknown'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-green-500" />
                                                    <span className="text-[10px] text-green-600">Online</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                                CNCODE ANALYTICS · DỮ LIỆU THỜI GIAN THỰC
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}