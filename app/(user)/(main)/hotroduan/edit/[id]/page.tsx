
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { helpProjectApi } from '@/lib/api/helpproject.api';
import { uploadApi } from '@/lib/upload';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';

export default function EditHelpProjectPage() {
    const router = useRouter();
    const params = useParams();
    const editorRef = useRef<CustomEditorRef>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [content, setContent] = useState('');
    const [titleError, setTitleError] = useState('');
    const [contentError, setContentError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const res = await helpProjectApi.getProjectById(params.id as string);
            if (res.success) {
                setTitle(res.data.title);
                setThumbnail(res.data.thumbnail || '');
                setContent(res.data.content);
                if (editorRef.current) {
                    editorRef.current.setContent(res.data.content);
                }
            } else {
                toast.error('Không thể tải dự án');
                router.push('/hotroduan');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
            router.push('/hotroduan');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }
        setUploading(true);
        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
            const result = await uploadApi.uploadImage(base64, 'help-projects');
            if (result.success && result.url) {
                setThumbnail(result.url);
                toast.success('Upload ảnh thành công');
            } else {
                toast.error(result.message || 'Upload thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        let hasError = false;
        if (!title.trim()) {
            setTitleError('Vui lòng nhập tiêu đề dự án');
            hasError = true;
        } else {
            setTitleError('');
        }

        const editorContent = editorRef.current?.getContent() || '';
        if (!editorContent.trim() || editorContent === '<p><br></p>') {
            setContentError('Vui lòng nhập nội dung dự án');
            hasError = true;
        } else {
            setContentError('');
        }

        if (hasError) return;

        setSubmitting(true);
        try {
            const res = await helpProjectApi.updateProject(params.id as string, {
                title: title.trim(),
                thumbnail,
                content: editorContent
            });
            if (res.success) {
                toast.success('Cập nhật dự án thành công');
                router.push(`/hotroduan/${params.id}`);
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href={`/hotroduan/${params.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">✏️ Chỉnh sửa dự án</h1>

                    <div className="space-y-5">
                        <CustomInput
                            label="Tiêu đề dự án"
                            placeholder="Nhập tiêu đề dự án..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={titleError}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh thumbnail</label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                                {uploading ? (
                                    <div className="py-4">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Đang upload...</p>
                                    </div>
                                ) : thumbnail ? (
                                    <div className="relative">
                                        <img src={thumbnail} alt="Thumbnail" className="max-h-40 mx-auto rounded" />
                                        <button onClick={(e) => { e.stopPropagation(); setThumbnail(''); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Click để chọn ảnh</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung dự án <span className="text-red-500">*</span></label>
                            <CustomEditor
                                key={params.id as string}
                                ref={editorRef}
                                initialValue={content}
                            />
                            {contentError && <p className="mt-2 text-sm text-red-500">{contentError}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Link href={`/hotroduan/${params.id}`}>
                                <CustomButton variant="secondary">Hủy</CustomButton>
                            </Link>
                            <CustomButton onClick={handleSubmit} loading={submitting}>Cập nhật</CustomButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
