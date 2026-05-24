// components/shortlink/AdminLinksTable.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Search, ExternalLink, Trash2, MousePointerClick, Calendar,
    User, Copy, Plus, ChevronLeft, ChevronRight, MoreHorizontal,
    Link as LinkIcon, Clock, AlertCircle, BarChart3,
    Crown, Star, ArrowUpRight, Globe, XCircle
} from 'lucide-react';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { toast } from 'sonner';
import type { ShortLinkWithUser } from '@/types/shortlink.type';
import { CreateShortLinkModal } from './CreateShortLinkModal';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';

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
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchLinks = async (p: number, s: string) => {
        setIsLoading(true);
        try {
            const data = await shortlinkApi.getAllLinks(p, 15, s);
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
    }, [page, search]);

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
        const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) return { label: `Còn ${daysLeft} ngày`, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
        return { label: formatDate(expiresAt) || '', color: 'text-slate-600', bg: 'bg-slate-100', icon: Calendar };
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const truncateUrl = (url: string, maxLength: number = 100) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    return (
        <div className="w-full">
            <div className="space-y-6">
                {/* Header Section - CHỈ 1 LẦN */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 border border-blue-100">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl" />
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <LinkIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Short Link</h1>
                                    <p className="text-sm text-gray-500">Quản lý tất cả link rút gọn trên hệ thống</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                        >
                            <Plus size={18} />
                            Tạo link mới
                        </button>
                    </div>
                </div>

                {/* Stats Card - CHỈ 1 LẦN */}
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

                {/* Loading State */}
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
                        {/* Card Grid Layout */}
                        <div className="grid grid-cols-1 gap-5">
                            {links.map((link) => {
                                const expiry = getExpiryStatus(link.expiresAt);
                                const ExpiryIcon = expiry.icon;

                                return (
                                    <div
                                        key={link.shortCode}
                                        className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="p-6">
                                            {/* Header Row */}
                                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SHORT LINK</span>
                                                        <a
                                                            href={link.shortUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-base font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            {link.shortUrl}
                                                            <ArrowUpRight size={14} />
                                                        </a>
                                                        {link.isCustom && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                                                                <Star size={10} /> Tùy chỉnh
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        Mã: {link.shortCode}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(link.shortUrl)}
                                                        className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:scale-105 transition-all duration-200"
                                                        title="Sao chép link"
                                                    >
                                                        <Copy size={16} className="text-gray-500 hover:text-blue-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(link.shortCode)}
                                                        className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 hover:scale-105 transition-all duration-200"
                                                        title="Xóa link"
                                                    >
                                                        <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Original URL */}
                                            <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Globe size={12} className="text-gray-400" />
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">URL GỐC</span>
                                                </div>
                                                <a
                                                    href={link.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-gray-600 hover:text-blue-600 break-all flex items-center gap-1 group/link"
                                                >
                                                    <span className="break-all">{truncateUrl(link.originalUrl, 120)}</span>
                                                    <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                                                </a>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                                        <MousePointerClick size={14} className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400">Lượt click</p>
                                                        <p className="text-base font-bold text-gray-800">
                                                            {link.clicks.toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={`flex items-center gap-2 p-2 rounded-lg ${expiry.bg}`}>
                                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                                        <ExpiryIcon size={14} className={expiry.color} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400">Hết hạn</p>
                                                        <p className={`text-sm font-semibold ${expiry.color}`}>
                                                            {expiry.label}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                                        <Calendar size={14} className="text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400">Ngày tạo</p>
                                                        <p className="text-sm font-medium text-gray-700">
                                                            {formatDate(link.createdAt) || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                                        <User size={14} className="text-purple-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] text-gray-400">Người tạo</p>
                                                        {link.user ? (
                                                            <p className="text-sm font-medium text-gray-700 truncate" title={link.user.fullName || link.user.email}>
                                                                {link.user.fullName || link.user.email}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-gray-400">Khách</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                                <a
                                                    href={link.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                                >
                                                    <ExternalLink size={14} />
                                                    Truy cập link gốc
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(link.shortUrl)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                                >
                                                    <Copy size={14} />
                                                    Sao chép link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4 pb-4">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Trước</span>
                                </button>

                                <div className="flex gap-1">
                                    {getPageNumbers().map((pageNum, idx) => (
                                        pageNum === '...' ? (
                                            <span key={`dots-${idx}`} className="px-3 py-2 text-sm text-gray-400">
                                                <MoreHorizontal size={14} />
                                            </span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum as number)}
                                                className={`min-w-[40px] px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${page === pageNum
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25'
                                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
                                >
                                    <span>Sau</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
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

            {/* Create Short Link Modal */}
            <CreateShortLinkModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchLinks(page, search);
                }}
            />
        </div>
    );
}