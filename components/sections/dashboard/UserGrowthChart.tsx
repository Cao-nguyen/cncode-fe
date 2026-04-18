"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

interface GrowthData {
    date: string;
    count: number;
}

interface UserGrowthChartProps {
    data?: GrowthData[];
    loading?: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: GrowthData;
    }>;
    label?: string;
}

const generateMockData = (): GrowthData[] => {
    const mockData: GrowthData[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
            date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
            count: 5 + Math.floor(Math.random() * 45),
        });
    }
    return mockData;
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0];
        return (
            <div className="bg-white dark:bg-[#1f1f1f] p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{data.payload.date}</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                    {data.value} người mới
                </p>
            </div>
        );
    }
    return null;
};

export default function UserGrowthChart({ data = [], loading = false }: UserGrowthChartProps) {
    const { theme } = useTheme();

    const chartData = useMemo(() => {
        if (data.length > 0) return data;
        return generateMockData();
    }, [data]);

    const isDark = theme === "dark";
    const textColor = isDark ? "#9ca3af" : "#6b7280";
    const gridColor = isDark ? "#374151" : "#e5e7eb";

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-black/5 dark:border-white/10 h-[320px] animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
                <div className="h-[250px] bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-black/5 dark:border-white/10">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Người dùng mới (30 ngày)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" stroke={textColor} fontSize={12} interval={6} />
                    <YAxis stroke={textColor} fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}