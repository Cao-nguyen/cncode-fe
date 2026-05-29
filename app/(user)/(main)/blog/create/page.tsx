'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { blogApi } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
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

export default function CreateBlogPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const editorRef = useRef<CustomEditorRef>(null);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('other');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung');
            return;
        }

        setLoading(true);
        try {
            // Tự động lấy ảnh đầu tiên từ content làm thumbnail
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            const thumbnail = imgMatch ? imgMatch[1] : '/images/blog.png';

            const res = await blogApi.createBlogUser({
                title: title.trim(),
                thumbnail,
                content: content.trim(),
                category,
                tags,
                isPublished: false // Chờ admin duyệt
            });

            if (res.success) {
                toast.success('Tạo bài viết thành công! Bài viết đang chờ admin duyệt.');
                router.push('/me/blog');
            } else {
                toast.error(res.message || 'Tạo bài viết thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/me/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Tạo bài viết mới</h1>

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
                                Ảnh đầu tiên trong nội dung sẽ được dùng làm thumbnail. Bài viết sẽ được gửi đến admin để duyệt trước khi xuất bản.
                            </p>
                            <CustomEditor ref={editorRef} initialValue="" />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton
                                type="submit"
                                loading={loading}
                                className="flex-1"
                            >
                                Gửi bài viết
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