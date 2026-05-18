'use client';

import { User, UserCheck, TrendingUp, Eye, Shield, X, Smartphone, Monitor, Laptop } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

const getDeviceIcon = (deviceStr?: string) => {
    if (!deviceStr) return <Monitor size={14} className="text-gray-400" />;
    const d = deviceStr.toLowerCase();
    if (d.includes('android') || d.includes('ios')) return <Smartphone size={14} className="text-green-500" />;
    if (d.includes('mac') || d.includes('windows')) return <Laptop size={14} className="text-blue-500" />;
    return <Monitor size={14} className="text-gray-400" />;
};

export default function Analytics({ today: propToday, total: propTotal }: {
    today?: number;
    total?: number;
}) {
    const { onlineUsers, onlineStats, isConnected } = useSocket();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0 });
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                const statsRes = await statisticApi.getPublicStats();
                if (isMounted && statsRes.success) {
                    setStats(statsRes.data);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to load initial data:', error);
                setLoading(false);
            }
        };

        loadInitialData();
        intervalRef.current = setInterval(async () => {
            try {
                const statsRes = await statisticApi.getPublicStats();
                if (isMounted && statsRes.success) setStats(statsRes.data);
            } catch (error) { }
        }, 30000);

        return () => {
            isMounted = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const format = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    const items = [
        { label: 'Tổng lượt truy cập', value: propTotal || stats.totalVisits, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Hôm nay', value: propToday || stats.todayVisits, icon: Eye, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Khách online', value: onlineStats.guests, icon: User, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'User online', value: onlineStats.users, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-50' }
    ];

    if (loading) return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>)}
    </div>;

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isOnlineCard = item.label === 'User online';
                    return (
                        <div
                            key={item.label}
                            className={`group p-3 sm:p-4 rounded-xl bg-white dark:bg-[#171717] border border-[#e6e6e6] dark:border-[#222] flex items-center justify-between transition-all ${isOnlineCard && isAdmin ? 'cursor-pointer hover:shadow-md' : ''}`}
                            onClick={() => isOnlineCard && isAdmin && setShowPopup(true)}
                        >
                            <div>
                                <p className="text-[11px] sm:text-xs text-gray-500">{item.label}</p>
                                <h4 className="text-sm sm:text-base font-bold">{format(item.value)}</h4>
                            </div>
                            <div className={`p-2 rounded-lg ${item.bg}`}>
                                <Icon size={14} className={item.color} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {isAdmin && showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPopup(false)}>
                    <div className="bg-white dark:bg-[#171717] rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Shield size={18} className="text-purple-500" />
                                Người dùng online ({onlineUsers.length})
                            </h3>
                            <button onClick={() => setShowPopup(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-2 flex-1">
                            {onlineUsers.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Không có dữ liệu</div>
                            ) : (
                                <div className="space-y-2">
                                    {onlineUsers.map((u) => (
                                        <div key={u.userId} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {u.avatar ? <Image src={u.avatar} alt="" width={36} height={36} className="rounded-full" /> : <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">{u.fullName[0]}</div>}
                                                <div>
                                                    <p className="text-sm font-medium">{u.fullName}</p>
                                                    <p className="text-[10px] text-gray-400">ID: ...{u.userId.slice(-6)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                                {getDeviceIcon(u.device)}
                                                <span className="text-[10px]">{u.device}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}