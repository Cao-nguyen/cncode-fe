// app/admin/sanphamlienket/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, X, Loader2, ExternalLink, Upload, ImageIcon } from 'lucide-react';
import { linkedProductApi } from '@/lib/api/linkedProduct.api';
import { uploadApi } from '@/lib/upload';
import { LinkedProduct, CreateLinkedProductDto } from '@/types/linkedProduct.type';

export default function AdminSanPhamLienKetPage() {
    const [products, setProducts] = useState<LinkedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<LinkedProduct | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
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
            console.log('Fetch products response:', res); // Debug

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
            // Convert file to base64
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
            console.log('Submitting product:', formData);

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
            // Sử dụng type assertion hoặc kiểm tra instance
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

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await linkedProductApi.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
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
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--cn-text-main)]">Quản lý sản phẩm hệ sinh thái</h1>
                        <p className="text-[var(--cn-text-sub)] text-sm mt-1">Thêm, sửa, xóa sản phẩm/dịch vụ của CNCode</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary-hover)] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm sản phẩm
                    </button>
                </div>

                {/* Products Grid Admin */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-lg)] border border-[var(--cn-border)]">
                        <ImageIcon className="w-16 h-16 mx-auto text-[var(--cn-text-muted)] mb-4" />
                        <p className="text-[var(--cn-text-sub)]">Chưa có sản phẩm nào</p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="mt-4 px-4 py-2 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary-hover)]"
                        >
                            Thêm sản phẩm đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="group bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] overflow-hidden border border-[var(--cn-border)] hover:shadow-[var(--cn-shadow-md)] transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative h-40 overflow-hidden bg-[var(--cn-bg-section)]">
                                    {product.thumbnailUrl ? (
                                        <Image
                                            src={product.thumbnailUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-[var(--cn-text-muted)]" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    <h3 className="text-sm font-semibold text-[var(--cn-text-main)] text-center line-clamp-2 min-h-[40px]">
                                        {product.name}
                                    </h3>

                                    <div className="mt-3 flex gap-2">
                                        <a
                                            href={product.productUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] text-xs font-medium hover:bg-[var(--cn-primary-hover)] transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            <span>Truy cập</span>
                                        </a>
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="px-2 py-1.5 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] text-[var(--cn-text-muted)] hover:text-blue-500 hover:border-blue-500 transition-colors"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="px-2 py-1.5 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] text-[var(--cn-text-muted)] hover:text-red-500 hover:border-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-lg)] w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-[var(--cn-border)]">
                            <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">
                                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-[var(--cn-hover)] rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--cn-text-sub)] mb-1">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--cn-primary)]"
                                    placeholder="Nhập tên sản phẩm"
                                />
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--cn-text-sub)] mb-1">Ảnh thumbnail</label>
                                <div
                                    className="relative border-2 border-dashed border-[var(--cn-border)] rounded-[var(--cn-radius-md)] p-4 text-center cursor-pointer hover:border-[var(--cn-primary)] transition-colors"
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
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--cn-primary)]" />
                                            <p className="text-sm text-[var(--cn-text-muted)] mt-2">Đang upload...</p>
                                        </div>
                                    ) : formData.thumbnailUrl ? (
                                        <div className="relative">
                                            <img
                                                src={formData.thumbnailUrl}
                                                alt="preview"
                                                className="max-h-32 mx-auto rounded-md object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData({ ...formData, thumbnailUrl: '' });
                                                }}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <Upload className="w-8 h-8 mx-auto text-[var(--cn-text-muted)]" />
                                            <p className="text-sm text-[var(--cn-text-muted)] mt-2">Click để chọn ảnh</p>
                                            <p className="text-xs text-[var(--cn-text-muted)]">PNG, JPG, JPEG (tối đa 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product URL */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--cn-text-sub)] mb-1">
                                    URL sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.productUrl}
                                    onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--cn-primary)]"
                                    placeholder="https://cncode.com/san-pham/..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 p-5 pt-0">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)] transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || uploading}
                                className="flex-1 px-4 py-2 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary-hover)] disabled:opacity-50 transition-colors"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingProduct ? 'Cập nhật' : 'Thêm mới')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}