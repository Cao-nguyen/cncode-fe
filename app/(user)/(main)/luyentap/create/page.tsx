"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "@/store/userSlice";
import { toast } from "sonner";
import { ImportQuestions, ImportedQuestion } from "@/components/sections/exercise/ImportQuestions";
import { Add, Trash, DirectRight } from "iconsax-react";

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface ShortAnswerData {
    correctAnswer: string;
    hint?: string;
}

interface EssayData {
    keywords?: string[];
    sampleAnswer?: string;
}

interface CodeData {
    starterCode?: string;
    testCases?: TestCase[];
}

interface Question {
    type: "multiple_choice" | "short_answer" | "essay" | "code";
    content: string;
    points: number;
    options?: string[];
    correctIndex?: number;
    shortAnswer?: ShortAnswerData;
    essay?: EssayData;
    code?: CodeData;
    explanation?: string;
}

interface ExerciseFormData {
    title: string;
    description: string;
    subject: string;
    difficulty: string;
    timeLimit: number | null;
    isFree: boolean;
    costCoins: number;
    isSpinnable: boolean;
    spinReward: number;
}

const initialFormData: ExerciseFormData = {
    title: "",
    description: "",
    subject: "programming",
    difficulty: "easy",
    timeLimit: null,
    isFree: true,
    costCoins: 0,
    isSpinnable: false,
    spinReward: 50,
};

const createEmptyQuestion = (): Question => ({
    type: "multiple_choice",
    content: "",
    points: 1,
    options: ["", "", "", ""],
    correctIndex: 0,
});

