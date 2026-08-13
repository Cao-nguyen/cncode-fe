'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronRight,
    FileText,
    Home,
    Image as ImageIcon,
    Link2,
    Loader2,
    ShoppingBag,
    Upload,
    X,
} from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomToggle } from '@/components/custom/CustomToggle';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { shopApi, SHOP_CATEGORIES, type CreateProductPayload, type Product } from '@/lib/api/shop.api';
import { useAuthStore } from '@/store/auth.store';
import { uploadApi } from '@/lib/upload';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { formatPayableAmount } from '@/lib/utils/currency.utils';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = SHOP_CATEGORIES.map((cat) => ({ value: cat, label: cat }));
const DISCOUNT_TYPE_OPTIONS = [
    { value: 'percent', label: '%' },
    { value: 'vnd', label: 'VNĐ' },
];

function CreateProductPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;
    const { user, token } = useAuthStore();
    const descriptionEditorRef = useRef<CustomEditorRef>(null);
    const [descriptionInitial, setDescriptionInitial] = useState('');
    const [editProductStatus, setEditProductStatus] = useState<Product['status'] | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(!!editId);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [discountType, setDiscountType] = useState<'percent' | 'vnd'>('percent');
    const [discountValue, setDiscountValue] = useState('');
    const [allowCoinPayment, setAllowCoinPayment] = useState(true);
    const [category, setCategory] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [files, setFiles] = useState<{ url: string; name: string; size: number; type: string }[]>([]);
    const [preview, setPreview] = useState<{ url: string; name: string; size: number; type: string } | null>(null);
    const [fileLinkInput, setFileLinkInput] = useState('');
    const [previewLinkInput, setPreviewLinkInput] = useState('');
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadingPreview, setUploadingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    useEffect(() => {
        if (!editId || !token) return;

        let cancelled = false;

        const loadProduct = async () => {
            setLoadingProduct(true);
            try {
                const res = await shopApi.getProduct(editId);
                if (cancelled) return;

                if (!res.success || !res.data) {
                    toast.error('Không thể tải sản phẩm');
                    router.push('/cuahangso');
                    return;
                }

                const product = res.data;
                if (String(product.seller?._id) !== String(user?._id) && user?.role !== 'admin') {
                    toast.error('Bạn không có quyền sửa sản phẩm này');
                    router.push('/cuahangso');
                    return;
                }

                if (product.status !== 'pending' && product.status !== 'rejected' && product.status !== 'approved') {
                    toast.error('Không thể sửa sản phẩm này');
                    router.push('/cuahangso');
                    return;
                }

                setTitle(product.title);
                setPrice(String(product.price ?? ''));
                setDiscountType(product.discountType === 'vnd' ? 'vnd' : 'percent');
                setDiscountValue(product.discountValue ? String(product.discountValue) : '');
                setAllowCoinPayment(product.allowCoinPayment !== false);
                setCategory(product.category || '');
                setCoverImage(product.coverImage || '');
                setImages(product.images || []);
                setFiles(
                    (product.files || [])
                        .filter((file) => file.url)
                        .map((file) => ({
                            url: file.url!,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                        })),
                );
                setPreview(product.preview || null);
                setDescriptionInitial(product.description || '');
                setEditProductStatus(product.status);
            } catch {
                if (!cancelled) {
                    toast.error('Không thể tải sản phẩm');
                    router.push('/cuahangso');
                }
            } finally {
                if (!cancelled) setLoadingProduct(false);
            }
        };

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [editId, token, user?._id, user?.role, router]);

    const finalPrice = useMemo(() => {
        const base = Number(price) || 0;
        const discount = Number(discountValue) || 0;
        if (discount <= 0) return base;
        if (discountType === 'vnd') return Math.max(0, base - discount);
        return Math.max(0, Math.round(base * (1 - discount / 100)));
    }, [price, discountType, discountValue]);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);
        try {
            const res = await uploadApi.uploadFileWithProgress(file, 'cuahangso');
            if (res.success && res.url) {
                setCoverImage(res.url);
                toast.success('Đã upload ảnh hiển thị');
            } else {
                toast.error(res.message || 'Upload ảnh thất bại');
            }
        } catch {
            toast.error('Upload ảnh thất bại');
        } finally {
            setUploadingCover(false);
            e.target.value = '';
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;

        setUploadingImage(true);
        const uploaded: string[] = [];
        let failed = 0;

        try {
            for (const file of selected) {
                if (!file.type.startsWith('image/')) {
                    failed += 1;
                    continue;
                }
                const res = await uploadApi.uploadFileWithProgress(file, 'cuahangso');
                if (res.success && res.url) {
                    uploaded.push(res.url);
                } else {
                    failed += 1;
                }
            }

            if (uploaded.length > 0) {
                setImages((prev) => [...prev, ...uploaded]);
                toast.success(`Đã thêm ${uploaded.length} ảnh sản phẩm`);
            }
            if (failed > 0) {
                toast.error(`${failed} ảnh upload thất bại`);
            }
        } catch {
            toast.error('Upload ảnh thất bại');
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPreview(true);
        try {
            const res = await uploadApi.uploadFileWithProgress(file, 'cuahangso');
            if (res.success && res.url) {
                setPreview({
                    url: res.url,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                });
                toast.success('Đã thêm tài liệu xem trước');
            } else {
                toast.error(res.message || 'Upload file thất bại');
            }
        } catch {
            toast.error('Upload file thất bại');
        } finally {
            setUploadingPreview(false);
            e.target.value = '';
        }
    };

    const handleAddPreviewLink = () => {
        const url = previewLinkInput.trim();
        if (!url) return;

        try {
            // eslint-disable-next-line no-new
            new URL(url);
        } catch {
            toast.error('Link không hợp lệ');
            return;
        }

        const name = decodeURIComponent(url.split('/').pop() || 'Link xem trước');
        setPreview({ url, name, size: 0, type: 'link' });
        setPreviewLinkInput('');
        toast.success('Đã thêm link xem trước');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        try {
            const res = await uploadApi.uploadFileWithProgress(file, 'cuahangso');
            if (res.success && res.url) {
                setFiles((prev) => [
                    ...prev,
                    {
                        url: res.url!,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                    },
                ]);
                toast.success('Đã upload file');
            } else {
                toast.error(res.message || 'Upload file thất bại');
            }
        } catch {
            toast.error('Upload file thất bại');
        } finally {
            setUploadingFile(false);
            e.target.value = '';
        }
    };

    const handleAddFileLink = () => {
        const url = fileLinkInput.trim();
        if (!url) return;

        try {
            // eslint-disable-next-line no-new
            new URL(url);
        } catch {
            toast.error('Link không hợp lệ');
            return;
        }

        const name = decodeURIComponent(url.split('/').pop() || 'Link đính kèm');
        setFiles((prev) => [...prev, { url, name, size: 0, type: 'link' }]);
        setFileLinkInput('');
        toast.success('Đã thêm link');
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const description = descriptionEditorRef.current?.getContent() || '';
        const emptyContent = !description.trim() || description === '<p><br></p>';

        if (!title.trim() || emptyContent || price === '' || !category) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const basePrice = Number(price);
        const discount = Number(discountValue) || 0;
        if (discountType === 'percent' && discount > 100) {
            toast.error('Giảm giá không được vượt quá 100%');
            return;
        }
        if (discountType === 'vnd' && discount > basePrice) {
            toast.error('Giảm giá không được lớn hơn giá bán');
            return;
        }

        if (files.length === 0) {
            toast.error('Vui lòng upload hoặc dán link tài liệu đính kèm');
            return;
        }

        setSubmitting(true);
        try {
            const payload: CreateProductPayload = {
                title: title.trim(),
                description,
                price: basePrice,
                category: category as (typeof SHOP_CATEGORIES)[number],
                coverImage: coverImage || undefined,
                images: images.filter(Boolean),
                files: files.filter((f) => f.url),
                discountType,
                discountValue: discount,
                allowCoinPayment,
            };
            if (preview?.url) {
                payload.preview = preview;
            }

            if (isEditMode && editId) {
                const res = await shopApi.updateProduct(editId, payload);
                if (res.success) {
                    toast.success(res.message || 'Cập nhật sản phẩm thành công');
                    router.push('/cuahangso');
                } else {
                    toast.error(res.message || 'Không thể cập nhật sản phẩm');
                }
            } else {
                const res = await shopApi.createProduct(payload);

                if (res.success) {
                    toast.success(
                        res.message
                            || (user?.role === 'admin'
                                ? 'Đăng sản phẩm thành công!'
                                : 'Đăng sản phẩm thành công! Chờ admin xét duyệt'),
                    );
                    router.push('/cuahangso');
                } else {
                    toast.error(res.message || 'Không thể đăng sản phẩm');
                }
            }
        } catch (err) {
            console.error('Create product error:', err);
            toast.error('Có lỗi xảy ra khi đăng sản phẩm');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user || loadingProduct) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--cn-primary)' }} />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-8 pt-16 md:pt-14 lg:pt-8"
            style={{ backgroundColor: 'var(--cn-bg-main)' }}
        >
            <div className="mx-auto w-full px-4 lg:px-[60px]">
                <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--cn-text-sub)] md:text-sm">
                    <Link href="/" className="flex items-center gap-1 transition hover:text-[var(--cn-text-main)]">
                        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)] md:h-4 md:w-4" />
                    <Link href="/cuahangso" className="transition hover:text-[var(--cn-text-main)]">
                        Cửa hàng số
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)] md:h-4 md:w-4" />
                    <span className="font-medium text-[var(--cn-text-main)]">
                        {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Đăng sản phẩm'}
                    </span>
                </nav>

                <div
                    className="rounded-xl p-6"
                    style={{
                        backgroundColor: 'var(--cn-bg-card)',
                        border: '1px solid var(--cn-border)',
                    }}
                >
                    <div className="mb-6 flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6" style={{ color: 'var(--cn-primary)' }} />
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--cn-text-main)' }}>
                            {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Đăng bán sản phẩm'}
                        </h1>
                    </div>

                    <p className="mb-6 text-sm" style={{ color: 'var(--cn-text-sub)' }}>
                        {isEditMode
                            ? editProductStatus === 'rejected'
                                ? 'Sản phẩm bị từ chối — chỉnh sửa và gửi duyệt lại.'
                                : editProductStatus === 'approved'
                                    ? user?.role === 'admin'
                                        ? 'Chỉnh sửa sản phẩm đã duyệt — thay đổi có hiệu lực ngay.'
                                        : 'Sản phẩm đã duyệt — chỉnh sửa sẽ gửi duyệt lại trước khi hiển thị.'
                                    : 'Sản phẩm đang chờ duyệt — bạn có thể cập nhật trước khi admin xét duyệt.'
                            : user?.role === 'admin'
                                ? 'Sản phẩm sẽ hiển thị ngay trên cửa hàng số (admin không cần duyệt).'
                                : 'Sản phẩm sẽ được gửi đến admin duyệt trước khi hiển thị trên cửa hàng số.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <CustomInput
                                label="Tên sản phẩm"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tên sản phẩm..."
                                maxLength={200}
                                required
                            />
                            <CustomSelect
                                label="Danh mục"
                                options={CATEGORY_OPTIONS}
                                value={category}
                                onChange={setCategory}
                                placeholder="Chọn danh mục"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                            <CustomInput
                                label="Giá bán (xu = VNĐ)"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0 = miễn phí"
                                min={0}
                                icon={<img src="/icons/coins.svg" alt="" className="h-4 w-4" />}
                                required
                            />
                            <div>
                                <label className="mb-1 block text-[11px] font-medium text-[var(--cn-text-sub)] sm:mb-1.5 lg:text-[13px]">
                                    Giảm giá
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 shrink-0">
                                        <CustomSelect
                                            options={DISCOUNT_TYPE_OPTIONS}
                                            value={discountType}
                                            onChange={(v) => setDiscountType(v as 'percent' | 'vnd')}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CustomInput
                                            type="number"
                                            min={0}
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                {finalPrice !== (Number(price) || 0) && (
                                    <p className="mt-2 text-xs font-medium" style={{ color: 'var(--cn-primary)' }}>
                                        Giá sau giảm: {formatPayableAmount(finalPrice)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-medium text-[var(--cn-text-sub)] sm:mb-1.5 lg:text-[13px]">
                                    Thanh toán xu
                                </label>
                                <div
                                    className="flex min-h-[40px] items-center justify-between gap-4 rounded-[var(--cn-radius-sm)] px-3 py-2 sm:px-4"
                                    style={{
                                        backgroundColor: 'var(--cn-bg-section)',
                                        border: '1px solid var(--cn-border)',
                                    }}
                                >
                                    <span className="text-[12px] font-medium lg:text-[14px]" style={{ color: 'var(--cn-text-main)' }}>
                                        Cho phép thanh toán bằng xu
                                    </span>
                                    <CustomToggle
                                        checked={allowCoinPayment}
                                        onChange={setAllowCoinPayment}
                                        size="small"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                Mô tả chi tiết sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <CustomEditor
                                key={isEditMode ? `edit-${editId}` : 'create'}
                                ref={descriptionEditorRef}
                                initialValue={descriptionInitial}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div
                                className="flex flex-col rounded-xl p-4"
                                style={{
                                    backgroundColor: 'var(--cn-bg-card)',
                                    border: '1px solid var(--cn-border)',
                                }}
                            >
                                <div className="mb-4 min-h-[52px]">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--cn-text-main)' }}>
                                        Hình ảnh hiển thị
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--cn-text-sub)' }}>
                                        Ảnh đại diện trên danh sách cửa hàng số.
                                    </p>
                                </div>
                                <input
                                    id="upload-cover"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverUpload}
                                    className="hidden"
                                    disabled={uploadingCover}
                                />
                                {coverImage ? (
                                    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                                        <img
                                            src={getImageUrl(coverImage)}
                                            alt="Ảnh hiển thị"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-end justify-center gap-2 bg-black/0 p-3 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                                            <CustomButton
                                                type="button"
                                                variant="secondary"
                                                size="small"
                                                disabled={uploadingCover}
                                                onClick={() => document.getElementById('upload-cover')?.click()}
                                            >
                                                Đổi ảnh
                                            </CustomButton>
                                            <CustomButton
                                                type="button"
                                                variant="secondary"
                                                size="small"
                                                onClick={() => setCoverImage('')}
                                            >
                                                Xóa
                                            </CustomButton>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={uploadingCover}
                                        onClick={() => document.getElementById('upload-cover')?.click()}
                                        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg transition hover:bg-[var(--cn-bg-section)] disabled:opacity-60"
                                        style={{
                                            backgroundColor: 'var(--cn-bg-section)',
                                            border: '1px dashed var(--cn-border)',
                                        }}
                                    >
                                        {uploadingCover ? (
                                            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--cn-primary)' }} />
                                        ) : (
                                            <>
                                                <ImageIcon className="h-8 w-8" style={{ color: 'var(--cn-text-muted)' }} />
                                                <span className="text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                                    Upload ảnh hiển thị
                                                </span>
                                                <span className="text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                                                    PNG, JPG tối đa 5MB
                                                </span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div
                                className="flex flex-col rounded-xl p-4"
                                style={{
                                    backgroundColor: 'var(--cn-bg-card)',
                                    border: '1px solid var(--cn-border)',
                                }}
                            >
                                <div className="mb-4 min-h-[52px]">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--cn-text-main)' }}>
                                        Ảnh sản phẩm
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--cn-text-sub)' }}>
                                        Thêm nhiều ảnh minh họa sản phẩm.
                                    </p>
                                </div>
                                <input
                                    id="upload-image"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                                <div
                                    className="flex min-h-0 flex-1 flex-col rounded-lg"
                                    style={{
                                        backgroundColor: 'var(--cn-bg-section)',
                                        border: '1px dashed var(--cn-border)',
                                    }}
                                >
                                    {images.length > 0 ? (
                                        <div className="grid flex-1 grid-cols-2 gap-2 p-3 sm:grid-cols-3">
                                            {images.map((img, idx) => (
                                                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg">
                                                    <img
                                                        src={getImageUrl(img)}
                                                        alt={`Ảnh ${idx + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                disabled={uploadingImage}
                                                onClick={() => document.getElementById('upload-image')?.click()}
                                                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg transition hover:bg-[var(--cn-bg-card)] disabled:opacity-60"
                                                style={{ border: '1px dashed var(--cn-border)' }}
                                            >
                                                {uploadingImage ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--cn-primary)' }} />
                                                ) : (
                                                    <>
                                                        <Upload className="h-5 w-5" style={{ color: 'var(--cn-text-muted)' }} />
                                                        <span className="text-xs" style={{ color: 'var(--cn-text-sub)' }}>Thêm</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={uploadingImage}
                                            onClick={() => document.getElementById('upload-image')?.click()}
                                            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg transition hover:bg-[var(--cn-bg-card)] disabled:opacity-60"
                                        >
                                            {uploadingImage ? (
                                                <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--cn-primary)' }} />
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-8 w-8" style={{ color: 'var(--cn-text-muted)' }} />
                                                    <span className="text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                                        Upload ảnh sản phẩm
                                                    </span>
                                                    <span className="text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                                                        Có thể chọn nhiều ảnh
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                Tài liệu hoặc link xem trước sản phẩm
                            </label>
                            <p className="mb-3 text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                                Người mua có thể xem trước trước khi mua — demo, mục lục, slide mẫu...
                            </p>
                            <div
                                className="mb-3 flex flex-col overflow-hidden rounded-[var(--cn-radius-sm)] sm:flex-row sm:items-stretch"
                                style={{ border: '1px solid var(--cn-border)' }}
                            >
                                <input
                                    id="upload-preview"
                                    type="file"
                                    onChange={handlePreviewUpload}
                                    className="hidden"
                                    disabled={uploadingPreview}
                                />
                                <button
                                    type="button"
                                    disabled={uploadingPreview}
                                    onClick={() => document.getElementById('upload-preview')?.click()}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 border-b border-[var(--cn-border)] px-4 py-2.5 text-[12px] font-medium transition hover:bg-[var(--cn-bg-section)] disabled:opacity-60 sm:border-b-0 sm:border-r lg:text-[14px]"
                                    style={{
                                        color: 'var(--cn-text-main)',
                                        backgroundColor: 'var(--cn-bg-card)',
                                    }}
                                >
                                    {uploadingPreview ? (
                                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--cn-primary)' }} />
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                    Upload file
                                </button>
                                <div className="relative flex min-w-0 flex-1 items-center">
                                    <Link2
                                        className="pointer-events-none absolute left-3 h-4 w-4"
                                        style={{ color: 'var(--cn-text-muted)' }}
                                    />
                                    <input
                                        type="url"
                                        value={previewLinkInput}
                                        onChange={(e) => setPreviewLinkInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddPreviewLink();
                                            }
                                        }}
                                        placeholder="Dán link xem trước..."
                                        className="h-11 w-full bg-transparent py-2.5 pl-10 pr-3 text-[12px] outline-none lg:text-[14px]"
                                        style={{ color: 'var(--cn-text-main)' }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddPreviewLink}
                                    className="inline-flex shrink-0 items-center justify-center border-t border-[var(--cn-border)] px-4 py-2.5 text-[12px] font-semibold transition hover:opacity-90 sm:border-l sm:border-t-0 lg:text-[14px]"
                                    style={{
                                        color: 'white',
                                        backgroundColor: 'var(--cn-primary)',
                                    }}
                                >
                                    Thêm link
                                </button>
                            </div>
                            {preview && (
                                <div
                                    className="flex items-center justify-between rounded-lg p-3"
                                    style={{
                                        backgroundColor: 'var(--cn-bg-section)',
                                        border: '1px solid var(--cn-border)',
                                    }}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText className="h-5 w-5 shrink-0" style={{ color: 'var(--cn-text-sub)' }} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                                {preview.name}
                                            </p>
                                            <p className="truncate text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                                                {preview.type === 'link'
                                                    ? preview.url
                                                    : `${(preview.size / 1024).toFixed(2)} KB`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPreview(null)}
                                        className="shrink-0 text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                Tài liệu hoặc link đính kèm <span className="text-red-500">*</span>
                            </label>
                            <p className="mb-3 text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                                Upload file hoặc dán link Google Drive, Dropbox, v.v.
                            </p>
                            <div
                                className="mb-3 flex flex-col overflow-hidden rounded-[var(--cn-radius-sm)] sm:flex-row sm:items-stretch"
                                style={{ border: '1px solid var(--cn-border)' }}
                            >
                                <input
                                    id="upload-file"
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploadingFile}
                                />
                                <button
                                    type="button"
                                    disabled={uploadingFile}
                                    onClick={() => document.getElementById('upload-file')?.click()}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 border-b border-[var(--cn-border)] px-4 py-2.5 text-[12px] font-medium transition hover:bg-[var(--cn-bg-section)] disabled:opacity-60 sm:border-b-0 sm:border-r lg:text-[14px]"
                                    style={{
                                        color: 'var(--cn-text-main)',
                                        backgroundColor: 'var(--cn-bg-card)',
                                    }}
                                >
                                    {uploadingFile ? (
                                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--cn-primary)' }} />
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                    Upload file
                                </button>
                                <div className="relative flex min-w-0 flex-1 items-center">
                                    <Link2
                                        className="pointer-events-none absolute left-3 h-4 w-4"
                                        style={{ color: 'var(--cn-text-muted)' }}
                                    />
                                    <input
                                        type="url"
                                        value={fileLinkInput}
                                        onChange={(e) => setFileLinkInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddFileLink();
                                            }
                                        }}
                                        placeholder="Dán link tài liệu..."
                                        className="h-11 w-full bg-transparent py-2.5 pl-10 pr-3 text-[12px] outline-none lg:text-[14px]"
                                        style={{ color: 'var(--cn-text-main)' }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddFileLink}
                                    className="inline-flex shrink-0 items-center justify-center border-t border-[var(--cn-border)] px-4 py-2.5 text-[12px] font-semibold transition hover:opacity-90 sm:border-l sm:border-t-0 lg:text-[14px]"
                                    style={{
                                        color: 'white',
                                        backgroundColor: 'var(--cn-primary)',
                                    }}
                                >
                                    Thêm link
                                </button>
                            </div>
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-lg p-3"
                                            style={{
                                                backgroundColor: 'var(--cn-bg-section)',
                                                border: '1px solid var(--cn-border)',
                                            }}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <FileText className="h-5 w-5 shrink-0" style={{ color: 'var(--cn-text-sub)' }} />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                                        {file.name}
                                                    </p>
                                                    <p className="truncate text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                                                        {file.type === 'link'
                                                            ? file.url
                                                            : `${(file.size / 1024).toFixed(2)} KB`}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="shrink-0 text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <CustomButton type="submit" loading={submitting} className="w-full sm:w-auto sm:min-w-[200px]">
                                {isEditMode ? 'Lưu thay đổi' : 'Gửi sản phẩm'}
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function CreateProductPage() {
    return (
        <Suspense
            fallback={(
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--cn-primary)' }} />
                </div>
            )}
        >
            <CreateProductPageContent />
        </Suspense>
    );
}
