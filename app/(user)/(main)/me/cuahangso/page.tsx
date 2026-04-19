'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Plus, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { digitalProductApi } from '@/lib/api/digital-product.api';
import { useAuthStore } from '@/store/auth.store';
import { IDigitalProduct } from '@/types/digital-product.type';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'published':
            return { label: 'Đã duyệt', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle };
        case 'draft':
            return { label: 'Bản nháp', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400', icon: Clock };
        default:
            return { label: status, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: AlertCircle };
    }
};

export default function MyProductsPage() {
    const { token } = useAuthStore();
    const [products, setProducts] = useState<IDigitalProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const result = await digitalProductApi.getUserProducts(token!);
            if (result.success) {
                setProducts(result.data);
            }
        } catch (error) {
            toast.error('Lỗi khi tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const result = await digitalProductApi.deleteProduct(deleteTarget.id, token!);
            if (result.success) {
                toast.success('Xóa sản phẩm thành công');
                setProducts(products.filter(p => p._id !== deleteTarget.id));
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeleteTarget(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
                <div className="container mx-auto px-5 lg:px-10">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
            <div className="container mx-auto px-5 lg:px-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sản phẩm của tôi</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý các sản phẩm bạn đã đăng</p>
                    </div>
                    <Link
                        href="/me/cuahangso/create"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>Đăng sản phẩm mới</span>
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white dark:bg-[#171717] rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                        <Package size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chưa có sản phẩm</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Bạn chưa đăng sản phẩm nào</p>
                        <Link
                            href="/me/cuahangso/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Đăng sản phẩm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {products.map((product) => {
                            const StatusBadge = getStatusBadge(product.status);
                            const StatusIcon = StatusBadge.icon;

                            return (
                                <div
                                    key={product._id}
                                    className="bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-800"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4 p-5">
                                        <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                            <Image
                                                width={128}
                                                height={128}
                                                src={product.thumbnail}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                        {formatPrice(product.price)}
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium mt-2 ${StatusBadge.color}`}>
                                                        <StatusIcon size={12} />
                                                        <span>{StatusBadge.label}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-3">
                                                <span>Lượt tải: {product.downloadCount.toLocaleString()}</span>
                                                <span>Đánh giá: {product.rating.toFixed(1)} ({product.reviewCount})</span>
                                                <span>Ngày đăng: {new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <Link
                                                    href={`/cuahangso/${product.slug}`}
                                                    target="_blank"
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    Xem
                                                </Link>
                                                <Link
                                                    href={`/me/cuahangso/edit/${product._id}`}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                >
                                                    <Edit size={14} />
                                                    Sửa
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget({ id: product._id, name: product.name })}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa sản phẩm"
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </div>
    );
}