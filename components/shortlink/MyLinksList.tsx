'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Link21, Mouse, Calendar, Trash, ExportSquare } from 'iconsax-react';
import { useShortLinkStore } from '@/store/shortlink.store';
import { CopyButton } from '@/components/common/CopyButton';
import type { ShortLink } from '@/types/shortlink.type';

export function MyLinksList() {
    const { links, isLoading, currentPage, totalPages, fetchMyLinks, deleteLink } = useShortLinkStore();

    useEffect(() => {
        fetchMyLinks(1);
    }, [fetchMyLinks]);

    const handleDelete = async (shortCode: string) => {
        try {
            await deleteLink(shortCode);
            toast.success('Đã xóa link');
        } catch {
            toast.error('Xóa thất bại');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (links.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 border-2 border-dashed border-gray-200 rounded-xl">
                <Link21 size={32} variant="Outline" className="text-gray-300" />
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Chưa có link nào</p>
                    <p className="text-xs text-gray-400 mt-1">Hãy tạo link rút gọn đầu tiên của bạn!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {links.map((link: ShortLink) => (
                    <LinkCard key={link.shortCode} link={link} onDelete={handleDelete} />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination current={currentPage} total={totalPages} onChange={fetchMyLinks} />
            )}
        </div>
    );
}

function LinkCard({ link, onDelete }: { link: ShortLink; onDelete: (shortCode: string) => void }) {
    const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;

    return (
        <div className="group p-4 rounded-xl border border-gray-200 hover:border-main/30 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-main hover:underline truncate">
                            {link.shortUrl}
                        </a>
                        {link.isCustom && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-main/10 text-main font-medium">Tùy chỉnh</span>
                        )}
                        {isExpired && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-500 font-medium">Hết hạn</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{link.originalUrl}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Mouse size={12} />{link.clicks.toLocaleString('vi-VN')} lượt click</span>
                        {link.expiresAt && (
                            <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}>
                                <Calendar size={12} />Hết hạn: {new Date(link.expiresAt).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <CopyButton text={link.shortUrl} />
                    <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Mở link gốc">
                        <ExportSquare size={16} className="text-gray-500" />
                    </a>
                    <button onClick={() => onDelete(link.shortCode)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Xóa link">
                        <Trash size={16} className="text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (page: number) => void }) {
    return (
        <div className="flex items-center justify-center gap-2 pt-2">
            <button onClick={() => onChange(current - 1)} disabled={current === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                Trước
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-600 font-medium">{current} / {total}</span>
            <button onClick={() => onChange(current + 1)} disabled={current === total} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                Sau
            </button>
        </div>
    );
}