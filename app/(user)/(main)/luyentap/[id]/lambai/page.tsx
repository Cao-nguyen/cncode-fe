"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectToken } from "@/store/userSlice";
import { Exercise, Question } from "@/types/exercise";
import { toast } from "sonner";
import {
    Clock, ChevronLeft, ChevronRight, Send,
    Code, AlignLeft, Hash, ToggleLeft, CheckSquare
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

// ✅ FIX TYPE
type AnswerState = {
    selectedIndex?: number | null;
    selectedIndexes?: number[];
    textAnswer?: string | null;
    code?: string | null;
};

// ── Question renderers ────────────────────────────────────────────────────────

function MultipleChoice({ q, value, onChange }: {
    q: Question;
    value: number | undefined;
    onChange: (i: number) => void;
}) {
    return (
        <div className="space-y-2.5 mt-4">
            {q.multipleChoice!.options.map((opt, i) => (
                <button key={i} onClick={() => onChange(i)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border
                                transition-all text-sm
                                ${value === i
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card hover:border-primary/40 text-foreground"
                        }`}>
                    <span className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                                      text-xs font-bold transition-all
                                      ${value === i ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>
                        {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                </button>
            ))}
        </div>
    );
}

function MultiSelect({ q, values, onChange }: {
    q: Question;
    values: number[];
    onChange: (indexes: number[]) => void;
}) {
    const toggle = (i: number) => {
        onChange(values.includes(i) ? values.filter(x => x !== i) : [...values, i]);
    };
    return (
        <div className="space-y-2.5 mt-4">
            <p className="text-xs text-muted-foreground">Chọn tất cả đáp án đúng</p>
            {q.multiSelect!.options.map((opt, i) => (
                <button key={i} onClick={() => toggle(i)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border
                                transition-all text-sm
                                ${values.includes(i)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40"
                        }`}>
                    <span className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                                      ${values.includes(i) ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                        {values.includes(i) && <span className="text-primary-foreground text-[10px]">✓</span>}
                    </span>
                    {opt}
                </button>
            ))}
        </div>
    );
}

function ShortAnswer({ value, onChange, hint }: {
    value: string; onChange: (v: string) => void; hint?: string;
}) {
    return (
        <div className="mt-4">
            {hint && <p className="text-xs text-muted-foreground mb-2">Gợi ý: {hint}</p>}
            <input
                value={value}
                onChange={e => onChange(e.target.value.slice(0, 4))}
                maxLength={4}
                placeholder="Nhập 4 chữ số..."
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm
                           focus:outline-none focus:border-primary/50 text-center text-2xl font-bold
                           tracking-[0.5em] transition"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{value.length}/4</p>
        </div>
    );
}

function EssayAnswer({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="mt-4">
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Viết câu trả lời của bạn tại đây..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm
                           focus:outline-none focus:border-primary/50 resize-none transition"
            />
            <p className="text-xs text-muted-foreground text-right">{value.length} ký tự</p>
        </div>
    );
}

function CodeEditor({ value, onChange, language, starterCode }: {
    value: string; onChange: (v: string) => void;
    language: string; starterCode: string;
}) {
    const initialized = useRef(false);
    useEffect(() => {
        if (!initialized.current && !value && starterCode) {
            onChange(starterCode);
            initialized.current = true;
        }
    }, []);

    return (
        <div className="mt-4 rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-zinc-400 font-mono uppercase">{language}</span>
                <button onClick={() => onChange(starterCode)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition">
                    Reset
                </button>
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                spellCheck={false}
                className="w-full min-h-[280px] bg-zinc-950 text-zinc-100 font-mono text-sm
                           px-4 py-4 focus:outline-none resize-y leading-relaxed"
                style={{ tabSize: 2 }}
                onKeyDown={e => {
                    if (e.key === "Tab") {
                        e.preventDefault();
                        const el = e.currentTarget;
                        const start = el.selectionStart;
                        const end = el.selectionEnd;
                        const newVal = value.substring(0, start) + "  " + value.substring(end);
                        onChange(newVal);
                        requestAnimationFrame(() => {
                            el.selectionStart = el.selectionEnd = start + 2;
                        });
                    }
                }}
            />
        </div>
    );
}

export default function LamBaiPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const token = useSelector(selectToken);

    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const storageKey = `exercise_${id}`;

    useEffect(() => {
        if (!token) { router.push("/auth/login"); return; }
        fetch(`${API}/api/exercises/${id}`)
            .then(r => r.json())
            .then(data => {
                setExercise(data);

                const saved = sessionStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setAnswers(parsed.answers || {});
                    setCurrent(parsed.current || 0);
                    setTimeLeft(parsed.timeLeft ?? (data.timeLimit ? data.timeLimit * 60 : null));
                } else if (data.timeLimit) setTimeLeft(data.timeLimit * 60);
            })
            .catch(() => router.push("/luyen-tap"))
            .finally(() => setLoading(false));
    }, [id, token, router]);

    useEffect(() => {
        if (!exercise) return;
        sessionStorage.setItem(storageKey, JSON.stringify({ answers, current, timeLeft }));
    }, [answers, current, timeLeft, exercise]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, []);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(t);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [timeLeft]);

    const setAnswer = (index: number, value: Partial<AnswerState>) => {
        setAnswers(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                ...value
            }
        }));
    };

    const handleSubmit = useCallback(async () => {
        if (submitting || !exercise) return;
        setSubmitting(true);
        const toastId = toast.loading("Đang chấm bài...");

        const payload = exercise.questions.map((q, i) => {
            const a: AnswerState = answers[i] || {};
            return {
                selectedIndex: a.selectedIndex ?? null,
                selectedIndexes: a.selectedIndexes || [],
                textAnswer: a.textAnswer || null,
                code: a.code || null,
            };
        });

        try {
            const res = await fetch(`${API}/api/exercises/${id}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answers: payload, timeTaken: exercise.timeLimit ? (exercise.timeLimit * 60 - (timeLeft || 0)) : 0 }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Nộp bài thành công!", { id: toastId });
            sessionStorage.setItem(`result_${id}`, JSON.stringify(data));
            sessionStorage.removeItem(storageKey);
            router.push(`/luyen-tap/${id}/ket-qua`);
        } catch (err) {
            toast.error((err as { message?: string }).message || "Lỗi nộp bài", { id: toastId });
            setSubmitting(false);
        }
    }, [answers, exercise, id, token, timeLeft, submitting, router]);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!exercise) return null;

    const q = exercise.questions[current];
    const totalQ = exercise.questions.length;

    const isAnswered = (i: number) => {
        const a = answers[i];
        if (!a) return false;
        return (
            a.selectedIndex !== undefined ||
            (a.selectedIndexes && a.selectedIndexes.length > 0) ||
            a.textAnswer ||
            a.code
        );
    };

    const answeredCount = Object.keys(answers).filter(i => isAnswered(Number(i))).length;
    const mins = timeLeft !== null ? Math.floor(timeLeft / 60) : null;
    const secs = timeLeft !== null ? timeLeft % 60 : null;
    const isUrgent = timeLeft !== null && timeLeft < 60;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <h2 className="text-sm font-semibold text-foreground truncate max-w-[200px] md:max-w-sm">
                        {exercise.title}
                    </h2>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            {answeredCount}/{totalQ} đã trả lời
                        </span>
                        {timeLeft !== null && (
                            <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1.5
                                           rounded-lg border transition-colors
                                           ${isUrgent
                                    ? "border-red-500/30 bg-red-500/10 text-red-500"
                                    : "border-border bg-card text-foreground"
                                }`}>
                                <Clock className="w-3.5 h-3.5" />
                                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                            </div>
                        )}
                        <button onClick={handleSubmit} disabled={submitting}
                            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5
                                       bg-primary text-primary-foreground rounded-lg
                                       hover:bg-primary/90 disabled:opacity-50 transition">
                            <Send className="w-3.5 h-3.5" />
                            Nộp bài
                        </button>
                    </div>
                </div>
                <div className="h-1 bg-secondary">
                    <div className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((current + 1) / totalQ) * 100}%` }} />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-6">
                <div className="md:w-48 flex-shrink-0">
                    <div className="bg-card border border-border rounded-2xl p-4 sticky top-20">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Câu hỏi</p>
                        <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5">
                            {exercise.questions.map((_, i) => (
                                <button key={i} onClick={() => setCurrent(i)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                                               ${i === current
                                            ? "bg-primary text-primary-foreground"
                                            : isAnswered(i)
                                                ? "bg-primary/20 text-primary"
                                                : "bg-red-200 text-red-500"
                                        }`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                                Câu {current + 1}/{totalQ}
                            </span>
                            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full
                                            flex items-center gap-1">
                                {q.type === "multiple_choice" && <><ToggleLeft className="w-3 h-3" /> Trắc nghiệm</>}
                                {q.type === "multi_select" && <><CheckSquare className="w-3 h-3" /> Nhiều lựa chọn</>}
                                {q.type === "short_answer" && <><Hash className="w-3 h-3" /> Trả lời ngắn</>}
                                {q.type === "essay" && <><AlignLeft className="w-3 h-3" /> Tự luận</>}
                                {q.type === "code" && <><Code className="w-3 h-3" /> Lập trình</>}
                            </span>
                            <span className="text-xs text-primary ml-auto font-medium">
                                {q.points} điểm
                            </span>
                        </div>

                        <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                            {q.content}
                        </p>

                        {q.type === "multiple_choice" && (
                            <MultipleChoice q={q}
                                value={answers[current]?.selectedIndex ?? undefined}
                                onChange={(i) => setAnswer(current, { selectedIndex: i })}
                            />
                        )}
                        {q.type === "multi_select" && (
                            <MultiSelect q={q}
                                values={answers[current]?.selectedIndexes || []}
                                onChange={(idxs) => setAnswer(current, { selectedIndexes: idxs })}
                            />
                        )}
                        {q.type === "short_answer" && (
                            <ShortAnswer
                                value={answers[current]?.textAnswer || ""}
                                onChange={(v) => setAnswer(current, { textAnswer: v })}
                                hint={q.shortAnswer?.hint}
                            />
                        )}
                        {q.type === "essay" && (
                            <EssayAnswer
                                value={answers[current]?.textAnswer || ""}
                                onChange={(v) => setAnswer(current, { textAnswer: v })}
                            />
                        )}
                        {q.type === "code" && (
                            <CodeEditor
                                value={answers[current]?.code || ""}
                                onChange={(v) => setAnswer(current, { code: v })}
                                language={q.code?.language || "javascript"}
                                starterCode={q.code?.starterCode || ""}
                            />
                        )}
                    </div>

                    <div className="flex justify-between mt-4">
                        <button onClick={() => setCurrent(p => Math.max(0, p - 1))}
                            disabled={current === 0}
                            className="flex items-center gap-1.5 text-sm px-4 py-2.5 border border-border
                                       rounded-xl disabled:opacity-40 hover:border-primary/40 transition">
                            <ChevronLeft className="w-4 h-4" />
                            Câu trước
                        </button>
                        {current < totalQ - 1 ? (
                            <button onClick={() => setCurrent(p => p + 1)}
                                className="flex items-center gap-1.5 text-sm px-4 py-2.5
                                           bg-primary text-primary-foreground rounded-xl
                                           hover:bg-primary/90 transition">
                                Câu tiếp
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={submitting}
                                className="flex items-center gap-1.5 text-sm px-5 py-2.5
                                           bg-primary text-primary-foreground rounded-xl font-semibold
                                           hover:bg-primary/90 disabled:opacity-50 transition">
                                <Send className="w-4 h-4" />
                                Nộp bài
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}