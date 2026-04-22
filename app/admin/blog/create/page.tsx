'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { postApi } from '@/lib/api/post.api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Globe, Lock, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import TinyMCEEditor from '@/components/common/TinyMCEEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const extractFirstImage = (html: string): string => {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : '';
};

const extractDescription = (html: string): string => {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 200).trim();
};

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
        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung');
            return;
        }
        if (!token) {
            toast.error('Vui lòng đăng nhập lại');
            return;
        }

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
                    description: extractDescription(content),
                    content,
                    category: 'general',
                    thumbnail,
                    tags: [],
                    status: status === 'published' ? 'published' : 'draft'
                },
                token,
            );

            if (result.success) {
                toast.success(status === 'draft' ? 'Đã lưu bài nháp' : 'Đăng bài thành công!');
                router.push('/me/baiviet');
            } else {
                toast.error(result.message || 'Đăng bài thất bại');
            }
        } catch (error) {
            console.error('Create post error:', error);
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
        <div className="min-h-screen py-5">
            <div className="container mx-auto px-5 lg:px-10">
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <Link
                        href="/me/baiviet"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setStatus(s => s === 'published' ? 'draft' : 'published')}
                            className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${status === 'published'
                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-400'
                                : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                }`}
                        >
                            {status === 'published' ? <Globe size={14} /> : <Lock size={14} />}
                            {status === 'published' ? 'Công khai' : 'Nháp'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/me/baiviet')}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin inline mr-1.5" />
                                    Đang đăng...
                                </>
                            ) : status === 'published' ? (
                                'Đăng bài'
                            ) : (
                                'Lưu nháp'
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tiêu đề bài viết..."
                            className="w-full text-xl font-semibold h-14 rounded-xl border-0 border-b border-gray-200 dark:border-gray-800 bg-transparent px-0 focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                            <ImageIcon size={13} />
                            Ảnh đầu tiên trong bài sẽ làm ảnh đại diện
                        </p>

                        <TinyMCEEditor
                            value={content}
                            onChange={setContent}
                            height={600}
                            placeholder="Nội dung bài viết..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}