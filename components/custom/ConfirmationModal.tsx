// components/custom/ConfirmationModal.tsx
'use client';

import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    warning?: string;
    isDeleting?: boolean;
}

export const ConfirmModalDelete: React.FC<ConfirmModalDeleteProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận hủy',
    message = 'Bạn có chắc chắn muốn hủy thao tác này không?',
    warning = 'Dữ liệu đã nhập sẽ không được lưu lại.',
    isDeleting = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-md shadow-[var(--cn-shadow-lg)] border border-[var(--cn-border)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--cn-border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--cn-hover)] transition-colors"
                    >
                        <X className="w-4 h-4 text-[var(--cn-text-muted)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                    <p className="text-sm text-[var(--cn-text-sub)]">{message}</p>
                    <p className="text-sm text-red-500">{warning}</p>
                    <p className="text-xs text-[var(--cn-text-muted)] italic">* Hành động này không thể hoàn tác.</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-5 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-[var(--cn-border)] text-[var(--cn-text-sub)] rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-hover)] transition-colors text-sm font-medium"
                    >
                        Không, quay lại
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-[var(--cn-radius-sm)] hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isDeleting ? 'Đang xóa...' : 'Xác nhận hủy'}
                    </button>
                </div>
            </div>
        </div>
    );
};