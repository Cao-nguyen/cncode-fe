'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Upload, X, Image as ImageIcon, FileText, Tag, DollarSign } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { addProduct, getProducts, ShopProduct } from '@/lib/utils/shopHistory';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

const CATEGORIES = ['Tài liệu', 'Bài thuyết trình', 'Code', 'Thiết kế', 'Khác'] as const;
const CATEGORY_OPTIONS = CATEGORIES.map(cat => ({ value: cat, label: cat }));

export default function ProductUploadPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const descriptionEditorRef = useRef<CustomEditorRef>(null);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => [...prev, file]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const description = descriptionEditorRef.current?.getContent() || '';

        if (!title.trim() || !description.trim() || !price || !category) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const newProduct: ShopProduct = {
            _id: `shop${Date.now()}`,
            title,
            description,
            price: parseFloat(price),
            category: category as 'Tài liệu' | 'Bài thuyết trình' | 'Code' | 'Thiết kế' | 'Khác',
            sellerId: user?._id || '',
            sellerName: user?.fullName || user?.username || 'Unknown',
            images,
            files: files.map(f => ({
                url: URL.createObjectURL(f),
                name: f.name,
                size: f.size,
                type: f.type
            })),
            tags,
            views: 0,
            purchases: 0,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        setSubmitting(true);
        try {
            addProduct(newProduct);
            toast.success('Đăng sản phẩm thành công! Chờ admin xét duyệt');
            router.push('/cuahangso');
        } catch (error) {
            console.error('Error submitting product:', error);
            toast.error('Có lỗi xảy ra khi đăng sản phẩm');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <button onClick={() => router.push('/cuahangso')}>
                        Quay lại cửa hàng
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Đăng bán sản phẩm</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Title */}
                <CustomInput
                    label="Tiêu đề sản phẩm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề sản phẩm..."
                    required
                />

                {/* Category */}
                <CustomSelect
                    label="Danh mục"
                    options={CATEGORY_OPTIONS}
                    value={category}
                    onChange={setCategory}
                    placeholder="Chọn danh mục"
                    required
                />

                {/* Price */}
                <CustomInput
                    label="Giá bán (VND)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    min={0}
                    icon={<DollarSign />}
                    required
                />

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mô tả sản phẩm
                    </label>
                    <CustomEditor
                        ref={descriptionEditorRef}
                        initialValue=""
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                        <CustomInput
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            placeholder="Nhập tag và nhấn Enter..."
                            icon={<Tag />}
                        />
                        <CustomButton onClick={handleAddTag} variant="outline" className="px-3">
                            <Plus className="w-4 h-4" />
                        </CustomButton>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                >
                                    {tag}
                                    <button onClick={() => removeTag(tag)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hình ảnh
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-colors">
                            <Upload className="w-4 h-4" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            Upload hình ảnh
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Chọn hình ảnh đại diện cho sản phẩm
                        </span>
                    </div>
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img src={img} alt={`Image ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Files */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tài liệu đính kèm
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-colors">
                            <Upload className="w-4 h-4" />
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            Upload file
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tải lên tài liệu đính kèm
                        </span>
                    </div>
                    {files.length > 0 && (
                        <div className="space-y-2">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {file.size ? (file.size / 1024).toFixed(2) + ' KB' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                    <CustomButton
                        onClick={() => router.push('/cuahangso')}
                        variant="outline"
                        className="flex-1"
                    >
                        Hủy
                    </CustomButton>
                    <CustomButton
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1"
                    >
                        {submitting ? 'Đang đăng...' : 'Đăng sản phẩm'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}