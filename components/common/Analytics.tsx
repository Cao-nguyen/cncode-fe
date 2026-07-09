'use client';

import { useState, useEffect } from "react";
import { TrendingUp, Eye, User, UserCheck } from "lucide-react";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import { statisticApi } from "@/lib/api/statistic.api";
import StatsCard from "./analytics/StatsCard";
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

export default function Analytics() {
    const { socket, isConnected, onlineUsers: socketOnlineUsers } = useSocket();
    const { user } = useAuthStore();

    const [showUsersPopup, setShowUsersPopup] = useState(false);
    const [showGuestsPopup, setShowGuestsPopup] = useState(false);
    const [onlineStats, setOnlineStats] = useState<OnlineStatsData>({ users: 0, guests: 0 });
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0 });
    const [guests, setGuests] = useState<GuestInfo[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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
            const sessionId = getSessionId();
            if (!sessionId || !shouldTrackVisit()) return;

            try {
                const result = await statisticApi.trackVisit(sessionId, user?._id);
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
        console.log('[ANALYTICS] Socket state check:', { socket: !!socket, isConnected });
        if (!socket || !isConnected) {
            console.log('[ANALYTICS] Socket not connected, skipping event registration');
            return;
        }

        // Register with analytics service to be tracked as online user
        if (user?._id) {
            console.log('[ANALYTICS] Registering user with analytics service:', user._id);
            socket.emit('register', { userId: user._id });
        } else if (sessionId) {
            console.log('[ANALYTICS] Registering guest with analytics service:', sessionId);
            socket.emit('register', { sessionId });
        }

        // Request current online users list
        socket.emit('request_online_users');

        const handleOnlineStats = (data: OnlineStatsData) => {
            console.log('[ANALYTICS] Received online_stats:', data);
            setOnlineStats({ users: data.users || 0, guests: data.guests || 0 });

            if (data.totalVisits !== undefined && data.todayVisits !== undefined) {
                setStats({
                    totalVisits: data.totalVisits,
                    todayVisits: data.todayVisits
                });
            }
        };

        const handleOnlineUsers = (data: { users: OnlineUser[] }) => {
            console.log('[ANALYTICS] Received online_users:', data);
            setOnlineStats(prev => ({ ...prev, users: data.users?.length || 0 }));
            setOnlineUsers(data.users || []);
        };

        console.log('[ANALYTICS] Registering socket listeners: online_stats, online_users');
        socket.on('online_stats', handleOnlineStats);
        socket.on('online_users', handleOnlineUsers);

        return () => {
            console.log('[ANALYTICS] Cleaning up socket listeners');
            socket.off('online_stats', handleOnlineStats);
            socket.off('online_users', handleOnlineUsers);
        };
    }, [socket, isConnected, user?._id, sessionId]);

    // Fallback: Use onlineUsers from socket provider
    useEffect(() => {
        if (socketOnlineUsers && socketOnlineUsers.length > 0) {
            console.log('[ANALYTICS] Using onlineUsers from socket provider:', socketOnlineUsers);
            setOnlineStats(prev => ({ ...prev, users: socketOnlineUsers.length }));
            setOnlineUsers(socketOnlineUsers);
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
            <div className="py-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Thống kê truy cập
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">Theo dõi lượng truy cập và người dùng trực tuyến</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {statsCards.map((item) => (
                        <StatsCard
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            icon={item.icon}
                            color={item.color}
                            bg={item.bg}
                            onClick={item.onClick}
                        />
                    ))}
                </div>

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
        </>
    );
}
