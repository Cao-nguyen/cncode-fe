'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Editor } from '@tinymce/tinymce-react'
import { Save, Eye, X, Plus, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'
import { postApi } from '@/lib/api/post.api'

const CATEGORIES = [
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' },
    { id: 'fullstack', name: 'Fullstack' },
    { id: 'devops', name: 'DevOps' },
    { id: 'ai', name: 'AI/ML' },
    { id: 'tutorial', name: 'Hướng dẫn' }
]

export default function CreatePostPage() {
    const router = useRouter()
    const { token } = useAuthStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tagInput, setTagInput] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        thumbnail: '',
        tags: [] as string[]
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleEditorChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }))
    }

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }))
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }))
    }

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề')
            return false
        }
        if (!formData.description.trim()) {
            toast.error('Vui lòng nhập mô tả')
            return false
        }
        if (!formData.content.trim()) {
            toast.error('Vui lòng nhập nội dung')
            return false
        }
        if (!formData.category) {
            toast.error('Vui lòng chọn danh mục')
            return false
        }
        if (!formData.thumbnail.trim()) {
            toast.error('Vui lòng nhập URL ảnh thumbnail')
            return false
        }
        return true
    }

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const result = await postApi.createPost({ ...formData, status }, token!)

            if (result.success) {
                toast.success(status === 'draft' ? 'Đã lưu bài viết' : 'Đăng bài thành công')
                router.push('/me/baiviet')
            } else {
                toast.error(result.message || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Create post failed:', error)
            toast.error('Không thể kết nối đến server')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
            <div className="container mx-auto px-5 lg:px-10">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Viết bài mới
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tiêu đề bài viết
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Nhập tiêu đề bài viết..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Danh mục
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    URL ảnh thumbnail
                                </label>
                                <input
                                    type="url"
                                    name="thumbnail"
                                    value={formData.thumbnail}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mô tả ngắn
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Tóm tắt nội dung bài viết..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nội dung
                                </label>
                                <Editor
                                    tinymceScriptSrc="https://cdn.tiny.cloud/1/o6ofaxdljkxy2c1etf2syu7hwrvb16oe5h07h4tvo0gg1gvh/tinymce/6/tinymce.min.js"
                                    value={formData.content}
                                    onEditorChange={handleEditorChange}
                                    init={{
                                        height: 500,
                                        menubar: true,
                                        plugins: [
                                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
                                        ],
                                        toolbar: 'undo redo | blocks | ' +
                                            'bold italic backcolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist outdent indent | ' +
                                            'removeformat | help | code | fullscreen | image | link | codesample',
                                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
                                        codesample_languages: [
                                            { text: 'JavaScript', value: 'javascript' },
                                            { text: 'TypeScript', value: 'typescript' },
                                            { text: 'HTML/XML', value: 'markup' },
                                            { text: 'CSS', value: 'css' },
                                            { text: 'Python', value: 'python' },
                                            { text: 'Java', value: 'java' },
                                            { text: 'C++', value: 'cpp' },
                                            { text: 'Go', value: 'go' },
                                            { text: 'Rust', value: 'rust' },
                                            { text: 'PHP', value: 'php' },
                                            { text: 'SQL', value: 'sql' },
                                            { text: 'Bash', value: 'bash' }
                                        ],
                                        promotion: false
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Thẻ tags
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <div className="flex-1 relative">
                                        <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                            placeholder="Nhập tag và nhấn Enter"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center gap-2"
                                            >
                                                #{tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
                            <button
                                onClick={() => handleSubmit('draft')}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {isSubmitting ? 'Đang lưu...' : 'Lưu nháp'}
                            </button>
                            <button
                                onClick={() => handleSubmit('published')}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Eye size={18} />
                                {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}