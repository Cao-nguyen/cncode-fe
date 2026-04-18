"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

interface RevenueData {
    date: string;
    amount: number;
}

interface RevenueChartProps {
    data?: RevenueData[];
    loading?: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: RevenueData;
    }>;
    label?: string;
}

const generateMockData = (): RevenueData[] => {
    const mockData: RevenueData[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
            date: date.toLocaleDateString("vi-VN", { weekday: "short" }),
            amount: 1000000 + Math.floor(Math.random() * 4000000),
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
                <p className="text-sm text-blue-600 dark:text-blue-400">
                    {data.value.toLocaleString()} CNcoins
                </p>
            </div>
        );
    }
    return null;
};

export default function RevenueChart({ data = [], loading = false }: RevenueChartProps) {
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
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
                <div className="h-[250px] bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-black/5 dark:border-white/10">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Doanh thu (CNcoins)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" stroke={textColor} fontSize={12} />
                    <YAxis stroke={textColor} fontSize={12} tickFormatter={(value) => value.toLocaleString()} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}