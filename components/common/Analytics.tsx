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
