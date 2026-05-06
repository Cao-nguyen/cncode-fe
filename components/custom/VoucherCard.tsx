// components/custom/VoucherCard.tsx
'use client';

import React, { useState } from 'react';
import { Copy, Check, Tag, Ticket, Truck } from 'lucide-react';

interface VoucherCardProps {
    id: string;
    title: string;
    description: string;
    code: string;
    expiryDate?: string;
    discountValue: string;
    discountType: 'percentage' | 'fixed' | 'freeship';
    category?: string;
    minOrder?: number;
    maxDiscount?: number;
    isUsed?: boolean;
    onApply?: (code: string) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
    title,
    description,
    code,
    expiryDate,
    discountValue,
    discountType,
    category = 'Khóa học',
    minOrder,
    maxDiscount,
    isUsed = false,
    onApply,
}) => {
    const [copied, setCopied] = useState(false);

    const getDiscountDisplay = () => {
        if (discountType === 'percentage') return `${discountValue}% OFF`;
        if (discountType === 'fixed') return `Flat ${parseInt(discountValue).toLocaleString()}đ`;
        return 'FREE SHIP';
    };

    const getIcon = () => {
        if (discountType === 'percentage') return <Tag size={24} />;
        if (discountType === 'fixed') return <Ticket size={24} />;
        return <Truck size={24} />;
    };

    const getTypeColor = () => {
        switch (discountType) {
            case 'percentage': return 'from-orange-500 to-red-500';
            case 'fixed': return 'from-blue-500 to-indigo-500';
            case 'freeship': return 'from-green-500 to-emerald-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const formatExpiryDate = (date?: string) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getConditionText = () => {
        if (minOrder && maxDiscount && discountType === 'percentage') {
            return `Save ${discountValue}% up to ${maxDiscount.toLocaleString()}đ on orders over ${minOrder.toLocaleString()}đ`;
        }
        if (minOrder && discountType === 'fixed') {
            return `Save ${parseInt(discountValue).toLocaleString()}đ on orders over ${minOrder.toLocaleString()}đ`;
        }
        if (minOrder) {
            return `Save on orders over ${minOrder.toLocaleString()}đ`;
        }
        return description;
    };

    if (isUsed) return null;

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${getTypeColor()} p-4 text-white`}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium opacity-80 uppercase tracking-wider">DISCOUNT</p>
                        <p className="text-2xl font-bold mt-1">{getDiscountDisplay()}</p>
                    </div>
                    <div className="opacity-80">
                        {getIcon()}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-800 text-base mb-1">{title}</h3>
                <p className="text-sm text-gray-500 mb-3">{getConditionText()}</p>

                {/* Terms */}
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-xs text-gray-400">
                        {expiryDate && `*HSD: ${formatExpiryDate(expiryDate)}`}
                    </p>
                    <p className="text-xs text-gray-400">*Terms & conditions</p>
                </div>

                {/* Code and action */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2.5">
                        <code className="text-sm font-mono font-bold text-gray-800 tracking-wider">{code}</code>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="p-2.5 text-gray-400 hover:text-main transition-colors rounded-xl hover:bg-gray-100"
                        title="Sao chép mã"
                    >
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                    <button
                        onClick={() => onApply?.(code)}
                        className="px-5 py-2.5 bg-main text-white rounded-xl text-sm font-semibold hover:bg-main/80 transition-colors"
                    >
                        Apply Code
                    </button>
                </div>
            </div>
        </div>
    );
};