export default function TaoBaiTapPage() {
    const router = useRouter();
    const user = useSelector(selectUser);
    const token = useSelector(selectToken);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<ExerciseFormData>(initialFormData);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        const canAccess = user?.role === "teacher" || user?.role === "admin";
        if (!canAccess) {
            toast.error("Bạn không có quyền truy cập trang này");
            router.push("/");
            return;
        }

        setLoading(false);
    }, [user, token, router]);

    const updateFormField = useCallback(<K extends keyof ExerciseFormData>(
        field: K,
        value: ExerciseFormData[K]
    ): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleImport = useCallback((importedQuestions: ImportedQuestion[]): void => {
        const mappedQuestions: Question[] = importedQuestions.map(q => ({
            type: q.type,
            content: q.content,
            points: q.points,
            options: q.options,
            correctIndex: q.correctIndex,
            shortAnswer: q.shortAnswer,
            essay: q.essay,
            code: q.code,
            explanation: q.explanation,
        }));
        setQuestions(prev => [...prev, ...mappedQuestions]);
    }, []);

    const addQuestion = useCallback((): void => {
        setQuestions(prev => [...prev, createEmptyQuestion()]);
    }, []);

    const removeQuestion = useCallback((index: number): void => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateQuestion = useCallback((index: number, updates: Partial<Question>): void => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
    }, []);

    const updateOption = useCallback((qIndex: number, optIndex: number, value: string): void => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex || q.type !== "multiple_choice") return q;
            const newOptions = [...(q.options || [])];
            newOptions[optIndex] = value;
            return { ...q, options: newOptions };
        }));
    }, []);

    const addTestCase = useCallback((qIndex: number): void => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex || q.type !== "code") return q;
            const newTestCases = [...(q.code?.testCases || []), { input: "", expectedOutput: "", isHidden: false }];
            return { ...q, code: { ...q.code, testCases: newTestCases } };
        }));
    }, []);

    const updateTestCase = useCallback((qIndex: number, tcIndex: number, updates: Partial<TestCase>): void => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex || q.type !== "code") return q;
            const newTestCases = [...(q.code?.testCases || [])];
            newTestCases[tcIndex] = { ...newTestCases[tcIndex], ...updates };
            return { ...q, code: { ...q.code, testCases: newTestCases } };
        }));
    }, []);

    const removeTestCase = useCallback((qIndex: number, tcIndex: number): void => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex || q.type !== "code") return q;
            const newTestCases = (q.code?.testCases || []).filter((_, idx) => idx !== tcIndex);
            return { ...q, code: { ...q.code, testCases: newTestCases } };
        }));
    }, []);

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài tập");
            return false;
        }
        if (questions.length === 0) {
            toast.error("Vui lòng thêm ít nhất 1 câu hỏi");
            return false;
        }
        for (const q of questions) {
            if (!q.content.trim()) {
                toast.error("Vui lòng nhập nội dung câu hỏi");
                return false;
            }
            if (q.type === "multiple_choice" && q.options?.some(opt => !opt.trim())) {
                toast.error("Vui lòng nhập đầy đủ các đáp án");
                return false;
            }
            if (q.type === "short_answer" && !q.shortAnswer?.correctAnswer.trim()) {
                toast.error("Vui lòng nhập đáp án đúng cho câu hỏi trả lời ngắn");
                return false;
            }
        }
        return true;
    };

    const buildSubmitPayload = () => ({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit,
        isFree: formData.isFree,
        costCoins: formData.isFree ? 0 : formData.costCoins,
        isSpinnable: formData.isSpinnable,
        spinReward: formData.spinReward,
        questions: questions.map(q => {
            const base = {
                content: q.content,
                type: q.type,
                points: q.points,
                explanation: q.explanation,
            };
            switch (q.type) {
                case "multiple_choice":
                    return { ...base, multipleChoice: { options: q.options, correctIndex: q.correctIndex } };
                case "short_answer":
                    return { ...base, shortAnswer: q.shortAnswer };
                case "essay":
                    return { ...base, essay: q.essay || {} };
                case "code":
                    return { ...base, code: q.code };
                default:
                    return base;
            }
        }),
    });

    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) return;

        setSubmitting(true);
        const toastId = toast.loading("Đang tạo bài tập...");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(buildSubmitPayload()),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            toast.success("Tạo bài tập thành công!", { id: toastId });
            router.push("/luyentap");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Lỗi khi tạo bài tập";
            toast.error(message, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-foreground mb-6">Tạo bài tập mới</h1>

                <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => updateFormField("title", e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50"
                            placeholder="VD: Lập trình cơ bản"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateFormField("description", e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50"
                            placeholder="Mô tả ngắn về bài tập..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Môn học</label>
                            <select
                                value={formData.subject}
                                onChange={(e) => updateFormField("subject", e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                            >
                                <option value="programming">Lập trình</option>
                                <option value="ai">AI</option>
                                <option value="office">Tin học văn phòng</option>
                                <option value="highschool">THPT</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Độ khó</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => updateFormField("difficulty", e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                            >
                                <option value="easy">Dễ</option>
                                <option value="medium">Trung bình</option>
                                <option value="hard">Khó</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Thời gian (phút)</label>
                            <input
                                type="number"
                                value={formData.timeLimit || ""}
                                onChange={(e) => updateFormField("timeLimit", e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                placeholder="Không giới hạn"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isFree}
                                    onChange={(e) => updateFormField("isFree", e.target.checked)}
                                    className="accent-primary"
                                />
                                <span className="text-sm">Miễn phí</span>
                            </label>
                            {!formData.isFree && (
                                <input
                                    type="number"
                                    value={formData.costCoins}
                                    onChange={(e) => updateFormField("costCoins", Number(e.target.value))}
                                    className="w-24 px-3 py-2 bg-background border border-border rounded-xl"
                                    placeholder="Xu"
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isSpinnable}
                                onChange={(e) => updateFormField("isSpinnable", e.target.checked)}
                                className="accent-primary"
                            />
                            <span className="text-sm">Cho phép vòng quay may mắn</span>
                        </label>
                        {formData.isSpinnable && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Phần thưởng tối đa</label>
                                <input
                                    type="number"
                                    value={formData.spinReward}
                                    onChange={(e) => updateFormField("spinReward", Number(e.target.value))}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <ImportQuestions onImport={handleImport} />
                </div>

                <div className="space-y-4 mb-6">
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-2xl p-5">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold">Câu {idx + 1}</h3>
                                <button
                                    onClick={() => removeQuestion(idx)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={q.content}
                                    onChange={(e) => updateQuestion(idx, { content: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                    placeholder="Nội dung câu hỏi"
                                />

                                <div className="flex gap-3">
                                    <select
                                        value={q.type}
                                        onChange={(e) => updateQuestion(idx, { type: e.target.value as Question["type"] })}
                                        className="px-3 py-2 bg-background border border-border rounded-xl"
                                    >
                                        <option value="multiple_choice">Trắc nghiệm</option>
                                        <option value="short_answer">Trả lời ngắn</option>
                                        <option value="essay">Tự luận</option>
                                        <option value="code">Lập trình</option>
                                    </select>

                                    <input
                                        type="number"
                                        value={q.points}
                                        onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) })}
                                        className="w-20 px-3 py-2 bg-background border border-border rounded-xl"
                                        placeholder="Điểm"
                                    />
                                </div>

                                {q.type === "multiple_choice" && (
                                    <div className="space-y-2 pl-4">
                                        {q.options?.map((opt, optIdx) => (
                                            <div key={optIdx} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct_${idx}`}
                                                    checked={q.correctIndex === optIdx}
                                                    onChange={() => updateQuestion(idx, { correctIndex: optIdx })}
                                                    className="accent-primary"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg"
                                                    placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {q.type === "short_answer" && (
                                    <div>
                                        <input
                                            type="text"
                                            value={q.shortAnswer?.correctAnswer || ""}
                                            onChange={(e) => updateQuestion(idx, {
                                                shortAnswer: { correctAnswer: e.target.value, hint: q.shortAnswer?.hint }
                                            })}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                            placeholder="Đáp án đúng"
                                        />
                                        <input
                                            type="text"
                                            value={q.shortAnswer?.hint || ""}
                                            onChange={(e) => updateQuestion(idx, {
                                                shortAnswer: { correctAnswer: q.shortAnswer?.correctAnswer || "", hint: e.target.value }
                                            })}
                                            className="w-full mt-2 px-4 py-2 bg-background border border-border rounded-xl"
                                            placeholder="Gợi ý (không bắt buộc)"
                                        />
                                    </div>
                                )}

                                {q.type === "essay" && (
                                    <textarea
                                        value={q.essay?.sampleAnswer || ""}
                                        onChange={(e) => updateQuestion(idx, {
                                            essay: { keywords: q.essay?.keywords || [], sampleAnswer: e.target.value }
                                        })}
                                        rows={4}
                                        className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                        placeholder="Đáp án mẫu (không bắt buộc)"
                                    />
                                )}

                                {q.type === "code" && (
                                    <div>
                                        <textarea
                                            value={q.code?.starterCode || ""}
                                            onChange={(e) => updateQuestion(idx, {
                                                code: { starterCode: e.target.value, testCases: q.code?.testCases || [] }
                                            })}
                                            rows={5}
                                            className="w-full px-4 py-2 font-mono text-sm bg-background border border-border rounded-xl"
                                            placeholder="Code mẫu (không bắt buộc)"
                                        />
                                        <div className="mt-2">
                                            <button
                                                onClick={() => addTestCase(idx)}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                + Thêm test case
                                            </button>
                                        </div>
                                        {q.code?.testCases?.map((tc, tcIdx) => (
                                            <div key={tcIdx} className="flex gap-2 mt-2 items-center">
                                                <input
                                                    type="text"
                                                    value={tc.input}
                                                    onChange={(e) => updateTestCase(idx, tcIdx, { input: e.target.value })}
                                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                                    placeholder="Input"
                                                />
                                                <input
                                                    type="text"
                                                    value={tc.expectedOutput}
                                                    onChange={(e) => updateTestCase(idx, tcIdx, { expectedOutput: e.target.value })}
                                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                                    placeholder="Output"
                                                />
                                                <label className="flex items-center gap-1 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={tc.isHidden}
                                                        onChange={(e) => updateTestCase(idx, tcIdx, { isHidden: e.target.checked })}
                                                        className="accent-primary"
                                                    />
                                                    <span className="text-xs">Ẩn</span>
                                                </label>
                                                <button
                                                    onClick={() => removeTestCase(idx, tcIdx)}
                                                    className="text-red-500"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <textarea
                                    value={q.explanation || ""}
                                    onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                    placeholder="Lời giải chi tiết (không bắt buộc)"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={addQuestion}
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:border-primary/40 transition"
                    >
                        <Add variant="Outline" size={18} />
                        Thêm câu hỏi
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                        <DirectRight size={18} />
                        {submitting ? "Đang tạo..." : "Tạo bài tập"}
                    </button>
                </div>
            </div>
        </div>
    );
}