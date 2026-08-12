'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Book, Check, CheckCircle, X } from 'lucide-react';
import { CNBOOKS_DATA } from '@/lib/data/cnbooks.data';
import { BookReader } from '@/components/cnbooks/BookReader';

interface CodeExercise {
    id: string;
    title: string;
    description: string;
    starterCode: string;
    solution: string;
    testCases: { input: string; expectedOutput: string }[];
    hints: string[];
    userCode: string;
    completed: boolean;
}

interface QuizQuestion {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    selectedAnswer: number | null;
}

export default function CnBookLessonPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const lesson = CNBOOKS_DATA.lessons.find((l) => l.slug === slug);
    const lessonIndex = CNBOOKS_DATA.lessons.findIndex((l) => l.slug === slug);

    const [panel, setPanel] = useState<'none' | 'exercises' | 'quiz'>('none');
    const [exercises, setExercises] = useState<CodeExercise[]>(lesson?.exercises || []);
    const [quiz, setQuiz] = useState<QuizQuestion[]>(
        lesson?.quiz.map((q) => ({ ...q, selectedAnswer: null })) || []
    );

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Book className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy bài học</h2>
                    <p className="text-gray-500 mt-2">Bài học bạn đang tìm kiếm không tồn tại</p>
                </div>
            </div>
        );
    }

    const prevLesson = lessonIndex > 0 ? CNBOOKS_DATA.lessons[lessonIndex - 1] : null;
    const nextLesson =
        lessonIndex < CNBOOKS_DATA.lessons.length - 1
            ? CNBOOKS_DATA.lessons[lessonIndex + 1]
            : null;

    const handleExerciseChange = (exerciseId: string, newCode: string) => {
        setExercises(
            exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, userCode: newCode } : ex
            )
        );
    };

    const checkExercise = (exerciseId: string) => {
        setExercises(
            exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, completed: true } : ex
            )
        );
    };

    const handleQuizAnswer = (questionIndex: number, optionIndex: number) => {
        setQuiz(
            quiz.map((q, i) =>
                i === questionIndex ? { ...q, selectedAnswer: optionIndex } : q
            )
        );
    };

    const submitQuiz = () => {
        const correctCount = quiz.reduce(
            (count, q) => count + (q.selectedAnswer === q.answerIndex ? 1 : 0),
            0
        );
        const score = (correctCount / quiz.length) * 100;
        alert(
            `Điểm quiz của bạn: ${score.toFixed(0)}% (${correctCount}/${quiz.length} câu đúng)`
        );
    };

    return (
        <>
            <BookReader
                lesson={lesson}
                bookTitle={CNBOOKS_DATA.book.title}
                onBack={() => router.push('/cnbooks')}
                onPrevLesson={
                    prevLesson
                        ? () => router.push(`/cnbooks/${prevLesson.slug}`)
                        : undefined
                }
                onNextLesson={
                    nextLesson
                        ? () => router.push(`/cnbooks/${nextLesson.slug}`)
                        : undefined
                }
                onOpenExercises={() => setPanel('exercises')}
                onOpenQuiz={() => setPanel('quiz')}
            />

            {panel !== 'none' && (
                <div className="fixed inset-0 z-[110] bg-black/40" onClick={() => setPanel('none')}>
                    <div
                        className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {panel === 'exercises'
                                    ? `Bài tập (${exercises.filter((e) => e.completed).length}/${exercises.length})`
                                    : `Quiz (${quiz.length} câu)`}
                            </h2>
                            <button
                                onClick={() => setPanel('none')}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            {panel === 'exercises' && (
                                <div className="space-y-6">
                                    {exercises.map((exercise, index) => (
                                        <div
                                            key={exercise.id}
                                            className="border border-gray-200 rounded-xl p-5"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                                        {index + 1}
                                                    </span>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {exercise.title}
                                                    </h3>
                                                </div>
                                                {exercise.completed && (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                )}
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4">
                                                {exercise.description}
                                            </p>

                                            <textarea
                                                value={exercise.userCode}
                                                onChange={(e) =>
                                                    handleExerciseChange(
                                                        exercise.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-36 p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
                                                placeholder="# Viết code của bạn ở đây..."
                                            />

                                            <div className="space-y-2 mb-3">
                                                {exercise.hints.map((hint, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-yellow-50 p-2 rounded text-xs text-gray-700"
                                                    >
                                                        💡 Gợi ý {idx + 1}: {hint}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => checkExercise(exercise.id)}
                                                disabled={exercise.completed}
                                                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                {exercise.completed ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Đã hoàn thành
                                                    </>
                                                ) : (
                                                    'Kiểm tra bài làm'
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {panel === 'quiz' && (
                                <div>
                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={submitQuiz}
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            Nộp bài
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {quiz.map((question, qIndex) => (
                                            <div
                                                key={qIndex}
                                                className="border-b border-gray-200 pb-5 last:border-0"
                                            >
                                                <h4 className="text-gray-900 font-medium mb-3 text-sm">
                                                    {qIndex + 1}. {question.question}
                                                </h4>
                                                <div className="space-y-2">
                                                    {question.options.map((option, oIndex) => (
                                                        <label
                                                            key={oIndex}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                                                                quiz[qIndex].selectedAnswer ===
                                                                oIndex
                                                                    ? 'bg-blue-50 border-2 border-blue-500'
                                                                    : 'hover:bg-gray-50 border border-transparent'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${qIndex}`}
                                                                checked={
                                                                    quiz[qIndex].selectedAnswer ===
                                                                    oIndex
                                                                }
                                                                onChange={() =>
                                                                    handleQuizAnswer(
                                                                        qIndex,
                                                                        oIndex
                                                                    )
                                                                }
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="text-gray-700">
                                                                {option}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {quiz[qIndex].selectedAnswer !== null && (
                                                    <div
                                                        className={`mt-3 p-3 rounded-lg text-xs ${
                                                            quiz[qIndex].selectedAnswer ===
                                                            question.answerIndex
                                                                ? 'bg-green-50 text-green-700'
                                                                : 'bg-red-50 text-red-700'
                                                        }`}
                                                    >
                                                        {quiz[qIndex].selectedAnswer ===
                                                        question.answerIndex
                                                            ? '✅ Đúng!'
                                                            : '❌ Sai!'}{' '}
                                                        {question.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
