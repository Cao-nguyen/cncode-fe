'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Send, Loader2, X } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { toast } from 'sonner';
import { uploadApi } from '@/lib/upload';
import { getImageUrl, getVideoUrl } from '@/lib/utils/imageUrl';
import { isCommentContentEmpty } from '@/lib/comment-content';
import {
    CommentTableBar,
    CommentTableInsertPicker,
    insertCommentTable,
} from '@/components/custom/CommentTableTools';

interface CommentMediaItem {
    id: string;
    previewSrc: string;
    remoteUrl?: string;
    mediaType: 'image' | 'video' | 'gif';
    status: 'uploading' | 'done' | 'error';
    fileName?: string;
}

interface CustomTextareaProps {
    value?: string;
    onChange?: (value: string) => void;
    attachments?: string[];
    onAttachmentsChange?: (attachments: string[]) => void;
    placeholder?: string;
    onSubmit?: () => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    autoFocus?: boolean;
    onCancel?: () => void;
    cancelLabel?: string;
    showActions?: boolean;
    label?: string;
    error?: string;
    rows?: number;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

const FORMAT_BUTTONS = [
    { icon: '/editor/bold-text.png', label: 'In đậm', action: 'bold', group: 0 },
    { icon: '/editor/italic-font.png', label: 'In nghiêng', action: 'italic', group: 0 },
    { icon: '/editor/underline.png', label: 'Gạch chân', action: 'underline', group: 0 },
    { icon: '/editor/strikethrough.png', label: 'Gạch ngang', action: 'strikethrough', group: 0 },
    { icon: '/editor/text.png', label: 'Chỉ số trên', action: 'superscript', group: 1 },
    { icon: '/editor/link.png', label: 'Liên kết', action: 'link', group: 1 },
    { icon: '/editor/quote.png', label: 'Trích dẫn', action: 'quote', group: 1 },
    { icon: '/editor/code.png', label: 'Code', action: 'code', group: 2 },
    { icon: '/editor/code (1).png', label: 'Khối code', action: 'codeblock', group: 2 },
    { icon: '/editor/table.png', label: 'Bảng', action: 'table', group: 2 },
] as const;

const VIDEO_ATTACHMENT_PREFIX = 'video::';

function isVideoUrl(url: string) {
    return url.startsWith(VIDEO_ATTACHMENT_PREFIX)
        || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
        || url.includes('/video/');
}

function isGifUrl(url: string) {
    return /\.gif(\?|$)/i.test(url);
}

function stripMediaPrefix(url: string) {
    if (url.startsWith(VIDEO_ATTACHMENT_PREFIX)) return url.slice(VIDEO_ATTACHMENT_PREFIX.length);
    return url;
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function resolveMediaSrc(url: string, mediaType?: 'image' | 'video' | 'gif') {
    const normalized = stripMediaPrefix(url);
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (mediaType === 'video' || isVideoUrl(url)) {
        if (normalized.includes('/proxy/video/') || normalized.startsWith('http')) return getImageUrl(normalized);
        return getVideoUrl(normalized);
    }
    return getImageUrl(normalized);
}

export const CustomTextCmt: React.FC<CustomTextareaProps> = ({
    value = '',
    onChange,
    attachments = [],
    onAttachmentsChange,
    placeholder = 'Tham gia cuộc trò chuyện',
    onSubmit,
    isSubmitting = false,
    autoFocus = false,
    onCancel,
    cancelLabel = 'Hủy',
    showActions = true,
    label,
    error,
    maxLength,
    required = false,
    disabled = false,
    className = '',
}) => {
    const [isExpanded, setIsExpanded] = useState(autoFocus);
    const [showToolbar, setShowToolbar] = useState(false);
    const [showGifInput, setShowGifInput] = useState(false);
    const [gifUrl, setGifUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [, setToolbarTick] = useState(0);
    const [mediaItems, setMediaItems] = useState<CommentMediaItem[]>([]);
    const [previewMedia, setPreviewMedia] = useState<CommentMediaItem | null>(null);
    const [showTablePicker, setShowTablePicker] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const tableButtonRef = useRef<HTMLButtonElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const gifFileInputRef = useRef<HTMLInputElement>(null);
    const skipExternalSync = useRef(false);
    const blobUrlsRef = useRef<Set<string>>(new Set());
    const lastSyncedAttachmentsRef = useRef('');

    const uploadedUrls = mediaItems
        .filter((item) => item.status === 'done' && item.remoteUrl)
        .map((item) => item.remoteUrl!);
    const uploadedUrlsKey = uploadedUrls.join('\0');
    const hasUploadingMedia = mediaItems.some((item) => item.status === 'uploading');
    const canSubmit = (!isCommentContentEmpty(value) || uploadedUrls.length > 0) && !hasUploadingMedia;

    useEffect(() => {
        if (uploadedUrlsKey === lastSyncedAttachmentsRef.current) return;
        lastSyncedAttachmentsRef.current = uploadedUrlsKey;
        onAttachmentsChange?.(uploadedUrlsKey ? uploadedUrlsKey.split('\0') : []);
    }, [uploadedUrlsKey, onAttachmentsChange]);

    useEffect(() => {
        if (attachments.length > 0) return;
        setMediaItems((prev) => {
            if (prev.length === 0) return prev;
            prev.forEach((item) => {
                if (item.previewSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(item.previewSrc);
                    blobUrlsRef.current.delete(item.previewSrc);
                }
            });
            return [];
        });
        setPreviewMedia(null);
        lastSyncedAttachmentsRef.current = '';
    }, [attachments.length]);

    useEffect(() => {
        return () => {
            blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            blobUrlsRef.current.clear();
        };
    }, []);

    const submitRef = useRef({ onSubmit, canSubmit, isSubmitting, uploading: uploading || hasUploadingMedia });

    useEffect(() => {
        submitRef.current = { onSubmit, canSubmit, isSubmitting, uploading: uploading || hasUploadingMedia };
    }, [onSubmit, canSubmit, isSubmitting, uploading, hasUploadingMedia]);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                horizontalRule: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-600 underline' },
            }),
            Placeholder.configure({ placeholder }),
            Table.configure({
                resizable: false,
                HTMLAttributes: {
                    style: 'border-collapse:collapse;width:100%;border:1px solid #94a3b8;',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    style: 'border:1px solid #94a3b8;padding:8px;background:#f1f5f9;font-weight:600;',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    style: 'border:1px solid #94a3b8;padding:8px;min-width:72px;',
                },
            }),
        ],
        content: value || '',
        editable: !disabled && !uploading,
        onUpdate: ({ editor: ed }) => {
            skipExternalSync.current = true;
            const html = ed.getHTML();
            onChange?.(html);
            setCharCount(ed.getText().length);
            setToolbarTick((n) => n + 1);
        },
        onSelectionUpdate: () => setToolbarTick((n) => n + 1),
        onFocus: () => setIsExpanded(true),
        editorProps: {
            attributes: {
                class: 'comment-wysiwyg outline-none text-sm text-gray-800 min-h-[36px]',
            },
            handleKeyDown: (_view, event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    const s = submitRef.current;
                    if (s.onSubmit && s.canSubmit && !s.isSubmitting && !s.uploading) {
                        s.onSubmit();
                    }
                    return true;
                }
                return false;
            },
        },
    }, [disabled, uploading, placeholder]);

    useEffect(() => {
        if (autoFocus && editor) {
            editor.commands.focus('end');
            setIsExpanded(true);
        }
    }, [autoFocus, editor]);

    useEffect(() => {
        if (!editor || skipExternalSync.current) {
            skipExternalSync.current = false;
            return;
        }
        const current = editor.getHTML();
        if (value !== current) {
            editor.commands.setContent(value || '', { emitUpdate: false });
            setCharCount(editor.getText().length);
        }
    }, [value, editor]);

    useEffect(() => {
        editor?.setEditable(!disabled && !uploading);
    }, [editor, disabled, uploading]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isCommentContentEmpty(value) && mediaItems.length === 0) {
                    setIsExpanded(false);
                    setShowToolbar(false);
                    setShowGifInput(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, mediaItems.length]);

    const runFormat = useCallback((action: string) => {
        if (!editor) return;
        editor.chain().focus();

        switch (action) {
            case 'bold':
                editor.chain().focus().toggleBold().run();
                break;
            case 'italic':
                editor.chain().focus().toggleItalic().run();
                break;
            case 'underline':
                editor.chain().focus().toggleUnderline().run();
                break;
            case 'strikethrough':
                editor.chain().focus().toggleStrike().run();
                break;
            case 'superscript': {
                const { from, to } = editor.state.selection;
                const selected = editor.state.doc.textBetween(from, to, ' ');
                editor.chain().focus().insertContent(`<sup>${selected || 'x²'}</sup>`).run();
                break;
            }
            case 'link': {
                const prev = editor.getAttributes('link').href as string | undefined;
                const url = window.prompt('Nhập liên kết:', prev || 'https://');
                if (url === null) break;
                if (url === '') {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                } else {
                    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }
                break;
            }
            case 'quote':
                editor.chain().focus().toggleBlockquote().run();
                break;
            case 'code':
                editor.chain().focus().toggleCode().run();
                break;
            case 'codeblock':
                editor.chain().focus().toggleCodeBlock().run();
                break;
            default:
                break;
        }
        setToolbarTick((n) => n + 1);
    }, [editor]);

    const isActive = (action: string): boolean => {
        if (!editor) return false;
        switch (action) {
            case 'bold': return editor.isActive('bold');
            case 'italic': return editor.isActive('italic');
            case 'underline': return editor.isActive('underline');
            case 'strikethrough': return editor.isActive('strike');
            case 'quote': return editor.isActive('blockquote');
            case 'code': return editor.isActive('code');
            case 'codeblock': return editor.isActive('codeBlock');
            case 'link': return editor.isActive('link');
            case 'table': return editor.isActive('table');
            default: return false;
        }
    };

    const createPendingMedia = (file: File, mediaType: CommentMediaItem['mediaType']) => {
        const previewSrc = URL.createObjectURL(file);
        blobUrlsRef.current.add(previewSrc);
        const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const item: CommentMediaItem = {
            id,
            previewSrc,
            mediaType,
            status: 'uploading',
            fileName: file.name,
        };
        setMediaItems((prev) => [...prev, item]);
        setIsExpanded(true);
        return id;
    };

    const markMediaDone = (id: string, remoteUrl: string) => {
        setMediaItems((prev) => prev.map((item) => (
            item.id === id
                ? { ...item, remoteUrl, status: 'done' as const }
                : item
        )));
    };

    const markMediaError = (id: string) => {
        setMediaItems((prev) => prev.map((item) => (
            item.id === id ? { ...item, status: 'error' as const } : item
        )));
    };

    const removeMediaItem = (id: string) => {
        setMediaItems((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target?.previewSrc.startsWith('blob:')) {
                URL.revokeObjectURL(target.previewSrc);
                blobUrlsRef.current.delete(target.previewSrc);
            }
            return prev.filter((item) => item.id !== id);
        });
    };

    const clearMediaItems = () => {
        mediaItems.forEach((item) => {
            if (item.previewSrc.startsWith('blob:')) {
                URL.revokeObjectURL(item.previewSrc);
                blobUrlsRef.current.delete(item.previewSrc);
            }
        });
        setMediaItems([]);
        setPreviewMedia(null);
        lastSyncedAttachmentsRef.current = '';
        onAttachmentsChange?.([]);
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/') || file.type.includes('gif')) {
            if (file.type.includes('gif') || file.name.toLowerCase().endsWith('.gif')) {
                void handleGifFile(file);
                return;
            }
            toast.error('Chỉ chấp nhận file ảnh');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Ảnh tối đa 10MB');
            return;
        }

        const mediaId = createPendingMedia(file, 'image');
        setUploading(true);
        try {
            const base64 = await readFileAsDataUrl(file);
            const result = await uploadApi.uploadImage(base64, 'comments');
            if (result.success && result.url) {
                markMediaDone(mediaId, result.url);
                toast.success('Đã thêm ảnh');
            } else {
                markMediaError(mediaId);
                toast.error(result.message || 'Upload ảnh thất bại');
            }
        } catch {
            markMediaError(mediaId);
            toast.error('Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUpload = async (file: File) => {
        if (!file.type.startsWith('video/')) {
            toast.error('Chỉ chấp nhận file video');
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            toast.error('Video tối đa 100MB');
            return;
        }

        const mediaId = createPendingMedia(file, 'video');
        setUploading(true);
        try {
            const result = await uploadApi.uploadVideoWithProgress(file);
            if (result.success && result.url) {
                markMediaDone(mediaId, `${VIDEO_ATTACHMENT_PREFIX}${result.url}`);
                toast.success('Đã thêm video');
            } else {
                markMediaError(mediaId);
                toast.error(result.message || 'Upload video thất bại');
            }
        } catch {
            markMediaError(mediaId);
            toast.error('Upload video thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleGifFile = async (file: File) => {
        if (!file.type.includes('gif') && !file.name.toLowerCase().endsWith('.gif')) {
            toast.error('Chọn file GIF');
            return;
        }

        const mediaId = createPendingMedia(file, 'gif');
        setUploading(true);
        try {
            const base64 = await readFileAsDataUrl(file);
            const result = await uploadApi.uploadImage(base64, 'comments');
            if (result.success && result.url) {
                markMediaDone(mediaId, result.url);
                setShowGifInput(false);
                toast.success('Đã thêm GIF');
            } else {
                markMediaError(mediaId);
                toast.error(result.message || 'Upload GIF thất bại');
            }
        } catch {
            markMediaError(mediaId);
            toast.error('Upload GIF thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleGifFromUrl = async () => {
        const url = gifUrl.trim();
        if (!url) {
            toast.warning('Nhập URL GIF');
            return;
        }

        const id = `media-url-${Date.now()}`;
        setMediaItems((prev) => [...prev, {
            id,
            previewSrc: url,
            mediaType: 'gif',
            status: 'uploading',
        }]);
        setUploading(true);
        try {
            const result = await uploadApi.uploadFromUrl(url, 'comments');
            if (result.success && result.url) {
                markMediaDone(id, result.url);
                setGifUrl('');
                setShowGifInput(false);
                toast.success('Đã thêm GIF');
            } else {
                markMediaError(id);
                toast.error(result.message || 'Không thể tải GIF từ URL');
            }
        } catch {
            markMediaError(id);
            toast.error('Không thể tải GIF từ URL');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        editor?.commands.clearContent(true);
        setIsExpanded(false);
        setShowToolbar(false);
        setShowGifInput(false);
        clearMediaItems();
        onAttachmentsChange?.([]);
        onChange?.('');
        onCancel?.();
    };

    const handleSubmit = () => {
        if (onSubmit && canSubmit && !isSubmitting && !uploading && !hasUploadingMedia) {
            onSubmit();
        }
    };

    return (
        <div ref={containerRef} className={`w-full min-w-0 ${className}`}>
            <style jsx global>{`
                .comment-wysiwyg p { margin: 0 0 0.35em; }
                .comment-wysiwyg p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .comment-wysiwyg blockquote {
                    border-left: 3px solid #d1d5db;
                    margin: 0.25em 0;
                    padding-left: 0.75em;
                    color: #4b5563;
                }
                .comment-wysiwyg code {
                    background: #f3f4f6;
                    border-radius: 4px;
                    padding: 0.1em 0.35em;
                    font-size: 0.9em;
                }
                .comment-wysiwyg pre {
                    background: #f3f4f6;
                    border-radius: 8px;
                    padding: 0.5em 0.75em;
                    overflow-x: auto;
                }
                .comment-wysiwyg pre code { background: none; padding: 0; }
                .comment-wysiwyg sup { font-size: 0.75em; vertical-align: super; }
            `}</style>

            {label && (
                <label className="block font-medium text-gray-700 mb-1.5 text-sm">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageUpload(file);
                e.target.value = '';
            }} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleVideoUpload(file);
                e.target.value = '';
            }} />
            <input ref={gifFileInputRef} type="file" accept="image/gif,.gif" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleGifFile(file);
                e.target.value = '';
            }} />

            <div className="border border-gray-200 rounded-xl bg-white">
                {showToolbar && editor && (
                    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100">
                        {FORMAT_BUTTONS.map((btn) => (
                            <button
                                key={btn.action}
                                ref={btn.action === 'table' ? tableButtonRef : undefined}
                                type="button"
                                onClick={() => {
                                    if (btn.action === 'table') {
                                        if (editor.isActive('table')) {
                                            setShowTablePicker((open) => !open);
                                        } else {
                                            insertCommentTable(editor, 3, 3);
                                            setShowTablePicker(false);
                                        }
                                        setShowToolbar(true);
                                        setIsExpanded(true);
                                        return;
                                    }
                                    runFormat(btn.action);
                                }}
                                disabled={disabled || uploading}
                                className={`p-1.5 rounded-full transition-colors disabled:opacity-40 shrink-0 ${
                                    (btn.action === 'table' ? (showTablePicker || isActive(btn.action)) : isActive(btn.action))
                                        ? 'bg-blue-100'
                                        : 'hover:bg-gray-100'
                                }`}
                                title={btn.action === 'table' ? 'Chèn bảng (bấm lại để chọn kích thước)' : btn.label}
                            >
                                <img src={btn.icon} alt={btn.label} className="w-3.5 h-3.5" />
                            </button>
                        ))}
                    </div>
                )}

                <CommentTableInsertPicker
                    open={showTablePicker}
                    inline
                    onClose={() => setShowTablePicker(false)}
                    onInsert={(rows, cols) => {
                        if (editor) insertCommentTable(editor, rows, cols);
                        setShowToolbar(true);
                        setIsExpanded(true);
                    }}
                />

                {mediaItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-3 pt-3">
                        {mediaItems.map((item) => {
                            const displaySrc = item.status === 'done' && item.remoteUrl
                                ? resolveMediaSrc(item.remoteUrl, item.mediaType)
                                : resolveMediaSrc(item.previewSrc, item.mediaType);

                            return (
                                <div key={item.id} className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMedia(item)}
                                        className="block rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                                        title="Xem trước"
                                    >
                                        {item.mediaType === 'video' ? (
                                            <video
                                                src={displaySrc}
                                                className="h-20 w-28 sm:h-24 sm:w-32 object-cover bg-black pointer-events-none"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={displaySrc}
                                                alt={item.fileName || ''}
                                                className="h-16 w-16 sm:h-20 sm:w-20 object-cover"
                                            />
                                        )}
                                    </button>
                                    {item.mediaType === 'gif' && (
                                        <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1 rounded pointer-events-none">GIF</span>
                                    )}
                                    {item.status === 'uploading' && (
                                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                        </div>
                                    )}
                                    {item.status === 'error' && (
                                        <div className="absolute inset-0 bg-red-500/70 rounded-lg flex items-center justify-center px-1">
                                            <span className="text-[10px] text-white text-center">Lỗi</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeMediaItem(item.id)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div
                    className={`relative px-3 sm:px-4 py-2 ${isExpanded ? 'min-h-[120px]' : ''} ${editor?.isActive('table') ? 'min-h-[180px]' : ''}`}
                    onClick={() => { setIsExpanded(true); editor?.commands.focus(); }}
                >
                    <EditorContent editor={editor} />
                    {!isExpanded && isCommentContentEmpty(value) && mediaItems.length === 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <ChevronDown size={18} />
                        </div>
                    )}
                </div>

                {editor && <CommentTableBar editor={editor} />}

                {showGifInput && (
                    <div className="px-3 pb-2 flex flex-wrap items-center gap-2">
                        <input
                            type="url"
                            value={gifUrl}
                            onChange={(e) => setGifUrl(e.target.value)}
                            placeholder="Dán link GIF (Giphy, Tenor...)"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => gifFileInputRef.current?.click()} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Chọn file</button>
                            <button type="button" onClick={() => void handleGifFromUrl()} disabled={uploading || !gifUrl.trim()} className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">Thêm</button>
                        </div>
                    </div>
                )}

                {isExpanded && (
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 px-3 py-2 border-t border-gray-100">
                        <button type="button" onClick={() => imageInputRef.current?.click()} disabled={disabled || uploading} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40 shrink-0" title="Thêm ảnh">
                            <img src="/editor/gallery.png" alt="Ảnh" className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => videoInputRef.current?.click()} disabled={disabled || uploading} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40 shrink-0" title="Thêm video">
                            <img src="/editor/play-button.png" alt="Video" className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => { setShowGifInput(!showGifInput); setIsExpanded(true); }} disabled={disabled || uploading} className={`p-1.5 rounded-full transition-colors disabled:opacity-40 shrink-0 ${showGifInput ? 'bg-blue-100' : 'hover:bg-gray-100'}`} title="Thêm GIF">
                            <img src="/editor/gif.png" alt="GIF" className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => { setShowToolbar(!showToolbar); setIsExpanded(true); editor?.commands.focus(); }} disabled={disabled || uploading} className={`p-1.5 rounded-full transition-colors disabled:opacity-40 shrink-0 ${showToolbar ? 'bg-blue-100' : 'hover:bg-gray-100'}`} title="Định dạng văn bản">
                            <img src="/editor/text-size.png" alt="Format" className="w-4 h-4" />
                        </button>
                        {uploading && (
                            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                                <Loader2 className="w-3 h-3 animate-spin" /> Đang tải lên...
                            </span>
                        )}

                        {showActions && (
                            <div className="flex items-center gap-2 ms-auto shrink-0">
                                {onCancel && (
                                    <button type="button" onClick={handleCancel} disabled={isSubmitting || uploading || hasUploadingMedia} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                        {cancelLabel}
                                    </button>
                                )}
                                {onSubmit && (
                                    <button type="button" onClick={handleSubmit} disabled={!canSubmit || isSubmitting || uploading || hasUploadingMedia} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" title="Gửi bình luận">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {maxLength && (
                <div className="text-right text-xs text-gray-400 mt-1">{charCount}/{maxLength}</div>
            )}

            {previewMedia && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setPreviewMedia(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewMedia(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                        <X size={20} />
                    </button>
                    <div className="max-w-[min(960px,95vw)] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        {previewMedia.mediaType === 'video' ? (
                            <video
                                src={resolveMediaSrc(
                                    previewMedia.status === 'done' && previewMedia.remoteUrl
                                        ? previewMedia.remoteUrl
                                        : previewMedia.previewSrc,
                                    'video'
                                )}
                                controls
                                autoPlay
                                className="max-h-[90vh] max-w-full rounded-lg bg-black"
                            />
                        ) : (
                            <img
                                src={resolveMediaSrc(
                                    previewMedia.status === 'done' && previewMedia.remoteUrl
                                        ? previewMedia.remoteUrl
                                        : previewMedia.previewSrc,
                                    previewMedia.mediaType
                                )}
                                alt={previewMedia.fileName || 'Preview'}
                                className="max-h-[90vh] max-w-full rounded-lg object-contain"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
