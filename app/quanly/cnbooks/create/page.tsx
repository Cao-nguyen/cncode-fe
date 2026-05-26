// app/quanly/cnbooks/create/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cnbookApi } from '@/lib/api/cnbook.api';
import { uploadApi } from '@/lib/upload';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';

const CATEGORY_OPTIONS = [
    { value: 'grade10', label: 'Tin học 10' },
    { value: 'grade11', label: 'Tin học 11' },
    { value: 'grade12', label: 'Tin học 12' },
    { value: 'other', label: 'Khác' }
];

export default function CreateCNBookPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [category, setCategory] = useState('other');
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [isFree, setIsFree] = useState(false);
    const [titleError, setTitleError] = useState('');
    const [thumbnailError, setThumbnailError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }
        setUploading(true);
        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
            const result = await uploadApi.uploadImage(base64, 'cnbooks');
            if (result.success && result.url) {
                setThumbnail(result.url);
                toast.success('Upload ảnh thành công');
            } else {
                toast.error(result.message || 'Upload thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        let hasError = false;
        if (!title.trim()) {
            setTitleError('Vui lòng nhập tiêu đề sách');
            hasError = true;
        } else {
            setTitleError('');
        }
        if (!thumbnail) {
            setThumbnailError('Vui lòng chọn ảnh thumbnail');
            hasError = true;
        } else {
            setThumbnailError('');
        }
        if (hasError) return;

        setLoading(true);
        try {
            const res = await cnbookApi.createBook({
                title: title.trim(),
                description,
                thumbnail,
                category,
                price: isFree ? 0 : price,
                discountPrice: isFree ? 0 : discountPrice,
                isFree
            });
            if (res.success && res.data) {
                toast.success('Tạo sách thành công! Vui lòng chờ admin duyệt.');
                router.push(`/quanly/cnbooks/edit/${res.data._id}`);
            } else {
                toast.error('Có lỗi xảy ra khi tạo sách');
            }
        } catch (error) {
            console.error('Create book error:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/quanly/cnbooks" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 Tạo sách mới</h1>

                    <div className="space-y-5">
                        <CustomInput
                            label="Tiêu đề sách"
                            placeholder="Nhập tiêu đề sách..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={titleError}
                            required
                        />

                        <CustomInput
                            label="Mô tả sách"
                            placeholder="Nhập mô tả sách..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            textarea
                            rows={3}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ảnh thumbnail <span className="text-red-500">*</span>
                            </label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                />
                                {uploading ? (
                                    <div className="py-4">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Đang upload...</p>
                                    </div>
                                ) : thumbnail ? (
                                    <div className="relative">
                                        <img src={thumbnail} alt="Thumbnail" className="max-h-40 mx-auto rounded" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setThumbnail(''); }}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Click để chọn ảnh (kích thước A4)</p>
                                    </div>
                                )}
                            </div>
                            {thumbnailError && <p className="mt-1 text-sm text-red-500">{thumbnailError}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomSelect
                                label="Danh mục"
                                options={CATEGORY_OPTIONS}
                                value={category}
                                onChange={setCategory}
                            />
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="isFree"
                                    checked={isFree}
                                    onChange={(e) => setIsFree(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isFree" className="text-sm text-gray-700 cursor-pointer">
                                    Sách miễn phí
                                </label>
                            </div>
                        </div>

                        {!isFree && (
                            <div className="grid grid-cols-2 gap-4">
                                <CustomInput
                                    label="Giá gốc (VNĐ)"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                />
                                <CustomInput
                                    label="Giá giảm (VNĐ)"
                                    type="number"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Link href="/quanly/cnbooks">
                                <CustomButton variant="secondary">Hủy</CustomButton>
                            </Link>
                            <CustomButton onClick={handleSubmit} loading={loading}>
                                Tạo sách
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}