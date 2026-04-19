'use client';

import { useEffect, useState } from 'react';
import { User, UserCheck, TrendingUp, Eye } from 'lucide-react';
import { statisticApi } from '@/lib/api/statistic.api';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Analytics() {
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0 });
    const { onlineStats } = useWebSocket();

    useEffect(() => {
        const fetchStats = async () => {
            const res = await statisticApi.getPublicStats();
            if (res.success) setStats(res.data);
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const format = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    const items = [
        { label: 'Tổng', value: stats.totalVisits, icon: TrendingUp },
        { label: 'Hôm nay', value: stats.todayVisits, icon: Eye },
        { label: 'Khách online', value: onlineStats.guests, icon: User },
        { label: 'User online', value: onlineStats.users, icon: UserCheck }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div key={item.label} className="p-5 rounded-2xl bg-white dark:bg-[#171717] border flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <h4 className="text-lg md:text-xl font-bold">{format(item.value)}</h4>
                        </div>
                        <Icon size={24} />
                    </div>
                );
            })}
        </div>
    );
}