'use client';

import { useState, useEffect } from "react";
import { TrendingUp, Eye, User, UserCheck } from "lucide-react";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import { statisticApi } from "@/lib/api/statistic.api";
import UsersPopup from "./analytics/UsersPopup";
import GuestsPopup from "./analytics/GuestsPopup";
import { getSessionId, shouldTrackVisit, markVisitTracked } from "@/lib/utils/session";

interface OnlineUser {
    userId?: string;
    fullName: string;
    avatar?: string;
    role?: string;
    device?: string;
}

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

interface StatsData {
    totalVisits: number;
    todayVisits: number;
}

export default function Analytics() {
    const { socket, isConnected, onlineUsers: socketOnlineUsers } = useSocket();
    const { user } = useAuthStore();

    const [showUsersPopup, setShowUsersPopup] = useState<boolean>(false);
    const [showGuestsPopup, setShowGuestsPopup] = useState<boolean>(false);
    const [onlineStats, setOnlineStats] = useState<OnlineStatsData>({ users: 0, guests: 0 });
    const [stats, setStats] = useState<StatsData>({ totalVisits: 0, todayVisits: 0 });
    const [guests, setGuests] = useState<GuestInfo[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const sessionId = getSessionId();

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
            const currentSessionId = getSessionId();
            if (!currentSessionId || !shouldTrackVisit()) return;

            try {
                const result = await statisticApi.trackVisit(currentSessionId, user?._id);
                if (result.success && result.tracked) {
                    markVisitTracked();
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
        if (!socket || !isConnected) return;

        if (user?._id) {
            socket.emit('register', { userId: user._id });
        } else if (sessionId) {
            socket.emit('register', { sessionId });
        }

        socket.emit('request_online_users');

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
    }, [socket, isConnected, user?._id, sessionId]);

    useEffect(() => {
        if (socketOnlineUsers) {
            setOnlineStats(prev => ({ ...prev, users: socketOnlineUsers.length }));
            setOnlineUsers(socketOnlineUsers as OnlineUser[]);
        } else {
            setOnlineUsers([]);
            setOnlineStats(prev => ({ ...prev, users: 0 }));
        }
    }, [socketOnlineUsers]);

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

    if (loading) {
        return (
            <div className="w-full h-24 sm:h-14 bg-gray-50/50 border border-gray-100 rounded-xl animate-pulse" />
        );
    }

    return (
        <div className="w-full">
            {/* Wrapper chính: Trên mobile là dạng block dọc, trên laptop (sm trở lên) biến thành 1 div ngang gọn gàng */}
            <div className="w-full bg-white/70 backdrop-blur-md border border-gray-100 rounded-lg p-3 shadow-sm transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                {/* Góc trái: Tiêu đề Thống kê truy cập (Mobile căn giữa, Laptop nằm bên trái) */}
                <div className="flex items-center gap-2.5 justify-center sm:justify-start pl-1 border-b border-gray-50 pb-2 sm:pb-0 sm:border-0">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Thống kê truy cập</span>
                    </div>
                </div>

                {/* Khu vực số liệu: Trên mobile tự động chuyển thành Grid 2 cột x 2 hàng, Trên laptop chuyển thành Flex-row nằm ngang */}
                <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end gap-2 sm:gap-3 text-xs">

                    {/* Block 1: Tổng truy cập */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:py-1.5 bg-gray-50 rounded-xl border border-gray-100/60 w-full sm:w-auto">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                        <span className="text-gray-500">Tổng:</span>
                        <strong className="text-gray-800 font-bold">{stats.totalVisits.toLocaleString()}</strong>
                    </div>

                    {/* Block 2: Hôm nay */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:py-1.5 bg-gray-50 rounded-xl border border-gray-100/60 w-full sm:w-auto">
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-gray-500">Hôm nay:</span>
                        <strong className="text-gray-800 font-bold">{stats.todayVisits.toLocaleString()}</strong>
                    </div>

                    {/* Block 3: Khách Online */}
                    <button
                        disabled={!isAdmin}
                        onClick={() => {
                            loadGuests();
                            setShowGuestsPopup(true);
                        }}
                        className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:py-1.5 rounded-xl border transition-all duration-200 w-full sm:w-auto ${isAdmin
                            ? 'bg-amber-50/60 border-amber-100/80 text-amber-800 hover:bg-amber-100/80 active:scale-95 cursor-pointer'
                            : 'bg-gray-50 border-gray-100 text-gray-700 cursor-default'
                            }`}
                    >
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>Khách:</span>
                        <strong className="font-bold">{onlineStats.guests}</strong>
                    </button>

                    {/* Block 4: User Online */}
                    <button
                        disabled={!isAdmin}
                        onClick={() => setShowUsersPopup(true)}
                        className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:py-1.5 rounded-xl border transition-all duration-200 w-full sm:w-auto ${isAdmin
                            ? 'bg-purple-50/60 border-purple-100/80 text-purple-800 hover:bg-purple-100/80 active:scale-95 cursor-pointer'
                            : 'bg-gray-50 border-gray-100 text-gray-700 cursor-default'
                            }`}
                    >
                        <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                        <span>User:</span>
                        <strong className="font-bold">{onlineStats.users}</strong>
                    </button>

                </div>
            </div>

            {/* Các popup giữ nguyên tính năng tương tác */}
            <UsersPopup
                isOpen={showUsersPopup}
                onClose={() => setShowUsersPopup(false)}
                users={onlineUsers}
                isConnected={isConnected}
            />

            <GuestsPopup
                isOpen={showGuestsPopup}
                onClose={() => setShowGuestsPopup(false)}
                guests={guests}
            />
        </div>
    );
}