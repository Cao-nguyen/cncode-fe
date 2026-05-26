'use client'; // Cần thiết nếu dùng trong App Router của Next.js

import React, { useEffect, useState, useCallback } from 'react';
import { khuvuonApi } from '@/lib/api/khuvuon.api'; // Sửa lại path cho đúng project của bạn
import { IGarden, IQuestion } from '@/types/khuvuon.type';

export default function KhuVuonHocTap() {
    const [garden, setGarden] = useState<IGarden | null>(null);
    const [question, setQuestion] = useState<IQuestion | null>(null);
    const [loading, setLoading] = useState(false);

    // 1. Dùng useCallback để "ghi nhớ" hàm, tránh bị khởi tạo lại gây render lặp
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await khuvuonApi.getGarden();
            setGarden(res.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu vườn:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. useEffect gọi fetchData khi component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLearn = async () => {
        try {
            const res = await khuvuonApi.getQuestion();
            setQuestion(res.data);
        } catch (error) {
            alert("Không thể tải câu hỏi!");
        }
    };

    const handleAnswer = async (index: number) => {
        if (!question) return;
        try {
            const res = await khuvuonApi.submitAnswer(question._id, index);
            if (res.data.correct) {
                alert(`Đúng rồi! Bạn nhận được ${res.data.waterReceived}ml nước`);
                setQuestion(null);
                fetchData(); // Cập nhật lại số nước hiện có
            } else {
                alert("Sai rồi, hãy thử lại nhé!");
            }
        } catch (error) {
            alert("Lỗi khi gửi đáp án");
        }
    };

    const handleWatering = async () => {
        try {
            const res = await khuvuonApi.waterTree();
            setGarden(res.data.garden);
            if (res.data.bonusCoin > 0) {
                alert(`Chúc mừng! Cây đã lớn và bạn nhận được ${res.data.bonusCoin} xu!`);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Không đủ nước để tưới!");
        }
    };

    if (loading && !garden) return <div className="p-10 text-center">Đang tải khu vườn...</div>;
    if (!garden) return <div className="p-10 text-center">Không tìm thấy dữ liệu vườn.</div>;

    return (
        <div className="min-h-screen bg-green-50 p-8 flex flex-col items-center">
            {/* UI giữ nguyên như cũ */}
            <h1 className="text-3xl font-bold text-green-800 mb-8">Khu Vườn Học Tập</h1>

            <div className="flex gap-10 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-2 border-b-4 border-blue-200">
                    <span className="text-blue-500 font-bold">💧 Nước: {garden.water}ml</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-2 border-b-4 border-yellow-200">
                    <span className="text-yellow-600 font-bold">💰 Xu: {garden.totalCoins}</span>
                </div>
            </div>

            <div className="bg-white p-12 rounded-3xl shadow-2xl mb-8 border-4 border-green-200 relative">
                {/* Component TreeDisplay giữ như cũ */}
                <TreeDisplay stage={garden.stage} growth={garden.growth} />
            </div>

            <div className="flex gap-4">
                <button onClick={handleLearn} className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 shadow-lg active:scale-95 transition">
                    Học kiếm nước
                </button>
                <button onClick={handleWatering} className="px-6 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 shadow-lg active:scale-95 transition">
                    Tưới cây (-10ml)
                </button>
            </div>

            {/* Modal câu hỏi */}
            {question && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">{question.question}</h3>
                        <div className="grid gap-3">
                            {question.options.map((opt, i) => (
                                <button key={i} onClick={() => handleAnswer(i)} className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-left font-medium">
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setQuestion(null)} className="mt-6 text-gray-400 w-full text-center text-sm underline">Bỏ qua</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Giữ nguyên TreeDisplay
const TreeDisplay = ({ stage, growth }: { stage: number, growth: number }) => {
    return (
        <div className="relative flex flex-col items-center">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" className="transition-all duration-700">
                {stage === 1 && <path d="M12 22V18M12 18C10 18 8 16 8 14M12 18C14 18 16 16 16 14" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />}
                {stage === 2 && <g><path d="M12 22V10M12 15L7 12M12 12L17 9" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="8" r="2" fill="#22C55E" /></g>}
                {stage === 3 && <g><rect x="11" y="14" width="2" height="8" fill="#78350F" /><circle cx="12" cy="10" r="6" fill="#15803D" /><circle cx="9" cy="8" r="4" fill="#16A34A" /><circle cx="15" cy="8" r="4" fill="#16A34A" /></g>}
            </svg>
            <div className="w-64 bg-gray-200 rounded-full h-3 mt-6 overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${growth}%` }}></div>
            </div>
            <p className="text-sm font-bold text-green-700 mt-2">Trưởng thành: {growth}%</p>
        </div>
    );
};