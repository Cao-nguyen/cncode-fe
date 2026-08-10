
'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Search, ExternalLink, Trash2, MousePointerClick, Calendar,
    User, Copy, Plus, ChevronLeft, ChevronRight, MoreHorizontal,
    Link as LinkIcon, Clock, AlertCircle, BarChart3,
    Crown, Star, ArrowUpRight, Globe, XCircle, ChevronsLeft, ChevronsRight, ChevronDown, Check
} from 'lucide-react';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { toast } from 'sonner';
import type { ShortLinkWithUser } from '@/types/shortlink.type';
import { CreateShortLinkModal } from './CreateShortLinkModal';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { LinkStatsModal } from './LinkStatsModal';

function formatCountdown(timeLeft: number): string {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function AdminLinksTable() {
    const [links, setLinks] = useState<ShortLinkWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingDeleteCode, setPendingDeleteCode] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showChartModal, setShowChartModal] = useState(false);
    const [selectedLinkForChart, setSelectedLinkForChart] = useState<string | null>(null);
    const [now, setNow] = useState(Date.now());
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [isPerPageOpen, setIsPerPageOpen] = useState(false);
    const PAGINATION_OPTIONS = [5, 10, 15, 25, 50];
    const perPageDropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchLinks = async (p: number, s: string) => {
        setIsLoading(true);
        try {
            const data = await shortlinkApi.getAllLinks(p, itemsPerPage, s);
            setLinks(data.links);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err) {
            console.error('Fetch links error:', err);
            toast.error('Không thể tải danh sách link');
            setLinks([]);
            setTotalPages(1);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks(page, search);
    }, [page, search, itemsPerPage]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(value.trim());
            setPage(1);
        }, 400);
    };

    const handleDeleteClick = (shortCode: string) => {
        setPendingDeleteCode(shortCode);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteCode) return;
        setIsDeleting(true);
        try {
            await shortlinkApi.delete(pendingDeleteCode);
            toast.success('Đã xóa link thành công');
            fetchLinks(page, search);
            setDeleteModalOpen(false);
            setPendingDeleteCode(null);
        } catch {
            toast.error('Xóa thất bại');
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        toast.success('Đã sao chép link');
    };

    const formatDate = (date: string | null) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN');
    };

    const getExpiryStatus = (expiresAt: string | null) => {
        if (!expiresAt) return { label: 'Vĩnh viễn', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Crown };
        const isExpired = new Date(expiresAt) < new Date();
        if (isExpired) return { label: 'Đã hết hạn', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
        
        const timeLeft = new Date(expiresAt).getTime() - now;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        
        if (hoursLeft < 24) return { label: formatCountdown(timeLeft), color: 'text-red-600', bg: 'bg-red-50', icon: Clock };
        if (daysLeft <= 7) return { label: `Còn ${daysLeft} ngày`, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
        return { label: formatDate(expiresAt) || '', color: 'text-slate-600', bg: 'bg-slate-100', icon: Calendar };
    };

    const truncateUrl = (url: string, maxLength: number = 100) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    return (
        <div className="w-full">
            <div className="space-y-6">
                {}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng số link</p>
                            <p className="text-2xl font-bold text-gray-800">{total.toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="flex-1 flex justify-end">
                            <div className="relative w-full max-w-md">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Tìm kiếm theo short code hoặc URL..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-sm transition-all text-gray-700 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {}
                {isLoading && links.length === 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-56 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : links.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                            <Search size={32} className="text-blue-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-medium text-gray-700">
                                {search ? `Không tìm thấy kết quả cho "${search}"` : 'Chưa có link nào'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {search ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy tạo link rút gọn đầu tiên của bạn'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Short Link</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">URL Gốc</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Clicks</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Hết hạn</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Người tạo</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {links.map((link) => {
                                            const expiry = getExpiryStatus(link.expiresAt);
                                            return (
                                                <tr key={link.shortCode} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <a
                                                                href={link.shortUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                                            >
                                                                {link.shortUrl}
                                                                <ArrowUpRight size={12} />
                                                            </a>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-400">{link.shortCode}</span>
                                                                {link.isCustom && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                                                        Custom
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <a
                                                            href={link.originalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-gray-600 hover:text-blue-600 truncate max-w-xs block"
                                                            title={link.originalUrl}
                                                        >
                                                            {truncateUrl(link.originalUrl, 50)}
                                                        </a>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            {link.clicks.toLocaleString('vi-VN')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-xs font-medium ${expiry.color}`}>
                                                            {expiry.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-sm text-gray-700">
                                                            {link.user ? (link.user.fullName || link.user.email) : 'Khách'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-sm text-gray-600">
                                                            {formatDate(link.createdAt) || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => copyToClipboard(link.shortUrl)}
                                                                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                                                title="Sao chép"
                                                            >
                                                                <Copy size={14} className="text-gray-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLinkForChart(link.shortCode);
                                                                    setShowChartModal(true);
                                                                }}
                                                                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                                                title="Xem thống kê"
                                                            >
                                                                <BarChart3 size={14} className="text-gray-500" />
                                                            </button>
                                                            <a
                                                                href={link.originalUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                                                title="Truy cập link gốc"
                                                            >
                                                                <ExternalLink size={14} className="text-gray-500" />
                                                            </a>
                                                            <button
                                                                onClick={() => handleDeleteClick(link.shortCode)}
                                                                className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={14} className="text-gray-500 hover:text-red-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {}
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-4">
                                <div className="relative" ref={perPageDropdownRef}>
                                    <button
                                        onClick={() => setIsPerPageOpen(!isPerPageOpen)}
                                        className="min-w-[60px] px-3 py-1 text-sm font-medium border rounded-lg bg-white text-gray-900 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-between gap-2 border-gray-200 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <span>{itemsPerPage}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${isPerPageOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isPerPageOpen && (
                                        <div className="absolute z-[9999] w-full bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                            {PAGINATION_OPTIONS.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                        setItemsPerPage(option);
                                                        setPage(1);
                                                        setIsPerPageOpen(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                                                >
                                                    <span className="text-gray-900">{option}</span>
                                                    {itemsPerPage === option && (
                                                        <Check className="w-3.5 h-3.5 text-blue-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {links.length > 0 && (
                                        <span>
                                            {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, total)} của {total} bản ghi
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Về trang đầu */}
                                <button
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    title="Trang đầu"
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>

                                {/* Lùi 1 trang */}
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {/* Hiển thị trang hiện tại / tổng trang */}
                                <div className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                    {page} / {totalPages}
                                </div>

                                {/* Tới 1 trang */}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                {/* Về trang cuối */}
                                <button
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    title="Trang cuối"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {}
            <ConfirmModalDelete
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPendingDeleteCode(null);
                }}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title="Xóa link rút gọn"
                message="Bạn có chắc chắn muốn xóa link này không?"
                warning="Link đã xóa sẽ không thể truy cập được nữa."
            />

            {}
            <CreateShortLinkModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchLinks(page, search);
                }}
            />

            {}
            {selectedLinkForChart && (
                <LinkStatsModal
                    isOpen={showChartModal}
                    onClose={() => {
                        setShowChartModal(false);
                        setSelectedLinkForChart(null);
                    }}
                    shortCode={selectedLinkForChart}
                />
            )}
        </div>
    );
}
