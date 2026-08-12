export const GRADE_OPTIONS = [
    ...Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: `Khối ${i + 1}`,
    })),
    { value: 'other', label: 'Khác' },
];

export const EXAM_PURPOSE_OPTIONS = [
    { value: 'chapter-review', label: 'Ôn tập theo chương bài' },
    { value: 'midterm-1', label: 'Kiểm tra học kì I' },
    { value: 'midterm-2', label: 'Kiểm tra học kỳ II' },
    { value: 'mock-midterm-1', label: 'Thi thử học kỳ I' },
    { value: 'mock-midterm-2', label: 'Thi thử học kỳ II' },
    { value: 'regular-test', label: 'Kiểm tra thường xuyên' },
    { value: 'mock-graduation', label: 'Thi thử tốt nghiệp THPT' },
    { value: 'other', label: 'Khác' },
];

export const EXAM_PURPOSE_LABELS: Record<string, string> = Object.fromEntries(
    EXAM_PURPOSE_OPTIONS.map((opt) => [opt.value, opt.label])
);

export const GRADE_LABELS: Record<string, string> = Object.fromEntries(
    GRADE_OPTIONS.map((opt) => [opt.value, opt.label])
);

export const PROCTORING_OPTIONS = [
    { value: 'off', label: 'Tắt' },
    { value: 'tab-switch', label: 'Giám sát thoát màn hình' },
];

export const ESSAY_KEYBOARD_OPTIONS = [
    { value: 'basic', label: 'Cơ bản' },
    { value: 'math', label: 'Toán học (+ công thức)' },
    { value: 'editor', label: 'Soạn thảo nâng cao' },
];

export const REVEAL_WHEN_OPTIONS = [
    { value: 'never', label: 'Không' },
    { value: 'after-submit', label: 'Khi thi xong' },
    { value: 'after-expiry', label: 'Khi đề thi hết hạn' },
];

export const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' },
    { value: 'very_hard', label: 'Rất khó' },
];

export const DIFFICULTY_LABELS: Record<string, string> = Object.fromEntries(
    DIFFICULTY_OPTIONS.map((opt) => [opt.value, opt.label]),
);
