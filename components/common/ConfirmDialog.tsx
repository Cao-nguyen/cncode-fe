'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isConfirmLoading?: boolean;
    isDestructive?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xóa',
    cancelText = 'Hủy',
    isConfirmLoading = false,
    isDestructive = true,
}: ConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isConfirmLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDestructive ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        disabled={isConfirmLoading}
                    >
                        {isConfirmLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}