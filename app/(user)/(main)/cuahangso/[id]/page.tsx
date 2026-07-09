'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Eye, Download, FileText, Image as ImageIcon, User, Calendar, Tag } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { getProductById, addTransaction } from '@/lib/utils/shopHistory';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [buying, setBuying] = useState(false);

    const product = useMemo(() => {
        if (!id) return null;
        return getProductById(id as string);
    }, [id]);

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm</p>
                    <Link href="/cuahangso" className="text-blue-500 hover:underline mt-2 inline-block">
                        Quay lại cửa hàng
                    </Link>
                </div>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleBuy = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để mua sản phẩm');
            router.push('/login');
            return;
        }

        if (user._id === product.sellerId) {
            toast.error('Bạn không thể mua sản phẩm của chính mình');
            return;
        }

        setBuying(true);
        try {
            // Simulate purchase
            const transaction = {
                id: Date.now().toString(),
                productId: product._id,
                productName: product.title,
                sellerId: product.sellerId,
                sellerName: product.sellerName,
                buyerId: user._id,
                buyerName: user.fullName || user.username || 'Unknown',
                price: product.price,
                timestamp: new Date().toISOString()
            };

            addTransaction(transaction);
            toast.success('Mua sản phẩm thành công! Kiểm tra email để nhận link tải');

            // Update views and purchases
            product.purchases += 1;

        } catch (error) {
            console.error('Error buying product:', error);
            toast.error('Có lỗi xảy ra khi mua sản phẩm');
        } finally {
            setBuying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link
                    href="/cuahangso"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại cửa hàng
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="relative h-96 bg-gray-100 dark:bg-gray-700">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[selectedImage]}
                                        alt={product.title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="w-24 h-24 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative h-20 rounded-lg overflow-hidden ${selectedImage === idx
                                            ? 'ring-2 ring-blue-500'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="mb-4">
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {product.title}
                            </h1>

                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{product.views} lượt xem</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{product.purchases} đã mua</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                {product.price === 0 ? (
                                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        Miễn phí
                                    </span>
                                ) : (
                                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>

                            <CustomButton
                                onClick={handleBuy}
                                disabled={buying || Boolean(user && user._id === product.sellerId)}
                                className="w-full gap-2 py-6 text-lg"
                            >
                                {buying ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        {product.price === 0 ? 'Tải xuống miễn phí' : 'Mua ngay'}
                                    </>
                                )}
                            </CustomButton>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <User className="w-5 h-5" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">Người bán</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{product.sellerName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-5 h-5" />
                                <span>
                                    Đăng ngày {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>

                        {/* Files */}
                        {product.files && product.files.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Tài liệu đính kèm ({product.files.length})
                                </h3>
                                <div className="space-y-2">
                                    {product.files.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description & Tags */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mô tả sản phẩm</h2>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {product.description}
                    </p>

                    {product.tags && product.tags.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag className="w-5 h-5 text-gray-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}