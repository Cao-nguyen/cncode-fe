'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomButton } from '@/components/custom/CustomButton';
import { useAuthStore } from '@/store/auth.store';

const CATEGORIES = [
    { value: 'technology', label: 'Công nghệ' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'news', label: 'Tin tức' },
    { value: 'contest', label: 'Cuộc thi' },
    { value: 'other', label: 'Khác' }
];

export default function EditBlogPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuthStore();
    const editorRef = useRef<CustomEditorRef>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('other');
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchBlog();
    }, [params.id, token]);

    const fetchBlog = async () => {
        if (!token) return;

        try {
            const res = await blogApi.getBlogById(params.id as string);
            if (res.success) {
                setBlog(res.data);
                setTitle(res.data.title);
                setCategory(res.data.category);
                setTags(res.data.tags || []);
                // Set editor content after a small delay to ensure editor is mounted
                setTimeout(() => {
                    editorRef.current?.setContent(res.data.content);
                }, 100);
            } else {
                toast.error('Không tìm thấy bài viết');
                router.push('/me/blog');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            router.push('/me/blog');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !blog) return;

        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung');
            return;
        }

        setSaving(true);
        try {
            // Tự động lấy ảnh đầu tiên từ content làm thumbnail
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            const thumbnail = imgMatch ? imgMatch[1] : '/images/blog.png';

            const updateData: Record<string, unknown> = {
                title: title.trim(),
                thumbnail,
                content: content.trim(),
                category,
                tags
            };

            // If post was rejected and user is resubmitting, set needsReview=true
            if (blog.rejectionReason) {
                updateData.needsReview = true;
                updateData.rejectionReason = ''; // Clear rejection reason
            }

            const res = await blogApi.updateBlogUser(blog._id, updateData);

            if (res.success) {
                toast.success('Cập nhật bài viết thành công!');

                // If needs review, redirect to my blogs list
                if (blog.rejectionReason) {
                    toast.success('Bài viết đã được gửi để duyệt lại!');
                }

                router.push('/me/blog');
            } else {
                toast.error(res.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !blog) return;

        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

        try {
            const res = await blogApi.deleteBlog(blog._id);
            if (res.success) {
                toast.success('Xóa bài viết thành công');
                router.push('/me/blog');
            } else {
                toast.error(res.message || 'Xóa thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/me/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa bài viết</h1>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            Xóa bài viết
                        </button>
                    </div>

                    {/* Rejection Reason Alert */}
                    {blog.rejectionReason && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                                        Bài viết bị từ chối
                                    </h3>
                                    <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                                        {blog.rejectionReason}
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-500">
                                        Vui lòng chỉnh sửa theo yêu cầu và lưu lại để gửi duyệt lại.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <CustomInput
                            label="Tiêu đề"
                            placeholder="Nhập tiêu đề bài viết..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            required
                        />

                        {/* Category */}
                        <CustomSelect
                            label="Danh mục"
                            value={category}
                            onChange={(value) => setCategory(value)}
                            options={CATEGORIES}
                        />

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags (phân cách bằng dấu phẩy)
                            </label>
                            <CustomInput
                                placeholder="react, javascript, tutorial"
                                value={tags.join(', ')}
                                onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nội dung <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Ảnh đầu tiên trong nội dung sẽ được dùng làm thumbnail.
                            </p>
                            <CustomEditor ref={editorRef} initialValue={blog.content} />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton
                                type="submit"
                                loading={saving}
                                className="flex-1"
                            >
                                Lưu thay đổi
                            </CustomButton>
                            <CustomButton
                                type="button"
                                variant="secondary"
                                onClick={() => router.back()}
                            >
                                Hủy
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}