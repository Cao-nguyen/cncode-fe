'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    XCircle,
    Trash2,
    Eye,
    Loader2,
    ShoppingBag,
    Clock,
    Package,
    Coins,
    Download,
} from 'lucide-react';
import { shopApi, Product, SHOP_CATEGORIES, ShopAdminStats } from '@/lib/api/shop.api';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomInput } from '@/components/custom/CustomInput';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableScroll } from '@/components/admin/AdminTableScroll';
import { getImageUrl, getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import { formatShopPrice, formatShopOriginalPrice } from '@/lib/cuahangso/cuahangso-display.utils';
import { getPayableAmount, formatVndCompact } from '@/lib/utils/currency.utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminShopProductDetailModal } from '@/components/cuahangso/AdminShopProductDetailModal';
import { AdminShopDashboard } from '@/components/cuahangso/AdminShopDashboard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' },
];

const CATEGORY_OPTIONS = [
    { value: '', label: 'Tất cả danh mục' },
    ...SHOP_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
];

const STATUS_BADGE: Record<Product['status'], string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_LABEL: Record<Product['status'], string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
};

const PAGE_SIZE = 10;

function RejectModal({
    open,
    onClose,
    onConfirm,
    loading,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading: boolean;
}) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (open) setReason('');
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-[#141414]"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-3 text-lg font-semibold text-[var(--cn-text-main)]">Từ chối sản phẩm</h3>
                <CustomInput
                    label="Lý do từ chối"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do..."
                />
                <div className="mt-4 flex justify-end gap-2">
                    <CustomButton variant="outline" onClick={onClose}>
                        Hủy
                    </CustomButton>
                    <CustomButton
                        onClick={() => onConfirm(reason)}
                        loading={loading}
                        disabled={!reason.trim()}
                    >
                        Xác nhận
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}

