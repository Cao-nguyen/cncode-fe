
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Link2, MousePointerClick, Calendar, Trash2, ExternalLink,
    Copy, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
    Crown, XCircle, Star, ArrowUpRight, Globe
} from 'lucide-react';
import { useShortLinkStore } from '@/store/shortlink.store';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import type { ShortLink } from '@/types/shortlink.type';

export function MyLinksList() {
    const { links, isLoading, currentPage, totalPages, fetchMyLinks, deleteLink } = useShortLinkStore();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingDeleteCode, setPendingDeleteCode] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchMyLinks(1);
    }, [fetchMyLinks]);

    const handleDeleteClick = (shortCode: string) => {
        setPendingDeleteCode(shortCode);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteCode) return;
        setIsDeleting(true);
        try {
            await deleteLink(pendingDeleteCode);
            toast.success('Đã xóa link');
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
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const truncateUrl = (url: string, maxLength: number = 80) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (links.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <Link2 size={32} className="text-blue-400" />
                </div>
                <div className="text-center">
                    <p className="text-base font-medium text-gray-700">Chưa có link nào</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy tạo link rút gọn đầu tiên của bạn!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {}
            <div className="grid grid-cols-1 gap-4">
                {links.map((link: ShortLink) => {
                    const expiry = getExpiryStatus(link.expiresAt);
                    const ExpiryIcon = expiry.icon;

                    return (
                        <div
                            key={link.shortCode}
                            className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                            <div className="p-5">
                                {}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-xs font-semibold text-gray-400 uppercase">SHORT LINK</span>
                                            <a
                                                href={link.shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                {link.shortUrl}
                                                <ArrowUpRight size={12} />
                                            </a>
                                            {link.isCustom && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                                                    <Star size={10} /> Custom
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">Mã: {link.shortCode}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => copyToClipboard(link.shortUrl)}
                                            className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-all duration-200"
                                            title="Sao chép"
                                        >
                                            <Copy size={15} className="text-gray-500 hover:text-blue-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(link.shortCode)}
                                            className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 transition-all duration-200"
                                            title="Xóa"
                                        >
                                            <Trash2 size={15} className="text-gray-500 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {}
                                <div className="mb-3 p-2 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Globe size={11} className="text-gray-400" />
                                        <span className="text-[10px] font-medium text-gray-400 uppercase">URL GỐC</span>
                                    </div>
                                    <a
                                        href={link.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-600 hover:text-blue-600 break-all flex items-center gap-1"
                                    >
                                        {truncateUrl(link.originalUrl, 80)}
                                        <ExternalLink size={10} className="flex-shrink-0" />
                                    </a>
                                </div>

                                {}
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <MousePointerClick size={13} className="text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {link.clicks.toLocaleString('vi-VN')} clicks
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${expiry.color}`}>
                                        <ExpiryIcon size={13} />
                                        <span className="text-sm font-medium">{expiry.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Calendar size={13} />
                                        <span className="text-xs">{formatDate(link.createdAt) || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => fetchMyLinks(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                    >
                        <ChevronLeft size={14} />
                        <span>Trước</span>
                    </button>

                    <div className="flex gap-1">
                        {getPageNumbers().map((pageNum, idx) => (
                            pageNum === '...' ? (
                                <span key={`dots-${idx}`} className="px-2 py-1.5 text-sm text-gray-400">
                                    <MoreHorizontal size={14} />
                                </span>
                            ) : (
                                <button
                                    key={pageNum}
                                    onClick={() => fetchMyLinks(pageNum as number)}
                                    className={`min-w-[34px] px-2 py-1.5 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        ))}
                    </div>

                    <button
                        onClick={() => fetchMyLinks(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                    >
                        <span>Sau</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}

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
                warning="Link đã xóa sẽ không thể khôi phục."
            />
        </div>
    );
}
