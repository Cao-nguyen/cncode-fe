// app/admin/voucher/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, Edit, Trash2,
    X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Tag, Loader2, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { voucherApi } from '@/lib/api/voucher.api';
import { IVoucher, ICreateVoucherDto, DiscountType } from '@/types/voucher.type';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { DashboardCard } from '@/components/custom/DashboardCard';

const PAGE_SIZE = 10;

const discountTypeOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'percentage', label: 'Phần trăm (%)' },
    { value: 'fixed', label: 'Giảm cố định (VNĐ)' },
    { value: 'freeship', label: 'Miễn phí vận chuyển' },
];

const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Tạm dừng' },
    { value: 'expired', label: 'Hết hạn' },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Hoạt động</span>;
        case 'inactive':
            return <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Tạm dừng</span>;
        case 'expired':
            return <span className="inline-flex px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Hết hạn</span>;
        default:
            return <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{status}</span>;
    }
};

export default function AdminVoucherPage() {
    const { token } = useAuthStore();
    const [vouchers, setVouchers] = useState<IVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVouchers, setTotalVouchers] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        discountType: '',
        status: '',
    });

    const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        discountValue: 0,
        discountType: 'percentage' as DiscountType,
        category: 'Khóa học',
        minOrder: 0,
        maxDiscount: '',
        expiryDate: '',
        usageLimit: 100,
        isGlobal: true, // Mặc định global cho tất cả user
    });

    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const stats = {
        total: vouchers.length,
        active: vouchers.filter(v => v.status === 'active').length,
        inactive: vouchers.filter(v => v.status === 'inactive').length,
        expired: vouchers.filter(v => v.status === 'expired').length,
        totalUsage: vouchers.reduce((sum, v) => sum + v.usedCount, 0),
    };

    const cardConfigs = [
        { key: 'total', title: 'Tổng voucher', value: stats.total, iconBgColor: '#EFF6FF', iconColor: '#3B82F6', icon: <Tag size={18} /> },
        { key: 'active', title: 'Đang hoạt động', value: stats.active, iconBgColor: '#F0FDF4', iconColor: '#22C55E', icon: <Tag size={18} /> },
        { key: 'inactive', title: 'Tạm dừng', value: stats.inactive, iconBgColor: '#F3F4F6', iconColor: '#6B7280', icon: <Tag size={18} /> },
        { key: 'expired', title: 'Hết hạn', value: stats.expired, iconBgColor: '#FEE2E2', iconColor: '#EF4444', icon: <Tag size={18} /> },
        { key: 'usage', title: 'Lượt sử dụng', value: stats.totalUsage, iconBgColor: '#F5F3FF', iconColor: '#8B5CF6', icon: <Tag size={18} /> },
    ];

    const fetchVouchers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await voucherApi.getAllVouchers(token, {
                search: filters.search || undefined,
                status: filters.status || undefined,
            });
            if (result.success) {
                setVouchers(result.data);
                setTotalVouchers(result.data.length);
                setTotalPages(Math.ceil(result.data.length / PAGE_SIZE));
            }
        } catch (error) {
            console.error('Failed to fetch vouchers:', error);
        } finally {
            setLoading(false);
        }
    }, [token, filters]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    const filteredVouchers = vouchers.filter(v => {
        if (filters.discountType && v.discountType !== filters.discountType) return false;
        return true;
    });

    const paginatedVouchers = filteredVouchers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('vi-VN');
    };

    const getDiscountDisplay = (voucher: IVoucher) => {
        if (voucher.discountType === 'percentage') return `${voucher.discountValue}%`;
        if (voucher.discountType === 'fixed') return `${formatNumber(voucher.discountValue)}đ`;
        return 'Free ship';
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Đã sao chép mã');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleOpenCreateModal = () => {
        setSelectedVoucher(null);
        setFormData({
            title: '',
            description: '',
            code: '',
            discountValue: 0,
            discountType: 'percentage',
            category: 'Khóa học',
            minOrder: 0,
            maxDiscount: '',
            expiryDate: '',
            usageLimit: 100,
            isGlobal: true,
        });
        setShowVoucherModal(true);
    };

    const handleOpenEditModal = (voucher: IVoucher) => {
        setSelectedVoucher(voucher);
        setFormData({
            title: voucher.title,
            description: voucher.description,
            code: voucher.code,
            discountValue: voucher.discountValue,
            discountType: voucher.discountType,
            category: voucher.category,
            minOrder: voucher.minOrder,
            maxDiscount: voucher.maxDiscount?.toString() || '',
            expiryDate: voucher.expiryDate.split('T')[0],
            usageLimit: voucher.usageLimit,
            isGlobal: voucher.isGlobal,
        });
        setShowVoucherModal(true);
    };

    const handleSubmitVoucher = async () => {
        if (!formData.title || !formData.code || !formData.expiryDate) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        const data = {
            ...formData,
            maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
            isGlobal: true, // Luôn global
        };

        let res;
        if (selectedVoucher) {
            res = await voucherApi.updateVoucher(token!, selectedVoucher._id, data);
        } else {
            res = await voucherApi.createVoucher(token!, data);
        }

        if (res.success) {
            toast.success(selectedVoucher ? 'Cập nhật thành công' : 'Tạo voucher thành công');
            setShowVoucherModal(false);
            fetchVouchers();
        } else {
            toast.error(res.message || 'Có lỗi xảy ra');
        }
        setSubmitting(false);
    };

    const handleDeleteVoucher = async () => {
        if (!selectedVoucher) return;
        setActionLoading(true);
        const res = await voucherApi.deleteVoucher(token!, selectedVoucher._id);
        if (res.success) {
            toast.success('Xóa voucher thành công');
            setShowDeleteConfirm(false);
            setSelectedVoucher(null);
            fetchVouchers();
        } else {
            toast.error(res.message || 'Có lỗi xảy ra');
        }
        setActionLoading(false);
    };

    if (loading && vouchers.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Voucher</h1>
                    <p className="text-sm text-gray-500 mt-1">Tạo và quản lý mã giảm giá toàn hệ thống</p>
                </div>
                <CustomButton variant="primary" onClick={handleOpenCreateModal}>
                    <Plus size={16} />
                    Tạo voucher
                </CustomButton>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {cardConfigs.map((card) => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                        change={0}
                        trend="neutral"
                    />
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <CustomInput
                            placeholder="Tìm kiếm theo tên hoặc mã..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            icon={<Search size={16} />}
                        />
                    </div>
                    <div className="w-48">
                        <CustomSelect
                            value={filters.discountType}
                            onChange={(value) => setFilters(prev => ({ ...prev, discountType: value }))}
                            options={discountTypeOptions}
                            placeholder="Loại giảm giá"
                        />
                    </div>
                    <div className="w-48">
                        <CustomSelect
                            value={filters.status}
                            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            options={statusOptions}
                            placeholder="Trạng thái"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Mã</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tiêu đề</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Giảm giá</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tối thiểu</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Loại</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Hạn dùng</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                        <p className="text-sm text-gray-400 mt-3">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : paginatedVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16">
                                        <Tag size={48} className="text-gray-300 mx-auto" />
                                        <p className="text-gray-400 mt-2">Không có voucher nào</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedVouchers.map((voucher) => (
                                    <tr key={voucher._id} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-mono font-semibold text-blue-600">{voucher.code}</code>
                                                <button
                                                    onClick={() => handleCopyCode(voucher.code)}
                                                    className="p-1 text-gray-400 hover:text-blue-500 transition"
                                                >
                                                    {copiedCode === voucher.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{voucher.title}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{voucher.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm font-semibold text-blue-600">{getDiscountDisplay(voucher)}</span>
                                            {voucher.maxDiscount && voucher.discountType === 'percentage' && (
                                                <p className="text-xs text-gray-400">tối đa {formatNumber(voucher.maxDiscount)}đ</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-gray-600">{voucher.minOrder > 0 ? `${formatNumber(voucher.minOrder)}đ` : '0đ'}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-gray-600">
                                                {voucher.discountType === 'percentage' ? 'Phần trăm' :
                                                    voucher.discountType === 'fixed' ? 'Cố định' : 'Free ship'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-gray-500">{formatDate(voucher.expiryDate)}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {getStatusBadge(voucher.status)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEditModal(voucher)}
                                                    className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg transition"
                                                    title="Sửa"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedVoucher(voucher); setShowDeleteConfirm(true); }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                        <div className="text-sm text-gray-500">
                            Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalVouchers)} trên {totalVouchers}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronsLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 text-sm text-gray-700">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronRight size={16} />
                            </button>
                            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showVoucherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowVoucherModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {selectedVoucher ? 'Sửa voucher' : 'Tạo voucher mới'}
                            </h3>
                            <button onClick={() => setShowVoucherModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Mã voucher *"
                                    placeholder="VD: SALE50"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                                <CustomSelect
                                    label="Loại giảm giá"
                                    options={[
                                        { value: 'percentage', label: 'Phần trăm (%)' },
                                        { value: 'fixed', label: 'Giảm cố định (VNĐ)' },
                                        { value: 'freeship', label: 'Miễn phí vận chuyển' },
                                    ]}
                                    value={formData.discountType}
                                    onChange={(val) => setFormData({ ...formData, discountType: val as DiscountType })}
                                />
                            </div>
                            <CustomInput
                                label="Tiêu đề *"
                                placeholder="VD: Giảm giá khóa học React"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <CustomTextarea
                                label="Mô tả"
                                placeholder="Mô tả chi tiết về voucher"
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                                rows={2}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Giá trị giảm *"
                                    type="number"
                                    placeholder={formData.discountType === 'percentage' ? '50' : '100000'}
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                />
                                <CustomSelect
                                    label="Danh mục"
                                    options={[
                                        { value: 'Khóa học', label: 'Khóa học' },
                                        { value: 'Đơn hàng', label: 'Đơn hàng' },
                                        { value: 'Vận chuyển', label: 'Vận chuyển' },
                                        { value: 'Sản phẩm', label: 'Sản phẩm' },
                                    ]}
                                    value={formData.category}
                                    onChange={(val) => setFormData({ ...formData, category: val })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Đơn hàng tối thiểu"
                                    type="number"
                                    placeholder="0"
                                    value={formData.minOrder}
                                    onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                                />
                                {formData.discountType === 'percentage' && (
                                    <CustomInput
                                        label="Giảm tối đa"
                                        type="number"
                                        placeholder="Không giới hạn"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Ngày hết hạn *"
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                                <CustomInput
                                    label="Số lượt sử dụng tối đa"
                                    type="number"
                                    placeholder="100"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <CustomButton variant="secondary" onClick={() => setShowVoucherModal(false)}>Hủy</CustomButton>
                            <CustomButton variant="primary" onClick={handleSubmitVoucher} loading={submitting}>
                                {selectedVoucher ? 'Cập nhật' : 'Tạo voucher'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && selectedVoucher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">Xóa voucher</h3>
                            <button onClick={() => setShowDeleteConfirm(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <Trash2 size={20} className="text-red-500" />
                                </div>
                                <p className="text-gray-900">
                                    Xóa voucher <span className="font-semibold">{selectedVoucher.code}</span>?
                                </p>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Hành động này không thể hoàn tác.</p>
                            <div className="flex gap-3">
                                <CustomButton variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Hủy</CustomButton>
                                <CustomButton variant="danger" onClick={handleDeleteVoucher} loading={actionLoading}>Xóa</CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}