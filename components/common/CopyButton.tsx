'use client';

import { useState } from 'react';
import { Copy, TickCircle } from 'iconsax-react';
import { toast } from 'sonner';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Đã sao chép!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Sao chép thất bại');
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
            aria-label="Sao chép"
            title="Sao chép"
        >
            {copied ? (
                <TickCircle size={16} variant="Bold" className="text-green-500" />
            ) : (
                <Copy size={16} variant="Outline" className="text-gray-500" />
            )}
        </button>
    );
}