
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cnbookApi } from '@/lib/api/cnbook.api';
import { Book, Section, Lesson, Exercise } from '@/types/cnbook.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { toast } from 'sonner';
import {
    ArrowLeft, BookOpen, Menu, X, Home,
    ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
    Trophy, Brain, CheckCircle, XCircle, Zap
} from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';

interface ExerciseItemProps {
    exercise: Exercise;
    onAnswer: (exerciseId: string, answer: string | number | boolean) => void;
    userAnswer?: string | number | boolean;
}

const ExerciseItem = ({ exercise, onAnswer, userAnswer }: ExerciseItemProps) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | number | boolean | null>(null);
    const [shortAnswer, setShortAnswer] = useState<string>('');

    const checkLogic = (val: string | number | boolean): boolean => {
        if (exercise.type === 'multiple_choice' || exercise.type === 'true_false') {
            return String(val) === String(exercise.correctAnswer);
        }
        return String(val).toLowerCase().trim() === String(exercise.correctAnswer).toLowerCase().trim();
    };

    const submitted = userAnswer !== undefined && userAnswer !== null;
    const isCorrect = submitted ? checkLogic(userAnswer) : false;

    if (submitted && exercise.type === 'short_answer' && shortAnswer !== String(userAnswer)) {
        
        setShortAnswer(String(userAnswer));
    }

    if (submitted && exercise.type !== 'short_answer' && selectedAnswer !== userAnswer) {
        setSelectedAnswer(userAnswer);
    }

    if (!submitted && (selectedAnswer !== null || shortAnswer !== '')) {
        setSelectedAnswer(null);
        setShortAnswer('');
    }

    const handleSubmit = () => {
        let answer: string | number | boolean | null = null;

        if (exercise.type === 'multiple_choice' || exercise.type === 'true_false') {
            if (selectedAnswer === null) {
                toast.error('Vui lòng chọn đáp án');
                return;
            }
            answer = selectedAnswer;
        } else {
            if (!shortAnswer.trim()) {
                toast.error('Vui lòng nhập đáp án');
                return;
            }
            answer = shortAnswer.trim();
        }
        onAnswer(exercise._id, answer);
    };

    const getDifficultyColor = (): string => {
        if (exercise.points <= 1) return 'bg-green-100 text-green-700';
        if (exercise.points <= 2) return 'bg-yellow-100 text-yellow-700';
        return 'bg-orange-100 text-orange-700';
    };

    return (
        <div className={`rounded-xl border-2 overflow-hidden transition-all duration-300 mb-4 ${submitted ? (isCorrect ? 'border-green-400 shadow-sm' : 'border-red-400 shadow-sm') : 'border-gray-200'
            }`}>
            <div className={`px-5 py-3 flex items-center justify-between ${submitted ? (isCorrect ? 'bg-green-50' : 'bg-red-50') : 'bg-gray-50'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getDifficultyColor()}`}>
                        <Brain className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Bài tập ({exercise.points} điểm)</span>
                </div>
                {submitted && (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isCorrect ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG'}
                    </div>
                )}
            </div>

            <div className="p-5 bg-white">
                <p className="text-gray-800 font-medium mb-4">{exercise.question}</p>

                {exercise.type === 'multiple_choice' && exercise.options && (
                    <div className="space-y-2 mb-4">
                        {exercise.options.map((opt: string, idx: number) => {
                            const isCorrectIdx = submitted && String(idx) === String(exercise.correctAnswer);
                            const isSelectedIdx = String(selectedAnswer) === String(idx);

                            let optionClass = "border-2 rounded-lg p-3 cursor-pointer transition-all flex items-center gap-3 ";
                            if (isCorrectIdx) optionClass += "border-green-400 bg-green-50";
                            else if (submitted && isSelectedIdx) optionClass += "border-red-400 bg-red-50";
                            else if (isSelectedIdx) optionClass += "border-blue-400 bg-blue-50";
                            else optionClass += "border-gray-100 hover:bg-gray-50";

                            return (
                                <label key={idx} className={optionClass}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        onChange={() => !submitted && setSelectedAnswer(idx)}
                                        disabled={submitted}
                                    />
                                    <span className="font-bold text-gray-700">{String.fromCharCode(65 + idx)}.</span>
                                    <span className="flex-1 text-sm">{opt}</span>
                                    {isCorrectIdx && <CheckCircle className="w-5 h-5 text-green-500" />}
                                </label>
                            );
                        })}
                    </div>
                )}

                {exercise.type === 'true_false' && (
                    <div className="flex gap-4 mb-4">
                        {[true, false].map((val) => {
                            const isCorrectVal = submitted && String(val) === String(exercise.correctAnswer);
                            const isSelectedVal = selectedAnswer === val;

                            let tfClass = "flex-1 border-2 rounded-lg p-3 cursor-pointer transition-all text-center font-bold ";
                            if (isCorrectVal) tfClass += "border-green-400 bg-green-50 text-green-700";
                            else if (submitted && isSelectedVal) tfClass += "border-red-400 bg-red-50 text-red-700";
                            else if (isSelectedVal) tfClass += "border-blue-400 bg-blue-50 text-blue-700";
                            else tfClass += "border-gray-100 text-gray-400";

                            return (
                                <label key={String(val)} className={tfClass}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        onChange={() => !submitted && setSelectedAnswer(val)}
                                        disabled={submitted}
                                    />
                                    {val ? '✅ ĐÚNG' : '❌ SAI'}
                                </label>
                            );
                        })}
                    </div>
                )}

                {exercise.type === 'short_answer' && (
                    <input
                        type="text"
                        value={shortAnswer}
                        onChange={(e) => setShortAnswer(e.target.value)}
                        placeholder="Nhập đáp án..."
                        disabled={submitted}
                        className={`w-full px-4 py-3 border-2 rounded-xl outline-none mb-4 ${submitted ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-gray-200 focus:border-blue-400'
                            }`}
                    />
                )}

                {!submitted && (
                    <CustomButton onClick={handleSubmit} className="w-full sm:w-auto">
                        <Zap className="w-4 h-4 mr-2" /> Kiểm tra đáp án
                    </CustomButton>
                )}

                {submitted && exercise.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-gray-600">
                        <span className="font-bold text-blue-700 block mb-1">Giải thích:</span>
                        <StaticContent content={exercise.explanation} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default function LearnCNBookPage() {
    const params = useParams();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [userAnswers, setUserAnswers] = useState<Record<string, string | number | boolean>>({});
    const [progressPercent, setProgressPercent] = useState<number>(0);

    useEffect(() => {
        fetchData();
    }, [params.slug]);

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        try {
            const bookRes = await cnbookApi.getBookBySlug(params.slug as string);
            if (!bookRes.success) {
                router.push('/cnbooks');
                return;
            }
            setBook(bookRes.data);

            const progressRes = await cnbookApi.getUserProgress(bookRes.data._id);
            if (progressRes.success && progressRes.data) {
                const answersMap: Record<string, string | number | boolean> = {};
                progressRes.data.exerciseAnswers?.forEach((item: { exerciseId: string; answer: string | number | boolean }) => {
                    answersMap[item.exerciseId] = item.answer;
                });
                setUserAnswers(answersMap);

                const allLessons = bookRes.data.sections.flatMap((s: Section) => s.lessons);
                const totalEx = allLessons.reduce((acc: number, l: Lesson) => acc + (l.exercises?.length || 0), 0);
                const doneEx = Object.keys(answersMap).length;
                setProgressPercent(totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0);

                let targetLesson: Lesson | null = null;
                if (progressRes.data.lastLessonId) {
                    targetLesson = allLessons.find((l: Lesson) => l._id === progressRes.data.lastLessonId) || null;
                }
                setCurrentLesson(targetLesson || allLessons[0] || null);
            }
        } catch (error) {
            toast.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (exerciseId: string, answer: string | number | boolean): Promise<void> => {
        if (!book || !currentLesson) return;

        try {
            const res = await cnbookApi.saveExerciseAnswer(book._id, exerciseId, answer);
            if (res.success) {
                const newAnswers = { ...userAnswers, [exerciseId]: answer };
                setUserAnswers(newAnswers);

                const allLessons = book.sections.flatMap((s: Section) => s.lessons);
                const totalEx = allLessons.reduce((acc: number, l: Lesson) => acc + (l.exercises?.length || 0), 0);
                const doneEx = Object.keys(newAnswers).length;
                const newPercent = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0;

                setProgressPercent(newPercent);
                await cnbookApi.updateProgress(book._id, currentLesson._id, newPercent);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!book) return null;

    const allLessons = book.sections.flatMap((s: Section) => s.lessons);
    const currentIndex = allLessons.findIndex((l: Lesson) => l._id === currentLesson?._id);

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {}
            <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-50 rounded-lg">
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link href="/cnbooks" className="text-gray-400 hover:text-blue-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-gray-800 truncate text-sm uppercase">{book.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-[11px] font-bold text-blue-700 border border-blue-100">
                        <Trophy className="w-3 h-3" /> {progressPercent}%
                    </div>
                    <Link href="/">
                        <Home className="w-5 h-5 text-gray-400" />
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {}
                <aside className={`fixed lg:static top-0 left-0 h-full w-80 bg-white border-r border-gray-100 z-[60] transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}>
                    <div className="p-5 border-b border-gray-50 flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-gray-800">Mục lục</h2>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                        {book.sections.map((section: Section, idx: number) => (
                            <div key={section._id} className="mb-4">
                                <h3 className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase">
                                    Phần {idx + 1}: {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.lessons.map((lesson: Lesson, lIdx: number) => (
                                        <button
                                            key={lesson._id}
                                            onClick={() => {
                                                setCurrentLesson(lesson);
                                                setSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${currentLesson?._id === lesson._id
                                                ? 'bg-blue-600 text-white font-bold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentLesson?._id === lesson._id ? 'bg-white/20' : 'bg-gray-100'
                                                }`}>
                                                {lIdx + 1}
                                            </span>
                                            <span className="truncate">{lesson.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {}
                <main className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
                    <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                        <div className="max-w-3xl mx-auto pb-20">
                            {currentLesson ? (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-bold text-gray-800">{currentLesson.title}</h2>

                                    {currentLesson.content && (
                                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                            <StaticContent content={currentLesson.content} />
                                        </div>
                                    )}

                                    {currentLesson.exercises && currentLesson.exercises.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center py-6">
                                                Luyện tập
                                            </h3>
                                            {currentLesson.exercises.map((ex: Exercise) => (
                                                <ExerciseItem
                                                    key={ex._id}
                                                    exercise={ex}
                                                    onAnswer={handleAnswer}
                                                    userAnswer={userAnswers[ex._id]}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                                    <p>Chọn bài học để bắt đầu</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {}
                    {currentLesson && (
                        <div className="h-20 flex-shrink-0 bg-white border-t border-gray-100 px-6 flex items-center">
                            <div className="max-w-3xl mx-auto w-full flex justify-between gap-4">
                                <CustomButton
                                    variant="secondary"
                                    onClick={() => {
                                        if (currentIndex > 0) {
                                            setCurrentLesson(allLessons[currentIndex - 1]);
                                        } else {
                                            toast.info('Đây là bài học đầu tiên');
                                        }
                                    }}
                                    className="px-6"
                                >
                                    <ChevronLeftIcon className="w-4 h-4 mr-1" /> Bài trước
                                </CustomButton>
                                <CustomButton
                                    variant="primary"
                                    onClick={() => {
                                        if (currentIndex < allLessons.length - 1) {
                                            setCurrentLesson(allLessons[currentIndex + 1]);
                                        } else {
                                            toast.success('🎉 Chúc mừng! Bạn đã hoàn thành sách!');
                                        }
                                    }}
                                    className="px-6 shadow-md shadow-blue-100"
                                >
                                    Bài tiếp theo <ChevronRightIcon className="w-4 h-4 ml-1" />
                                </CustomButton>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
