'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { postApi } from '@/lib/api/post.api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Globe, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import TinyMCEEditor from '@/components/common/TinyMCEEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface IPost {
    _id: string;
    title: string;
    content: string;
    status: string;
    thumbnail: string;
    author?: {
        fullName: string;
    };
    createdAt: string;
}

const extractFirstImage = (html: string): string => {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : '';
};

const extractDescription = (html: string): string => {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 200).trim();
};

export default function AdminEditPostPage() {
    const router = useRouter();
    const params = useParams();
    const { token, user } = useAuthStore();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'published' | 'draft' | 'pending' | 'rejected'>('draft');
    const [originalPost, setOriginalPost] = useState<IPost | null>(null);

    useEffect(() => {
        if (!token || user?.role !== 'admin') {
            toast.error('Bạn không có quyền truy cập');
            router.push('/');
        } else if (token && id) {
            fetchPost();
        }
    }, [token, user, id, router]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const result = await postApi.adminGetPostById(id, token!);

            if (result.success) {
                const post = result.data;
                setOriginalPost(post);
                setTitle(post.title);
                setContent(post.content);
                setStatus(post.status);
            } else {
                toast.error(result.message || 'Không tìm thấy bài viết');
                router.push('/admin/blog');
            }
        } catch (error) {
            console.error('Fetch post error:', error);
            toast.error('Lỗi khi tải bài viết');
            router.push('/admin/blog');
        } finally {
            setLoading(false);
        }
    };

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

        const thumbnail = extractFirstImage(content);
        if (!thumbnail) {
            toast.error('Nội dung cần có ít nhất 1 ảnh để làm ảnh đại diện');
            return;
        }

        setSubmitting(true);
        try {
            const result = await postApi.adminUpdatePost(id, {
                title: title.trim(),
                description: extractDescription(content),
                content,
                thumbnail,
                status,
            }, token!);

            if (result.success) {
                toast.success('Cập nhật bài viết thành công');
                router.push('/admin/blog');
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-5">
                <div className="container mx-auto px-5 lg:px-10">
                    <div className="flex justify-center items-center h-64">
                        <Loader2 size={40} className="animate-spin text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto px-5 lg:px-10">
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <Link
                        href="/admin/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </Link>

                    {originalPost && originalPost.author && (
                        <div className="text-sm text-gray-500">
                            Tác giả: {originalPost.author.fullName} |
                            Ngày tạo: {new Date(originalPost.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${status === 'published' ? 'bg-green-100 text-green-700' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {status === 'published' && <CheckCircle size={14} />}
                            {status === 'pending' && <Loader2 size={14} className="animate-spin" />}
                            {status === 'rejected' && <AlertCircle size={14} />}
                            <span>
                                {status === 'published' ? 'Đã duyệt' :
                                    status === 'pending' ? 'Chờ duyệt' :
                                        status === 'rejected' ? 'Bị từ chối' : 'Nháp'}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStatus(s => {
                                if (s === 'published') return 'draft';
                                if (s === 'pending') return 'draft';
                                if (s === 'rejected') return 'draft';
                                return 'published';
                            })}
                            className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${status === 'published'
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-gray-100 border-gray-300 text-gray-700'
                                }`}
                        >
                            {status === 'published' ? <Globe size={14} /> : <Lock size={14} />}
                            {status === 'published' ? 'Công khai' : 'Nháp'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/admin/blog')}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin inline mr-1.5" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                'Cập nhật bài viết'
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
                            className="w-full text-xl font-semibold h-14 rounded-xl border-0 border-b border-gray-200 bg-transparent px-0 focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                            Ảnh đầu tiên trong bài sẽ làm ảnh đại diện
                        </p>

                        <TinyMCEEditor
                            value={content}
                            onChange={setContent}
                            height={600}
                            placeholder="Nội dung bài viết..."
                            uploadImage={uploadImageToCloudinary}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}