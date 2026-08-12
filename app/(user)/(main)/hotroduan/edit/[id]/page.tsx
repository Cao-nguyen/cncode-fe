'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    Clock,
    CheckCircle2,
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

const STATUS: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    pending: { label: 'Chờ trả lời', className: 'bg-amber-50 text-amber-700', icon: Clock },
    answered: { label: 'Đã trả lời', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
};

export default function EditHelpProjectPage() {
    const router = useRouter();
    const params = useParams();
    const editorRef = useRef<CustomEditorRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [content, setContent] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [status, setStatus] = useState<'pending' | 'answered'>('pending');
    const [titleError, setTitleError] = useState('');
    const [contentError, setContentError] = useState('');

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        setPageLoading(true);
        try {
            const res = await helpProjectApi.getProjectById(params.id as string);
            if (res.success) {
                setTitle(res.data.title);
                setThumbnail(res.data.thumbnail || '');
                setContent(res.data.content);
                setIsPublic(res.data.isPublic ?? false);
                setStatus(res.data.status || 'pending');
                if (editorRef.current) {
                    editorRef.current.setContent(res.data.content);
                }
            } else {
                toast.error('Không thể tải dự án');
                router.push('/hotroduan');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
            router.push('/hotroduan');
        } finally {
            setPageLoading(false);
        }
    };

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

        const editorContent = editorRef.current?.getContent() || '';
        if (!editorContent.trim() || editorContent === '<p><br></p>') {
            setContentError('Vui lòng nhập nội dung dự án');
            hasError = true;
        } else {
            setContentError('');
        }

        if (hasError) return;

        setSubmitting(true);
        try {
            const res = await helpProjectApi.updateProject(params.id as string, {
                title: title.trim(),
                thumbnail,
                content: editorContent,
                isPublic,
            });
            if (res.success) {
                toast.success('Cập nhật dự án thành công');
                router.push(`/hotroduan/${params.id}`);
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center pt-16" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
                <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    const st = STATUS[status] || STATUS.pending;
    const StatusIcon = st.icon;

    return (
        <div className="min-h-screen pb-8 pt-16 md:pt-14 lg:pt-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
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
                    <Link href={`/hotroduan/${params.id}`} className="line-clamp-1 transition hover:text-[var(--cn-text-main)]">
                        Chi tiết dự án
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--cn-text-muted)] md:h-4 md:w-4" />
                    <span className="font-medium text-[var(--cn-text-main)]">Chỉnh sửa</span>
                </nav>

                <div className="mb-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--cn-text-main)] md:text-3xl">
                        <FolderKanban className="h-7 w-7 text-[var(--cn-primary)] md:h-8 md:w-8" />
                        Chỉnh sửa dự án
                    </h1>
                    <p className="mt-1 text-sm text-[var(--cn-text-sub)]">
                        Cập nhật thông tin dự án trước khi gửi lại cho đội ngũ CNcode
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
                                    <div className="flex flex-col items-center justify-center px-4 py-10">
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
                            <CustomEditor
                                key={params.id as string}
                                ref={editorRef}
                                initialValue={content}
                            />
                            {contentError && <p className="mt-2 text-sm text-[var(--cn-error)]">{contentError}</p>}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[var(--cn-border)] pt-5 lg:hidden">
                            <CustomButton type="button" variant="secondary" onClick={() => router.push(`/hotroduan/${params.id}`)}>
                                Hủy
                            </CustomButton>
                            <CustomButton type="submit" loading={submitting}>
                                Lưu thay đổi
                            </CustomButton>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-5 shadow-sm">
                            <p className="mb-3 text-sm font-semibold text-[var(--cn-text-main)]">Trạng thái</p>
                            <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold', st.className)}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {st.label}
                            </span>
                            <p className="mt-3 text-xs leading-relaxed text-[var(--cn-text-muted)]">
                                Trạng thái do admin cập nhật sau khi phản hồi dự án.
                            </p>
                        </div>

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
                                Lưu ý
                            </div>
                            <ul className="space-y-2 text-xs leading-relaxed text-[var(--cn-text-sub)]">
                                <li>• Chỉnh sửa sẽ không xóa phản hồi hiện có</li>
                                <li>• Cập nhật mô tả rõ ràng giúp admin phản hồi nhanh hơn</li>
                                <li>• Chọn Riêng tư nếu dự án chứa thông tin nhạy cảm</li>
                            </ul>
                        </div>

                        <div className="hidden space-y-3 lg:block">
                            <CustomButton type="submit" loading={submitting} fullWidth>
                                Lưu thay đổi
                            </CustomButton>
                            <CustomButton
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={() => router.push(`/hotroduan/${params.id}`)}
                            >
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
