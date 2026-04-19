'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { digitalProductApi } from '@/lib/api/digital-product.api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type ProductCategory = 'powerpoint' | 'code' | 'design' | 'document';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
    { value: 'powerpoint', label: 'PowerPoint' },
    { value: 'code', label: 'Code' },
    { value: 'design', label: 'Design' },
    { value: 'document', label: 'Tài liệu' }
];

interface FormData {
    name: string;
    description: string;
    longDescription: string;
    category: ProductCategory;
    price: number;
    thumbnail: string;
    previewImages: string[];
    downloadUrl: string;
    previewUrl: string;
    features: string[];
    requirements: string[];
    tags: string[];
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { token } = useAuthStore();
    const id = params.id as string;

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        longDescription: '',
        category: 'code',
        price: 0,
        thumbnail: '',
        previewImages: [],
        downloadUrl: '',
        previewUrl: '',
        features: [],
        requirements: [],
        tags: []
    });
    const [newFeature, setNewFeature] = useState<string>('');
    const [newRequirement, setNewRequirement] = useState<string>('');
    const [newTag, setNewTag] = useState<string>('');
    const [oldThumbnail, setOldThumbnail] = useState<string>('');
    const [oldPreviewImages, setOldPreviewImages] = useState<string[]>([]);

    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const previewImageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (token && id) {
            fetchProduct();
        }
    }, [token, id]);

    const fetchProduct = async (): Promise<void> => {
        try {
            setLoading(true);
            const result = await digitalProductApi.getProductById(id, token!);
            if (result.success) {
                const product = result.data;
                setFormData({
                    name: product.name,
                    description: product.description,
                    longDescription: product.longDescription || '',
                    category: product.category,
                    price: product.price,
                    thumbnail: product.thumbnail,
                    previewImages: product.previewImages || [],
                    downloadUrl: product.downloadUrl || '',
                    previewUrl: product.previewUrl || '',
                    features: product.features || [],
                    requirements: product.requirements || [],
                    tags: product.tags || []
                });
                setOldThumbnail(product.thumbnail);
                setOldPreviewImages(product.previewImages || []);
            } else {
                toast.error('Không tìm thấy sản phẩm');
                router.push('/me/cuahangso');
            }
        } catch {
            toast.error('Lỗi khi tải sản phẩm');
            router.push('/me/cuahangso');
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                return result.url;
            }
            return null;
        } catch {
            toast.error('Upload ảnh thất bại');
            return null;
        }
    };

    const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
            setFormData(prev => ({ ...prev, thumbnail: imageUrl }));
            toast.success('Upload ảnh thumbnail thành công');
        }
        setUploading(false);
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    };

    const handlePreviewImageUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
            setFormData(prev => ({ ...prev, previewImages: [...prev.previewImages, imageUrl] }));
            toast.success('Upload ảnh preview thành công');
        }
        setUploading(false);
        if (previewImageInputRef.current) previewImageInputRef.current.value = '';
    };

    const removePreviewImage = (index: number): void => {
        setFormData(prev => ({
            ...prev,
            previewImages: prev.previewImages.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await digitalProductApi.updateProduct(id, formData, token!);
            if (result.success) {
                toast.success('Cập nhật sản phẩm thành công');
                router.push('/me/cuahangso');
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const addFeature = (): void => {
        if (newFeature.trim()) {
            setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
            setNewFeature('');
        }
    };

    const removeFeature = (index: number): void => {
        setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    };

    const addRequirement = (): void => {
        if (newRequirement.trim()) {
            setFormData(prev => ({ ...prev, requirements: [...prev.requirements, newRequirement.trim()] }));
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number): void => {
        setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }));
    };

    const addTag = (): void => {
        if (newTag.trim()) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
            setNewTag('');
        }
    };

    const removeTag = (index: number): void => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
                <div className="container mx-auto px-5 lg:px-10">
                    <div className="flex justify-center items-center h-64">
                        <Loader2 size={40} className="animate-spin text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
            <div className="container mx-auto px-5 lg:px-10 max-w-4xl">
                <Link
                    href="/me/cuahangso"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
                >
                    <ArrowLeft size={20} />
                    Quay lại
                </Link>

                <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chỉnh sửa sản phẩm</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Cập nhật thông tin sản phẩm của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tên sản phẩm *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mô tả ngắn *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mô tả chi tiết
                            </label>
                            <textarea
                                value={formData.longDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Danh mục *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Giá (VNĐ) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    required
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Ảnh thumbnail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ảnh thumbnail *
                            </label>
                            <div className="flex gap-3 items-start">
                                {formData.thumbnail && (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image
                                            src={formData.thumbnail}
                                            alt="Thumbnail"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                                        placeholder="Hoặc nhập URL ảnh"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            ref={thumbnailInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => thumbnailInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200"
                                        >
                                            <Upload size={14} />
                                            {uploading ? 'Đang upload...' : 'Upload ảnh'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ảnh preview */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ảnh preview
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                {formData.previewImages.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={img}
                                            alt={`Preview ${idx + 1}`}
                                            width={200}
                                            height={150}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePreviewImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <div
                                    className="aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                                    onClick={() => previewImageInputRef.current?.click()}
                                >
                                    <ImageIcon size={24} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Thêm ảnh</span>
                                </div>
                                <input
                                    ref={previewImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePreviewImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                URL download *
                            </label>
                            <input
                                type="url"
                                value={formData.downloadUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                URL xem trước (tùy chọn)
                            </label>
                            <input
                                type="url"
                                value={formData.previewUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tính năng nổi bật
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                                    placeholder="Thêm tính năng"
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="button" onClick={addFeature} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200">
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.features.map((feature, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                                        {feature}
                                        <button type="button" onClick={() => removeFeature(idx)} className="hover:text-red-600">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Yêu cầu hệ thống
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                                    placeholder="Thêm yêu cầu"
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="button" onClick={addRequirement} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200">
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.requirements.map((req, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm">
                                        {req}
                                        <button type="button" onClick={() => removeRequirement(idx)} className="hover:text-red-600">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Thêm tag"
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200">
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-600">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Cập nhật sản phẩm'}
                            </button>
                            <Link
                                href="/me/cuahangso"
                                className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Hủy
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}