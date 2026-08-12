'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomToggle } from '@/components/custom/CustomToggle';
import { CustomInputDate } from '@/components/custom/CustomInputDate';
import { CustomInputHourMinute } from '@/components/custom/CustomInputHourMinute';
import {
    GRADE_OPTIONS,
    EXAM_PURPOSE_OPTIONS,
    PROCTORING_OPTIONS,
    REVEAL_WHEN_OPTIONS,
    DIFFICULTY_OPTIONS,
} from '@/lib/luyentap/exercise-config.constants';
import type { ExerciseSettingsForm } from '@/lib/luyentap/exercise-settings.types';

interface LuyentapExerciseSettingsOverlayProps {
    form: ExerciseSettingsForm;
    saving?: boolean;
    publishing?: boolean;
    folderOptions?: Array<{ value: string; label: string }>;
    onChange: (patch: Partial<ExerciseSettingsForm>) => void;
    onBack: () => void;
    onPublish: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">{title}</h3>
            {children}
        </section>
    );
}

function ToggleRow({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-1.5">
            <span className="text-sm text-gray-700">{label}</span>
            <CustomToggle checked={checked} onChange={onChange} size="small" />
        </div>
    );
}

export default function LuyentapExerciseSettingsOverlay({
    form,
    saving = false,
    publishing = false,
    folderOptions = [],
    onChange,
    onBack,
    onPublish,
}: LuyentapExerciseSettingsOverlayProps) {
    const busy = saving || publishing;

    return (
        <div className="fixed inset-0 z-[10001] bg-white flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={busy}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-base font-semibold text-gray-900">Cấu hình bài tập</h2>
                </div>
                <CustomButton size="small" onClick={onPublish} loading={publishing} disabled={busy}>
                    Xuất bản
                </CustomButton>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Section title="Cấu hình chung">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                            <div className="sm:col-span-2">
                                <CustomInput
                                    label="Tên bài tập"
                                    placeholder="Nhập tên..."
                                    value={form.title}
                                    onChange={(e) => onChange({ title: e.target.value })}
                                    required
                                />
                            </div>
                            <CustomSelect
                                label="Khối học"
                                placeholder="Chọn khối"
                                options={GRADE_OPTIONS}
                                value={form.grade}
                                onChange={(v) => onChange({ grade: v })}
                                required
                            />
                            <CustomSelect
                                label="Mục đích tạo đề"
                                placeholder="Chọn mục đích"
                                options={EXAM_PURPOSE_OPTIONS}
                                value={form.examPurpose}
                                onChange={(v) => onChange({ examPurpose: v })}
                                required
                            />
                            <CustomInput
                                label="Thời gian làm bài (phút)"
                                type="number"
                                min={1}
                                value={form.duration}
                                onChange={(e) => onChange({ duration: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                            />
                            <CustomSelect
                                label="Mức độ"
                                placeholder="Chọn mức độ"
                                options={DIFFICULTY_OPTIONS}
                                value={form.difficulty}
                                onChange={(v) => onChange({ difficulty: v as ExerciseSettingsForm['difficulty'] })}
                                required
                            />
                            <CustomSelect
                                label="Thư mục"
                                placeholder="Chọn thư mục"
                                options={[
                                    { value: '', label: 'Ngoài thư mục' },
                                    ...folderOptions,
                                ]}
                                value={form.folderId}
                                onChange={(v) => onChange({ folderId: v })}
                            />
                        </div>
                        <div className="mt-2.5">
                            <p className="text-[11px] font-medium text-gray-500 mb-1.5">Thời gian giao đề</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <CustomInputDate
                                    label="Từ — ngày"
                                    value={form.deliveryFromDate}
                                    onChange={(v) => onChange({ deliveryFromDate: v })}
                                />
                                <CustomInputHourMinute
                                    label="Giờ"
                                    compact
                                    value={form.deliveryFromTime}
                                    onChange={(v) => onChange({ deliveryFromTime: v })}
                                    placeholder="08:00"
                                />
                                <CustomInputDate
                                    label="Đến — ngày"
                                    value={form.deliveryToDate}
                                    onChange={(v) => onChange({ deliveryToDate: v })}
                                />
                                <CustomInputHourMinute
                                    label="Giờ"
                                    compact
                                    value={form.deliveryToTime}
                                    onChange={(v) => onChange({ deliveryToTime: v })}
                                    placeholder="17:30"
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="Bảo mật">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                            <CustomInput
                                label="Số lượt làm"
                                type="number"
                                min={0}
                                placeholder="0 = không giới hạn"
                                value={form.maxAttempts}
                                onChange={(e) => onChange({ maxAttempts: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                            />
                            <CustomInput
                                label="Mật khẩu đề"
                                type="password"
                                placeholder="Tùy chọn"
                                value={form.examPassword}
                                onChange={(e) => onChange({ examPassword: e.target.value })}
                            />
                            <CustomSelect
                                label="Giám sát"
                                options={PROCTORING_OPTIONS}
                                value={form.proctoring}
                                onChange={(v) => onChange({ proctoring: v as ExerciseSettingsForm['proctoring'] })}
                            />
                        </div>
                    </Section>

                    <Section title="Đáp án & điểm số">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                            <CustomSelect
                                label="Cho xem điểm"
                                options={REVEAL_WHEN_OPTIONS}
                                value={form.showScoreWhen}
                                onChange={(v) => onChange({ showScoreWhen: v as ExerciseSettingsForm['showScoreWhen'] })}
                            />
                            <CustomSelect
                                label="Cho xem đáp án"
                                options={REVEAL_WHEN_OPTIONS}
                                value={form.showAnswersWhen}
                                onChange={(v) => onChange({ showAnswersWhen: v as ExerciseSettingsForm['showAnswersWhen'] })}
                            />
                        </div>
                    </Section>

                    <Section title="Đảo câu hỏi & đáp án">
                        <ToggleRow label="Đảo câu hỏi (trong nhóm)" checked={form.shuffleQuestions} onChange={(v) => onChange({ shuffleQuestions: v })} />
                        <ToggleRow label="Đảo đáp án (trong câu)" checked={form.shuffleAnswers} onChange={(v) => onChange({ shuffleAnswers: v })} />
                    </Section>

                    <Section title="Khác">
                        <ToggleRow label="Thông báo trước khi thi" checked={form.preExamNoticeEnabled} onChange={(v) => onChange({ preExamNoticeEnabled: v })} />
                        {form.preExamNoticeEnabled && (
                            <CustomTextarea
                                placeholder="Nội dung thông báo..."
                                value={form.preExamNotice}
                                onChange={(v) => onChange({ preExamNotice: v })}
                                rows={2}
                            />
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
}
