'use client';

import React, { useState, useEffect, useRef } from 'react';
import { slideshowApi, SlideshowItem } from '@/lib/api/slideshow.api';
import { uploadApi } from '@/lib/upload';
import { toast } from 'sonner';
import {
    Plus, Edit2, Trash2, EyeOff, Loader2, X, Check, Upload, Link,
    Type, AlignLeft, Sparkles, ArrowRight
} from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { CardSkeleton } from '@/components/ui/skeleton';

const GRADIENT_PRESETS = [
    'from-blue-500 via-indigo-500 to-violet-500',
    'from-cyan-400 via-blue-500 to-teal-400',
    'from-green-400 via-emerald-500 to-teal-500',
    'from-rose-400 via-red-500 to-orange-500',
    'from-pink-400 via-rose-400 to-orange-300',
    'from-amber-300 via-orange-400 to-red-400',
    'from-gray-600 via-slate-600 to-gray-700',
    'from-sky-400 via-blue-500 to-indigo-600',
];

export default function AdminSlideshowPage() {
    const [slides, setSlides] = useState<SlideshowItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState<SlideshowItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<SlideshowItem | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [cta, setCta] = useState('Khám phá ngay');
    const [href, setHref] = useState('/');
    const [imageUrl, setImageUrl] = useState('');
    const [gradient, setGradient] = useState(GRADIENT_PRESETS[0]);

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const res = await slideshowApi.getAllSlides();
            if (res.success) {
                setSlides(res.data);
            }
        } catch (error) {
            console.error('Fetch slides error:', error);
            toast.error('Không thể tải danh sách slide');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const resetForm = () => {
        setTitle('');
        setSubtitle('');
        setDescription('');
        setCta('Khám phá ngay');
        setHref('/');
        setImageUrl('');
        setGradient(GRADIENT_PRESETS[0]);
        setEditingSlide(null);
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (slide: SlideshowItem) => {
        setEditingSlide(slide);
        setTitle(slide.title || '');
        setSubtitle(slide.subtitle || '');
        setDescription(slide.description || '');
        setCta(slide.cta || 'Khám phá ngay');
        setHref(slide.href || '/');
        setImageUrl(slide.imageUrl || '');
        setGradient(slide.gradient || GRADIENT_PRESETS[0]);
        setShowModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        setUploading(true);
        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
            const result = await uploadApi.uploadImage(base64, 'slideshow');
            if (!result?.success || !result.url) {
                toast.error(result?.message || 'Upload thất bại');
                return;
            }
            setImageUrl(result.url);
            toast.success('Upload ảnh thành công');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Có lỗi xảy ra khi upload');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        if (!imageUrl.trim()) {
            toast.error('Vui lòng upload ảnh hoặc dán link');
            return;
        }
        setSubmitting(true);
        try {
            const data = {
                title: title.trim(),
                subtitle: subtitle.trim(),
                description: description.trim(),
                cta: cta.trim() || 'Khám phá ngay',
                href: href.trim() || '/',
                imageUrl,
                gradient,
                isActive: true,
                order: editingSlide ? editingSlide.order : slides.length,
            };

            let res;
            if (editingSlide) {
                res = await slideshowApi.updateSlide(editingSlide._id, data);
            } else {
                res = await slideshowApi.createSlide(data);
            }

            if (res.success) {
                toast.success(editingSlide ? 'Cập nhật thành công' : 'Tạo slide thành công');
                setShowModal(false);
                resetForm();
                fetchSlides();
            } else {
                toast.error(res.message || 'Thao tác thất bại');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const res = await slideshowApi.deleteSlide(deleteConfirm._id);
            if (res.success) {
                toast.success('Xoá slide thành công');
                setDeleteConfirm(null);
                fetchSlides();
            } else {
                toast.error(res.message || 'Xoá thất bại');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const toggleActive = async (slide: SlideshowItem) => {
        try {
            const res = await slideshowApi.updateSlide(slide._id, { isActive: !slide.isActive });
            if (res.success) {
                toast.success(slide.isActive ? 'Đã ẩn slide' : 'Đã hiện slide');
                fetchSlides();
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 pb-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CardSkeleton count={6} />
                </div>
            </div>
        );
    }

    // Banner preview style (same layout as public)
    const gradientClass = `bg-gradient-to-r ${gradient}`;

    return (
        <div className="space-y-6 pb-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Quản lý Slideshow</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Banner 2 cột: Text + Ảnh góc phải</p>
                </div>
                <CustomButton onClick={openCreate}>
                    <Plus size={18} />
                    Thêm slide
                </CustomButton>
            </div>

            {/* Slides list */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 space-y-3">
                    {slides.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-600">
                            <p className="text-sm text-gray-400 dark:text-gray-500">Chưa có slide nào</p>
                            <CustomButton onClick={openCreate} className="mt-4">
                                <Plus size={18} />
                                Thêm slide đầu tiên
                            </CustomButton>
                        </div>
                    ) : (
                        slides.map((slide) => (
                            <div
                                key={slide._id}
                                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50"
                            >
                                <div className="flex items-start gap-4 p-4">
                                    {/* Preview banner */}
                                    <div className={`relative h-32 w-56 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-r ${slide.gradient || 'from-gray-200 to-gray-300'}`}>
                                        <div className="flex h-full">
                                            <div className="w-1/2 p-3 flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-white leading-tight line-clamp-1">{slide.title}</p>
                                                <p className="text-[8px] text-white/80 mt-0.5 line-clamp-2">{slide.description}</p>
                                            </div>
                                            <div className="w-1/2 relative">
                                                {slide.imageUrl && (
                                                    <img
                                                        src={slide.imageUrl}
                                                        alt=""
                                                        className="absolute inset-0 h-full w-full object-contain object-right-bottom"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {!slide.isActive && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">Ẩn</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{slide.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">CTA: {slide.cta}</p>
                                            </div>
                                            <span className={`text-xs font-medium ${slide.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                                                {slide.isActive ? 'Hoạt động' : 'Ẩn'}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                                            {slide.href && (
                                                <span className="truncate max-w-[300px]">🔗 {slide.href}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => toggleActive(slide)}
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                                            title={slide.isActive ? 'Ẩn slide' : 'Hiện slide'}
                                        >
                                            <EyeOff size={16} />
                                        </button>
                                        <button
                                            onClick={() => openEdit(slide)}
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-gray-700"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(slide)}
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
                                            title="Xoá"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className="my-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingSlide ? 'Chỉnh sửa slide' : 'Thêm slide mới'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            {/* LIVE PREVIEW */}
                            <div className={`relative mb-6 overflow-hidden rounded-xl ${gradientClass} min-h-[200px] flex`}>
                                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">{title || 'Tiêu đề'}</h3>
                                    <p className="text-sm text-white/80 mt-1">{subtitle || 'Subtitle'}</p>
                                    <p className="text-xs sm:text-sm text-white/90 mt-2 line-clamp-3">{description || 'Mô tả...'}</p>
                                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm w-fit">
                                        {cta || 'Button'} <ArrowRight size={12} />
                                    </span>
                                </div>
                                <div className="w-1/2 sm:w-2/5 relative">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt=""
                                            className="absolute inset-0 h-full w-full object-contain object-right-bottom"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-white/40 text-sm">
                                            Không có ảnh
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FORM */}
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Type size={14} /> Tiêu đề <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Lớp Fullstack qua Zoom"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <AlignLeft size={14} /> Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        placeholder="Nhỏ hơn tiêu đề"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <AlignLeft size={14} /> Mô tả
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Mô tả chi tiết (2-3 dòng)"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
                                    />
                                </div>

                                {/* CTA + Link đích (ngang 2 cột) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <ArrowRight size={14} /> Nút bấm (CTA)
                                        </label>
                                        <input
                                            type="text"
                                            value={cta}
                                            onChange={(e) => setCta(e.target.value)}
                                            placeholder="Khám phá ngay"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Link size={14} /> Link đích
                                        </label>
                                        <input
                                            type="url"
                                            value={href}
                                            onChange={(e) => setHref(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Image + Gradient (ngang 2 cột) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Upload size={14} /> Ảnh (5000x5000) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                                            >
                                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                {uploading ? 'Đang tải...' : 'Tải ảnh'}
                                            </button>
                                            <input
                                                type="url"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="Hoặc dán link ảnh"
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            />
                                            {imageUrl && (
                                                <button onClick={() => setImageUrl('')} className="p-1.5 text-gray-400 hover:text-red-500">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Sparkles size={14} /> Màu nền
                                        </label>
                                        <select
                                            value={gradient}
                                            onChange={(e) => setGradient(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            {GRADIENT_PRESETS.map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !title.trim() || !imageUrl.trim()}
                                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Check size={16} />
                                )}
                                {submitting ? 'Đang lưu...' : editingSlide ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            <ConfirmModalDelete
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xoá slide"
                message="Bạn có chắc chắn muốn xoá slide này? Hành động này không thể hoàn tác."
            />
        </div>
    );
}