import type { ExerciseConfigForm } from '@/components/luyentap/LuyentapExerciseConfigOverlay';
import { combineDateAndTime, splitDateAndTime } from '@/components/custom/CustomInputHourMinute';

export interface CustomStudentField {
    id: string;
    label: string;
    required: boolean;
}

export interface ExerciseSettingsForm extends ExerciseConfigForm {
    duration: number;
    deliveryFromDate: string;
    deliveryFromTime: string;
    deliveryToDate: string;
    deliveryToTime: string;
    maxAttempts: number;
    examPassword: string;
    proctoring: 'off' | 'tab-switch';
    verifyStudentInfo: boolean;
    studentFullName: boolean;
    studentClassName: boolean;
    customStudentFields: CustomStudentField[];
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    essayKeyboard: 'basic' | 'math' | 'editor';
    showScoreWhen: 'never' | 'after-submit' | 'after-expiry';
    showAnswersWhen: 'never' | 'after-submit' | 'after-expiry';
    hideLeaderboard: boolean;
    preExamNoticeEnabled: boolean;
    preExamNotice: string;
}

export const DEFAULT_EXERCISE_SETTINGS: ExerciseSettingsForm = {
    title: '',
    grade: '',
    examPurpose: '',
    description: '',
    duration: 60,
    deliveryFromDate: '',
    deliveryFromTime: '',
    deliveryToDate: '',
    deliveryToTime: '',
    maxAttempts: 0,
    examPassword: '',
    proctoring: 'off',
    verifyStudentInfo: false,
    studentFullName: true,
    studentClassName: true,
    customStudentFields: [],
    shuffleQuestions: false,
    shuffleAnswers: false,
    essayKeyboard: 'basic',
    showScoreWhen: 'after-submit',
    showAnswersWhen: 'never',
    hideLeaderboard: false,
    preExamNoticeEnabled: false,
    preExamNotice: '',
};

function toDatetimeLocal(value?: string | Date | null): string {
    return splitDateAndTime(value).date;
}

function toTimeLocal(value?: string | Date | null): string {
    return splitDateAndTime(value).time;
}

export function buildSettingsForm(
    basic: ExerciseConfigForm,
    exercise?: Partial<ExerciseSettingsForm & {
        deliveryFrom?: string;
        deliveryTo?: string;
        studentInfoFields?: {
            fullName?: boolean;
            className?: boolean;
            custom?: Array<{ label: string; required?: boolean }>;
        };
    }> | null,
): ExerciseSettingsForm {
    const custom = exercise?.studentInfoFields?.custom?.map((f, i) => ({
        id: `custom-${i}-${f.label}`,
        label: f.label,
        required: f.required ?? false,
    })) ?? exercise?.customStudentFields ?? [];

    return {
        ...DEFAULT_EXERCISE_SETTINGS,
        title: basic.title || exercise?.title || '',
        grade: basic.grade || exercise?.grade || '',
        examPurpose: basic.examPurpose || exercise?.examPurpose || '',
        description: basic.description || exercise?.description || '',
        duration: exercise?.duration ?? DEFAULT_EXERCISE_SETTINGS.duration,
        deliveryFromDate: toDatetimeLocal(exercise?.deliveryFrom),
        deliveryFromTime: toTimeLocal(exercise?.deliveryFrom),
        deliveryToDate: toDatetimeLocal(exercise?.deliveryTo),
        deliveryToTime: toTimeLocal(exercise?.deliveryTo),
        maxAttempts: exercise?.maxAttempts ?? 0,
        examPassword: exercise?.examPassword ?? '',
        proctoring: exercise?.proctoring ?? 'off',
        verifyStudentInfo: exercise?.verifyStudentInfo ?? false,
        studentFullName: exercise?.studentInfoFields?.fullName ?? exercise?.studentFullName ?? true,
        studentClassName: exercise?.studentInfoFields?.className ?? exercise?.studentClassName ?? true,
        customStudentFields: custom,
        shuffleQuestions: exercise?.shuffleQuestions ?? false,
        shuffleAnswers: exercise?.shuffleAnswers ?? false,
        essayKeyboard: exercise?.essayKeyboard ?? 'basic',
        showScoreWhen: exercise?.showScoreWhen ?? 'after-submit',
        showAnswersWhen: exercise?.showAnswersWhen ?? 'never',
        hideLeaderboard: exercise?.hideLeaderboard ?? false,
        preExamNoticeEnabled: exercise?.preExamNoticeEnabled ?? false,
        preExamNotice: exercise?.preExamNotice ?? '',
    };
}

export function settingsFormToPayload(form: ExerciseSettingsForm) {
    return {
        title: form.title.trim(),
        description: form.description,
        grade: form.grade,
        examPurpose: form.examPurpose,
        duration: form.duration,
        deliveryFrom: combineDateAndTime(form.deliveryFromDate, form.deliveryFromTime),
        deliveryTo: combineDateAndTime(form.deliveryToDate, form.deliveryToTime),
        maxAttempts: form.maxAttempts,
        examPassword: form.examPassword,
        proctoring: form.proctoring,
        verifyStudentInfo: form.verifyStudentInfo,
        studentInfoFields: {
            fullName: form.studentFullName,
            className: form.studentClassName,
            custom: form.customStudentFields.map((f) => ({
                label: f.label,
                required: f.required,
            })),
        },
        shuffleQuestions: form.shuffleQuestions,
        shuffleAnswers: form.shuffleAnswers,
        essayKeyboard: form.essayKeyboard,
        showScoreWhen: form.showScoreWhen,
        showAnswersWhen: form.showAnswersWhen,
        hideLeaderboard: form.hideLeaderboard,
        preExamNoticeEnabled: form.preExamNoticeEnabled,
        preExamNotice: form.preExamNotice,
    };
}
