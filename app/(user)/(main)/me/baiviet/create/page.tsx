'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
type BlobInfo = {
    blob: () => Blob;
    filename: () => string;
    base64: () => string;
    blobUri: () => string;
    uri: () => string | undefined;
};
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ImageIcon, Loader2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { postApi } from '@/lib/api/post.api';
import { useAuthStore } from '@/store/auth.store';

const Editor = dynamic(() => import('@tinymce/tinymce-react').then((mod) => mod.Editor), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] w-full rounded-xl border bg-muted flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
    ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const extractFirstImage = (html: string): string => {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : '';
};

const extractDescription = (html: string): string => {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 200).trim();
};

const createSlug = (title: string): string =>
    title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export default function CreatePostPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'published' | 'draft'>('published');

    useEffect(() => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để đăng bài');
            router.push('/login');
        }
    }, [token, router]);

    const uploadImageToCloudinary = useCallback(
        async (file: File): Promise<string> => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'blogs');

            const response = await fetch(`${API_URL}/api/upload/single`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Upload thất bại');
            return data.data.url;
        },
        [token],
    );

    const handleSubmit = async () => {
        if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
        if (!content.trim()) { toast.error('Vui lòng nhập nội dung'); return; }
        if (!token) { toast.error('Vui lòng đăng nhập lại'); return; }

        const thumbnail = extractFirstImage(content);
        if (!thumbnail) {
            toast.error('Nội dung cần có ít nhất 1 ảnh để làm ảnh đại diện');
            return;
        }

        setLoading(true);
        try {
            const result = await postApi.createPost(
                {
                    title: title.trim(),
                    slug: createSlug(title.trim()),
                    description: extractDescription(content),
                    content,
                    category: 'general',
                    thumbnail,
                    status,
                },
                token,
            );

            if (result.success) {
                toast.success(status === 'draft' ? 'Đã lưu bài nháp' : 'Đăng bài thành công!');
                router.push(`/baiviet/${result.data.slug}`);
            } else {
                toast.error(result.message || 'Đăng bài thất bại');
            }
        } catch {
            toast.error('Lỗi khi đăng bài');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <Link
                    href="/baiviet"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
                >
                    <ChevronLeft size={16} />
                    Quay lại
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setStatus((s) => (s === 'published' ? 'draft' : 'published'))}
                        className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${status === 'published'
                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-400'
                            : 'bg-muted border-border text-muted-foreground'
                            }`}
                    >
                        {status === 'published' ? <Globe size={14} /> : <Lock size={14} />}
                        {status === 'published' ? 'Công khai' : 'Nháp'}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/baiviet')}>
                        Hủy
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin mr-1.5" />
                                Đang đăng...
                            </>
                        ) : status === 'published' ? (
                            'Đăng bài'
                        ) : (
                            'Lưu nháp'
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-5">
                <Input
                    placeholder="Tiêu đề bài viết..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-semibold h-14 rounded-xl border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground transition placeholder:text-muted-foreground/50"
                />

                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon size={13} />
                    Ảnh đầu tiên trong bài sẽ làm ảnh đại diện
                </p>

                <div className="rounded-xl overflow-hidden border">
                    <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        value={content}
                        onEditorChange={(val) => setContent(val)}
                        init={{
                            height: 600,
                            menubar: false,
                            mobile: { menubar: false, toolbar_mode: 'scrolling' },
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image',
                                'charmap', 'preview', 'searchreplace', 'visualblocks',
                                'code', 'fullscreen', 'media', 'table', 'wordcount',
                            ],
                            toolbar:
                                'undo redo | blocks | bold italic underline | ' +
                                'forecolor backcolor | alignleft aligncenter alignright | ' +
                                'bullist numlist | link image media | code fullscreen',
                            toolbar_mode: 'sliding',
                            content_style: `
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                    font-size: 15px;
                                    line-height: 1.7;
                                    padding: 16px;
                                    max-width: 100%;
                                }
                                img { max-width: 100%; height: auto; border-radius: 8px; }
                                pre { overflow-x: auto; background: #f4f4f4; padding: 12px; border-radius: 6px; }
                            `,
                            images_upload_handler: async (blobInfo: BlobInfo): Promise<string> => {
                                const url = await uploadImageToCloudinary(blobInfo.blob() as File);
                                return url;
                            },
                            automatic_uploads: true,
                            file_picker_types: 'image',
                            branding: false,
                            resize: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}