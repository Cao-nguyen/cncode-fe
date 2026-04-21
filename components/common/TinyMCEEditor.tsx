// components/common/TinyMCEEditor.tsx
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

// Mở rộng interface EditorInstance với các method cần thiết
interface EditorInstance {
    on: (event: string, callback: () => void) => void
    getBody: () => HTMLElement
    insertContent: (content: string) => void
    ui: {
        registry: {
            addButton: (name: string, config: {
                icon: string
                tooltip: string
                onAction: () => void
            }) => void
        }
    }
}

interface CodeSampleLanguage {
    text: string
    value: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY

export default function TinyMCEEditor({ value, onChange, height = 400, placeholder }: TinyMCEEditorProps) {
    const { token } = useAuthStore()
    const editorRef = useRef<EditorInstance | null>(null)

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

    const codeSampleLanguages: CodeSampleLanguage[] = [
        { text: 'HTML/XML', value: 'markup' },
        { text: 'JavaScript', value: 'javascript' },
        { text: 'TypeScript', value: 'typescript' },
        { text: 'CSS', value: 'css' },
        { text: 'Python', value: 'python' },
        { text: 'Java', value: 'java' },
        { text: 'C++', value: 'cpp' },
        { text: 'C#', value: 'csharp' },
        { text: 'PHP', value: 'php' },
        { text: 'Ruby', value: 'ruby' },
        { text: 'Go', value: 'go' },
        { text: 'Rust', value: 'rust' },
        { text: 'SQL', value: 'sql' },
        { text: 'Bash', value: 'bash' },
        { text: 'JSON', value: 'json' },
    ]

    // Hàm chèn công thức toán học
    const insertMathFormula = (editor: EditorInstance) => {
        const mathFormula = prompt('Nhập công thức toán học (LaTeX):\n\nVí dụ:\n- E = mc^2\n- \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n- \\int_0^\\infty e^{-x^2} dx', 'E = mc^2')
        if (mathFormula && mathFormula.trim()) {
            editor.insertContent(`\\(${mathFormula}\\)`)
        }
    }

    // Hàm chèn công thức toán học dạng hiển thị lớn
    const insertDisplayMathFormula = (editor: EditorInstance) => {
        const mathFormula = prompt('Nhập công thức toán học dạng hiển thị (LaTeX):\n\nVí dụ:\n- \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n- \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}', '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')
        if (mathFormula && mathFormula.trim()) {
            editor.insertContent(`\\[${mathFormula}\\]`)
        }
    }

    return (
        <Editor
            apiKey={TINYMCE_API_KEY}
            value={value}
            onEditorChange={(val: string) => onChange(val)}
            onInit={(_evt: unknown, editor: EditorInstance) => {
                editorRef.current = editor

                // Thêm button công thức toán học inline
                editor.ui.registry.addButton('mathInline', {
                    icon: 'sigma',
                    tooltip: 'Chèn công thức toán học (inline) - $...$',
                    onAction: () => insertMathFormula(editor)
                })

                // Thêm button công thức toán học display
                editor.ui.registry.addButton('mathDisplay', {
                    icon: 'sigma',
                    tooltip: 'Chèn công thức toán học (display) - $$...$$',
                    onAction: () => insertDisplayMathFormula(editor)
                })
            }}
            init={{
                height,
                menubar: false,
                placeholder: placeholder || 'Nhập nội dung...',

                plugins: [
                    'advlist', 'autolink', 'link', 'image', 'charmap', 'preview',
                    'searchreplace', 'visualblocks', 'fullscreen', 'table',
                    'wordcount', 'codesample'
                ],

                // Toolbar - thêm 2 button toán học
                toolbar: [
                    'undo redo |',
                    'blocks |',
                    'bold italic underline strikethrough |',
                    'alignleft aligncenter alignright alignjustify |',
                    'forecolor backcolor |',
                    'codesample |',
                    'mathInline mathDisplay |',
                    'table |',
                    'link image |',
                    'removeformat'
                ].join(''),

                toolbar_mode: 'sliding',

                block_formats: 'Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4;',

                font_formats: '',
                fontsize_formats: '',

                codesample_languages: codeSampleLanguages,

                table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                table_default_attributes: {
                    border: '1',
                    cellspacing: '0',
                    cellpadding: '8',
                    style: 'border-collapse: collapse; width: 100%;'
                },
                table_default_styles: {
                    borderCollapse: 'collapse',
                    width: '100%'
                },

                images_upload_handler: handleEditorImageUpload,
                automatic_uploads: true,
                file_picker_types: 'image',

                branding: false,
                resize: false,

                // Cấu hình cho công thức toán học với MathJax
                math: {
                    engine: 'mathjax',
                    mathjax: {
                        src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js',
                        config: {
                            tex: {
                                inlineMath: [['$', '$'], ['\\(', '\\)']],
                                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                                processEscapes: true
                            },
                            options: {
                                enableMenu: false
                            }
                        }
                    }
                },

                content_style: `
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; 
                        font-size: 14px; 
                        line-height: 1.6; 
                        padding: 12px; 
                        margin: 0;
                    }
                    
                    /* Code sample styling */
                    pre {
                        background: #1e1e1e;
                        color: #d4d4d4;
                        padding: 16px;
                        border-radius: 8px;
                        overflow-x: auto;
                        font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
                        font-size: 13px;
                        line-height: 1.5;
                    }
                    
                    code {
                        background: #f4f4f4;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
                        font-size: 0.875em;
                        color: #d14;
                    }
                    
                    .dark pre {
                        background: #0d1117;
                        border: 1px solid #30363d;
                    }
                    
                    .dark code {
                        background: #1e1e1e;
                        color: #58a6ff;
                    }
                    
                    /* Math styling - Công thức toán học */
                    .MathJax {
                        font-size: 1.1em;
                        overflow-x: auto;
                        overflow-y: hidden;
                    }
                    
                    mjx-container {
                        overflow-x: auto;
                        overflow-y: hidden;
                        padding: 8px 0;
                    }
                    
                    /* Table styling */
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 16px 0;
                    }
                    
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px 12px;
                        text-align: left;
                    }
                    
                    th {
                        background-color: #f2f2f2;
                        font-weight: 600;
                    }
                    
                    .dark th {
                        background-color: #1e1e1e;
                        border-color: #30363d;
                    }
                    
                    .dark td {
                        border-color: #30363d;
                    }
                    
                    /* Image styling */
                    img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 16px 0;
                    }
                    
                    /* Heading styling */
                    h1 { font-size: 2em; margin: 0.67em 0; font-weight: 600; }
                    h2 { font-size: 1.5em; margin: 0.75em 0; font-weight: 600; }
                    h3 { font-size: 1.25em; margin: 0.83em 0; font-weight: 600; }
                    h4 { font-size: 1.1em; margin: 1em 0; font-weight: 600; }
                    
                    /* Text alignment */
                    .text-left { text-align: left; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .text-justify { text-align: justify; }
                    
                    /* Blockquote */
                    blockquote {
                        border-left: 4px solid #ddd;
                        margin: 16px 0;
                        padding-left: 16px;
                        color: #666;
                        font-style: italic;
                    }
                    
                    .dark blockquote {
                        border-left-color: #30363d;
                        color: #8b949e;
                    }
                    
                    /* Lists */
                    ul, ol {
                        margin: 8px 0;
                        padding-left: 24px;
                    }
                    
                    li {
                        margin: 4px 0;
                    }
                `,

                skin: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
                content_css: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'default',

                style_formats: [
                    { title: 'Code Inline', inline: 'code' },
                    { title: 'Code Block', block: 'pre' },
                    { title: 'Highlight', inline: 'mark' },
                ],

                setup: (editor: EditorInstance) => {
                    editor.on('init', () => {
                        const body = editor.getBody()
                        if (body) {
                            body.classList.add('tiny-editor-body')
                        }
                    })
                },
            }}
        />
    )
}