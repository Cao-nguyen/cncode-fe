'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LinkClickChart } from './LinkClickChart';

interface LinkStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shortCode: string;
}

export function LinkStatsModal({ isOpen, onClose, shortCode }: LinkStatsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Thống kê lượt click</DialogTitle>
                </DialogHeader>
                <LinkClickChart shortCode={shortCode} />
            </DialogContent>
        </Dialog>
    );
}
