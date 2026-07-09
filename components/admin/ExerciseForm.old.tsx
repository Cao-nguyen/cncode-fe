'use client';

import { useState, useRef } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { CustomInput } from '../custom/CustomInput';
import { CustomButton } from '../custom/CustomButton';
import { CustomSelect } from '../custom/CustomSelect';
import CustomEditor, { CustomEditorRef } from '../custom/CustomEditor';
import ExerciseEditor, { ExerciseEditorRef } from '../custom/ExerciseEditor';
import { createAdminExercise, updateAdminExercise } from '@/lib/api/khoahoc.api';
import { Exercise } from '@/types/khoahoc.type';
import { toast } from 'sonner';

interface ExerciseFormProps {
    courseId: string;
    lessonId: string;
    exerciseId?: string;
    initialExercise?: Exercise;
    onSave: (exercise: Exercise) => void;
    onCancel: () => void;
}

type ExerciseType = 'quiz' | 'true-false' | 'short-answer' | 'ide';

interface QuestionState {
    type: ExerciseType;
    question: string;
    options?: { text: string; isCorrect: boolean }[];
    trueFalseOptions?: { text: string; isCorrect: boolean }[];
    correctAnswer?: string;
    maxLength?: number;
    language?: string;
    starterCode?: string;
    testCases?: { input: string; expectedOutput: string }[];
    correctAnswerIndex?: number;
}