export default function AdminCuaHangSoPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ShopAdminStats | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Product | null>(null);
    const [detailProductId, setDetailProductId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                shopApi.getProducts({
                    page,
                    limit: PAGE_SIZE,
                    status: statusFilter,
                    category: categoryFilter || undefined,
                    search: search.trim() || undefined,
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                }),
                shopApi.getStats(),
            ]);

            if (listRes.success) {
                setProducts(listRes.data || []);
                setTotalPages(listRes.pagination?.pages || 1);
                setTotalItems(listRes.pagination?.total ?? 0);
            }
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, categoryFilter, search]);

    useEffect(() => {
        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleApprove = async (product: Product) => {
        setActionLoading(product._id);
        try {
            const res = await shopApi.approveProduct(product._id);
            if (res.success) {
                toast.success(res.message || 'Đã duyệt sản phẩm');
                setDetailProductId(null);
                fetchData();
            } else {
                toast.error(res.message || 'Không thể duyệt sản phẩm');
            }
        } catch {
            toast.error('Lỗi khi duyệt sản phẩm');
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectFromDetail = (product: Product) => {
        setDetailProductId(null);
        setRejectTarget(product);
    };

    const handleReject = async (reason: string) => {
        if (!rejectTarget) return;
        setActionLoading(rejectTarget._id);
        try {
            const res = await shopApi.rejectProduct(rejectTarget._id, reason);
            if (res.success) {
                toast.success('Đã từ chối sản phẩm');
                setRejectTarget(null);
                fetchData();
            } else {
                toast.error(res.message || 'Không thể từ chối sản phẩm');
            }
        } catch {
            toast.error('Lỗi khi từ chối sản phẩm');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(deleteTarget._id);
        try {
            const res = await shopApi.deleteProduct(deleteTarget._id);
            if (res.success) {
                toast.success('Đã xóa sản phẩm');
                setDeleteTarget(null);
                fetchData();
            } else {
                toast.error('Không thể xóa sản phẩm');
            }
        } catch {
            toast.error('Lỗi khi xóa sản phẩm');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <AdminPageShell
            title="Quản lý cửa hàng số"
            description="Duyệt, từ chối và quản lý sản phẩm số do người dùng đăng bán"
        >
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <DashboardCard title="Tổng sản phẩm" value={stats?.totalProducts ?? 0} icon={<Package size={18} />} iconBgColor="#EFF6FF" iconColor="#2563EB" />
                <DashboardCard title="Chờ duyệt" value={stats?.pendingProducts ?? 0} icon={<Clock size={18} />} iconBgColor="#FFF7ED" iconColor="#F97316" />
                <DashboardCard title="Đã duyệt" value={stats?.approvedProducts ?? 0} icon={<CheckCircle size={18} />} iconBgColor="#ECFDF5" iconColor="#059669" />
                <DashboardCard title="Lượt mua" value={stats?.totalPurchases ?? 0} icon={<ShoppingBag size={18} />} iconBgColor="#F5F3FF" iconColor="#7C3AED" />
                <DashboardCard
                    title="Doanh thu"
                    value={formatVndCompact(stats?.totalRevenue ?? 0)}
                    icon={<Coins size={18} />}
                    iconBgColor="#FEF3C7"
                    iconColor="#D97706"
                />
                <DashboardCard title="Lượt tải" value={stats?.totalDownloads ?? 0} icon={<Download size={18} />} iconBgColor="#ECFEFF" iconColor="#0891B2" description={`${(stats?.totalViews ?? 0).toLocaleString('vi-VN')} lượt xem`} />
            </div>

            <AdminShopDashboard stats={stats} />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="min-w-[200px] flex-1">
                    <CustomInputSearch
                        placeholder="Tìm theo tên, mô tả..."
                        value={search}
                        onChange={setSearch}
                        size="medium"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <CustomSelect
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(v) => {
                            setStatusFilter(v);
                            setPage(1);
                        }}
                        placeholder="Trạng thái"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <CustomSelect
                        options={CATEGORY_OPTIONS}
                        value={categoryFilter}
                        onChange={(v) => {
                            setCategoryFilter(v);
                            setPage(1);
                        }}
                        placeholder="Danh mục"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#141414]">
                <AdminTableScroll minWidth={980}>
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40">
                            <tr className="text-left">
                                <th className="w-[52px] px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    STT
                                </th>
                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Sản phẩm
                                </th>
                                <th className="w-[130px] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Danh mục
                                </th>
                                <th className="w-[130px] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Giá
                                </th>
                                <th className="min-w-[180px] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Người bán
                                </th>
                                <th className="w-[110px] px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Trạng thái
                                </th>
                                <th className="w-[130px] px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className={cn('divide-y divide-gray-100 dark:divide-gray-800', loading && 'opacity-60')}>
                            {loading && products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--cn-primary)]" />
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                        <p className="text-sm text-gray-400">Không có sản phẩm nào</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => {
                                    const thumb = product.coverImage || product.images?.[0];
                                    const sellerName = product.seller?.fullName || '—';
                                    const payable = getPayableAmount(product);

                                    return (
                                        <tr
                                            key={product._id}
                                            className="transition hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                        >
                                            <td className="px-5 py-4 text-center text-sm text-gray-500">
                                                {(page - 1) * PAGE_SIZE + index + 1}
                                            </td>
                                            <td
                                                className="cursor-pointer px-5 py-4 transition hover:bg-blue-50/60 dark:hover:bg-blue-900/10"
                                                onClick={() => setDetailProductId(product._id)}
                                                title="Xem chi tiết sản phẩm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                                                        {thumb ? (
                                                            <img
                                                                src={getImageUrl(thumb)}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600 dark:text-gray-100">
                                                            {product.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {payable === 0 ? (
                                                    <span className="text-sm font-medium text-emerald-600">Miễn phí</span>
                                                ) : (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                            {formatShopPrice(product)}
                                                        </span>
                                                        {product.discountPrice != null &&
                                                            product.discountPrice < (product.price ?? 0) && (
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    {formatShopOriginalPrice(product.price ?? 0)}
                                                                </span>
                                                            )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8 shrink-0 border border-gray-200 dark:border-gray-700">
                                                        {product.seller?.avatar ? (
                                                            <AvatarImage
                                                                {...avatarImageProps}
                                                                src={getAvatarUrl(product.seller.avatar)}
                                                            />
                                                        ) : null}
                                                        <AvatarFallback className="text-xs">
                                                            {sellerName.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {sellerName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={cn(
                                                        'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
                                                        STATUS_BADGE[product.status],
                                                    )}
                                                >
                                                    {STATUS_LABEL[product.status]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    {product.slug && product.status === 'approved' && (
                                                        <Link
                                                            href={`/cuahangso/${product.slug}`}
                                                            target="_blank"
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                                            title="Xem"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                    {product.status === 'pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(product)}
                                                                disabled={actionLoading === product._id}
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
                                                                title="Duyệt"
                                                            >
                                                                {actionLoading === product._id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectTarget(product)}
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                                title="Từ chối"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {product.status === 'approved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRejectTarget(product)}
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                            title="Từ chối lại"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {product.status === 'rejected' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(product)}
                                                            disabled={actionLoading === product._id}
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
                                                            title="Duyệt lại"
                                                        >
                                                            {actionLoading === product._id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(product)}
                                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </AdminTableScroll>

                <AdminPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                    itemLabel="bản ghi"
                />
            </div>

            <AdminShopProductDetailModal
                productId={detailProductId}
                onClose={() => setDetailProductId(null)}
                onApprove={handleApprove}
                onReject={openRejectFromDetail}
                actionLoading={!!detailProductId && actionLoading === detailProductId}
            />

            <RejectModal
                open={!!rejectTarget}
                onClose={() => setRejectTarget(null)}
                onConfirm={handleReject}
                loading={!!rejectTarget && actionLoading === rejectTarget._id}
            />

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa sản phẩm"
                message={`Bạn có chắc muốn xóa "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
            />
        </AdminPageShell>
    );
}
