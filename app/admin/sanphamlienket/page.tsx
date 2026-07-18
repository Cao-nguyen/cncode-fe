'use client';

import React, { useState } from 'react';
import { Plus, ImageIcon } from 'lucide-react';
import { useAdminLinkedProducts } from '@/hooks/linkedProduct/useAdminLinkedProducts';
import { AdminProductCard } from '@/components/linkedProduct/AdminProductCard';
import { ProductModal } from '@/components/linkedProduct/ProductModal';
import { CustomButton } from '@/components/custom/CustomButton';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { LinkedProduct, CreateLinkedProductDto, UpdateLinkedProductDto } from '@/types/linkedProduct.type';

export default function AdminSanPhamLienKetPage() {
    const { products, loading, submitting, createProduct, updateProduct, deleteProduct } = useAdminLinkedProducts();
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<LinkedProduct | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<LinkedProduct | null>(null);
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

    const handleSubmit = async (data: CreateLinkedProductDto) => {
        const success = editingProduct
            ? await updateProduct(editingProduct._id, data as UpdateLinkedProductDto)
            : await createProduct(data);

        if (success) {
            setShowModal(false);
            setEditingProduct(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        const success = await deleteProduct(deleteConfirm._id);
        if (success) {
            setDeleteConfirm(null);
        }
    };

    const openEditModal = (product: LinkedProduct) => {
        setEditingProduct(product);
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
                        setEditingProduct(null);
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
                            setEditingProduct(null);
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
                        <AdminProductCard
                            key={product._id}
                            product={product}
                            imgError={imgErrors[product._id]}
                            onImgError={() => setImgErrors(prev => ({ ...prev, [product._id]: true }))}
                            onEdit={() => openEditModal(product)}
                            onDelete={() => setDeleteConfirm(product)}
                        />
                    ))}
                </div>
            )}

            <ProductModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleSubmit}
                editingProduct={editingProduct}
                submitting={submitting}
            />

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