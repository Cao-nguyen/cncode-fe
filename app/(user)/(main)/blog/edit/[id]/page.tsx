'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { useAuthStore } from '@/store/auth.store';

const CATEGORIES = [
    { value: 'technology', label: 'Công nghệ' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'tutorial', label: 'Hướng dẫn' },
    { value: 'news', label: 'Tin tức' },
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
    const [formData, setFormData] = useState({
        title: '',
        thumbnail: '',
        excerpt: '',
        category: 'other',
        tags: [] as string[],
        isPublished: false
    });
    const [tagInput, setTagInput] = useState('');

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
                setFormData({
                    title: res.data.title,
                    thumbnail: res.data.thumbnail || '',
                    excerpt: res.data.excerpt || '',
                    category: res.data.category,
                    tags: res.data.tags || [],
                    isPublished: res.data.isPublished
                });
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

        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        const content = editorRef.current?.getContent() || '';
        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung');
            return;
        }

        setSaving(true);
        try {
            const res = await blogApi.updateBlog(blog._id, {
                ...formData,
                title: formData.title.trim(),
                excerpt: formData.excerpt.trim() || undefined,
                content: content.trim()
            });

            if (res.success) {
                toast.success('Cập nhật bài viết thành công!');
                router.push(`/blog/${res.data.slug}`);
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

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tiêu đề bài viết..."
                                maxLength={200}
                            />
                        </div>

                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ảnh đại diện
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="url"
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="URL ảnh đại diện..."
                                />
                                {formData.thumbnail && (
                                    <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden">
                                        <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh mục
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tag và nhấn Enter..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Thêm
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm flex items-center gap-2"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả ngắn (tùy chọn)
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Mô tả ngắn về bài viết..."
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.excerpt.length}/500 ký tự
                            </p>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung <span className="text-red-500">*</span>
                            </label>
                            <CustomEditor ref={editorRef} initialValue={blog.content} />
                        </div>

                        {/* Publish */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPublished"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isPublished" className="text-sm text-gray-700">
                                Xuất bản
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Lưu thay đổi
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}