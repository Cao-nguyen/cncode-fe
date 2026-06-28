'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import ExerciseEditor, { ExerciseEditorRef } from '@/components/custom/ExerciseEditor';
import CodeIDE from './CodeIDE';
import {
    PracticeSet,
    PracticeQuestion,
    PracticeQuestionType,
    QUESTION_TYPE_LABELS,
    CODE_LANGUAGES,
} from '@/types/luyentap.type';
import { toast } from 'sonner';

interface PracticeFormProps {
    initial?: PracticeSet;
    onSave: (data: Partial<PracticeSet>) => Promise<void>;
    onSubmitReview?: () => Promise<void>;
    mode: 'admin' | 'teacher';
}

function emptyQuestion(type: PracticeQuestionType = 'quiz'): PracticeQuestion {
    return {
        type,
        question: '',
        points: 1,
        options: type === 'quiz'
            ? Array.from({ length: 4 }, () => ({ text: '', isCorrect: false }))
            : undefined,
        trueFalseOptions: type === 'true-false'
            ? Array.from({ length: 4 }, () => ({ text: '', isCorrect: false }))
            : undefined,
        correctAnswer: type === 'short-answer' ? '' : undefined,
        maxLength: type === 'short-answer' ? 4 : undefined,
        language: type === 'code' ? 'javascript' : undefined,
        starterCode: type === 'code' ? '' : undefined,
        testCases: type === 'code' ? [{ input: '', expectedOutput: '' }] : undefined,
    };
}

