'use client';

import React from 'react';
import { X } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomButton } from '@/components/custom/CustomButton';
import { GRADE_OPTIONS, EXAM_PURPOSE_OPTIONS } from '@/lib/luyentap/exercise-config.constants';

export interface ExerciseConfigForm {
    title: string;
    grade: string;
    examPurpose: string;
    description: string;
}

interface LuyentapExerciseConfigOverlayProps {
    form: ExerciseConfigForm;
    saving?: boolean;
    onChange: (patch: Partial<ExerciseConfigForm>) => void;
    onBack: () => void;
    onSubmit: () => void;
}

export default function LuyentapExerciseConfigOverlay({
    form,
    saving = false,
    onChange,
    onBack,
    onSubmit,
}: LuyentapExerciseConfigOverlayProps) {
    return (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
            <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                    <h2 className="text-base font-semibold text-gray-900">Thông tin cơ bản</h2>
                    <button type="button" onClick={onBack} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto px-4 py-3 space-y-2.5">
                    <CustomInput
                        label="Tên bài tập"
                        placeholder="Nhập tên..."
                        value={form.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <CustomSelect
                            label="Khối học"
                            placeholder="Chọn"
                            options={GRADE_OPTIONS}
                            value={form.grade}
                            onChange={(v) => onChange({ grade: v })}
                            required
                        />
                        <CustomSelect
                            label="Mục đích"
                            placeholder="Chọn"
                            options={EXAM_PURPOSE_OPTIONS}
                            value={form.examPurpose}
                            onChange={(v) => onChange({ examPurpose: v })}
                            required
                        />
                    </div>
                    <CustomTextarea
                        label="Mô tả"
                        placeholder="Mô tả ngắn..."
                        value={form.description}
                        onChange={(v) => onChange({ description: v })}
                        rows={2}
                    />
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-end">
                    <CustomButton variant="secondary" size="small" onClick={onBack} disabled={saving} className="w-full sm:w-auto">
                        Quay lại
                    </CustomButton>
                    <CustomButton size="small" onClick={onSubmit} loading={saving} className="w-full sm:w-auto">
                        Lưu
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}
