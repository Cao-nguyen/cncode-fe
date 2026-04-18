"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectToken, selectUser, updateUserStats } from "@/store/userSlice";
import { Exercise, Question, UserAnswer } from "@/types/exercise.types";
import { toast } from "sonner";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    Element4,
    Card,
    Hashtag,
    DocumentText,
    Code,
    Eye,
    EyeSlash,
} from "iconsax-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const typeIcons: Record<string, React.ReactNode> = {
    multiple_choice: <Element4 size={18} variant="Outline" />,
    multi_select: <Card size={18} variant="Outline" />,
    short_answer: <Hashtag size={18} variant="Outline" />,
    essay: <DocumentText size={18} variant="Outline" />,
    code: <Code size={18} variant="Outline" />,
};

export default function LamBaiPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const dispatch = useDispatch();
    const token = useSelector(selectToken);
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }
        fetchExercise();
    }, [id, token]);

    const fetchExercise = async () => {
        try {
            const res = await fetch(`${API}/api/exercises/${id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setExercise(data);
            if (data.timeLimit) {
                setTimeLeft(data.timeLimit * 60);
            }
        } catch (error) {
            toast.error("Không thể tải bài tập");
            router.push("/luyentap");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = useCallback(async () => {
        if (submitting || !exercise) return;

        const unansweredCount = exercise.questions.filter((_, i) => !answers[i]).length;
        if (unansweredCount > 0) {
            if (!confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Vẫn nộp bài?`)) {
                return;
            }
        }

        setSubmitting(true);
        const toastId = toast.loading("Đang chấm điểm...");

        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const answerList = exercise.questions.map((_, i) => answers[i] || {});

        try {
            const res = await fetch(`${API}/api/exercises/${id}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    answers: answerList,
                    timeTaken,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            if (data.currentCoins !== undefined) {
                dispatch(updateUserStats({ cncoins: data.currentCoins }));
            }

            sessionStorage.setItem(`result_${id}`, JSON.stringify(data));
            toast.success("Nộp bài thành công!", { id: toastId });
            router.push(`/luyentap/${id}/ketqua`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Lỗi khi nộp bài";
            toast.error(message, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    }, [answers, exercise, id, token, startTime, submitting, dispatch, router]);

    useEffect(() => {
        if (!timeLeft || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev && prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleSubmit]);

    const handleAnswer = useCallback((index: number, answer: UserAnswer) => {
        setAnswers((prev) => ({ ...prev, [index]: answer }));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!exercise) return null;

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        href={`/luyentap/${id}`}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft size={20} variant="Outline" />
                    </Link>
                    <h1 className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {exercise.title}
                    </h1>
                    {timeLeft !== null && (
                        <div
                            className={`flex items-center gap-1 text-sm font-mono ${timeLeft < 60 ? "text-red-500" : "text-muted-foreground"
                                }`}
                        >
                            <Clock size={16} variant="Outline" />
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {exercise.questions.map((q, idx) => (
                    <QuestionCard
                        key={idx}
                        question={q}
                        index={idx}
                        answer={answers[idx]}
                        onAnswer={(answer) => handleAnswer(idx, answer)}
                    />
                ))}

                <div className="sticky bottom-4">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                        {submitting ? "Đang nộp bài..." : "Nộp bài"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function QuestionCard({
    question,
    index,
    answer,
    onAnswer,
}: {
    question: Question;
    index: number;
    answer?: UserAnswer;
    onAnswer: (answer: UserAnswer) => void;
}) {
    const [showHint, setShowHint] = useState(false);

    const renderInput = () => {
        switch (question.type) {
            case "multiple_choice":
                return (
                    <div className="space-y-2">
                        {question.multipleChoice?.options.map((opt, i) => (
                            <label
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name={`q${index}`}
                                    checked={answer?.type === "multiple_choice" && answer.selectedIndex === i}
                                    onChange={() =>
                                        onAnswer({ type: "multiple_choice", selectedIndex: i })
                                    }
                                    className="accent-primary"
                                />
                                <span className="text-sm">{opt}</span>
                            </label>
                        ))}
                    </div>
                );

            case "multi_select":
                return (
                    <div className="space-y-2">
                        {question.multiSelect?.options.map((opt, i) => (
                            <label
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        answer?.type === "multi_select" &&
                                        answer.selectedIndexes?.includes(i)
                                    }
                                    onChange={(e) => {
                                        const current =
                                            answer?.type === "multi_select" && answer.selectedIndexes
                                                ? answer.selectedIndexes
                                                : [];
                                        const newSelected = e.target.checked
                                            ? [...current, i]
                                            : current.filter((x) => x !== i);
                                        onAnswer({ type: "multi_select", selectedIndexes: newSelected });
                                    }}
                                    className="accent-primary"
                                />
                                <span className="text-sm">{opt}</span>
                            </label>
                        ))}
                    </div>
                );

            case "short_answer":
                return (
                    <input
                        type="text"
                        value={answer?.type === "short_answer" ? answer.textAnswer : ""}
                        onChange={(e) =>
                            onAnswer({ type: "short_answer", textAnswer: e.target.value })
                        }
                        placeholder="Nhập câu trả lời..."
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50"
                    />
                );

            case "essay":
                return (
                    <textarea
                        rows={6}
                        value={answer?.type === "essay" ? answer.textAnswer : ""}
                        onChange={(e) =>
                            onAnswer({ type: "essay", textAnswer: e.target.value })
                        }
                        placeholder="Viết câu trả lời của bạn tại đây..."
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 resize-none"
                    />
                );

            case "code":
                return (
                    <div className="space-y-3">
                        <div className="bg-secondary/50 rounded-xl p-4">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                                {question.code?.starterCode}
                            </pre>
                        </div>
                        <textarea
                            rows={10}
                            value={answer?.type === "code" ? answer.code : ""}
                            onChange={(e) => onAnswer({ type: "code", code: e.target.value })}
                            placeholder="Viết code của bạn tại đây..."
                            className="w-full px-4 py-3 font-mono text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                            Câu {index + 1}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {typeIcons[question.type]}
                            {question.points} điểm
                        </span>
                    </div>
                    {question.shortAnswer?.hint && (
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="text-muted-foreground hover:text-primary"
                        >
                            {showHint ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>

                <p className="text-foreground mb-4 whitespace-pre-wrap">{question.content}</p>

                {showHint && question.shortAnswer?.hint && (
                    <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-muted-foreground">
                        💡 Gợi ý: {question.shortAnswer.hint}
                    </div>
                )}

                {renderInput()}
            </div>
        </div>
    );
}