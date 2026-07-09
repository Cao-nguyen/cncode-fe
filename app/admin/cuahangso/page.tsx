'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { shopApi, Product } from '@/lib/api/shop.api';
import {
    Search, Plus, Edit, Trash2, CheckCircle, XCircle, Eye, Upload,
    DollarSign, TrendingUp, Box, Filter, X as Close, Save
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';

const CATEGORIES = ['Tài liệu', 'Bài thuyết trình', 'Code', 'Thiết kế', 'Khác'];

export default function AdminShopPage() {
    const { token } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        pendingProducts: 0,
        approvedProducts: 0,
        rejectedProducts: 0,
        totalViews: 0,
        totalPurchases: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Delete state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Approve/Reject state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (token) {
            fetchStats();
            fetchProducts();
        }
    }, [token, page, statusFilter, categoryFilter, search]);

    const fetchStats = async () => {
        if (!token) return;
        try {
            const result = await shopApi.getStats(token);
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchProducts = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const filters = {
                page,
                limit: 12,
                status: statusFilter === 'all' ? undefined : statusFilter,
                category: categoryFilter || undefined,
                search: search || undefined
            };

            const result = await shopApi.getProducts(filters, token);
            if (result.success) {
                setProducts(result.data);
                setTotalPages(result.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!token) return;
        setProcessing(true);
        try {
            const result = await shopApi.approveProduct(id, token);
            if (result.success) {
                fetchProducts();
                fetchStats();
            } else {
                alert(result.message || 'Lỗi khi duyệt sản phẩm');
            }
        } catch (error) {
            console.error('Error approving product:', error);
            alert('Lỗi khi duyệt sản phẩm');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!token || !rejectId || !rejectReason.trim()) return;
        setProcessing(true);
        try {
            const result = await shopApi.rejectProduct(rejectId, rejectReason, token);
            if (result.success) {
                setShowRejectModal(false);
                setRejectId(null);
                setRejectReason('');
                fetchProducts();
                fetchStats();
            } else {
                alert(result.message || 'Lỗi khi từ chối sản phẩm');
            }
        } catch (error) {
            console.error('Error rejecting product:', error);
            alert('Lỗi khi từ chối sản phẩm');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !deleteId || deleting) return;
        setDeleting(true);
        try {
            const result = await shopApi.deleteProduct(deleteId, token);
            if (result.success) {
                setShowDeleteConfirm(false);
                setDeleteId(null);
                fetchProducts();
                fetchStats();
            } else {
                alert(result.message || 'Lỗi khi xóa sản phẩm');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Lỗi khi xóa sản phẩm');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
            approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
            rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800' }
        };
        const variant = variants[status] || variants.pending;
        return <Badge className={variant.className}>{variant.label}</Badge>;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const filteredProducts = products;

    if (loading && page === 1) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cn-primary)] mx-auto mb-4"></div>
                    <p className="text-[var(--cn-text-sub)]">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý Cửa hàng số</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý và duyệt sản phẩm</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <DashboardCard
                    title="Tổng sản phẩm"
                    value={stats.totalProducts}
                    icon={<Box size={18} />}
                    iconBgColor="#EFF6FF"
                    iconColor="#3B82F6"
                />
                <DashboardCard
                    title="Chờ duyệt"
                    value={stats.pendingProducts}
                    icon={<Filter size={18} />}
                    iconBgColor="#FEF3C7"
                    iconColor="#F59E0B"
                />
                <DashboardCard
                    title="Đã duyệt"
                    value={stats.approvedProducts}
                    icon={<CheckCircle size={18} />}
                    iconBgColor="#D1FAE5"
                    iconColor="#10B981"
                />
                <DashboardCard
                    title="Từ chối"
                    value={stats.rejectedProducts}
                    icon={<XCircle size={18} />}
                    iconBgColor="#FEE2E2"
                    iconColor="#EF4444"
                />
                <DashboardCard
                    title="Lượt xem"
                    value={stats.totalViews}
                    icon={<Eye size={18} />}
                    iconBgColor="#F3E8FF"
                    iconColor="#A855F7"
                />
                <DashboardCard
                    title="Lượt mua"
                    value={stats.totalPurchases}
                    icon={<DollarSign size={18} />}
                    iconBgColor="#DBEAFE"
                    iconColor="#3B82F6"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tất cả danh mục</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Box className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Chưa có sản phẩm nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
                        >
                            {/* Product Image */}
                            <div className="relative h-48 bg-gray-100">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Box className="w-16 h-16 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(product.status)}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                                    {product.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatPrice(product.price)}
                                    </span>
                                    <Badge variant="outline">{product.category}</Badge>
                                </div>

                                {/* Seller Info */}
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={product.seller.avatar} />
                                        <AvatarFallback className="text-xs">
                                            {product.seller.fullName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-gray-600 truncate">
                                        {product.seller.fullName}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {product.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            {product.purchases}
                                        </span>
                                    </div>
                                    <span className="text-xs">
                                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>

                                {/* Actions */}
                                {product.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleApprove(product._id)}
                                            disabled={processing}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            size="sm"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Duyệt
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setRejectId(product._id);
                                                setShowRejectModal(true);
                                            }}
                                            disabled={processing}
                                            variant="outline"
                                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                            size="sm"
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Từ chối
                                        </Button>
                                    </div>
                                )}

                                {product.status === 'rejected' && product.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 rounded p-2">
                                        <p className="text-xs text-red-600">
                                            <strong>Lý do:</strong> {product.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2 mt-3">
                                    <Button
                                        onClick={() => setDeleteId(product._id)}
                                        variant="outline"
                                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Trước
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                        Trang {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Sau
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteId(null);
                }}
                onConfirm={handleDelete}
                title="Xác nhận xóa sản phẩm"
                message="Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác."
                isDeleting={deleting}
            />

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Từ chối sản phẩm</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectId(null);
                                    setRejectReason('');
                                }}
                            >
                                <Close className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="rejectReason">Lý do từ chối *</Label>
                                <Textarea
                                    id="rejectReason"
                                    placeholder="Nhập lý do từ chối sản phẩm..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectId(null);
                                        setRejectReason('');
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={processing || !rejectReason.trim()}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {processing ? 'Đang xử lý...' : 'Từ chối'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
