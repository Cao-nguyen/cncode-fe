
'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { helpProjectApi } from '@/lib/api/helpproject.api';
import { uploadApi } from '@/lib/upload';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { toast } from 'sonner';
import {
    Home,
    ChevronRight,
    FolderKanban,
    X,
    Loader2,
    Globe,
    Lock,
    ImageIcon,
    Info,
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

export default function CreateHelpProjectPage() {
    const router = useRouter();
    const editorRef = useRef<CustomEditorRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [titleError, setTitleError] = useState('');
    const [contentError, setContentError] = useState('');

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
            const result = await uploadApi.uploadImage(base64, 'help-projects');
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

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        let hasError = false;
        if (!title.trim()) {
            setTitleError('Vui lòng nhập tiêu đề dự án');
            hasError = true;
        } else {
            setTitleError('');
        }

        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            setContentError('Vui lòng nhập nội dung dự án');
            hasError = true;
        } else {
            setContentError('');
        }

        if (hasError) return;

        setLoading(true);
        try {
            const res = await helpProjectApi.createProject({
                title: title.trim(),
                thumbnail,
                content,
                isPublic,
            });
            if (res.success) {
                toast.success('Gửi dự án thành công');
                router.push(`/hotroduan/${res.data._id}`);
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-8 pt-16 md:pt-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-5xl px-4">
                <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--cn-text-sub)] md:text-sm">
                    <Link href="/" className="flex items-center gap-1 transition hover:text-[var(--cn-text-main)]">
                        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)] md:h-4 md:w-4" />
                    <Link href="/hotroduan" className="transition hover:text-[var(--cn-text-main)]">
                        Hỗ trợ dự án
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)] md:h-4 md:w-4" />
                    <span className="font-medium text-[var(--cn-text-main)]">Gửi dự án mới</span>
                </nav>

                <div className="mb-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--cn-text-main)] md:text-3xl">
                        <FolderKanban className="h-7 w-7 text-[var(--cn-primary)] md:h-8 md:w-8" />
                        Gửi dự án mới
                    </h1>
                    <p className="mt-1 text-sm text-[var(--cn-text-sub)]">
                        Mô tả ý tưởng dự án của bạn để nhận phản hồi từ đội ngũ CNcode
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-5 rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-5 shadow-sm md:p-6">
                        <CustomInput
                            label="Tiêu đề dự án"
                            placeholder="VD: Website quản lý thư viện trường học..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={titleError}
                            maxLength={200}
                            required
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--cn-text-main)]">
                                Ảnh minh họa
                                <span className="ml-1 text-xs font-normal text-[var(--cn-text-muted)]">(tuỳ chọn)</span>
                            </label>
                            <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                className={cn(
                                    'relative overflow-hidden rounded-xl border-2 border-dashed transition',
                                    thumbnail
                                        ? 'border-[var(--cn-primary)]/30 bg-[var(--cn-bg-section)]'
                                        : 'border-[var(--cn-border)] hover:border-[var(--cn-primary)]/50 hover:bg-[var(--cn-bg-section)]/50'
                                )}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
                                        <p className="mt-2 text-sm text-[var(--cn-text-sub)]">Đang tải ảnh...</p>
                                    </div>
                                ) : thumbnail ? (
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(thumbnail)}
                                            alt="Thumbnail"
                                            className="max-h-52 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setThumbnail(''); }}
                                            className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 px-4">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cn-bg-section)]">
                                            <ImageIcon className="h-6 w-6 text-[var(--cn-text-muted)]" />
                                        </div>
                                        <p className="text-sm font-medium text-[var(--cn-text-main)]">Kéo thả hoặc click để chọn ảnh</p>
                                        <p className="mt-1 text-xs text-[var(--cn-text-muted)]">PNG, JPG tối đa 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--cn-text-main)]">
                                Nội dung dự án <span className="text-[var(--cn-error)]">*</span>
                            </label>
                            <CustomEditor ref={editorRef} />
                            {contentError && <p className="mt-2 text-sm text-[var(--cn-error)]">{contentError}</p>}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[var(--cn-border)] pt-5 lg:hidden">
                            <CustomButton type="button" variant="secondary" onClick={() => router.push('/hotroduan')}>
                                Hủy
                            </CustomButton>
                            <CustomButton type="submit" loading={loading}>
                                Gửi dự án
                            </CustomButton>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-5 shadow-sm">
                            <p className="mb-3 text-sm font-semibold text-[var(--cn-text-main)]">Quyền riêng tư</p>
                            <div className="inline-flex w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-section)] p-1">
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(true)}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition',
                                        isPublic
                                            ? 'bg-[var(--cn-bg-card)] text-[var(--cn-primary)] shadow-sm'
                                            : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                    )}
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    Công khai
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(false)}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition',
                                        !isPublic
                                            ? 'bg-[var(--cn-bg-card)] text-[var(--cn-primary)] shadow-sm'
                                            : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                    )}
                                >
                                    <Lock className="h-3.5 w-3.5" />
                                    Riêng tư
                                </button>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-[var(--cn-text-muted)]">
                                {isPublic
                                    ? 'Mọi người dùng đã đăng nhập có thể xem dự án này.'
                                    : 'Chỉ bạn và admin CNcode có thể xem dự án này.'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-5 shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--cn-text-main)]">
                                <Info className="h-4 w-4 text-[var(--cn-primary)]" />
                                Gợi ý
                            </div>
                            <ul className="space-y-2 text-xs leading-relaxed text-[var(--cn-text-sub)]">
                                <li>• Mô tả rõ mục tiêu và phạm vi dự án</li>
                                <li>• Nêu công nghệ hoặc yêu cầu kỹ thuật nếu có</li>
                                <li>• Chọn Riêng tư nếu dự án chứa thông tin nhạy cảm</li>
                            </ul>
                        </div>

                        <div className="hidden space-y-3 lg:block">
                            <CustomButton type="submit" loading={loading} fullWidth>
                                Gửi dự án
                            </CustomButton>
                            <CustomButton type="button" variant="secondary" fullWidth onClick={() => router.push('/hotroduan')}>
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
