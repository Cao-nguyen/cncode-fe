'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { BarChart3, Loader2 } from 'lucide-react';

interface LinkClickChartProps {
    shortCode: string;
}

interface ClickData {
    date: string;
    clicks: number;
}

export function LinkClickChart({ shortCode }: LinkClickChartProps) {
    const [data, setData] = useState<ClickData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const stats = await shortlinkApi.getLinkClickStats(shortCode, days);
                setData(stats);
            } catch (error) {
                console.error('Fetch link click stats error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [shortCode, days]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                <BarChart3 className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Chưa có dữ liệu thống kê</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Thống kê lượt click theo ngày</h3>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={7}>7 ngày</option>
                    <option value={30}>30 ngày</option>
                    <option value={90}>90 ngày</option>
                </select>
            </div>
            
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <Tooltip 
                            labelFormatter={(label: any) => formatDate(label)}
                            contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
