"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, Coins, GraduationCap, Activity, FileCheck } from "lucide-react";
import StatsCard from "@/components/sections/dashboard/StatsCard";
import UserGrowthChart from "@/components/sections/dashboard/UserGrowthChart";
import RecentActivity from "@/components/sections/dashboard/RecentActivity";
import RevenueChart from "@/components/sections/dashboard/RevenueChart";
import axiosInstance from "@/lib/axiosInstance";

interface DashboardStats {
    users: {
        total: number;
        teachers: number;
        admins: number;
        newThisWeek: number;
        newThisMonth: number;
        activeToday: number;
    };
    content: {
        exercises: number;
        submissions: number;
    };
    economy: {
        totalCoins: number;
    };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState([]);
    const [growthData, setGrowthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, activitiesRes, growthRes] = await Promise.all([
                axiosInstance.get("/admin/stats"),
                axiosInstance.get("/admin/recent-activities?limit=8"),
                axiosInstance.get("/admin/user-growth?days=30"),
            ]);

            setStats(statsRes.data.data);
            setActivities(activitiesRes.data.data);
            setGrowthData(growthRes.data.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 animate-pulse">
                            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    ))}
                </div>
                <div className="h-80 bg-white dark:bg-[#1c1c1c] rounded-xl animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatsCard
                    title="Tổng người dùng"
                    value={stats?.users.total || 0}
                    icon={Users}
                    trend={5}
                    color="blue"
                />
                <StatsCard
                    title="Giáo viên"
                    value={stats?.users.teachers || 0}
                    icon={GraduationCap}
                    color="green"
                />
                <StatsCard
                    title="Bài tập"
                    value={stats?.content.exercises || 0}
                    icon={FileCheck}
                    color="purple"
                />
                <StatsCard
                    title="Tổng CNcoins"
                    value={stats?.economy.totalCoins || 0}
                    icon={Coins}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <UserGrowthChart data={growthData} loading={loading} />
                </div>
                <div>
                    <StatsCard
                        title="Người dùng mới tuần này"
                        value={stats?.users.newThisWeek || 0}
                        icon={Activity}
                        color="green"
                    />
                    <div className="mt-5">
                        <StatsCard
                            title="Bài tập đã hoàn thành"
                            value={stats?.content.submissions || 0}
                            icon={BookOpen}
                            color="purple"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <RevenueChart loading={loading} />
                </div>
                <div>
                    <RecentActivity activities={activities} loading={loading} />
                </div>
            </div>
        </div>
    );
}