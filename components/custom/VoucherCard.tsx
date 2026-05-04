import React from 'react';
import { Tag, Calendar, CheckCircle } from 'lucide-react';

interface VoucherCardProps {
    title: string;
    description: string;
    code: string;
    expiryDate: string;
    discount: string;
    type: 'percentage' | 'fixed' | 'freeship';
    condition?: string;
    onUse?: () => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
    title,
    description,
    code,
    expiryDate,
    discount,
    type,
    condition,
    onUse,
}) => {
    const getTypeStyles = () => {
        switch (type) {
            case 'percentage':
                return 'bg-orange-100 text-orange-700';
            case 'fixed':
                return 'bg-blue-100 text-blue-700';
            case 'freeship':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getDiscountDisplay = () => {
        if (type === 'percentage') return `${discount}% GIẢM GIÁ`;
        if (type === 'fixed') return `${discount} GIẢM GIÁ`;
        return 'FREESHIP MIỄN PHÍ';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className={`p-4 ${getTypeStyles()}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        <span className="font-bold text-sm">{getDiscountDisplay()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>HSD: {expiryDate}</span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 mb-3">{description}</p>

                <div className="mb-3">
                    <p className="text-xs text-gray-500">Mã: <span className="font-mono font-semibold">{code}</span></p>
                    {condition && <p className="text-xs text-gray-500 mt-1">Điều kiện: {condition}</p>}
                </div>

                <button
                    onClick={onUse}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    Sử dụng
                </button>
            </div>
        </div>
    );
};