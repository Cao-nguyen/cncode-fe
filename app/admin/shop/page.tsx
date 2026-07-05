'use client';

import React, { useState, useEffect } from 'react';
import { giftApi, IGift } from '@/lib/api/gift.api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Gift, Image as ImageIcon, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { uploadApi } from '@/lib/upload';
import { getImageUrl } from '@/lib/utils/imageUrl';

const CATEGORIES = [
    { value: 'heart', label: 'Trái tim' },
    { value: 'star', label: 'Ngôi sao' },
    { value: 'flower', label: 'Hoa' },
    { value: 'special', label: 'Đặc biệt' },
    { value: 'other', label: 'Khác' }
];

function AdminShopPageContent() {
    const { token } = useAuthStore();
    const [gifts, setGifts] = useState<IGift[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGift, setEditingGift] = useState<IGift | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<IGift | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [priceInXu, setPriceInXu] = useState('');
    const [category, setCategory] = useState('other');
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState('0');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchGifts();
    }, []);

    const fetchGifts = async () => {
        try {
            setLoading(true);
            const data = await giftApi.getAllGifts(token || '');
            setGifts(data);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi tải danh sách quà tặng';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                const result = await uploadApi.uploadImage(base64, 'gifts');
                if (result.success && result.url) {
                    setImage(result.url);
                    toast.success('Tải ảnh lên thành công');
                } else {
                    toast.error(result.message || 'Lỗi khi tải ảnh lên');
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi tải ảnh lên';
            toast.error(message);
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !image || !priceInXu) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            const giftData = {
                name,
                description,
                image,
                priceInXu: parseInt(priceInXu),
                category: category as 'heart' | 'star' | 'flower' | 'special' | 'other',
                isActive,
                order: parseInt(order)
            };

            if (editingGift) {
                await giftApi.updateGift(editingGift._id, giftData, token || '');
                toast.success('Cập nhật quà tặng thành công');
            } else {
                await giftApi.createGift(giftData, token || '');
                toast.success('Tạo quà tặng thành công');
            }

            setShowModal(false);
            resetForm();
            fetchGifts();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi lưu quà tặng';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (gift: IGift) => {
        setEditingGift(gift);
        setName(gift.name);
        setDescription(gift.description || '');
        setImage(gift.image);
        setPriceInXu(gift.priceInXu.toString());
        setCategory(gift.category);
        setIsActive(gift.isActive);
        setOrder(gift.order.toString());
        setShowModal(true);
    };

    const handleDelete = async (gift: IGift) => {
        try {
            await giftApi.deleteGift(gift._id, token || '');
            toast.success('Xóa quà tặng thành công');
            setDeleteConfirm(null);
            fetchGifts();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi xóa quà tặng';
            toast.error(message);
        }
    };

    const resetForm = () => {
        setEditingGift(null);
        setName('');
        setDescription('');
        setImage('');
        setPriceInXu('');
        setCategory('other');
        setIsActive(true);
        setOrder('0');
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Cửa hàng Quà tặng</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý các quà tặng người dùng có thể mua
                    </p>
                </div>
                <CustomButton onClick={openModal} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm quà tặng
                </CustomButton>
            </div>

            <div className="bg-white dark:bg-[#0f0f0f] rounded-xl shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Hình ảnh</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Tên</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Danh mục</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Giá (xu)</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Trạng thái</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Thứ tự</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gifts.map((gift) => (
                                <tr key={gift._id} className="border-b border-gray-100 dark:border-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                    <td className="px-6 py-4">
                                        <img
                                            src={getImageUrl(gift.image)}
                                            alt={gift.name}
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{gift.name}</div>
                                        {gift.description && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                {gift.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                            {CATEGORIES.find(c => c.value === gift.category)?.label || gift.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {gift.priceInXu.toLocaleString()} xu
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${gift.isActive
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                                            }`}>
                                            {gift.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white">{gift.order}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(gift)}
                                                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(gift)}
                                                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {gifts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        Chưa có quà tặng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-[#0f0f0f] rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.06]">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {editingGift ? 'Cập nhật quà tặng' : 'Thêm quà tặng mới'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <CustomInput
                                label="Tên quà tặng *"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên quà tặng"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả quà tặng"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/[0.1] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hình ảnh *
                                </label>
                                <div className="space-y-2">
                                    {image && (
                                        <img
                                            src={getImageUrl(image)}
                                            alt="Preview"
                                            className="h-32 w-32 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/[0.1] hover:bg-gray-200 dark:hover:bg-white/[0.15] rounded-lg cursor-pointer transition-colors"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                            {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <CustomInput
                                label="Giá (xu) *"
                                type="number"
                                value={priceInXu}
                                onChange={(e) => setPriceInXu(String(e.target.value))}
                                placeholder="Nhập giá xu"
                                min={0}
                                required
                            />

                            <CustomSelect
                                label="Danh mục"
                                value={category}
                                onChange={(value) => setCategory(value)}
                                options={CATEGORIES}
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                                    Hoạt động
                                </label>
                            </div>

                            <CustomInput
                                label="Thứ tự hiển thị"
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(String(e.target.value))}
                                placeholder="0"
                                min={0}
                            />

                            <div className="flex gap-3 pt-4">
                                <CustomButton
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                >
                                    Hủy
                                </CustomButton>
                                <CustomButton
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        editingGift ? 'Cập nhật' : 'Tạo'
                                    )}
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModalDelete
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Xóa quà tặng"
                message={`Bạn có chắc muốn xóa quà tặng "${deleteConfirm?.name}"? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
}

export default AdminShopPageContent;
