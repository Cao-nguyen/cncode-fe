'use client';

import { useState, useEffect } from "react";
import { User, UserCheck, TrendingUp, Eye, Shield, X, Monitor, Smartphone, Laptop, Activity, MapPin, Globe } from "lucide-react";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import { statisticApi } from "@/lib/api/statistic.api";
import Image from "next/image";

interface OnlineStatsData {
    users: number;
    guests: number;
    totalVisits?: number;
    todayVisits?: number;
}

interface GuestInfo {
    sessionId: string;
    device: string;
    ip: string;
    location: string;
    firstSeen: number;
    lastActive: number;
}

const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
};

export default function Analytics() {
    const { socket, isConnected, onlineUsers } = useSocket();
    const { user } = useAuthStore();

    const [showUsersPopup, setShowUsersPopup] = useState(false);
    const [showGuestsPopup, setShowGuestsPopup] = useState(false);
    const [onlineStats, setOnlineStats] = useState<OnlineStatsData>({ users: 0, guests: 0 });
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0 });
    const [guests, setGuests] = useState<GuestInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [publicData, onlineData] = await Promise.all([
                    statisticApi.getPublicStats(),
                    statisticApi.getOnlineStats()
                ]);

                if (publicData.success) setStats(publicData.data);
                if (onlineData.success) setOnlineStats(onlineData.data);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        const trackVisit = async () => {
            const sessionId = getSessionId();
            if (!sessionId) return;

            const lastTracked = localStorage.getItem('lastVisitTracked');
            const today = new Date().toISOString().split('T')[0];

            if (lastTracked === today) return;

            try {
                const result = await statisticApi.trackVisit(sessionId, user?._id);
                if (result.success && result.tracked) {
                    localStorage.setItem('lastVisitTracked', today);
                    const updatedStats = await statisticApi.getPublicStats();
                    if (updatedStats.success) setStats(updatedStats.data);
                }
            } catch (error) {
                console.error('Error tracking visit:', error);
            }
        };

        trackVisit();
    }, [user?._id]);

    useEffect(() => {
        if (!socket) return;

        const handleOnlineStats = (data: OnlineStatsData) => {
            setOnlineStats({ users: data.users || 0, guests: data.guests || 0 });

            if (data.totalVisits !== undefined && data.todayVisits !== undefined) {
                setStats({
                    totalVisits: data.totalVisits,
                    todayVisits: data.todayVisits
                });
            }
        };

        socket.on('online_stats', handleOnlineStats);

        return () => {
            socket.off('online_stats', handleOnlineStats);
        };
    }, [socket]);

    const loadGuests = async () => {
        if (!isAdmin) return;
        try {
            const result = await statisticApi.getOnlineGuests();
            if (result.success) {
                setGuests(result.data);
            }
        } catch (error) {
            console.error('Error loading guests:', error);
        }
    };

    const formatNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return `${Math.floor(hours / 24)} ngày trước`;
    };

    const getDeviceIcon = (device?: string) => {
        if (!device) return <Laptop size={12} />;
        const d = device.toLowerCase();
        if (d.includes('mobile') || d.includes('android') || d.includes('ios') || d.includes('iphone') || d.includes('ipad')) return <Smartphone size={12} />;
        if (d.includes('desktop') || d.includes('windows') || d.includes('mac') || d.includes('linux')) return <Monitor size={12} />;
        return <Laptop size={12} />;
    };

    const getUserInitial = (name: string) => {
        return name?.charAt(0)?.toUpperCase() || 'U';
    };

    const statsCards = [
        { label: 'Tổng truy cập', value: stats.totalVisits, icon: TrendingUp, color: '#3BA4E8', bg: '#E6F4FB', onClick: null },
        { label: 'Hôm nay', value: stats.todayVisits, icon: Eye, color: '#22C55E', bg: '#F0FDF4', onClick: null },
        {
            label: 'Khách online',
            value: onlineStats.guests,
            icon: User,
            color: '#F59E0B',
            bg: '#FFF7ED',
            onClick: isAdmin ? () => {
                loadGuests();
                setShowGuestsPopup(true);
            } : null
        },
        {
            label: 'User online',
            value: onlineStats.users,
            icon: UserCheck,
            color: '#8B5CF6',
            bg: '#F5F3FF',
            onClick: isAdmin ? () => setShowUsersPopup(true) : null
        }
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
                    const isClickable = item.onClick !== null;

                    return (
                        <div
                            key={item.label}
                            onClick={item.onClick || undefined}
                            className={`p-4 bg-white border border-gray-200 rounded-lg transition-all hover:shadow-md
                                ${isClickable ? 'cursor-pointer hover:border-blue-400' : ''}`}
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
                            {isClickable && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-blue-500">
                                    <Activity size={10} />
                                    <span>Click để xem danh sách</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isAdmin && showUsersPopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowUsersPopup(false)}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
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
                                onClick={() => setShowUsersPopup(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

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
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                                CNCODE ANALYTICS · DỮ LIỆU THỜI GIAN THỰC
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isAdmin && showGuestsPopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowGuestsPopup(false)}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm">
                                        Khách viếng thăm
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {guests.length} khách đang trực tuyến
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGuestsPopup(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {guests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">Không có khách trực tuyến</p>
                                </div>
                            ) : (
                                guests.map((guest, idx) => (
                                    <div
                                        key={guest.sessionId || idx}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-100"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                                <User size={18} className="text-orange-500" />
                                            </div>
                                            <span
                                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white bg-green-500"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Khách #{idx + 1}
                                                </p>
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-50 text-orange-600">
                                                    GUEST
                                                </span>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    {getDeviceIcon(guest.device)}
                                                    <span className="font-medium">Thiết bị:</span>
                                                    <span className="text-gray-500">{guest.device}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Globe size={12} />
                                                    <span className="font-medium">IP:</span>
                                                    <span className="text-gray-500 font-mono">{guest.ip}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <MapPin size={12} />
                                                    <span className="font-medium">Vị trí:</span>
                                                    <span className="text-gray-500">{guest.location}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                                                    <Activity size={10} />
                                                    <span>Hoạt động: {formatTime(guest.lastActive)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                                CNCODE ANALYTICS · THÔNG TIN CHI TIẾT KHÁCH TRUY CẬP
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}