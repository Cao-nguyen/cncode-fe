'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { BarChart3, Loader2 } from 'lucide-react';
import { CustomSelect } from '@/components/custom/CustomSelect';

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
                const stats = await shortlinkApi.getUserLinkClickStats(shortCode, days);
                setData(Array.isArray(stats) ? stats : []);
            } catch (error) {
                console.error('Fetch link click stats error:', error);
                setData([]);
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
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-64 bg-gray-50 rounded-lg">
                    <div className="h-full flex items-center justify-center">
                        <div className="w-full h-full space-y-2 p-4">
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
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
                <div className="min-w-[120px]">
                    <CustomSelect
                        options={[
                            { value: '7', label: '7 ngày' },
                            { value: '30', label: '30 ngày' },
                            { value: '90', label: '90 ngày' }
                        ]}
                        value={String(days)}
                        onChange={(value) => setDays(Number(value))}
                        placeholder="30 ngày"
                    />
                </div>
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
