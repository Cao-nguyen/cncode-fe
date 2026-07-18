
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, HelpCircle, EyeOff } from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomButton } from '@/components/custom/CustomButton';

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
    const [titleError, setTitleError] = useState('');
    const [contentError, setContentError] = useState('');

    const handleSubmit = async () => {
        let hasError = false;
        if (!title.trim()) { setTitleError('Vui lòng nhập tiêu đề'); hasError = true; }
        else if (title.length < 5) { setTitleError('Tiêu đề nên có ít nhất 5 ký tự'); hasError = true; }
        else { setTitleError(''); }

        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') { setContentError('Vui lòng nhập nội dung'); hasError = true; }
        else { setContentError(''); }

        if (hasError) return;

        setLoading(true);
        try {
            const res = await faqApi.createQuestion({ title: title.trim(), content, grade, isAnonymous });
            if (res.success) router.push(`/faq/${res.data.slug}`);
        } catch (error) { alert(getErrorMessage(error)); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[var(--cn-bg-main)] pt-14 pb-8 lg:pt-8 lg:py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/faq" className="p-2 rounded-xl hover:bg-[var(--cn-hover)]"><ArrowLeft className="w-5 h-5" /></Link>
                    <div><h1 className="text-2xl font-bold">Đặt câu hỏi mới</h1><p className="text-sm text-[var(--cn-text-muted)]">Mô tả bài tập bạn đang gặp khó khăn</p></div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <div className="flex items-start gap-3"><HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div><p className="text-sm font-medium text-blue-800">Mẹo để được trợ giúp nhanh hơn</p>
                            <ul className="text-xs text-blue-700 mt-1"><li>• Mô tả chi tiết bài tập và vấn đề</li><li>• Cung cấp đề bài cụ thể (nếu có)</li><li>• Cho biết bạn đã thử những gì</li></ul>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--cn-bg-card)] rounded-xl border border-[var(--cn-border)] p-6 space-y-6">
                    <CustomInput label="Tiêu đề câu hỏi" placeholder="Ví dụ: Bài tập về phương trình bậc 2" value={title} onChange={(e) => setTitle(e.target.value)} error={titleError} required />

                    <div><label className="text-sm font-medium mb-2 block">Nội dung câu hỏi <span className="text-red-500">*</span></label><CustomEditor ref={editorRef} />{contentError && <p className="mt-2 text-sm text-red-500">{contentError}</p>}</div>

                    <CustomSelect label="Môn học / Lớp" options={GRADE_OPTIONS} value={grade} onChange={setGrade} />

                    <div className="flex items-center gap-3 p-3 bg-[var(--cn-bg-section)] rounded-xl">
                        <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 rounded" />
                        <label htmlFor="anonymous" className="text-sm flex items-center gap-2 cursor-pointer"><EyeOff className="w-4 h-4" />Đặt câu hỏi ẩn danh</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href="/faq"><CustomButton variant="secondary">Hủy</CustomButton></Link>
                        <CustomButton onClick={handleSubmit} loading={loading}><Send className="w-4 h-4" />Đăng câu hỏi</CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
