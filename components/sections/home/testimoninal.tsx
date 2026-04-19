"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Comment {
    name: string;
    content: string;
    rating: number;
    avatar?: string;
}

const initialComments: Comment[] = [
    { name: "User #1023", content: "Khoá học rất hay, dễ hiểu và thực tế 🔥", rating: 5, avatar: "" },
    { name: "User #2045", content: "Nội dung rõ ràng, dễ áp dụng.", rating: 5, avatar: "" },
];

const MAX = 15;

export default function Testimonial() {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [index, setIndex] = useState(0);

    const visibleComments = useMemo(() => comments.slice(0, MAX), [comments]);

    const normalizedIndex = useMemo(() => {
        if (visibleComments.length === 0) return 0;
        return Math.min(Math.max(index, 0), visibleComments.length - 1);
    }, [visibleComments.length, index]);

    const activeComment = visibleComments[normalizedIndex] ?? null;
    const hasComments = visibleComments.length > 0;

    const handleSubmit = () => {
        const trimmed = content.trim();
        if (!trimmed) return;

        const newComment: Comment = {
            name: `User #${Math.floor(1000 + Math.random() * 9000)}`,
            content: trimmed,
            rating,
            avatar: "/images/avatar.png",
        };

        setComments((prev) => [newComment, ...prev].slice(0, 100));
        setContent("");
        setRating(5);
        setIndex(0);
    };

    const handlePrev = () => {
        if (!hasComments) return;
        setIndex((prev) => (prev <= 0 ? visibleComments.length - 1 : prev - 1));
    };

    const handleNext = () => {
        if (!hasComments) return;
        setIndex((prev) => (prev + 1) % visibleComments.length);
    };

    return (
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="p-6 rounded-3xl border border-[#e6e6e6] dark:border-[#222] bg-white dark:bg-[#171717] flex flex-col gap-5">
                <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Đánh giá</p>
                    <h2 className="text-2xl font-semibold">Hãy cho chúng tôi biết cảm nhận của bạn</h2>
                </div>

                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                        <button key={v} onClick={() => setRating(v)} className="transition-transform duration-200 hover:-translate-y-1">
                            <Star
                                size={28}
                                className={`transition-all ${v <= rating ? "text-yellow-400 scale-110" : "text-gray-300 dark:text-gray-500"}`}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    maxLength={320}
                    placeholder="Nhập cảm nhận của bạn..."
                    className="w-full p-4 rounded-2xl border border-[#e6e6e6] dark:border-[#222] bg-white dark:bg-[#111] text-sm text-gray-800 dark:text-gray-100 outline-none resize-none focus:border-black dark:focus:border-white"
                />

                <button
                    onClick={handleSubmit}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium transition hover:opacity-90"
                >
                    Gửi đánh giá
                </button>
            </section>

            <section className="relative min-h-80 rounded-3xl border border-[#e6e6e6] dark:border-[#222] bg-white dark:bg-[#171717] p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Đã có {visibleComments.length} đánh giá</p>
                        <h3 className="text-xl font-semibold">Cảm nhận của người dùng</h3>
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={!hasComments}
                            className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:opacity-40"
                        >
                            ←
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!hasComments}
                            className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:opacity-40"
                        >
                            →
                        </button>
                    </div>
                </div>

                <div className="flex-1 rounded-[28px] bg-[#f8f8f8] dark:bg-[#111] p-6 shadow-sm">
                    {activeComment ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={activeComment.avatar ?? "/images/avatar.png"} />
                                    <AvatarFallback>{activeComment.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{activeComment.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        {Array.from({ length: activeComment.rating }).map((_, i) => (
                                            <Star key={i} size={16} className="text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400 break-words">{activeComment.content}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Chưa có đánh giá nào.</p>
                    )}
                </div>

                <div className="mt-6 flex justify-center">
                    <div className="flex gap-2 overflow-x-auto px-1 py-1">
                        {visibleComments.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`w-6 h-2 rounded-full transition ${i === normalizedIndex ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}