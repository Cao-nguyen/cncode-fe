'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Loader2, ExternalLink, Upload, ImageIcon } from 'lucide-react';
import { linkedProductApi } from '@/lib/api/linkedProduct.api';
import { uploadApi } from '@/lib/upload';
import { LinkedProduct, CreateLinkedProductDto } from '@/types/linkedProduct.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';

export default function AdminSanPhamLienKetPage() {
    const [products, setProducts] = useState<LinkedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<LinkedProduct | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<LinkedProduct | null>(null);
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<CreateLinkedProductDto>({
        name: '',
        thumbnailUrl: '',
        productUrl: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await linkedProductApi.getUserProducts({ limit: 100 });

            if (res.success) {
                setProducts(res.products || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }

        setUploading(true);
        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });

            const result = await uploadApi.uploadImage(base64, 'linked-products');

            if (result.success && result.url) {
                setFormData({ ...formData, thumbnailUrl: result.url });
            } else {
                alert(result.message || 'Upload ảnh thất bại');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi khi upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.productUrl) {
            alert('Vui lòng nhập tên sản phẩm và URL');
            return;
        }

        setSubmitting(true);
        try {
            if (editingProduct) {
                await linkedProductApi.updateProduct(editingProduct._id, formData);
            } else {
                await linkedProductApi.createProduct(formData);
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);

            if (error instanceof Error) {
                alert(error.message);
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                alert((error as { message: string }).message);
            } else {
                alert('Có lỗi xảy ra khi lưu sản phẩm');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await linkedProductApi.deleteProduct(deleteConfirm._id);
            setDeleteConfirm(null);
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi xoá sản phẩm');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            thumbnailUrl: '',
            productUrl: '',
        });
    };

    const openEditModal = (product: LinkedProduct) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            thumbnailUrl: product.thumbnailUrl || '',
            productUrl: product.productUrl,
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý sản phẩm liên kết</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng {products.length} sản phẩm</p>
                </div>
                <CustomButton
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Thêm sản phẩm
                </CustomButton>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                            <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            <div className="p-3 space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                                <div className="flex gap-2">
                                    <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-[var(--cn-radius-lg)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-12 text-center">
                    <ImageIcon className="mx-auto mb-4 h-16 w-16 text-[var(--cn-text-muted)]" />
                    <p className="text-[var(--cn-text-sub)]">Chưa có sản phẩm nào</p>
                    <CustomButton
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="mt-4"
                    >
                        Thêm sản phẩm đầu tiên
                    </CustomButton>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="group overflow-hidden rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)] transition-all duration-300 hover:shadow-[var(--cn-shadow-md)]"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-40 overflow-hidden bg-[var(--cn-bg-section)]">
                                {product.thumbnailUrl && !imgErrors[product._id] ? (
                                    <img
                                        src={product.thumbnailUrl}
                                        alt={product.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={() => setImgErrors(prev => ({ ...prev, [product._id]: true }))}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cn-primary)]/10">
                                            <ImageIcon className="h-8 w-8 text-[var(--cn-text-muted)]" />
                                        </div>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="min-h-[40px] text-center text-sm font-semibold text-[var(--cn-text-main)] line-clamp-2">
                                        {product.name}
                                    </h3>

                                    <div className="mt-3 flex gap-2">
                                        <a
                                            href={product.productUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-1 items-center justify-center gap-1 rounded-[var(--cn-radius-sm)] bg-[var(--cn-primary)] px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--cn-primary-hover)]"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            <span>Truy cập</span>
                                        </a>
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] px-2 py-1.5 text-[var(--cn-text-muted)] transition-colors hover:border-blue-500 hover:text-blue-500"
                                        >
                                            <Edit className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(product)}
                                            className="rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] px-2 py-1.5 text-[var(--cn-text-muted)] transition-colors hover:border-red-500 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-md rounded-[var(--cn-radius-lg)] bg-[var(--cn-bg-card)]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-[var(--cn-border)] p-5">
                            <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">
                                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="rounded p-1 hover:bg-[var(--cn-hover)]">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            {/* Tên sản phẩm */}
                            <CustomInput
                                label="Tên sản phẩm"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên sản phẩm"
                            />

                            {/* Upload ảnh */}
                            <div>
                                <label className="mb-1.5 block text-[11px] font-medium text-[var(--cn-text-sub)] lg:text-[13px]">
                                    Ảnh thumbnail
                                </label>
                                <div
                                    className="relative cursor-pointer rounded-[var(--cn-radius-md)] border-2 border-dashed border-[var(--cn-border)] p-4 text-center transition-colors hover:border-[var(--cn-primary)]"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file);
                                        }}
                                    />

                                    {uploading ? (
                                        <div className="py-4">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--cn-primary)]" />
                                            <p className="mt-2 text-sm text-[var(--cn-text-muted)]">Đang upload...</p>
                                        </div>
                                    ) : formData.thumbnailUrl ? (
                                        <div className="relative">
                                            <img
                                                src={formData.thumbnailUrl}
                                                alt="preview"
                                                className="mx-auto max-h-32 rounded-md object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData({ ...formData, thumbnailUrl: '' });
                                                }}
                                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <Upload className="mx-auto h-8 w-8 text-[var(--cn-text-muted)]" />
                                            <p className="mt-2 text-sm text-[var(--cn-text-muted)]">Click để chọn ảnh</p>
                                            <p className="text-xs text-[var(--cn-text-muted)]">PNG, JPG, JPEG (tối đa 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* URL sản phẩm */}
                            <CustomInput
                                label="URL sản phẩm"
                                required
                                value={formData.productUrl}
                                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                                placeholder="https://cncode.com/san-pham/..."
                            />
                        </div>

                        <div className="flex gap-3 p-5 pt-0">
                            <CustomButton
                                variant="secondary"
                                fullWidth
                                onClick={() => setShowModal(false)}
                            >
                                Hủy
                            </CustomButton>
                            <CustomButton
                                fullWidth
                                onClick={handleSubmit}
                                disabled={submitting || uploading}
                                loading={submitting}
                            >
                                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            <ConfirmModalDelete
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xoá sản phẩm"
                message={`Bạn có chắc chắn muốn xoá sản phẩm "${deleteConfirm?.name}"? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
}