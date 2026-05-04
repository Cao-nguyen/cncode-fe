// components/common/DeleteConfirmModal.tsx
'use client';

import { Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title?: string;
    message?: string;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title = 'Xác nhận xóa',
    message = 'Bạn có chắc chắn muốn xóa mục này không?',
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-md shadow-[var(--cn-shadow-lg)]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-[var(--cn-border)]">
                    <h3 className="text-lg font-semibold text-[var(--cn-text-main)]">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-[var(--cn-text-sub)]">{message}</p>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-2">Hành động này không thể hoàn tác.</p>
                </div>
                <div className="flex gap-3 p-4 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-[var(--cn-border)] text-[var(--cn-text-sub)] rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-hover)] transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-[var(--cn-radius-sm)] hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isDeleting ? 'Đang xóa...' : 'Xóa'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}