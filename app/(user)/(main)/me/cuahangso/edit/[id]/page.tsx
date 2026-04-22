// app/(user)/(main)/me/cuahangso/edit/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { digitalProductApi } from '@/lib/api/digital-product.api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save, Eye, Trash2, X, Plus, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import TinyMCEEditor from '@/components/common/TinyMCEEditor';
import ConfirmDialog from '@/components/common/ConfirmDialog';

type ProductCategory = 'powerpoint' | 'code' | 'design' | 'document';

const CATEGORIES: { id: ProductCategory; name: string; color: string }[] = [
    { id: 'powerpoint', name: 'PowerPoint', color: 'orange' },
    { id: 'code', name: 'Code', color: 'blue' },
    { id: 'design', name: 'Design', color: 'purple' },
    { id: 'document', name: 'Tài liệu', color: 'green' }
];

interface ProductForm {
    name: string;
    longDescription: string;
    category: ProductCategory;
    originalPrice: number;
    salePrice: number;
    enableXuPayment: boolean;
    previewImages: string[];
    downloadUrl: string;
    previewUrl: string;
    features: string[];
    requirements: string[];
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { token } = useAuthStore();

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        longDescription: '',
        category: 'powerpoint',
        originalPrice: 0,
        salePrice: 0,
        enableXuPayment: true,
        previewImages: [],
        downloadUrl: '',
        previewUrl: '',
        features: [],
        requirements: []
    });
    const [featureInput, setFeatureInput] = useState<string>('');
    const [requirementInput, setRequirementInput] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const [deletingImage, setDeletingImage] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            router.push('/login');
            return;
        }
        fetchProduct();
    }, [token, id]);

    const fetchProduct = async () => {
        if (!token || !id) return;
        try {
            const result = await digitalProductApi.getProductById(id, token);
            if (result.success) {
                const product = result.data;
                setFormData({
                    name: product.name || '',
                    longDescription: product.longDescription || '',
                    category: (product.category as ProductCategory) || 'powerpoint',
                    originalPrice: product.originalPrice || 0,
                    salePrice: product.price || 0,
                    enableXuPayment: product.enableXuPayment ?? true,
                    previewImages: product.previewImages || [],
                    downloadUrl: product.downloadUrl || '',
                    previewUrl: product.previewUrl || '',
                    features: product.features || [],
                    requirements: product.requirements || []
                });
            } else {
                toast.error('Không tìm thấy sản phẩm');
                router.push('/me/cuahangso');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        formDataUpload.append('folder', 'product-previews');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/single`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataUpload
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Upload failed');
        }
        return result.data.url;
    };

    const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: imageUrl })
            });
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingImage(true);
        try {
            const newImages: string[] = [];
            for (const file of files) {
                const url = await uploadImageToCloudinary(file);
                newImages.push(url);
            }
            setFormData(prev => ({
                ...prev,
                previewImages: [...prev.previewImages, ...newImages]
            }));
            toast.success(`Đã thêm ${newImages.length} ảnh`);
        } catch {
            toast.error('Upload ảnh thất bại');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = async (index: number) => {
        const imageUrl = formData.previewImages[index];
        setDeletingImage(imageUrl);
        try {
            await deleteImageFromCloudinary(imageUrl);
            setFormData(prev => ({
                ...prev,
                previewImages: prev.previewImages.filter((_, i) => i !== index)
            }));
            toast.success('Đã xóa ảnh');
        } catch {
            toast.error('Xóa ảnh thất bại');
        } finally {
            setDeletingImage(null);
        }
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const addRequirement = () => {
        if (requirementInput.trim()) {
            setFormData(prev => ({
                ...prev,
                requirements: [...prev.requirements, requirementInput.trim()]
            }));
            setRequirementInput('');
        }
    };

    const removeRequirement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên sản phẩm');
            return;
        }
        if (!formData.longDescription.trim()) {
            toast.error('Vui lòng nhập mô tả chi tiết');
            return;
        }
        if (formData.salePrice <= 0) {
            toast.error('Vui lòng nhập giá bán hợp lệ');
            return;
        }
        if (formData.previewImages.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 ảnh preview');
            return;
        }
        if (!formData.downloadUrl.trim()) {
            toast.error('Vui lòng nhập URL tải sản phẩm');
            return;
        }
        if (!token) return;

        setSaving(true);
        try {
            const thumbnailUrl = formData.previewImages[0];
            const xuAmount = formData.enableXuPayment ? Math.floor(formData.salePrice / 10) : 0;

            const productData = {
                name: formData.name,
                description: formData.longDescription.replace(/<[^>]+>/g, ' ').slice(0, 200),
                longDescription: formData.longDescription,
                category: formData.category,
                price: formData.salePrice,
                originalPrice: formData.originalPrice,
                priceInXu: xuAmount,
                enableXuPayment: formData.enableXuPayment,
                thumbnail: thumbnailUrl,
                previewImages: formData.previewImages,
                downloadUrl: formData.downloadUrl,
                previewUrl: formData.previewUrl,
                features: formData.features,
                requirements: formData.requirements,
                tags: [],
                status: 'published'
            };

            const result = await digitalProductApi.updateProduct(id, productData, token);
            if (result.success) {
                toast.success('Cập nhật sản phẩm thành công');
                router.push('/me/cuahangso');
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!token) return;
        setDeleting(true);
        try {
            const result = await digitalProductApi.deleteProduct(id, token);
            if (result.success) {
                toast.success('Xóa sản phẩm thành công');
                router.push('/me/cuahangso');
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const discountPercent = formData.originalPrice > 0 && formData.salePrice > 0
        ? Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-4 sm:py-10">
            <div className="container mx-auto px-4 sm:px-5 lg:px-10 max-w-5xl">
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <Link href="/me/cuahangso" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
                        <ArrowLeft size={20} />
                        Quay lại
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                        >
                            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            {deleting ? 'Đang xóa...' : 'Xóa sản phẩm'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Tên sản phẩm */}
                    <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="VD: Premium PowerPoint Template - Tech Bundle"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Danh mục *</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {CATEGORIES.map((cat) => {
                                        const isSelected = formData.category === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                                className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                                    ? `bg-${cat.color}-50 dark:bg-${cat.color}-950/20 border-${cat.color}-500`
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-black'
                                                    }`}
                                            >
                                                <div className={`font-medium text-center ${isSelected ? `text-${cat.color}-600` : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {cat.name}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả chi tiết *</label>
                                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                                    <TinyMCEEditor
                                        value={formData.longDescription}
                                        onChange={(val) => setFormData(prev => ({ ...prev, longDescription: val }))}
                                        height={400}
                                        placeholder="Mô tả chi tiết về sản phẩm..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hình ảnh sản phẩm */}
                    <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={20} className="text-blue-500" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hình ảnh sản phẩm</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Ảnh đầu tiên sẽ làm ảnh đại diện (thumbnail)</p>
                        </div>
                        <div className="p-6">
                            <label className="block w-full">
                                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploadingImage ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                        ) : (
                                            <>
                                                <Plus size={32} className="text-gray-400" />
                                                <p className="text-sm text-gray-500 mt-2">Thêm ảnh preview</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                            </label>

                            {formData.previewImages.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                                    {formData.previewImages.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                                            {idx === 0 && (
                                                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded z-10">Thumbnail</span>
                                            )}
                                            <button
                                                onClick={() => handleRemoveImage(idx)}
                                                disabled={deletingImage === img}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition disabled:opacity-100"
                                            >
                                                {deletingImage === img ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Giá bán */}
                    <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Giá bán</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá gốc (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={formData.originalPrice || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseInt(e.target.value) || 0 }))}
                                        placeholder="499000"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá bán (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={formData.salePrice || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseInt(e.target.value) || 0 }))}
                                        placeholder="299000"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                                    />
                                </div>
                            </div>

                            {discountPercent > 0 && (
                                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                                    <p className="text-green-600 dark:text-green-400">Giảm {discountPercent}% so với giá gốc</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white">Thanh toán bằng Xu</span>
                                    <p className="text-sm text-gray-500">Cho phép người dùng thanh toán bằng Xu (10 VNĐ = 1 Xu)</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, enableXuPayment: !prev.enableXuPayment }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.enableXuPayment ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enableXuPayment ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {formData.enableXuPayment && formData.salePrice > 0 && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                                    <p className="text-blue-600 dark:text-blue-400">Quy đổi: {Math.floor(formData.salePrice / 10).toLocaleString()} Xu</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tải sản phẩm */}
                    <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tải sản phẩm</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL tải sản phẩm *</label>
                                <input
                                    type="url"
                                    value={formData.downloadUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                                    placeholder="https://drive.google.com/... hoặc https://github.com/..."
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                                />
                            </div>

                            {(formData.category === 'powerpoint' || formData.category === 'document') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL xem thử (Google Docs Preview)</label>
                                    <input
                                        type="url"
                                        value={formData.previewUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
                                        placeholder="https://docs.google.com/presentation/d/xxx/preview"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tính năng & Yêu cầu */}
                    <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tính năng & Yêu cầu</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tính năng nổi bật</label>
                                <div className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                                        placeholder="VD: Giao diện đẹp mắt"
                                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                                    />
                                    <button onClick={addFeature} className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                                        <Plus size={20} />
                                    </button>
                                </div>
                                {formData.features.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2">
                                        <span className="text-gray-700 dark:text-gray-300">{f}</span>
                                        <button onClick={() => removeFeature(i)} className="text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yêu cầu hệ thống</label>
                                <div className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={requirementInput}
                                        onChange={(e) => setRequirementInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                                        placeholder="VD: Có kết nối Internet"
                                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                                    />
                                    <button onClick={addRequirement} className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                                        <Plus size={20} />
                                    </button>
                                </div>
                                {formData.requirements.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2">
                                        <span className="text-gray-700 dark:text-gray-300">{r}</span>
                                        <button onClick={() => removeRequirement(i)} className="text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteProduct}
                title="Xóa sản phẩm"
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${formData.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                confirmVariant="danger"
            />
        </div>
    );
}