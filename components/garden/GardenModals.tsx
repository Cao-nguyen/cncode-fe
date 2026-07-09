'use client';

import React, { useState, useEffect } from 'react';
import { X, Droplets, AlertCircle } from 'lucide-react';
import { Plant } from '@/types/garden.type';
import { CustomButton } from '@/components/custom/CustomButton';

// Get exercises from luyentap (simplified for demo - you can integrate with real API)
const getRandomQuestion = () => {
    const questions = [
        {
            question: "Trong JavaScript, kiểu dữ liệu nào dùng để lưu chuỗi ký tự?",
            options: ["number", "string", "boolean", "object"],
            correctAnswer: 1
        },
        {
            question: "Hàm nào dùng để in ra console trong JavaScript?",
            options: ["print()", "console.log()", "echo()", "write()"],
            correctAnswer: 1
        },
        {
            question: "CSS là viết tắt của gì?",
            options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
            correctAnswer: 1
        },
        {
            question: "HTML là viết tắt của gì?",
            options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
            correctAnswer: 0
        },
        {
            question: "Trong React, hook nào dùng để quản lý state?",
            options: ["useEffect", "useState", "useContext", "useMemo"],
            correctAnswer: 1
        }
    ];

    return questions[Math.floor(Math.random() * questions.length)];
};

// Add Plant Modal
export function AddPlantModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => void }) {
    const [plantName, setPlantName] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trồng cây mới</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tên cây của bạn
                    </label>
                    <input
                        type="text"
                        value={plantName}
                        onChange={(e) => setPlantName(e.target.value)}
                        placeholder="Ví dụ: Cây Kiến thức"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && plantName.trim()) {
                                onAdd(plantName);
                            }
                        }}
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Huỷ
                    </button>
                    <CustomButton
                        onClick={() => plantName.trim() && onAdd(plantName)}
                        disabled={!plantName.trim()}
                        className="flex-1"
                    >
                        Trồng cây
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}

// Water Plant Modal
export function WaterPlantModal({
    plant,
    availableWater,
    waterAmount,
    onWaterAmountChange,
    onWater,
    onClose
}: {
    plant: Plant;
    availableWater: number;
    waterAmount: number;
    onWaterAmountChange: (amount: number) => void;
    onWater: () => void;
    onClose: () => void;
}) {
    const maxWater = Math.min(availableWater, plant.waterRequired - plant.waterAmount);
    const progress = ((plant.waterAmount + waterAmount) / plant.waterRequired) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tưới nước</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Plant Info */}
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={`/garden/${plant.level}.png`}
                            alt={plant.name}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                                e.currentTarget.src = '/garden/placeholder.png';
                            }}
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{plant.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cấp {plant.level}</p>
                        </div>
                    </div>

                    {/* Progress Preview */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Sau khi tưới</span>
                            <span>{Math.min(plant.waterAmount + waterAmount, plant.waterRequired)}/{plant.waterRequired}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Water Amount Selector */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Số lượng nước
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Còn: {availableWater} <Droplets className="w-4 h-4 inline text-blue-500" />
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max={maxWater || 1}
                        value={waterAmount}
                        onChange={(e) => onWaterAmountChange(parseInt(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between mt-2">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{waterAmount}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Tối đa: {maxWater}</span>
                    </div>
                </div>

                {maxWater === 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {availableWater === 0
                                ? 'Bạn không có nước! Hãy trả lời câu hỏi để nhận nước.'
                                : 'Cây đã đủ nước để lên cấp!'}
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Huỷ
                    </button>
                    <CustomButton
                        onClick={onWater}
                        disabled={maxWater === 0}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Droplets className="w-4 h-4" />
                        Tưới nước
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}

// Quiz Modal
export function QuizModal({
    onClose,
    onSuccess,
    userId
}: {
    onClose: () => void;
    onSuccess: (waterEarned: number) => void;
    userId: string;
}) {
    const [question, setQuestion] = useState(getRandomQuestion());
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        const correct = selectedAnswer === question.correctAnswer;
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setTimeout(() => {
                const waterEarned = Math.floor(Math.random() * 3) + 3; // 3-5 nước
                onSuccess(waterEarned);
            }, 1500);
        }
    };

    const handleTryAgain = () => {
        setQuestion(getRandomQuestion());
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trả lời câu hỏi</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!showResult ? (
                    <>
                        {/* Question */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{question.question}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 mb-6">
                            {question.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedAnswer(index)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${selectedAnswer === index
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {selectedAnswer === index && (
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </div>
                                        <span className="text-gray-900 dark:text-white">{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <CustomButton
                            onClick={handleSubmit}
                            disabled={selectedAnswer === null}
                            className="w-full"
                        >
                            Trả lời
                        </CustomButton>
                    </>
                ) : (
                    <div className="text-center py-8">
                        {isCorrect ? (
                            <>
                                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Chính xác!</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Bạn nhận được nước để tưới cây 💧
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Chưa chính xác!</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    Đáp án đúng là: <span className="font-semibold">{question.options[question.correctAnswer]}</span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Hãy thử lại với câu hỏi khác</p>
                                <CustomButton onClick={handleTryAgain} className="w-full">
                                    Thử lại
                                </CustomButton>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}