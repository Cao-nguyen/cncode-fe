'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { CustomButton } from '../custom/CustomButton';
import RichContent from './RichContent';

interface QuizQuestion {
    time: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question: string;
    options?: string[];
    correctAnswer?: number;
    correctAnswers?: string[];
    score: number;
    explanation?: string;
}

interface QuizPopupProps {
    question: QuizQuestion;
    answer: string | null;
    answered: boolean;
    correct: boolean | null;
    onAnswerChange: (answer: string) => void;
    onSubmit: () => void;
    onContinue: () => void;
}

export default function QuizPopup({
    question,
    answer,
    answered,
    correct,
    onAnswerChange,
    onSubmit,
    onContinue
}: QuizPopupProps) {
    // True-False state: Record letter -> boolean (true/false/null)
    const [tfAnswers, setTfAnswers] = useState<Record<string, boolean | null>>({});

    // Short-answer state: array of single characters
    const [shortAnswerChars, setShortAnswerChars] = useState<string[]>(() => {
        if (question.type === 'short-answer' && question.correctAnswers && question.correctAnswers.length > 0) {
            const answerLength = question.correctAnswers[0].length;
            return new Array(answerLength).fill('');
        }
        return [];
    });
    const inputRefs = useRef<(HTMLInputElement | null)[]>(
        question.type === 'short-answer' && question.correctAnswers && question.correctAnswers.length > 0
            ? new Array(question.correctAnswers[0].length).fill(null)
            : []
    );

    // Handle true-false selection
    const handleTfChange = (letter: string, value: boolean) => {
        const newAnswers = { ...tfAnswers, [letter]: value };
        setTfAnswers(newAnswers);

        // Build answer string: "a:true,b:false,c:true,d:false"
        const answerStr = Object.entries(newAnswers)
            .filter(([, v]) => v !== null)
            .map(([k, v]) => `${k}:${v}`)
            .join(',');
        onAnswerChange(answerStr);
    };

    // Handle short-answer character input
    const handleCharChange = (index: number, value: string) => {
        // Only allow single character, number, -, or ,
        if (value.length > 1) return;
        if (value && !/^[0-9a-zA-Z\-,]$/.test(value)) return;

        const newChars = [...shortAnswerChars];
        newChars[index] = value;
        setShortAnswerChars(newChars);
        const fullAnswer = newChars.join('');
        onAnswerChange(fullAnswer);

        // Auto-focus next input
        if (value && index < shortAnswerChars.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace to go to previous input
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !shortAnswerChars[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                {/* Popup */}
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">Câu hỏi trong video</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Hãy trả lời câu hỏi để tiếp tục xem video
                        </p>
                    </div>

                    {/* Question */}
                    <div className="p-6">
                        <div className="text-base text-gray-900 mb-6 leading-relaxed">
                            <RichContent content={question.question} />
                        </div>

                        {/* Multiple Choice */}
                        {question.type === 'multiple-choice' && question.options && (
                            <div className="space-y-3">
                                {question.options.map((opt, i) => {
                                    const letter = opt.charAt(0);
                                    const text = opt.slice(opt.indexOf(' ') + 1);
                                    const isSelected = answer === letter;
                                    const isCorrectAnswer = answered && question.correctAnswers?.includes(letter);
                                    const isWrongAnswer = answered && isSelected && !isCorrectAnswer;

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (!answered) {
                                                    onAnswerChange(letter);
                                                }
                                            }}
                                            disabled={answered}
                                            className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${answered
                                                ? isCorrectAnswer
                                                    ? 'border-green-500 bg-green-50'
                                                    : isWrongAnswer
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 bg-gray-50'
                                                : isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            <span
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 ${answered
                                                    ? isCorrectAnswer
                                                        ? 'bg-green-500 text-white'
                                                        : isWrongAnswer
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-gray-200 text-gray-600'
                                                    : isSelected
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {letter.toUpperCase()}
                                            </span>
                                            <span className="flex-1 text-gray-900">
                                                <RichContent content={text} />
                                            </span>
                                            {answered && isCorrectAnswer && (
                                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                            )}
                                            {answered && isWrongAnswer && (
                                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* True-False */}
                        {question.type === 'true-false' && question.options && (
                            <div className="space-y-3">
                                {question.options.map((opt, i) => {
                                    const letter = opt.charAt(0).toLowerCase();
                                    const text = opt.slice(opt.indexOf(' ') + 1);
                                    const userAnswer = tfAnswers[letter];

                                    // Parse correct answer from correctAnswers array
                                    let correctValue: boolean | null = null;
                                    const correctAnswers = question.correctAnswers || [];
                                    
                                    if (correctAnswers[0]?.includes(':')) {
                                        // Format: ["a:true", "b:false", "c:true", "d:false"]
                                        const correctAnswerEntry = correctAnswers.find(ca => ca.startsWith(`${letter}:`));
                                        correctValue = correctAnswerEntry ? correctAnswerEntry.split(':')[1] === 'true' : null;
                                    } else if (correctAnswers.length < 4 && !correctAnswers[0]?.includes('true') && !correctAnswers[0]?.includes('false')) {
                                        // Format: ["a", "b"] - only letters of correct answers
                                        correctValue = correctAnswers.includes(letter);
                                    } else {
                                        // Format: ["true", "true", "false", "false"] - direct boolean array
                                        if (i < correctAnswers.length) {
                                            correctValue = correctAnswers[i] === 'true';
                                        }
                                    }

                                    const isCorrect = answered && userAnswer === correctValue;
                                    const isWrong = answered && userAnswer !== null && userAnswer !== correctValue;

                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all ${answered
                                                ? isCorrect
                                                    ? 'border-green-500 bg-green-50'
                                                    : isWrong
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 bg-gray-50'
                                                : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold shrink-0">
                                                    {letter.toUpperCase()}
                                                </span>
                                                <div className="flex-1 text-gray-900">
                                                    <RichContent content={text} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => !answered && handleTfChange(letter, true)}
                                                    disabled={answered}
                                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${answered
                                                        ? correctValue === true
                                                            ? 'bg-green-500 text-white'
                                                            : userAnswer === true
                                                                ? 'bg-red-500 text-white'
                                                                : 'bg-gray-200 text-gray-500'
                                                        : userAnswer === true
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    Đúng
                                                </button>
                                                <button
                                                    onClick={() => !answered && handleTfChange(letter, false)}
                                                    disabled={answered}
                                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${answered
                                                        ? correctValue === false
                                                            ? 'bg-green-500 text-white'
                                                            : userAnswer === false
                                                                ? 'bg-red-500 text-white'
                                                                : 'bg-gray-200 text-gray-500'
                                                        : userAnswer === false
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    Sai
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Short Answer - Multiple single-char inputs */}
                        {question.type === 'short-answer' && (
                            <div className="flex gap-2 justify-center">
                                {shortAnswerChars.map((char, i) => (
                                    <input
                                        key={i}
                                        ref={el => { inputRefs.current[i] = el; }}
                                        type="text"
                                        value={char}
                                        onChange={(e) => !answered && handleCharChange(i, e.target.value)}
                                        onKeyDown={(e) => !answered && handleKeyDown(i, e)}
                                        disabled={answered}
                                        maxLength={1}
                                        className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none transition-all ${answered
                                            ? correct
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-red-500 bg-red-50 text-red-700'
                                            : char
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Result */}
                        {answered && correct !== null && (
                            <div
                                className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${correct ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                                    }`}
                            >
                                {correct ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold ${correct ? 'text-green-900' : 'text-red-900'}`}>
                                        {correct ? 'Chính xác!' : 'Chưa chính xác'}
                                    </p>
                                    {question.explanation && (
                                        <div className={`text-sm mt-1 ${correct ? 'text-green-700' : 'text-red-700'}`}>
                                            <RichContent content={question.explanation} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200">
                        {!answered ? (
                            <CustomButton
                                onClick={onSubmit}
                                variant="primary"
                                size="large"
                                className="w-full"
                                disabled={!answer}
                            >
                                Kiểm tra kết quả
                            </CustomButton>
                        ) : (
                            <CustomButton
                                onClick={onContinue}
                                variant="primary"
                                size="large"
                                className="w-full"
                            >
                                Tiếp tục xem video
                            </CustomButton>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}