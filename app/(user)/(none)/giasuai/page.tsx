"use client";

import { useState, useRef, useEffect } from "react";
import Groq from "groq-sdk";
import ReactMarkdown from "react-markdown";

// Định nghĩa interface cho message
interface IMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

// Cấu hình Groq API
const API_KEY = "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";
const groq = new Groq({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});

// Model mạnh nhất trên Groq hiện tại
const MODEL_NAME = "llama-3.3-70b-versatile";

export default function ComputerScienceTutor() {
    const [messages, setMessages] = useState<IMessage[]>([
        {
            role: "assistant",
            content: "Chào em! Anh là **Gia sư Tin học AI (Groq Edition)**. Anh có thể giúp em giải bài tập lập trình cực nhanh. Hôm nay em muốn học gì?",
        },
    ]);
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: IMessage = { role: "user", content: input };
        const newMessages: IMessage[] = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            // Chuẩn bị danh sách tin nhắn cho Groq với đúng type
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một Gia sư Tin học chuyên nghiệp. Giải thích ngắn gọn, dễ hiểu, có ví dụ code. Ngôn ngữ: Tiếng Việt"
                    },
                    ...newMessages.map((msg): { role: "user" | "assistant" | "system"; content: string } => ({
                        role: msg.role === "user" ? "user" : msg.role === "assistant" ? "assistant" : "system",
                        content: msg.content
                    }))
                ],
                model: MODEL_NAME,
                temperature: 0.7,
                max_tokens: 2048,
            });

            const responseText = chatCompletion.choices[0]?.message?.content || "Không có phản hồi từ AI.";

            setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
        } catch (error) {
            console.error("Lỗi Groq API:", error);
            const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Lỗi rồi! ${errorMessage}\n\nKiểm tra lại API Key hoặc Model name nhé.` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
            {/* Header */}
            <header className="bg-orange-600 text-white p-4 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold">
                        IT
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Gia sư Tin học (Groq)</h1>
                        <p className="text-xs text-orange-100">Tốc độ siêu nhanh với Llama 3.3</p>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.role === "user"
                                ? "bg-orange-600 text-white rounded-tr-none"
                                : "bg-white border border-slate-200 rounded-tl-none"
                                }`}
                        >
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 animate-pulse text-slate-400 text-sm">
                            Gia sư Groq đang trả lời...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </main>

            {/* Input Area */}
            <footer className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        placeholder="Hỏi về code, thuật toán..."
                        className="flex-1 p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 disabled:bg-slate-400 transition-colors"
                    >
                        {isLoading ? "Đang gửi..." : "Gửi"}
                    </button>
                </form>
            </footer>
        </div>
    );
}