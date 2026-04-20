'use client';

import { User, UserCheck, TrendingUp, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useWebSocket } from "@/hooks/useWebSocket";

interface AnalyticsProps {
    today?: number;
    guest?: number;
    online?: number;
    total?: number;
}

export default function Analytics({ today: propToday, guest: propGuest, online: propOnline, total: propTotal }: AnalyticsProps) {
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0 });
    const { onlineStats } = useWebSocket();

    useEffect(() => {
        const fetchStats = async () => {
            const res = await statisticApi.getPublicStats();
            if (res.success) {
                setStats(res.data);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const format = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    
    const today = propToday !== undefined ? propToday : stats.todayVisits;
    const total = propTotal !== undefined ? propTotal : stats.totalVisits;
    const guest = propGuest !== undefined ? propGuest : onlineStats.guests;
    const online = propOnline !== undefined ? propOnline : onlineStats.users;

    const items = [
        { label: 'Tổng', value: total, icon: TrendingUp },
        { label: 'Hôm nay', value: today, icon: Eye },
        { label: 'Khách online', value: guest, icon: User },
        { label: 'User online', value: online, icon: UserCheck }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div key={item.label} className="p-5 rounded-2xl bg-white dark:bg-[#171717] border border-[#e6e6e6] dark:border-[#222] flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition">
                        <div>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <h4 className="text-lg md:text-xl font-bold">{format(item.value)}</h4>
                        </div>
                        <Icon size={24} className="text-black dark:text-white" />
                    </div>
                );
            })}
        </div>
    );
}