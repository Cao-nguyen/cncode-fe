
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
    Link2, MousePointerClick, Calendar, Trash2, ExternalLink,
    Copy, ChevronLeft, ChevronRight, MoreHorizontal, Clock,
    Crown, XCircle, Star, ArrowUpRight, Globe, Search, ChevronDown, MoreVertical,
    BarChart3, Edit, Settings, QrCode, Share2
} from 'lucide-react';
import { useShortLinkStore } from '@/store/shortlink.store';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { LinkStatsModal } from '@/components/shortlink/LinkStatsModal';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import type { ShortLink } from '@/types/shortlink.type';

function formatCountdown(timeLeft: number): string {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MyLinksList() {
    const { links, isLoading, currentPage, totalPages, fetchMyLinks, deleteLink, updateLinkClicks } = useShortLinkStore();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingDeleteCode, setPendingDeleteCode] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [now, setNow] = useState(Date.now());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState<'all' | 'active' | 'expired'>('all');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [selectedShortCode, setSelectedShortCode] = useState<string | null>(null);

    useEffect(() => {
        fetchMyLinks(1);
    }, [fetchMyLinks]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Listen for realtime click updates
    useEffect(() => {
        const handleShortlinkClicked = (event: CustomEvent) => {
            const { shortCode, clicks } = event.detail;
            console.log('[MyLinksList] Received click update:', shortCode, clicks);
            
            // Update local state to reflect new click count
            updateLinkClicks(shortCode, clicks);
        };

        window.addEventListener('shortlink:clicked', handleShortlinkClicked as EventListener);
        
        return () => {
            window.removeEventListener('shortlink:clicked', handleShortlinkClicked as EventListener);
        };
    }, [updateLinkClicks]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!menuOpen) return;
            const target = event.target as HTMLElement;
            if (target.closest('[data-menu-container]')) return;
            setMenuOpen(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const handleDeleteClick = (shortCode: string) => {
        setPendingDeleteCode(shortCode);
        setDeleteModalOpen(true);
    };

    const handleStatsClick = (shortCode: string) => {
        setSelectedShortCode(shortCode);
        setStatsModalOpen(true);
        setMenuOpen(null);
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

    const copyToClipboard = async (text: string, type: 'short' | 'original' = 'short') => {
        try {
            await navigator.clipboard.writeText(text);
            const message = type === 'short' ? 'Đã sao chép link rút gọn' : 'Đã sao chép link gốc';
            toast.success(message);
        } catch (error) {
            // Fallback for older browsers or when clipboard API fails
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                const message = type === 'short' ? 'Đã sao chép link rút gọn' : 'Đã sao chép link gốc';
                toast.success(message);
            } catch (err) {
                toast.error('Không thể sao chép link');
            }
            document.body.removeChild(textArea);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return null;
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
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

    // Filter and search links
    const filteredLinks = useMemo(() => {
        let filtered = [...links];

        // Apply filter
        if (filterOption === 'active') {
            filtered = filtered.filter(link => !link.expiresAt || new Date(link.expiresAt) > new Date());
        } else if (filterOption === 'expired') {
            filtered = filtered.filter(link => link.expiresAt && new Date(link.expiresAt) < new Date());
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(link =>
                link.shortUrl.toLowerCase().includes(query) ||
                link.originalUrl.toLowerCase().includes(query) ||
                link.shortCode.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [links, filterOption, searchQuery]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 space-y-2">
                            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                                <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-2 w-12 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-2 w-12 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-2 w-12 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
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
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-[2]">
                    <CustomInput
                        type="text"
                        placeholder="Tìm kiếm link..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search size={15} />}
                    />
                </div>
                <div className="flex-1 min-w-[155px]">
                    <CustomSelect
                        options={[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'active', label: 'Đang hoạt động' },
                            { value: 'expired', label: 'Đã hết hạn' }
                        ]}
                        value={filterOption}
                        onChange={(value) => setFilterOption(value as 'all' | 'active' | 'expired')}
                        placeholder="Tất cả"
                    />
                </div>
            </div>
            
            {/* Empty state for filtered results */}
            {filteredLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Search size={24} className="text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Không tìm thấy kết quả</p>
                        <p className="text-xs text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                </div>
            ) : (
            <div className="grid grid-cols-1 gap-3">
                {filteredLinks.map((link: ShortLink) => {
                    const expiry = getExpiryStatus(link.expiresAt);
                    const ExpiryIcon = expiry.icon;

                    return (
                        <div
                            key={link.shortCode}
                            className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] hover:border-[var(--cn-primary)] hover:shadow-sm transition-all duration-200"
                        >
                            <div className="p-4">
                                {/* Mobile + MD Layout */}
                                <div className="flex flex-col gap-3 lg:hidden">
                                    {/* URLs + Actions Row - MD: horizontal */}
                                    <div className="flex items-start gap-3">
                                        {/* URLs Section */}
                                        <div className="flex-1 min-w-0 max-w-[calc(100%-15px)]">
                                            <a
                                                href={link.shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-semibold text-[var(--cn-primary)] hover:underline flex items-center gap-1 mb-1 truncate"
                                            >
                                                {truncateUrl(link.shortUrl, 50)}
                                                <ArrowUpRight size={12} />
                                            </a>
                                            <div className="flex items-center gap-1.5">
                                                <Globe size={10} className="text-[var(--cn-text-muted)]" />
                                                <a
                                                    href={link.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-[var(--cn-text-sub)] hover:text-[var(--cn-primary)] break-all flex items-center gap-1 max-w-[285px]"
                                                >
                                                    {truncateUrl(link.originalUrl, 30)}
                                                    <ExternalLink size={10} className="flex-shrink-0" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Actions - Visible on Mobile and MD */}
                                        <div className="flex items-center gap-1 relative flex-shrink-0">
                                            <button
                                                onClick={() => copyToClipboard(link.shortUrl, 'short')}
                                                className="p-1.5 rounded-lg bg-[var(--cn-bg-section)] hover:bg-[var(--cn-primary)]/10 transition-all duration-200"
                                                title="Sao chép"
                                            >
                                                <Copy size={15} className="text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)]" />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpen(menuOpen === link.shortCode ? null : link.shortCode);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-[var(--cn-bg-section)] hover:bg-[var(--cn-bg-section)] transition-all duration-200"
                                                >
                                                    <MoreVertical size={15} className="text-[var(--cn-text-muted)]" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {menuOpen === link.shortCode && (
                                                    <div
                                                        data-menu-container
                                                        className="absolute right-0 top-full mt-2 w-40 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-lg shadow-lg z-10"
                                                    >
                                                        <div className="py-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(link.shortUrl, 'short');
                                                                    setMenuOpen(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-[var(--cn-text-main)] hover:bg-[var(--cn-hover)] flex items-center gap-3"
                                                            >
                                                                <Copy size={14} className="text-[var(--cn-text-muted)]" />
                                                                Link rút gọn
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(link.originalUrl, 'original');
                                                                    setMenuOpen(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-[var(--cn-text-main)] hover:bg-[var(--cn-hover)] flex items-center gap-3"
                                                            >
                                                                <Copy size={14} className="text-[var(--cn-text-muted)]" />
                                                                Link gốc
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleStatsClick(link.shortCode);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-[var(--cn-text-main)] hover:bg-[var(--cn-hover)] flex items-center gap-3"
                                                            >
                                                                <BarChart3 size={14} className="text-[var(--cn-text-muted)]" />
                                                                Thống kê
                                                            </button>
                                                        </div>
                                                        <div className="border-t border-[var(--cn-border)]"></div>
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteClick(link.shortCode);
                                                                    setMenuOpen(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                                            >
                                                                <Trash2 size={14} className="text-red-500" />
                                                                Xoá link
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Section - MD: horizontal row */}
                                    <div className="flex flex-row md:flex-row gap-3 md:gap-4">
                                        {/* Clicks */}
                                        <div className="flex flex-col gap-0.5 min-w-[70px]">
                                            <span className="text-sm font-medium text-[var(--cn-text-main)] leading-tight">
                                                {link.clicks.toLocaleString('vi-VN')}
                                            </span>
                                            <span className="text-xs text-[var(--cn-text-muted)] leading-tight">Clicks</span>
                                        </div>

                                        {/* Expiry & Created */}
                                        <div className="flex flex-col gap-1 min-w-[100px]">
                                            <div className={`flex items-center gap-1.5 ${expiry.color}`}>
                                                <ExpiryIcon size={13} />
                                                <span className="text-xs font-medium leading-tight">{expiry.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[var(--cn-text-muted)]">
                                                <Calendar size={13} />
                                                <span className="text-xs leading-tight">{formatDate(link.createdAt) || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout - Only visible on LG */}
                                <div className="hidden lg:flex lg:items-center lg:gap-4">
                                    {/* URLs Section */}
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={link.shortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-semibold text-[var(--cn-primary)] hover:underline flex items-center gap-1 mb-1 truncate"
                                        >
                                            {truncateUrl(link.shortUrl, 50)}
                                            <ArrowUpRight size={12} />
                                        </a>
                                        <div className="flex items-center gap-1.5">
                                            <Globe size={10} className="text-[var(--cn-text-muted)]" />
                                            <a
                                                href={link.originalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[var(--cn-text-sub)] hover:text-[var(--cn-primary)] break-all flex items-center gap-1 max-w-[285px]"
                                            >
                                                {truncateUrl(link.originalUrl, 30)}
                                                <ExternalLink size={10} className="flex-shrink-0" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Clicks */}
                                    <div className="flex flex-col gap-0.5 min-w-[80px]">
                                        <span className="text-sm font-medium text-[var(--cn-text-main)] leading-tight">
                                            {link.clicks.toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-xs text-[var(--cn-text-muted)] leading-tight">Clicks</span>
                                    </div>

                                    {/* Expiry & Created */}
                                    <div className="flex flex-col gap-1 min-w-[120px]">
                                        <div className={`flex items-center gap-1.5 ${expiry.color}`}>
                                            <ExpiryIcon size={13} />
                                            <span className="text-xs font-medium leading-tight">{expiry.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[var(--cn-text-muted)]">
                                            <Calendar size={13} />
                                            <span className="text-xs leading-tight">{formatDate(link.createdAt) || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 relative flex-shrink-0">
                                        <button
                                            onClick={() => copyToClipboard(link.shortUrl, 'short')}
                                            className="p-2 rounded-lg bg-[var(--cn-bg-section)] hover:bg-[var(--cn-primary)]/10 transition-all duration-200"
                                            title="Sao chép"
                                        >
                                            <Copy size={15} className="text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)]" />
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuOpen(menuOpen === link.shortCode ? null : link.shortCode);
                                                }}
                                                className="p-2 rounded-lg bg-[var(--cn-bg-section)] hover:bg-[var(--cn-bg-section)] transition-all duration-200"
                                            >
                                                <MoreVertical size={15} className="text-[var(--cn-text-muted)]" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {menuOpen === link.shortCode && (
                                                <div
                                                    data-menu-container
                                                    className="absolute right-0 top-full mt-2 w-40 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-lg shadow-lg z-10"
                                                >
                                                    <div className="py-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(link.shortUrl, 'short');
                                                                setMenuOpen(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-[var(--cn-text-main)] hover:bg-[var(--cn-hover)] flex items-center gap-3"
                                                        >
                                                            <Copy size={14} className="text-[var(--cn-text-muted)]" />
                                                            Link rút gọn
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(link.originalUrl, 'original');
                                                                setMenuOpen(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-[var(--cn-text-main)] hover:bg-[var(--cn-hover)] flex items-center gap-3"
                                                        >
                                                            <Copy size={14} className="text-[var(--cn-text-muted)]" />
                                                            Link gốc
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleStatsClick(link.shortCode);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-[var(--cn-text-main)] hover:bg-[var(--cn-hover)] flex items-center gap-3"
                                                        >
                                                            <BarChart3 size={14} className="text-[var(--cn-text-muted)]" />
                                                            Thống kê
                                                        </button>
                                                    </div>
                                                    <div className="border-t border-[var(--cn-border)]"></div>
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                handleDeleteClick(link.shortCode);
                                                                setMenuOpen(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                                        >
                                                            <Trash2 size={14} className="text-red-500" />
                                                            Xoá link
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

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
            <LinkStatsModal
                isOpen={statsModalOpen}
                onClose={() => {
                    setStatsModalOpen(false);
                    setSelectedShortCode(null);
                }}
                shortCode={selectedShortCode || ''}
            />
        </div>
    );
}

