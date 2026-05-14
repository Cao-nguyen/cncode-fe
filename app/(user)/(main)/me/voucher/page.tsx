// app/me/voucher/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Gift, Clock, Tag, Truck, Percent, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { voucherApi } from '@/lib/api/voucher.api';
import { IUserVoucher } from '@/types/voucher.type';

type TabType = 'all' | 'expiring_soon' | 'newest';

export default function MyVoucherPage() {
    const { token } = useAuthStore();
    const [vouchers, setVouchers] = useState<IUserVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            loadVouchers();
        }
    }, [token]);

    const loadVouchers = async () => {
        setLoading(true);
        const res = await voucherApi.getMyVouchers(token!);
        if (res.success) {
            const now = new Date();
            const available = res.data.filter(v =>
                v.status === 'available' && new Date(v.expiresAt) > now
            );
            setVouchers(available);
        } else {
            toast.error('Không thể tải danh sách ưu đãi');
        }
        setLoading(false);
    };

    const getDaysLeft = (expiryDate: string) => {
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const getFilteredVouchers = () => {
        let result = [...vouchers];

        if (activeTab === 'expiring_soon') {
            // Chỉ lấy voucher còn <= 3 ngày
            result = result.filter(v => getDaysLeft(v.expiresAt) <= 3);
            // Sắp xếp theo số ngày tăng dần (sắp hết nhất lên đầu)
            result.sort((a, b) => getDaysLeft(a.expiresAt) - getDaysLeft(b.expiresAt));
        } else if (activeTab === 'newest') {
            // Sắp xếp theo ngày nhận mới nhất
            result.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
        }

        return result;
    };

    const getDiscountIcon = (type: string) => {
        switch (type) {
            case 'percentage': return <Percent size={16} />;
            case 'fixed': return <Tag size={16} />;
            case 'freeship': return <Truck size={16} />;
            default: return <Tag size={16} />;
        }
    };

    const getDiscountDisplay = (voucher: IUserVoucher) => {
        const v = voucher.voucherId;
        if (v.discountType === 'percentage') return `${v.discountValue}% GIẢM`;
        if (v.discountType === 'fixed') return `${v.discountValue.toLocaleString()}đ GIẢM`;
        return 'FREESHIP';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'percentage': return 'text-orange-500';
            case 'fixed': return 'text-blue-500';
            case 'freeship': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const getTypeBg = (type: string) => {
        switch (type) {
            case 'percentage': return 'bg-orange-50';
            case 'fixed': return 'bg-blue-50';
            case 'freeship': return 'bg-green-50';
            default: return 'bg-gray-50';
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Đã sao chép mã');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredVouchers = getFilteredVouchers();
    const isHot = (voucher: IUserVoucher) => {
        const v = voucher.voucherId;
        return v.discountValue >= 50 || (v.discountType === 'fixed' && v.discountValue >= 500000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Tính số lượng cho từng tab
    const expiringSoonCount = vouchers.filter(v => getDaysLeft(v.expiresAt) <= 3).length;

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Kho Voucher</h1>
                    </div>
                    <p className="text-sm text-gray-500">Ưu đãi dành riêng cho bạn</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 px-1 text-sm font-medium transition relative ${activeTab === 'all'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Tất cả ({vouchers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('expiring_soon')}
                        className={`pb-3 px-1 text-sm font-medium transition relative ${activeTab === 'expiring_soon'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sắp hết hạn ({expiringSoonCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('newest')}
                        className={`pb-3 px-1 text-sm font-medium transition relative ${activeTab === 'newest'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Mới nhất
                    </button>
                </div>

                {/* Vouchers Grid */}
                {filteredVouchers.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {activeTab === 'expiring_soon' ? 'Không có voucher sắp hết hạn' : 'Chưa có ưu đãi nào'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {activeTab === 'expiring_soon' ? 'Tất cả voucher của bạn vẫn còn nhiều thời gian sử dụng' : 'Hãy tham gia các hoạt động để nhận voucher nhé!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredVouchers.map((userVoucher) => {
                            const voucher = userVoucher.voucherId;
                            const daysLeft = getDaysLeft(userVoucher.expiresAt);
                            const hot = isHot(userVoucher);

                            return (
                                <div key={userVoucher._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
                                    {/* Header */}
                                    <div className={`p-3 ${getTypeBg(voucher.discountType)} border-b border-gray-100`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={getTypeColor(voucher.discountType)}>
                                                    {getDiscountIcon(voucher.discountType)}
                                                </div>
                                                <span className={`font-bold text-lg ${getTypeColor(voucher.discountType)}`}>
                                                    {getDiscountDisplay(userVoucher)}
                                                </span>
                                                {hot && (
                                                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                                        HOT
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-800 mb-1">{voucher.title}</h3>
                                        <p className="text-xs text-gray-500 mb-2">{voucher.description}</p>

                                        {/* Condition */}
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <span className="text-xs text-gray-500">
                                                Đơn tối thiểu {voucher.minOrder > 0 ? `${voucher.minOrder.toLocaleString()}đ` : '0đ'}
                                            </span>
                                        </div>

                                        {/* Code và nút copy */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100">
                                                <code className="text-xs font-mono font-bold text-gray-700">{voucher.code}</code>
                                            </div>
                                            <button
                                                onClick={() => handleCopyCode(voucher.code)}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                                            >
                                                {copiedCode === voucher.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} className={`${daysLeft <= 3 ? 'text-red-500' : 'text-gray-400'}`} />
                                                <span className={`text-xs ${daysLeft <= 3 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                                    Còn {daysLeft} ngày
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Note */}
                {filteredVouchers.length > 0 && (
                    <div className="mt-8 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-blue-500" />
                            <p className="text-xs text-blue-600">
                                Mỗi mã chỉ được sử dụng một lần. Voucher sẽ tự động hết hạn sau ngày được ghi trên thẻ.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}