// components/sections/home/analytic.tsx
'use client';

import { User, UserCheck, TrendingUp, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { statisticApi } from "@/lib/api/statistic.api";
import { useWebSocket } from "@/hooks/useWebSocket";

interface IVisitStats {
    totalVisits: number;
    todayVisits: number;
}

export default function Analytics() {
    const [visitStats, setVisitStats] = useState<IVisitStats>({ totalVisits: 0, todayVisits: 0 });
    const [loading, setLoading] = useState(true);
    const { onlineStats } = useWebSocket();

    useEffect(() => {
        fetchVisitStats();

        // Refresh visit stats mỗi phút
        const interval = setInterval(fetchVisitStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchVisitStats = async () => {
        try {
            const result = await statisticApi.getPublicStats();
            if (result.success) {
                setVisitStats({
                    totalVisits: result.data.totalVisits,
                    todayVisits: result.data.todayVisits
                });
            }
        } catch (error) {
            console.error("Lỗi khi lấy thống kê:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    const items = [
        { label: "Tổng", value: visitStats.totalVisits, icon: TrendingUp },
        { label: "Hôm nay", value: visitStats.todayVisits, icon: Eye },
        { label: "Khách online", value: onlineStats.guests, icon: User, isRealtime: true },
        { label: "User online", value: onlineStats.users, icon: UserCheck, isRealtime: true }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#171717] border border-[#e6e6e6] dark:border-[#222] animate-pulse">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.label}
                        className="p-5 rounded-2xl bg-white dark:bg-[#171717] border border-[#e6e6e6] dark:border-[#222] flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition"
                    >
                        <div>
                            <p className="text-sm text-gray-500">
                                {item.label}
                                {item.isRealtime && (
                                    <span className="ml-1 inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                )}
                            </p>
                            <h4 className="text-lg md:text-xl font-bold">{formatNumber(item.value)}</h4>
                        </div>
                        <Icon size={24} className="text-black dark:text-white" />
                    </div>
                );
            })}
        </div>
    );
}