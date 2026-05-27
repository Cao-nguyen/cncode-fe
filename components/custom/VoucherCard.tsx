
'use client';

import React, { useState } from 'react';
import { Copy, Check, Tag, Ticket, Truck, Calendar } from 'lucide-react';

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
    usedCount?: number;
    usageLimit?: number;
    onApply?: (code: string) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
    title,
    description,
    code,
    expiryDate,
    discountValue,
    discountType,
    minOrder,
    isUsed = false,
    onApply,
}) => {
    const [copied, setCopied] = useState(false);

    const getDiscountDisplay = () => {
        const value = parseInt(discountValue);
        if (discountType === 'percentage') return `-${value}%`;
        if (discountType === 'fixed') return `-${value.toLocaleString()}đ`;
        return 'Free Ship';
    };

    const getIcon = () => {
        if (discountType === 'percentage') return <Tag size={18} />;
        if (discountType === 'fixed') return <Ticket size={18} />;
        return <Truck size={18} />;
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
        if (minOrder && minOrder > 0) {
            return `Đơn ${minOrder.toLocaleString()}đ`;
        }
        return 'Không yêu cầu';
    };

    const isExpired = () => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const disabled = isUsed || isExpired();

    return (
        <div className={`bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-200 ${disabled ? 'opacity-50' : 'hover:shadow-md'}`}>
            {}
            <div className={`bg-gradient-to-r ${getTypeColor()} px-3 py-2`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-white opacity-90">{getIcon()}</div>
                        <span className="text-white font-bold text-sm">{getDiscountDisplay()}</span>
                    </div>
                    <span className="text-white/80 text-[10px]">{getConditionText()}</span>
                </div>
            </div>

            {}
            <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{title}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{description}</p>

                {}
                <div className="flex items-center gap-1 mt-2">
                    <Calendar size={10} className="text-gray-300" />
                    <span className="text-[10px] text-gray-400">
                        {isExpired() ? 'Đã hết hạn' : `HSD: ${formatExpiryDate(expiryDate)}`}
                    </span>
                </div>

                {}
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100">
                        <code className="text-xs font-mono font-bold text-gray-700">{code}</code>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <button
                        onClick={() => onApply?.(code)}
                        disabled={disabled}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${disabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {isUsed ? 'Đã dùng' : isExpired() ? 'Hết hạn' : 'Áp dụng'}
                    </button>
                </div>
            </div>
        </div>
    );
};
