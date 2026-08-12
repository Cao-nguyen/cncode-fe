'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, HelpCircle, EyeOff } from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomButton } from '@/components/custom/CustomButton';
import { toast } from 'sonner';

const GRADE_OPTIONS = [
    { value: 'grade10', label: 'Tin học 10' },
    { value: 'grade11', label: 'Tin học 11' },
    { value: 'grade12', label: 'Tin học 12' },
    { value: 'other', label: 'Khác' },
];

export default function AskQuestionPage() {
    const router = useRouter();
    const editorRef = useRef<CustomEditorRef>(null);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [grade, setGrade] = useState('other');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || title.trim().length < 5) {
            toast.error('Tiêu đề nên có ít nhất 5 ký tự');
            return;
        }
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung câu hỏi');
            return;
        }

        setLoading(true);
        try {
            const res = await faqApi.createQuestion({ title: title.trim(), content, grade, isAnonymous });
            if (res.success) {
                toast.success('Đăng câu hỏi thành công');
                router.push(`/faq/${res.data.slug}`);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-8 pt-16 md:pt-14 lg:pt-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-5xl px-4">
                <div className="mb-6 flex items-center gap-3">
                    <CustomButton variant="secondary" onClick={() => router.push('/faq')}>
                        <ArrowLeft className="h-4 w-4" />
                    </CustomButton>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Đặt câu hỏi mới</h1>
                        <p className="text-sm text-gray-500">Mô tả bài tập bạn đang gặp khó khăn</p>
                    </div>
                </div>

                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex gap-3">
                        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                        <ul className="space-y-1 text-sm text-blue-800">
                            <li>Mô tả chi tiết bài tập và vấn đề</li>
                            <li>Cho biết bạn đã thử những gì</li>
                            <li>Đính kèm đề bài nếu có</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
                    <CustomInput label="Tiêu đề" placeholder="Ví dụ: Làm sao để tạo website?" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Nội dung <span className="text-red-500">*</span></label>
                        <CustomEditor ref={editorRef} />
                    </div>
                    <CustomSelect label="Môn học / Lớp" options={GRADE_OPTIONS} value={grade} onChange={setGrade} />
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded" />
                        <span className="inline-flex items-center gap-2 text-sm text-gray-700"><EyeOff className="h-4 w-4" />Đặt câu hỏi ẩn danh</span>
                    </label>
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <CustomButton variant="secondary" onClick={() => router.push('/faq')}>Hủy</CustomButton>
                        <CustomButton onClick={handleSubmit} loading={loading}><Send className="h-4 w-4" />Đăng câu hỏi</CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
