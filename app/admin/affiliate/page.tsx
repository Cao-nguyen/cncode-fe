// app/admin/affiliate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Users, FileText, GraduationCap, Coins, ChevronLeft, ChevronRight } from 'lucide-react';

interface AffiliateStat {
    _id: string;
    user: {
        _id: string;
        fullName: string;
        email: string;
        username: string;
    };
    code: string;
    link: string;
    clicks: number;
    totalRegistered: number;
    totalPosted: number;
    totalTakenQuiz: number;
    totalCoinsEarned: number;
    createdAt: string;
}

export default function AdminAffiliatePage() {
    const [stats, setStats] = useState<AffiliateStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchStats = async (p: number, s: string) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/affiliate/admin/stats?page=${p}&limit=20&search=${encodeURIComponent(s)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();

            if (data.success) {
                setStats(data.data.stats);
                setTotal(data.data.total);
                setTotalPages(data.data.totalPages);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(page, search);
    }, [page, search]);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tiếp thị liên kết</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Quản lý link giới thiệu của người dùng</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tìm theo email..."
                            className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-main focus:ring-2 focus:ring-main/20 outline-none"
                        />
                    </div>
                    <button onClick={handleSearch} className="px-3 py-1.5 bg-main text-white rounded-lg text-sm hover:bg-main/80 transition">
                        Tìm
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-main/5 border-b border-gray-200">
                            <tr>
                                <th className="text-left p-3 text-sm font-semibold text-main">Người dùng</th>
                                <th className="text-left p-3 text-sm font-semibold text-main">Mã giới thiệu</th>
                                <th className="text-center p-3 text-sm font-semibold text-main">Đăng ký</th>
                                <th className="text-center p-3 text-sm font-semibold text-main">Bài viết</th>
                                <th className="text-center p-3 text-sm font-semibold text-main">Bài tập</th>
                                <th className="text-center p-3 text-sm font-semibold text-main">Xu</th>
                                <th className="text-center p-3 text-sm font-semibold text-main">Click</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-main border-t-transparent mx-auto" />
                                    </td>
                                </tr>
                            ) : stats.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Chưa có dữ liệu</td>
                                </tr>
                            ) : (
                                stats.map((stat) => (
                                    <tr key={stat._id} className="hover:bg-gray-50 transition">
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{stat.user?.fullName || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{stat.user?.email}</p>
                                                <p className="text-xs text-main">@{stat.user?.username}</p>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <code className="text-xs font-mono font-semibold text-main bg-main/5 px-2 py-1 rounded">
                                                {stat.code}
                                            </code>
                                        </td>
                                        <td className="p-3 text-center font-semibold text-blue-600">{stat.totalRegistered}</td>
                                        <td className="p-3 text-center font-semibold text-green-600">{stat.totalPosted}</td>
                                        <td className="p-3 text-center font-semibold text-purple-600">{stat.totalTakenQuiz}</td>
                                        <td className="p-3 text-center font-semibold text-main">{stat.totalCoinsEarned.toLocaleString()}</td>
                                        <td className="p-3 text-center text-gray-500">{stat.clicks}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-gray-500">Tổng {total} người dùng</div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-2 text-sm">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}