export default function PracticeForm({ initial, onSave, onSubmitReview, mode }: PracticeFormProps) {
    const [title, setTitle] = useState(initial?.title || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [tier, setTier] = useState<'free' | 'pro'>(initial?.tier || 'free');
    const [passThreshold, setPassThreshold] = useState(initial?.passThreshold || 80);
    const [questions, setQuestions] = useState<PracticeQuestion[]>(
        initial?.questions?.length ? initial.questions : [emptyQuestion()]
    );
    const [activeQ, setActiveQ] = useState(0);
    const [saving, setSaving] = useState(false);
    const questionEditorRef = React.useRef<ExerciseEditorRef>(null);

    const current = questions[activeQ];

    const updateQuestion = (patch: Partial<PracticeQuestion>) => {
        setQuestions(qs => qs.map((q, i) => i === activeQ ? { ...q, ...patch } : q));
    };

    const handleSave = async () => {
        if (!title.trim()) { toast.error('Nhập tiêu đề'); return; }
        const qText = questionEditorRef.current?.getContent() || current.question;
        const finalQuestions = questions.map((q, i) =>
            i === activeQ ? { ...q, question: qText } : q
        );
        if (!finalQuestions.every(q => q.question.trim())) {
            toast.error('Mỗi câu hỏi cần có nội dung');
            return;
        }
        setSaving(true);
        try {
            await onSave({ title, description, tier, passThreshold, questions: finalQuestions });
            toast.success('Lưu thành công');
        } catch {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput label="Tiêu đề bài tập" value={title} onChange={e => setTitle(e.target.value)} required />
                <CustomSelect
                    label="Loại truy cập"
                    value={tier}
                    onChange={v => setTier(v as 'free' | 'pro')}
                    options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]}
                />
            </div>
            <CustomInput label="Mô tả" value={description} onChange={e => setDescription(e.target.value)} />
            <CustomInput label="Ngưỡng đạt (%)" type="number" value={String(passThreshold)} onChange={e => setPassThreshold(Number(e.target.value))} />

            <div className="flex flex-wrap gap-2 border-b pb-3">
                {questions.map((q, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActiveQ(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeQ === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Câu {i + 1}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => { setQuestions([...questions, emptyQuestion()]); setActiveQ(questions.length); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Thêm câu
                </button>
            </div>

            <CustomSelect
                label="Loại câu hỏi"
                value={current.type}
                onChange={v => updateQuestion(emptyQuestion(v as PracticeQuestionType))}
                options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            />

            <div>
                <label className="block text-sm font-medium mb-2">Nội dung câu hỏi</label>
                <ExerciseEditor ref={questionEditorRef} initialValue={current.question} height="120px" />
            </div>

            {current.type === 'quiz' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">4 phương án (chọn 1 đúng)</label>
                    {(current.options || []).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name={`correct-${activeQ}`}
                                checked={opt.isCorrect}
                                onChange={() => updateQuestion({
                                    options: (current.options || []).map((o, i) => ({ ...o, isCorrect: i === oi })),
                                })}
                            />
                            <input
                                className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600"
                                value={opt.text}
                                placeholder={`Phương án ${String.fromCharCode(65 + oi)}`}
                                onChange={e => {
                                    const opts = [...(current.options || [])];
                                    opts[oi] = { ...opts[oi], text: e.target.value };
                                    updateQuestion({ options: opts });
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {current.type === 'true-false' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">4 phương án (Đúng/Sai cho mỗi câu)</label>
                    {(current.trueFalseOptions || []).map((opt, oi) => (
                        <div key={oi} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <input
                                className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600"
                                value={opt.text}
                                placeholder={`Phát biểu ${oi + 1}`}
                                onChange={e => {
                                    const opts = [...(current.trueFalseOptions || [])];
                                    opts[oi] = { ...opts[oi], text: e.target.value };
                                    updateQuestion({ trueFalseOptions: opts });
                                }}
                            />
                            <div className="flex gap-2">
                                {[{ v: true, l: 'Đúng' }, { v: false, l: 'Sai' }].map(({ v, l }) => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => {
                                            const opts = [...(current.trueFalseOptions || [])];
                                            opts[oi] = { ...opts[oi], isCorrect: v };
                                            updateQuestion({ trueFalseOptions: opts });
                                        }}
                                        className={`px-3 py-1 rounded text-xs font-medium ${opt.isCorrect === v ? (v ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-gray-100'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {current.type === 'short-answer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomInput label="Đáp án đúng" value={current.correctAnswer || ''} onChange={e => updateQuestion({ correctAnswer: e.target.value })} />
                    <CustomInput label="Max ký tự" type="number" value={String(current.maxLength || 4)} onChange={e => updateQuestion({ maxLength: Number(e.target.value) })} />
                </div>
            )}

            {current.type === 'code' && (
                <div className="space-y-4">
                    <CustomSelect
                        label="Ngôn ngữ"
                        value={current.language || 'javascript'}
                        onChange={v => updateQuestion({ language: v as PracticeQuestion['language'] })}
                        options={CODE_LANGUAGES.map(l => ({ value: l.value, label: l.label }))}
                    />
                    <div>
                        <label className="text-sm font-medium mb-2 block">Code khởi tạo</label>
                        <CodeIDE
                            language={current.language || 'javascript'}
                            value={current.starterCode || ''}
                            onChange={code => updateQuestion({ starterCode: code })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Test cases</label>
                        {(current.testCases || []).map((tc, ti) => (
                            <div key={ti} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                <input className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800" placeholder="Input" value={tc.input || ''} onChange={e => {
                                    const tcs = [...(current.testCases || [])];
                                    tcs[ti] = { ...tcs[ti], input: e.target.value };
                                    updateQuestion({ testCases: tcs });
                                }} />
                                <input className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800" placeholder="Expected output" value={tc.expectedOutput || ''} onChange={e => {
                                    const tcs = [...(current.testCases || [])];
                                    tcs[ti] = { ...tcs[ti], expectedOutput: e.target.value };
                                    updateQuestion({ testCases: tcs });
                                }} />
                            </div>
                        ))}
                        <button type="button" onClick={() => updateQuestion({ testCases: [...(current.testCases || []), { input: '', expectedOutput: '' }] })} className="text-xs text-blue-600">+ Test case</button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t">
                <CustomButton onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Lưu</CustomButton>
                {questions.length > 1 && (
                    <CustomButton variant="secondary" onClick={() => {
                        setQuestions(questions.filter((_, i) => i !== activeQ));
                        setActiveQ(Math.max(0, activeQ - 1));
                    }}>
                        <Trash2 className="w-4 h-4" /> Xóa câu {activeQ + 1}
                    </CustomButton>
                )}
                {mode === 'teacher' && onSubmitReview && initial?.status !== 'pending' && (
                    <CustomButton variant="secondary" onClick={onSubmitReview}><Send className="w-4 h-4" /> Gửi duyệt</CustomButton>
                )}
            </div>
        </div>
    );
}
