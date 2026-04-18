// src/app/create-post/page.tsx
'use client'

import { useState, useRef, FormEvent, ChangeEvent, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { DocumentText, Image as ImageIcon, Tag, TickCircle, CloseCircle } from 'iconsax-react'
import { Eye, Save, Trash2, Plus, Loader2 } from 'lucide-react'

const Editor = dynamic(
    () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
    { ssr: false }
)

interface Category {
    id: string
    name: string
    value: string
}

interface FormData {
    title: string
    content: string
    excerpt: string
    category: string
    tags: string[]
    thumbnail: string
    status: 'draft' | 'published'
}

interface ApiResponse {
    success: boolean
    data: {
        slug: string
        _id: string
    }
    message: string
}

const CATEGORIES: Category[] = [
    { id: 'frontend', name: 'Frontend Development', value: 'frontend' },
    { id: 'backend', name: 'Backend Development', value: 'backend' },
    { id: 'fullstack', name: 'Fullstack', value: 'fullstack' },
    { id: 'devops', name: 'DevOps', value: 'devops' },
    { id: 'ai', name: 'AI & Machine Learning', value: 'ai' },
    { id: 'innovation', name: 'Innovation', value: 'innovation' }
]

export default function CreatePostPage() {
    const router = useRouter()
    const editorRef = useRef<unknown>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [tagInput, setTagInput] = useState<string>('')

    const [formData, setFormData] = useState<FormData>({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: [],
        thumbnail: '',
        status: 'draft'
    })

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (error) setError(null)
    }

    const handleEditorChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }))
    }

    const handleAddTag = (): void => {
        const trimmedTag = tagInput.trim()
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmedTag]
            }))
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string): void => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleTagKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        }
    }

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            setError('Vui lòng nhập tiêu đề bài viết')
            return false
        }
        if (!formData.content.trim()) {
            setError('Vui lòng nhập nội dung bài viết')
            return false
        }
        if (!formData.excerpt.trim()) {
            setError('Vui lòng nhập mô tả ngắn')
            return false
        }
        if (!formData.category) {
            setError('Vui lòng chọn danh mục')
            return false
        }
        if (formData.excerpt.length > 300) {
            setError('Mô tả ngắn không được vượt quá 300 ký tự')
            return false
        }
        return true
    }

    const handleSubmit = async (status: 'draft' | 'published'): Promise<void> => {
        if (!validateForm()) return

        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tạo bài viết')
            }

            const submitData = { ...formData, status }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            })

            const result: ApiResponse = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tạo bài viết')
            }

            setSuccess(
                status === 'draft'
                    ? 'Bài viết đã được lưu vào bản nháp!'
                    : 'Bài viết đã được đăng thành công!'
            )

            setTimeout(() => {
                if (status === 'published' && result.data?.slug) {
                    router.push(`/blog/${result.data.slug}`)
                } else {
                    router.push('/dashboard/posts')
                }
            }, 1500)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
        } finally {
            setIsLoading(false)
        }
    }

    const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <DocumentText size={28} className="text-white" variant="Outline" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Tạo bài viết mới
                                </h1>
                                <p className="text-blue-100 mt-1 text-sm">
                                    Chia sẻ kiến thức và trải nghiệm của bạn với cộng đồng
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                                <CloseCircle size={20} variant="Outline" />
                                <span className="flex-1">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-500 hover:text-red-700"
                                    type="button"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                                <TickCircle size={20} variant="Outline" />
                                <span className="flex-1">{success}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tiêu đề bài viết <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                                    placeholder="Nhập tiêu đề bài viết..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Danh mục <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {CATEGORIES.map((category) => (
                                            <option key={category.id} value={category.value}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        URL ảnh thumbnail
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            name="thumbnail"
                                            value={formData.thumbnail}
                                            onChange={handleInputChange}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            <ImageIcon size={20} variant="Outline" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả ngắn <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleInputChange}
                                    rows={3}
                                    maxLength={300}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tóm tắt nội dung bài viết (tối đa 300 ký tự)..."
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {formData.excerpt.length}/300
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                {tinymceApiKey ? (
                                    <Editor
                                        onInit={(_evt, editor) => {
                                            editorRef.current = editor
                                        }}
                                        value={formData.content}
                                        onEditorChange={handleEditorChange}
                                        apiKey={tinymceApiKey}
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
                                                { text: 'HTML/XML', value: 'markup' },
                                                { text: 'JavaScript', value: 'javascript' },
                                                { text: 'TypeScript', value: 'typescript' },
                                                { text: 'CSS', value: 'css' },
                                                { text: 'Python', value: 'python' },
                                                { text: 'Java', value: 'java' },
                                                { text: 'C++', value: 'cpp' },
                                                { text: 'C#', value: 'csharp' },
                                                { text: 'Go', value: 'go' },
                                                { text: 'Rust', value: 'rust' },
                                                { text: 'PHP', value: 'php' },
                                                { text: 'Ruby', value: 'ruby' },
                                                { text: 'SQL', value: 'sql' },
                                                { text: 'Bash', value: 'bash' },
                                                { text: 'JSON', value: 'json' }
                                            ],
                                            promotion: false
                                        }}
                                    />
                                ) : (
                                    <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-500 text-center">
                                        <p>⚠️ Vui lòng cấu hình TinyMCE API Key trong file .env</p>
                                        <p className="text-sm mt-2">Thêm dòng: NEXT_PUBLIC_TINYMCE_API_KEY=your_api_key</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Thẻ tags
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <div className="flex-1 relative">
                                        <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" variant="Outline" />
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={handleTagKeyPress}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập tag và nhấn Enter"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Thêm
                                    </button>
                                </div>

                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg text-sm flex items-center gap-2 border border-gray-200"
                                            >
                                                #{tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleSubmit('draft')}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    {isLoading ? 'Đang lưu...' : 'Lưu nháp'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSubmit('published')}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Eye size={20} />}
                                    {isLoading ? 'Đang đăng...' : 'Đăng bài'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}