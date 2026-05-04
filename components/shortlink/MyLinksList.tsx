// components/shortlink/MyLinksList.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link21, Mouse, Calendar, Trash, ExportSquare } from 'iconsax-react';
import { useShortLinkStore } from '@/store/shortlink.store';
import { CopyButton } from '@/components/common/CopyButton';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
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

        try {
            setIsDeleting(true);
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

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setPendingDeleteCode(null);
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-[var(--cn-radius-md)] bg-[var(--cn-bg-section)] animate-pulse" />
                ))}
            </div>
        );
    }

    if (links.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 border-2 border-dashed border-[var(--cn-border)] rounded-[var(--cn-radius-md)]">
                <Link21 size={32} variant="Outline" className="text-[var(--cn-text-muted)]" />
                <div className="text-center">
                    <p className="text-sm font-medium text-[var(--cn-text-sub)]">Chưa có link nào</p>
                    <p className="text-xs text-[var(--cn-text-muted)] mt-1">Hãy tạo link rút gọn đầu tiên của bạn!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {links.map((link: ShortLink) => (
                    <LinkCard key={link.shortCode} link={link} onDelete={handleDeleteClick} />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination current={currentPage} total={totalPages} onChange={fetchMyLinks} />
            )}

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title="Xác nhận xóa link"
                message="Bạn có chắc chắn muốn xóa link rút gọn này không?"
            />
        </div>
    );
}

function LinkCard({ link, onDelete }: { link: ShortLink; onDelete: (shortCode: string) => void }) {
    const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;

    return (
        <div className="group p-4 rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] hover:border-[var(--cn-primary)]/30 hover:shadow-[var(--cn-shadow-sm)] transition-all bg-[var(--cn-bg-card)]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--cn-primary)] hover:underline truncate">
                            {link.shortUrl}
                        </a>
                        {link.isCustom && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--cn-primary)]/10 text-[var(--cn-primary)] font-medium">Tùy chỉnh</span>
                        )}
                        {isExpired && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-500 font-medium">Hết hạn</span>
                        )}
                    </div>
                    <p className="text-xs text-[var(--cn-text-muted)] truncate">{link.originalUrl}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--cn-text-muted)]">
                        <span className="flex items-center gap-1"><Mouse size={12} variant="Outline" />{link.clicks.toLocaleString('vi-VN')} lượt click</span>
                        {link.expiresAt && (
                            <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}>
                                <Calendar size={12} variant="Outline" />Hết hạn: {new Date(link.expiresAt).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <CopyButton text={link.shortUrl} />
                    <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-hover)] transition-colors" title="Mở link gốc">
                        <ExportSquare size={16} variant="Outline" className="text-[var(--cn-text-muted)]" />
                    </a>
                    <button onClick={() => onDelete(link.shortCode)} className="p-2 rounded-[var(--cn-radius-sm)] hover:bg-red-50 transition-colors" title="Xóa link">
                        <Trash size={16} variant="Outline" className="text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (page: number) => void }) {
    return (
        <div className="flex items-center justify-center gap-2 pt-2">
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="px-3 py-1.5 rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] text-sm text-[var(--cn-text-sub)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--cn-hover)] transition-colors"
            >
                Trước
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-[var(--cn-text-main)]">{current} / {total}</span>
            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total}
                className="px-3 py-1.5 rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] text-sm text-[var(--cn-text-sub)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--cn-hover)] transition-colors"
            >
                Sau
            </button>
        </div>
    );
}