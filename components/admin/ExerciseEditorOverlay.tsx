'use client';

import { useEffect } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Image from 'next/image';
import CustomEditorCourseExercise from './CustomEditorCourseExercise';
import { CustomButton } from '@/components/custom/CustomButton';
import type { TrueFalseScale, ContestQuestion } from '@/components/custom/CustomEditorContest';
import { cn } from '@/lib/utils';

export interface ExerciseEditorOverlayProps {
    title: string;
    initialContent: string;
    initialScoreOverrides?: Record<number, number>;
    initialTrueFalseScale?: TrueFalseScale;
    saveStatus: 'unsaved' | 'saving' | 'saved';
    saving: boolean;
    onClose: () => void;
    onSave: () => void;
    onContentChange: (content: string, questions: ContestQuestion[]) => void;
    onScoreConfigChange: (config: {
        scoreOverrides: Record<number, number>;
        trueFalseScale: TrueFalseScale;
    }) => void;
}

export default function ExerciseEditorOverlay({
    title,
    initialContent,
    initialScoreOverrides,
    initialTrueFalseScale,
    saveStatus,
    saving,
    onClose,
    onSave,
    onContentChange,
    onScoreConfigChange,
}: ExerciseEditorOverlayProps) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const saveStatusLabel =
        saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'unsaved' ? 'Có thay đổi' : 'Đã lưu';

    return (
        <div className="fixed inset-0 z-[110] flex h-dvh w-full flex-col overflow-hidden bg-white">
            <header className="flex-shrink-0 border-b border-gray-100 bg-white px-3 py-2.5 sm:px-6 sm:py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                            title="Quay lại"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <Image
                            src="/images/logo.png"
                            alt="CNcode"
                            width={90}
                            height={36}
                            className="hidden h-8 w-auto shrink-0 sm:block"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">Soạn bài tập</p>
                            <p className="truncate text-xs text-gray-500">{title || 'Bài tập'}</p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <span
                            className={cn(
                                'rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:text-[11px]',
                                saveStatus === 'saved'
                                    ? 'bg-green-50 text-green-600'
                                    : saveStatus === 'saving'
                                      ? 'bg-amber-50 text-amber-600'
                                      : 'bg-gray-100 text-gray-600',
                            )}
                        >
                            {saveStatusLabel}
                        </span>
                        <CustomButton onClick={onSave} disabled={saving} size="medium" className="px-2.5 sm:px-4">
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin sm:mr-1.5" />
                            ) : (
                                <Save className="h-4 w-4 sm:mr-1.5" />
                            )}
                            <span className="hidden sm:inline">Lưu</span>
                        </CustomButton>
                    </div>
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden bg-white">
                <CustomEditorCourseExercise
                    initialContent={initialContent}
                    initialScoreOverrides={initialScoreOverrides}
                    initialTrueFalseScale={initialTrueFalseScale}
                    onContentChange={onContentChange}
                    onScoreConfigChange={onScoreConfigChange}
                    saveStatus={saveStatus}
                />
            </div>
        </div>
    );
}
