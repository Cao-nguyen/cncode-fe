'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const Editor = dynamic(() => import('@tinymce/tinymce-react').then((mod) => mod.Editor), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full rounded-xl border bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
    ),
})

interface BlobInfo {
    blob: () => Blob
    filename: () => string
    base64: () => string
    blobUri: () => string
    uri: () => string | undefined
}

interface TinyMCEEditorProps {
    value: string
    onChange: (value: string) => void
    height?: number
    placeholder?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY

export default function TinyMCEEditor({ value, onChange, height = 400, placeholder }: TinyMCEEditorProps) {
    const { token } = useAuthStore()

    const uploadImageToCloudinary = async (file: File, folder: string): Promise<string> => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('folder', folder)

        const response = await fetch(`${API_URL}/api/upload/single`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })

        const result = await response.json()
        if (!result.success) {
            throw new Error(result.message || 'Upload failed')
        }
        return result.data.url
    }

    const handleEditorImageUpload = async (blobInfo: BlobInfo): Promise<string> => {
        const file = blobInfo.blob() as File
        const url = await uploadImageToCloudinary(file, 'editor-images')
        return url
    }

    return (
        <Editor
            apiKey={TINYMCE_API_KEY}
            value={value}
            onEditorChange={(val: string) => onChange(val)}
            init={{
                height,
                menubar: false,
                placeholder: placeholder || 'Nhập mô tả chi tiết...',
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen', 'media', 'table', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic underline | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | link image media | code fullscreen',
                toolbar_mode: 'sliding',
                images_upload_handler: handleEditorImageUpload,
                automatic_uploads: true,
                file_picker_types: 'image',
                branding: false,
                resize: false,
                content_style: `
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                        font-size: 14px; 
                        line-height: 1.6; 
                        padding: 12px; 
                    }
                    img { 
                        max-width: 100%; 
                        height: auto; 
                        border-radius: 8px; 
                    }
                    pre { 
                        background: #f4f4f4; 
                        padding: 12px; 
                        border-radius: 6px; 
                        overflow-x: auto; 
                    }
                    code {
                        background: #f4f4f4;
                        padding: 2px 4px;
                        border-radius: 4px;
                        font-size: 0.875em;
                    }
                    .dark pre {
                        background: #1e1e1e;
                        color: #d4d4d4;
                    }
                    .dark code {
                        background: #1e1e1e;
                        color: #d4d4d4;
                    }
                `,
                skin: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
                content_css: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'default',
            }}
        />
    )
}