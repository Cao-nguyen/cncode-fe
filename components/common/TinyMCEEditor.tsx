// components/common/TinyMCEEditor.tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, X, Sigma } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { MathfieldElement } from 'mathlive'

// Đăng ký custom element cho mathlive
if (typeof window !== 'undefined') {
    if (!customElements.get('math-field')) {
        customElements.define('math-field', MathfieldElement)
    }
}

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

interface MathFieldElement extends HTMLElement {
    value: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY

const quickSymbols: Array<{ symbol: string; latex: string; label: string }> = [
    { symbol: '+', latex: '+', label: 'Cộng' },
    { symbol: '-', latex: '-', label: 'Trừ' },
    { symbol: '×', latex: '\\times', label: 'Nhân' },
    { symbol: '÷', latex: '\\div', label: 'Chia' },
    { symbol: '=', latex: '=', label: 'Bằng' },
    { symbol: '≠', latex: '\\neq', label: 'Khác' },
    { symbol: '<', latex: '<', label: 'Nhỏ hơn' },
    { symbol: '>', latex: '>', label: 'Lớn hơn' },
    { symbol: '≤', latex: '\\leq', label: '≤' },
    { symbol: '≥', latex: '\\geq', label: '≥' },
    { symbol: '±', latex: '\\pm', label: '±' },
    { symbol: '∞', latex: '\\infty', label: '∞' },
    { symbol: '∑', latex: '\\sum', label: '∑' },
    { symbol: '∫', latex: '\\int', label: '∫' },
    { symbol: '√', latex: '\\sqrt', label: '√' },
    { symbol: 'π', latex: '\\pi', label: 'π' },
    { symbol: 'θ', latex: '\\theta', label: 'θ' },
    { symbol: 'α', latex: '\\alpha', label: 'α' },
    { symbol: 'β', latex: '\\beta', label: 'β' },
    { symbol: 'γ', latex: '\\gamma', label: 'γ' },
]

interface MathModalProps {
    isOpen: boolean
    onClose: () => void
    onInsert: (formula: string) => void
    isMobile: boolean
    isDark: boolean
    initialValue?: string
}

const MathModal = ({ isOpen, onClose, onInsert, isMobile, isDark, initialValue = '' }: MathModalProps) => {
    const [mathValue, setMathValue] = useState<string>(initialValue)
    const mathFieldRef = useRef<MathFieldElement | null>(null)

    useEffect(() => {
        if (isOpen) {
            setMathValue(initialValue)
        }
    }, [isOpen, initialValue])

    const handleInsert = (): void => {
        if (mathValue.trim()) {
            onInsert(mathValue)
            onClose()
            setMathValue('')
        }
    }

    const insertSymbol = (latex: string): void => {
        setMathValue(prev => prev + latex)
        setTimeout(() => {
            mathFieldRef.current?.focus()
        }, 0)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className={`bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${isMobile ? 'mx-2' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sigma size={20} className="text-blue-500" />
                        <h2 className="text-lg font-semibold">Chèn công thức toán học</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Nhập công thức</label>
                        <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                            {/* @ts-expect-error - math-field is a custom element from mathlive */}
                            <math-field
                                ref={mathFieldRef}
                                value={mathValue}
                                onInput={(e: Event) => {
                                    const target = e.target as MathFieldElement
                                    setMathValue(target.value)
                                }}
                                style={{
                                    width: '100%',
                                    minHeight: '60px',
                                    padding: '12px',
                                    fontSize: '16px',
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    color: isDark ? '#f3f4f6' : '#111827',
                                }}
                                virtualKeyboardMode="manual"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Nhập trực tiếp hoặc chọn ký hiệu bên dưới</p>
                    </div>

                    {mathValue && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm font-medium mb-2">Công thức LaTeX:</p>
                            <code className="text-xs break-all">{mathValue}</code>
                        </div>
                    )}

                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={handleInsert}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            disabled={!mathValue.trim()}
                        >
                            Chèn công thức
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-3">Ký hiệu nhanh</h3>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                            {quickSymbols.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => insertSymbol(item.latex)}
                                    className="p-2 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    title={item.label}
                                >
                                    <span className="text-lg font-mono">{item.symbol}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-3">Mẫu công thức</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                { label: 'Phân số', latex: '\\frac{a}{b}' },
                                { label: 'Căn bậc hai', latex: '\\sqrt{x}' },
                                { label: 'Lũy thừa', latex: 'x^{n}' },
                                { label: 'Chỉ số dưới', latex: 'x_{n}' },
                                { label: 'Tích phân', latex: '\\int_{a}^{b} f(x) dx' },
                                { label: 'Tổng', latex: '\\sum_{i=1}^{n} i' },
                                { label: 'Giới hạn', latex: '\\lim_{x \\to 0} f(x)' },
                                { label: 'Ma trận 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
                            ].map((template, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => insertSymbol(template.latex)}
                                    className="p-2 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                                >
                                    <span className="font-medium">{template.label}</span>
                                    <code className="text-xs text-gray-500 block mt-1">{template.latex}</code>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TinyMCEEditor({ value, onChange, height = 400, placeholder }: TinyMCEEditorProps) {
    const { token } = useAuthStore()
    const editorRef = useRef<EditorInstance | null>(null)
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [isDark, setIsDark] = useState<boolean>(false)
    const [showMathModal, setShowMathModal] = useState<boolean>(false)

    useEffect(() => {
        const checkMobile = (): void => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)

        const checkDark = (): void => {
            setIsDark(document.documentElement.classList.contains('dark'))
        }
        checkDark()
        const observer = new MutationObserver(checkDark)
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

        return () => {
            window.removeEventListener('resize', checkMobile)
            observer.disconnect()
        }
    }, [])

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

    const handleInsertMathFormula = (formula: string): void => {
        if (editorRef.current && formula.trim()) {
            // Dùng $$ cho display math
            editorRef.current.insertContent(`$$${formula}$$`)
        }
    }

    return (
        <>
            <Editor
                apiKey={TINYMCE_API_KEY}
                value={value}
                onEditorChange={(val: string) => onChange(val)}
                onInit={(_evt: unknown, editor: EditorInstance) => {
                    editorRef.current = editor

                    editor.ui.registry.addButton('mathFormula', {
                        icon: 'sigma',
                        tooltip: 'Chèn công thức toán học',
                        onAction: () => setShowMathModal(true)
                    })
                }}
                init={{
                    height: isMobile ? height - 100 : height,
                    menubar: false,
                    placeholder: placeholder || 'Nhập nội dung...',
                    mobile: {
                        menubar: false,
                        toolbar_mode: 'scrolling',
                    },

                    plugins: [
                        'advlist', 'autolink', 'link', 'image', 'charmap', 'preview',
                        'searchreplace', 'visualblocks', 'fullscreen', 'table',
                        'wordcount', 'codesample'
                    ],

                    toolbar: isMobile ? [
                        'undo redo | bold italic underline | alignleft aligncenter alignright | mathFormula | link image'
                    ].join('') : [
                        'undo redo |',
                        'blocks |',
                        'bold italic underline strikethrough |',
                        'alignleft aligncenter alignright alignjustify |',
                        'forecolor backcolor |',
                        'codesample |',
                        'mathFormula |',
                        'table |',
                        'link image |',
                        'removeformat'
                    ].join(''),

                    toolbar_mode: isMobile ? 'sliding' : 'sliding',
                    toolbar_sticky: true,

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
                    statusbar: !isMobile,

                    // Thêm style cho công thức toán
                    content_style: `
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            font-size: ${isMobile ? '13px' : '14px'}; 
                            line-height: 1.6; 
                            padding: ${isMobile ? '8px' : '12px'}; 
                            margin: 0;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        pre {
                            background: ${isDark ? '#0d1117' : '#f6f8fa'};
                            padding: 12px;
                            border-radius: 8px;
                            overflow-x: auto;
                        }
                        code {
                            background: ${isDark ? '#1e1e1e' : '#f4f4f4'};
                            padding: 2px 5px;
                            border-radius: 4px;
                            font-size: 0.875em;
                        }
                    `,

                    skin: isDark ? 'oxide-dark' : 'oxide',
                    content_css: isDark ? 'dark' : 'default',
                }}
            />

            <MathModal
                isOpen={showMathModal}
                onClose={() => setShowMathModal(false)}
                onInsert={handleInsertMathFormula}
                isMobile={isMobile}
                isDark={isDark}
            />
        </>
    )
}