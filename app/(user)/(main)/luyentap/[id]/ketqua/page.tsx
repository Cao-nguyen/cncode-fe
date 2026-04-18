"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectToken, updateUserStats } from "@/store/userSlice";
import { toast } from "sonner";
import Link from "next/link";
import {
    Refresh, Home, TickCircle, CloseCircle, ArrowDown2, ArrowUp2, Flash
} from "iconsax-react";
import type { SubmitResult, Question, GradedAnswer } from "@/types/exercise.types";

interface SpinResponse {
    reward: number;
    message?: string;
}

export default function KetQuaPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const dispatch = useDispatch();
    const token = useSelector(selectToken);
    const [result, setResult] = useState<SubmitResult | null>(null);
    const [expandedQ, setExpandedQ] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [spinReward, setSpinReward] = useState<number | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem(`result_${id}`);
        if (!stored) {
            router.push(`/luyentap/${id}`);
            return;
        }
        try {
            const parsedResult = JSON.parse(stored) as SubmitResult;
            setResult(parsedResult);
        } catch (error) {
            console.error("Failed to parse result:", error);
            router.push(`/luyentap/${id}`);
        }
    }, [id, router]);

    const handleSpin = async () => {
        if (!result || loading || hasSpun) return;
        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/exercises/submissions/${result.submissionId}/spin`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json() as SpinResponse;

            if (!response.ok) {
                throw new Error(data.message || "Spin failed");
            }

            const actualReward = data.reward;
            setSpinReward(actualReward);
            setHasSpun(true);

            if (actualReward > 0) {
                const userSafeStr = localStorage.getItem("user_safe");
                let currentCoins = 0;
                if (userSafeStr) {
                    const safeUser = JSON.parse(userSafeStr);
                    currentCoins = safeUser.cncoins;
                }
                dispatch(updateUserStats({ cncoins: currentCoins + actualReward }));
                toast.success(`🎉 Bạn nhận được ${actualReward} CNcoins!`, { duration: 5000 });
            } else {
                toast("Chúc bạn may mắn lần sau!", { icon: "😅" });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Lỗi khi nhận thưởng";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const percent = result.percentage;
    const grade = percent >= 90 ? { label: "Xuất sắc", color: "text-emerald-500", emoji: "🏆" }
        : percent >= 70 ? { label: "Giỏi", color: "text-blue-500", emoji: "🌟" }
            : percent >= 50 ? { label: "Trung bình", color: "text-yellow-500", emoji: "👍" }
                : { label: "Cần cố gắng", color: "text-red-500", emoji: "💪" };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const getAnswerDisplay = (q: Question, a: GradedAnswer | undefined) => {
        if (!a) return "Chưa có câu trả lời";

        switch (q.type) {
            case "multiple_choice":
                return q.multipleChoice?.options[a.selectedIndex ?? -1] || "Không có đáp án";
            case "multi_select":
                return a.selectedIndexes?.map((i: number) => q.multiSelect?.options[i]).join(", ") || "Chưa chọn";
            case "short_answer":
            case "essay":
                return a.textAnswer || "Chưa có câu trả lời";
            case "code":
                return a.code ? <code className="font-mono text-xs">{a.code.slice(0, 100)}...</code> : "Chưa có code";
            default:
                return "Không xác định";
        }
    };

    const getCorrectAnswer = (q: Question) => {
        if (!q.correctAnswer) return null;

        switch (q.type) {
            case "multiple_choice":
                return q.multipleChoice?.options[q.correctAnswer as number] || null;
            case "multi_select":
                const indexes = q.correctAnswer as number[];
                return indexes.map(i => q.multiSelect?.options[i]).join(", ");
            case "short_answer":
                return String(q.correctAnswer);
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <p className="text-5xl mb-3">{grade.emoji}</p>
                    <h1 className="text-2xl font-bold text-foreground mb-1">{grade.label}</h1>

                    <div className="relative w-32 h-32 mx-auto my-6">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="52" fill="none" stroke="currentColor"
                                strokeWidth="12" className="text-secondary" />
                            <circle cx="64" cy="64" r="52" fill="none" strokeWidth="12"
                                stroke="hsl(var(--primary))"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - percent / 100)}`}
                                className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-foreground">{percent}%</span>
                            <span className="text-xs text-muted-foreground">điểm</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                        <div>
                            <p className="text-xl font-bold text-foreground">{result.totalScore}</p>
                            <p>điểm đạt</p>
                        </div>
                        <div className="w-px bg-border" />
                        <div>
                            <p className="text-xl font-bold text-foreground">{result.maxScore}</p>
                            <p>điểm tối đa</p>
                        </div>
                        <div className="w-px bg-border" />
                        <div>
                            <p className="text-xl font-bold text-foreground">
                                {formatTime(result.timeTaken)}
                            </p>
                            <p>thời gian</p>
                        </div>
                    </div>
                </div>

                {result.isSpinnable && spinReward === null && !hasSpun && (
                    <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-background
                                   border border-primary/20 rounded-2xl p-6">
                        <div className="text-center">
                            <h2 className="font-bold text-foreground text-lg">🎁 Nhận thưởng</h2>
                            <p className="text-sm text-muted-foreground mt-1 mb-5">
                                Điểm của bạn đủ điều kiện! Bấm nút để nhận CNcoins
                            </p>
                            <button
                                onClick={handleSpin}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-8 py-3 mx-auto
                                           bg-gradient-to-r from-yellow-500 to-orange-500
                                           text-white font-bold rounded-xl hover:opacity-90
                                           disabled:opacity-50 transition text-sm"
                            >
                                <Flash size={16} variant="Bold" />
                                {loading ? "Đang xử lý..." : `Nhận thưởng (${result.spinReward} xu)`}
                            </button>
                        </div>
                    </div>
                )}

                {spinReward !== null && (
                    <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-background
                                   border border-primary/20 rounded-2xl p-6 text-center">
                        <p className="text-lg font-bold text-primary">
                            {spinReward > 0 ? `+${spinReward} CNcoins 🎉` : "Chúc bạn may mắn lần sau 😅"}
                        </p>
                    </div>
                )}

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="font-semibold text-foreground">Xem lại đáp án</h2>
                    </div>
                    <div className="divide-y divide-border">
                        {result.questions.map((q, i) => {
                            const a = result.answers[i];
                            const isOpen = expandedQ === i;
                            return (
                                <div key={i}>
                                    <button
                                        onClick={() => setExpandedQ(isOpen ? null : i)}
                                        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-secondary/50 transition"
                                    >
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${a?.isCorrect ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                            {a?.isCorrect
                                                ? <TickCircle size={16} variant="Bold" className="text-emerald-500" />
                                                : <CloseCircle size={16} variant="Bold" className="text-red-500" />
                                            }
                                        </span>
                                        <span className="text-sm text-foreground flex-1 line-clamp-1">
                                            Câu {i + 1}: {q.content}
                                        </span>
                                        <span className={`text-xs font-medium mr-2 ${a?.isCorrect ? "text-emerald-500" : "text-red-500"}`}>
                                            {a?.pointsEarned}/{q.points}đ
                                        </span>
                                        {isOpen ? <ArrowUp2 size={16} /> : <ArrowDown2 size={16} />}
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-5 space-y-3 bg-secondary/20">
                                            <p className="text-sm text-foreground font-medium pt-3">
                                                {q.content}
                                            </p>
                                            <div className={`text-sm px-3 py-2 rounded-lg border ${a?.isCorrect ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" : "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400"}`}>
                                                <span className="font-medium">Câu trả lời của bạn: </span>
                                                {getAnswerDisplay(q, a)}
                                            </div>
                                            {!a?.isCorrect && (
                                                (() => {
                                                    const correctAnswer = getCorrectAnswer(q);
                                                    return correctAnswer && (
                                                        <div className="text-sm px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                                                            <span className="font-medium">Đáp án đúng: </span>
                                                            {correctAnswer}
                                                        </div>
                                                    );
                                                })()
                                            )}
                                            {q.explanation && (
                                                <div className="text-sm px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-muted-foreground">
                                                    💡 {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href={`/luyentap/${id}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 py-3 border border-border
                                           rounded-xl text-sm hover:border-primary/40 transition">
                            <Refresh size={16} variant="Bold" /> Làm lại
                        </button>
                    </Link>
                    <Link href="/luyentap" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 py-3
                                           bg-primary text-primary-foreground rounded-xl text-sm
                                           font-semibold hover:bg-primary/90 transition">
                            <Home size={16} variant="Outline" /> Bài tập khác
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}