export default function ExerciseForm({
    courseId,
    lessonId,
    exerciseId,
    initialExercise,
    onSave,
    onCancel
}: ExerciseFormProps) {
    const [questions, setQuestions] = useState<QuestionState[]>(
        initialExercise?.questions?.length ? initialExercise.questions.map(q => ({
            type: q.type,
            question: q.question,
            options: q.options,
            trueFalseOptions: q.trueFalseOptions,
            correctAnswer: q.correctAnswer,
            maxLength: q.maxLength,
            language: q.language,
            starterCode: q.starterCode,
            testCases: q.testCases,
            correctAnswerIndex: q.options?.findIndex(o => o.isCorrect) ?? 0
        })) : [createEmptyQuestion()]
    );
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showQuickInput, setShowQuickInput] = useState(false);
    const [quickInputText, setQuickInputText] = useState('');

    const questionEditorRef = useRef<ExerciseEditorRef>(null);
    const starterCodeEditorRef = useRef<CustomEditorRef>(null);
    const optionEditorRefs = useRef<{ [key: number]: ExerciseEditorRef | null }>({});
    const trueFalseEditorRefs = useRef<{ [key: number]: ExerciseEditorRef | null }>({});

    function createEmptyQuestion(): QuestionState {
        return {
            type: 'quiz',
            question: '',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            trueFalseOptions: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            correctAnswer: '',
            maxLength: 4,
            language: 'javascript',
            starterCode: '',
            testCases: [{ input: '', expectedOutput: '' }],
            correctAnswerIndex: 0
        };
    }

    const currentQuestion = questions[activeQuestion];

    const updateCurrentQuestion = (updates: Partial<QuestionState>) => {
        const updated = [...questions];
        updated[activeQuestion] = { ...currentQuestion, ...updates };
        setQuestions(updated);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, createEmptyQuestion()]);
        setActiveQuestion(questions.length);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length <= 1) {
            toast.error('Phải có ít nhất 1 câu hỏi');
            return;
        }
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
        if (activeQuestion >= updated.length) {
            setActiveQuestion(Math.max(0, updated.length - 1));
        }
    };

    const handleSave = async () => {
        const updated = [...questions];
        for (let i = 0; i < updated.length; i++) {
            const q = updated[i];

            if (i === activeQuestion) {
                q.question = questionEditorRef.current?.getContent() || '';
            }

            if (!q.question?.trim()) {
                toast.error(`Câu ${i + 1}: Vui lòng nhập đề bài`);
                return;
            }

            if (q.type === 'quiz') {
                for (let j = 0; j < (q.options?.length || 0); j++) {
                    const content = i === activeQuestion ? optionEditorRefs.current[j]?.getContent() || '' : q.options?.[j]?.text || '';
                    if (i === activeQuestion) q.options![j].text = content;
                    if (!content?.trim()) {
                        toast.error(`Câu ${i + 1}, Đáp án ${String.fromCharCode(65 + j)}: Không được để trống`);
                        return;
                    }
                }
            } else if (q.type === 'true-false') {
                for (let j = 0; j < (q.trueFalseOptions?.length || 0); j++) {
                    const content = i === activeQuestion ? trueFalseEditorRefs.current[j]?.getContent() || '' : q.trueFalseOptions?.[j]?.text || '';
                    if (i === activeQuestion) q.trueFalseOptions![j].text = content;
                    if (!content?.trim()) {
                        toast.error(`Câu ${i + 1}, Phát biểu ${j + 1}: Không được để trống`);
                        return;
                    }
                }
            } else if (q.type === 'short-answer') {
                if (!q.correctAnswer?.trim()) {
                    toast.error(`Câu ${i + 1}: Vui lòng nhập đáp án`);
                    return;
                }
            } else if (q.type === 'ide') {
                if (i === activeQuestion) q.starterCode = starterCodeEditorRef.current?.getContent() || '';
                if (!q.testCases?.length) {
                    toast.error(`Câu ${i + 1}: Phải có ít nhất 1 test case`);
                    return;
                }
            }
        }

        try {
            setSaving(true);
            const exerciseData = {
                lessonId,
                courseId,
                questions: updated.map(q => ({
                    type: q.type,
                    question: q.question,
                    options: q.type === 'quiz' ? q.options?.map((opt, idx) => ({
                        text: opt.text,
                        isCorrect: idx === (q.correctAnswerIndex ?? 0)
                    })) : undefined,
                    trueFalseOptions: q.type === 'true-false' ? q.trueFalseOptions : undefined,
                    correctAnswer: q.type === 'short-answer' ? q.correctAnswer : undefined,
                    maxLength: q.type === 'short-answer' ? q.maxLength : undefined,
                    language: q.type === 'ide' ? q.language : undefined,
                    starterCode: q.type === 'ide' ? q.starterCode : undefined,
                    testCases: q.type === 'ide' ? q.testCases : undefined
                }))
            };

            let exercise: Exercise;
            if (exerciseId) {
                exercise = await updateAdminExercise(exerciseId, exerciseData);
                toast.success('Đã cập nhật bài tập');
            } else {
                exercise = await createAdminExercise(lessonId, exerciseData);
                toast.success('Đã tạo bài tập');
            }

            onSave(exercise);
        } catch (err) {
            console.error(err);
            toast.error('Không thể lưu bài tập');
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuizOption = () => {
        updateCurrentQuestion({
            options: [...(currentQuestion.options || []), { text: '', isCorrect: false }]
        });
    };

    const handleRemoveQuizOption = (index: number) => {
        const opts = currentQuestion.options || [];
        if (opts.length <= 2) {
            toast.error('Phải có ít nhất 2 đáp án');
            return;
        }
        const updated = opts.filter((_, i) => i !== index);
        if ((currentQuestion.correctAnswerIndex ?? 0) >= updated.length) {
            updateCurrentQuestion({
                options: updated,
                correctAnswerIndex: Math.max(0, updated.length - 1)
            });
        } else {
            updateCurrentQuestion({ options: updated });
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-[13.5px] flex items-center justify-between shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                    {exerciseId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
                </h3>
                <div className="flex items-center gap-3">
                    <CustomButton onClick={onCancel} variant="secondary">
                        <X className="w-4 h-4 mr-1.5" /> Huỷ
                    </CustomButton>
                    <CustomButton onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Đang lưu...' : 'Lưu'}
                    </CustomButton>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6 pb-12">
                    {/* Questions Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveQuestion(i)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeQuestion === i
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-300 hover:border-indigo-400'
                                    }`}
                            >
                                Câu {i + 1}
                            </button>
                        ))}
                        <CustomButton onClick={handleAddQuestion} variant="secondary" size="small">
                            <Plus className="w-4 h-4 mr-1.5" /> Thêm câu
                        </CustomButton>
                    </div>

                    {/* Question Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Loại câu hỏi *</label>
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <CustomSelect
                                    value={currentQuestion.type}
                                    onChange={(value) => {
                                        updateCurrentQuestion({ type: value as ExerciseType });
                                        optionEditorRefs.current = {};
                                        trueFalseEditorRefs.current = {};
                                    }}
                                    options={[
                                        { value: 'quiz', label: 'Trắc nghiệm' },
                                        { value: 'true-false', label: 'Đúng/Sai' },
                                        { value: 'short-answer', label: 'Trả lời ngắn' },
                                        { value: 'ide', label: 'Code' }
                                    ]}
                                />
                            </div>
                            {questions.length > 1 && (
                                <CustomButton
                                    onClick={() => handleRemoveQuestion(activeQuestion)}
                                    variant="secondary"
                                    size="small"
                                    className="!p-1.5 !h-auto text-red-500 hover:bg-red-50 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </CustomButton>
                            )}
                        </div>
                    </div>

                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Đề bài *</label>
                        <ExerciseEditor
                            key={`question-${activeQuestion}`}
                            ref={questionEditorRef}
                            initialValue={currentQuestion.question}
                            height="200px"
                        />
                    </div>

                    {/* Quiz Options */}
                    {currentQuestion.type === 'quiz' && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">Đáp án *</label>
                                <CustomButton onClick={handleAddQuizOption} variant="secondary" size="small">
                                    <Plus className="w-4 h-4 mr-1.5" /> Thêm đáp án
                                </CustomButton>
                            </div>
                            <div className="space-y-3">
                                {(currentQuestion.options || []).map((opt, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <button
                                            type="button"
                                            onClick={() => updateCurrentQuestion({ correctAnswerIndex: i })}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 shrink-0 mt-1 transition-all ${(currentQuestion.correctAnswerIndex ?? 0) === i
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                                                }`}
                                        >
                                            {String.fromCharCode(65 + i)}
                                        </button>
                                        <div className="flex-1">
                                            <ExerciseEditor
                                                key={`quiz-opt-${activeQuestion}-${i}-${currentQuestion.type}`}
                                                ref={(el: ExerciseEditorRef | null) => {
                                                    if (el) optionEditorRefs.current[i] = el;
                                                }}
                                                initialValue={opt.text}
                                                height="200px"
                                            />
                                        </div>
                                        {(currentQuestion.options || []).length > 2 && (
                                            <CustomButton
                                                onClick={() => handleRemoveQuizOption(i)}
                                                variant="secondary"
                                                size="small"
                                                className="!p-1.5 !h-auto text-red-500 hover:bg-red-50 shrink-0 mt-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </CustomButton>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* True/False Options */}
                    {currentQuestion.type === 'true-false' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Các phát biểu (Đúng/Sai) *</label>
                            <div className="space-y-4">
                                {(currentQuestion.trueFalseOptions || []).map((opt, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex gap-2 shrink-0 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = currentQuestion.trueFalseOptions?.map((o, idx) =>
                                                        idx === i ? { ...o, isCorrect: true } : o
                                                    ) || [];
                                                    updateCurrentQuestion({ trueFalseOptions: updated });
                                                }}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all ${opt.isCorrect
                                                    ? 'bg-green-600 text-white border-green-600 shadow-md'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600'
                                                    }`}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = currentQuestion.trueFalseOptions?.map((o, idx) =>
                                                        idx === i ? { ...o, isCorrect: false } : o
                                                    ) || [];
                                                    updateCurrentQuestion({ trueFalseOptions: updated });
                                                }}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all ${!opt.isCorrect
                                                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-red-400 hover:text-red-600'
                                                    }`}
                                            >
                                                ✗
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <ExerciseEditor
                                                key={`tf-opt-${activeQuestion}-${i}-${currentQuestion.type}`}
                                                ref={(el: ExerciseEditorRef | null) => {
                                                    if (el) trueFalseEditorRefs.current[i] = el;
                                                }}
                                                initialValue={opt.text}
                                                height="200px"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Short Answer */}
                    {currentQuestion.type === 'short-answer' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Đáp án đúng *</label>
                            <CustomInput
                                value={currentQuestion.correctAnswer || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[0-9,\-]*$/.test(val) && val.length <= 4) {
                                        updateCurrentQuestion({ correctAnswer: val });
                                    }
                                }}
                                placeholder="Nhập đáp án (tối đa 4 ký tự: số, dấu , và -)"
                                maxLength={4}
                            />
                        </div>
                    )}

                    {/* IDE Exercise */}
                    {currentQuestion.type === 'ide' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                                <CustomSelect
                                    value={currentQuestion.language || 'javascript'}
                                    onChange={(value) => updateCurrentQuestion({ language: value })}
                                    options={[
                                        { value: 'python', label: 'Python' },
                                        { value: 'cpp', label: 'C/C++' },
                                        { value: 'javascript', label: 'JavaScript' },
                                        { value: 'html', label: 'HTML' },
                                        { value: 'css', label: 'CSS' },
                                        { value: 'pascal', label: 'Pascal' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Code mẫu</label>
                                <CustomEditor
                                    ref={starterCodeEditorRef}
                                    initialValue={currentQuestion.starterCode}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium">Test cases</label>
                                    <div className="flex gap-2">
                                        <CustomButton
                                            onClick={() => { setQuickInputText(''); setShowQuickInput(true); }}
                                            variant="secondary"
                                            size="small"
                                        >
                                            Nhập nhanh
                                        </CustomButton>
                                        <CustomButton
                                            onClick={() => {
                                                const tcs = currentQuestion.testCases || [];
                                                updateCurrentQuestion({
                                                    testCases: [...tcs, { input: '', expectedOutput: '' }]
                                                });
                                            }}
                                            variant="secondary"
                                            size="small"
                                        >
                                            <Plus className="w-4 h-4 mr-1.5" /> Thêm test case
                                        </CustomButton>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {(currentQuestion.testCases || []).map((tc, i) => (
                                        <div key={i} className="border rounded-lg p-4 space-y-3 bg-white">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Test case {i + 1}</span>
                                                {(currentQuestion.testCases || []).length > 1 && (
                                                    <CustomButton
                                                        onClick={() => {
                                                            const tcs = (currentQuestion.testCases || []).filter((_, j) => j !== i);
                                                            updateCurrentQuestion({ testCases: tcs });
                                                        }}
                                                        variant="secondary"
                                                        size="small"
                                                        className="!p-1.5 !h-auto text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </CustomButton>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Input</label>
                                                <CustomInput
                                                    value={tc.input}
                                                    onChange={(e) => {
                                                        const tcs = [...(currentQuestion.testCases || [])];
                                                        tcs[i] = { ...tcs[i], input: e.target.value };
                                                        updateCurrentQuestion({ testCases: tcs });
                                                    }}
                                                    placeholder="Input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Expected Output</label>
                                                <CustomInput
                                                    value={tc.expectedOutput}
                                                    onChange={(e) => {
                                                        const tcs = [...(currentQuestion.testCases || [])];
                                                        tcs[i] = { ...tcs[i], expectedOutput: e.target.value };
                                                        updateCurrentQuestion({ testCases: tcs });
                                                    }}
                                                    placeholder="Expected output"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Quick Input Modal */}
            {showQuickInput && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]"
                    onClick={(e) => e.target === e.currentTarget && setShowQuickInput(false)}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[90vw] p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Nhập nhanh test cases</h4>
                            <button
                                onClick={() => setShowQuickInput(false)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Format: mỗi test case gồm I: input và O: output. Phân cách bằng dòng trống hoặc dòng mới.
                            <br />Ví dụ:
                            <br />TC1
                            <br />I: 1 2 3
                            <br />O: 6
                            <br /><br />TC2
                            <br />I: 4 5 6
                            <br />O: 15
                        </p>
                        <textarea
                            value={quickInputText}
                            onChange={(e) => setQuickInputText(e.target.value)}
                            rows={8}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                            placeholder={`TC1\nI: input 1\nO: output 1\n\nTC2\nI: input 2\nO: output 2`}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowQuickInput(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={() => {
                                    const parsed: Array<{ input: string; expectedOutput: string }> = [];
                                    const lines = quickInputText.split('\n').map(l => l.trim());
                                    let currentInput = '';
                                    let currentOutput = '';
                                    for (const line of lines) {
                                        const lowerLine = line.toLowerCase();
                                        if (lowerLine.startsWith('i:') || lowerLine.startsWith('input:')) {
                                            currentInput = line.substring(line.indexOf(':') + 1).trim();
                                        } else if (lowerLine.startsWith('o:') || lowerLine.startsWith('output:')) {
                                            currentOutput = line.substring(line.indexOf(':') + 1).trim();
                                            if (currentInput || currentOutput) {
                                                parsed.push({ input: currentInput, expectedOutput: currentOutput });
                                                currentInput = '';
                                                currentOutput = '';
                                            }
                                        }
                                    }
                                    if (parsed.length > 0) {
                                        updateCurrentQuestion({ testCases: parsed });
                                        setShowQuickInput(false);
                                        toast.success(`Đã thêm ${parsed.length} test cases`);
                                    } else {
                                        toast.error('Không thể parse test cases. Kiểm tra lại format.');
                                    }
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}