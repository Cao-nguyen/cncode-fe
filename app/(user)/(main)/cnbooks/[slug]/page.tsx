'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Book, Clock, Award, CheckCircle, PenTool, Code,
    ChevronLeft, ChevronRight, Check, X, ChevronDown, ChevronUp,
    Save, Undo, Redo, Brush, Type, FileText
} from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CNBOOKS_DATA } from '@/lib/data/cnbooks.data';

// Types
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

    const lesson = CNBOOKS_DATA.lessons.find(l => l.slug === slug);
    const lessonIndex = CNBOOKS_DATA.lessons.findIndex(l => l.slug === slug);

    const [exercises, setExercises] = useState<CodeExercise[]>(lesson?.exercises || []);
    const [quiz, setQuiz] = useState<QuizQuestion[]>(lesson?.quiz.map(q => ({
        ...q,
        selectedAnswer: null
    })) || []);
    const [activeTab, setActiveTab] = useState<'theory' | 'exercises' | 'quiz'>('theory');
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState<string[]>(lesson?.userNotes || []);
    const [noteText, setNoteText] = useState('');
    const [notesOpen, setNotesOpen] = useState(true);

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter'>('pen');
    const [canvasWidth, setCanvasWidth] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Initialize canvas size
    useEffect(() => {
        if (canvasRef.current) {
            setCanvasWidth(canvasRef.current.clientWidth);
        }
    }, []);

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Book className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Không tìm thấy bài học</h2>
                    <p className="text-gray-500 mt-2">Bài học bạn đang tìm kiếm không tồn tại</p>
                </div>
            </div>
        );
    }

    const handleStartDrawing = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        ctxRef.current = canvas.getContext('2d');

        if (ctxRef.current) {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
            ctxRef.current.lineWidth = currentTool === 'highlighter' ? 20 : 3;
            ctxRef.current.lineCap = 'round';
            ctxRef.current.strokeStyle = currentTool === 'highlighter' ? 'rgba(255, 255, 0, 0.3)' : '#000';
        }
    };

    const handleDraw = (e: React.MouseEvent) => {
        if (!isDrawing || !canvasRef.current || !ctxRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
    };

    const handleStopDrawing = () => {
        if (ctxRef.current) {
            ctxRef.current.closePath();
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (canvasRef.current && ctxRef.current) {
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleSaveNote = () => {
        if (noteText.trim()) {
            setNotes([...notes, noteText.trim()]);
            setNoteText('');
        }
    };

    const removeNote = (index: number) => {
        setNotes(notes.filter((_, i) => i !== index));
    };

    const handleExerciseChange = (exerciseId: string, newCode: string) => {
        setExercises(exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, userCode: newCode } : ex
        ));
    };

    const runCode = (exercise: CodeExercise) => {
        try {
            console.log('Running code:', exercise.userCode);
            alert('Code chạy thành công! (Chức năng đang được phát triển)');
        } catch (error) {
            alert('Lỗi khi chạy code: ' + error);
        }
    };

    const checkExercise = (exerciseId: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                return { ...ex, completed: true };
            }
            return ex;
        }));
    };

    const submitQuiz = () => {
        const correctCount = quiz.reduce((count, q) => {
            return count + (q.selectedAnswer === q.answerIndex ? 1 : 0);
        }, 0);
        const score = (correctCount / quiz.length) * 100;
        alert(`Điểm quiz của bạn: ${score}% (${correctCount}/${quiz.length} câu đúng)`);
    };

    const handleQuizAnswer = (questionIndex: number, optionIndex: number) => {
        setQuiz(quiz.map((q, i) =>
            i === questionIndex ? { ...q, selectedAnswer: optionIndex } : q
        ));
    };

    const prevLesson = lessonIndex > 0 ? CNBOOKS_DATA.lessons[lessonIndex - 1] : null;
    const nextLesson = lessonIndex < CNBOOKS_DATA.lessons.length - 1 ? CNBOOKS_DATA.lessons[lessonIndex + 1] : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/cnbooks')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="font-semibold text-gray-900 dark:text-white">{lesson.title}</h1>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        {lesson.difficulty === 'beginner' ? 'Cơ bản' :
                                            lesson.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {prevLesson && (
                                <button
                                    onClick={() => router.push(`/cnbooks/${prevLesson.slug}`)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </button>
                            )}
                            {nextLesson && (
                                <button
                                    onClick={() => router.push(`/cnbooks/${nextLesson.slug}`)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setActiveTab('theory')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'theory'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Lý thuyết
                        </button>
                        <button
                            onClick={() => setActiveTab('exercises')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'exercises'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Bài tập ({exercises.filter(e => e.completed).length}/{exercises.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('quiz')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'quiz'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Quiz ({quiz.length} câu)
                        </button>
                    </div>

                    {activeTab === 'theory' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                            {/* Note Toggle */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ghi chú</h2>
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    <FileText className="w-4 h-4" />
                                    {showNotes ? 'Ẩn ghi chú' : 'Hiển thị ghi chú'}
                                </button>
                            </div>

                            {showNotes && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <PenTool className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                        <h3 className="font-medium text-gray-900 dark:text-white">Viết ghi chú</h3>
                                    </div>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Ghi chú của bạn..."
                                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <CustomButton onClick={handleSaveNote} variant="secondary">
                                            <Save className="w-4 h-4" />
                                            <span>Lưu</span>
                                        </CustomButton>
                                    </div>
                                    {notesOpen && (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {notes.map((note, index) => (
                                                <div key={index} className="flex items-start gap-2 bg-white dark:bg-gray-700 p-3 rounded-lg">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{note}</p>
                                                        <button
                                                            onClick={() => removeNote(index)}
                                                            className="text-red-500 hover:text-red-700 mt-1"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {notes.length === 0 && (
                                                <p className="text-sm text-gray-500 italic">Chưa có ghi chú nào</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="prose dark:prose-invert max-w-none">
                                {lesson.content.map((item, index) => (
                                    <div key={index} className="mb-6">
                                        {item.type === 'paragraph' && (
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.text}</p>
                                        )}

                                        {item.type === 'heading' && item.level === 2 && (
                                            <h2 className="text-gray-900 dark:text-white font-semibold mt-4 mb-2">
                                                {item.text}
                                            </h2>
                                        )}
                                        {item.type === 'heading' && item.level === 3 && (
                                            <h3 className="text-gray-900 dark:text-white font-semibold mt-4 mb-2">
                                                {item.text}
                                            </h3>
                                        )}
                                        {item.type === 'heading' && item.level === 4 && (
                                            <h4 className="text-gray-900 dark:text-white font-semibold mt-4 mb-2">
                                                {item.text}
                                            </h4>
                                        )}

                                        {item.type === 'note' && (
                                            <div className={`p-4 rounded-lg border-l-4 ${item.style === 'tip' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                                                item.style === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                                                    'bg-red-50 dark:bg-red-900/20 border-red-500'
                                                }`}>
                                                <div className="flex items-start gap-2">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {item.style === 'tip' ? '💡 Mẹo:' :
                                                            item.style === 'warning' ? '⚠️ Lưu ý:' : '❌ Lưu ý:'}
                                                    </span>
                                                    <p className="text-gray-700 dark:text-gray-300">{item.text}</p>
                                                </div>
                                            </div>
                                        )}

                                        {item.type === 'code' && (
                                            <div className="rounded-xl overflow-hidden bg-gray-900 my-4">
                                                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                                                    <span className="text-sm text-gray-300 font-mono">{item.language}</span>
                                                    {item.caption && (
                                                        <span className="text-xs text-gray-400">{item.caption}</span>
                                                    )}
                                                </div>
                                                <pre className="p-4 overflow-x-auto">
                                                    <code className="text-sm font-mono text-gray-100">
                                                        {item.code}
                                                    </code>
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Drawing Canvas */}
                                {lesson.content.some(c => c.type === 'code') && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            Vẽ sơ đồ / Ghi chú trên code
                                        </h3>
                                        <div
                                            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                                            onMouseLeave={handleStopDrawing}
                                        >
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800">
                                                <button
                                                    onClick={() => setCurrentTool('pen')}
                                                    className={`p-2 rounded-lg ${currentTool === 'pen' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                                    title="Bút vẽ"
                                                >
                                                    <PenTool className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentTool('highlighter')}
                                                    className={`p-2 rounded-lg ${currentTool === 'highlighter' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                                    title="Đánh dấu"
                                                >
                                                    <Brush className="w-4 h-4" />
                                                </button>
                                                <div className="flex-1" />
                                                <button
                                                    onClick={clearCanvas}
                                                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                            <canvas
                                                ref={canvasRef}
                                                width={600}
                                                height={300}
                                                onMouseDown={handleStartDrawing}
                                                onMouseMove={handleDraw}
                                                onMouseUp={handleStopDrawing}
                                                className="cursor-crosshair bg-white"
                                                style={{ maxWidth: '100%' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Key Takeaways */}
                            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    要点/Key Takeaways
                                </h3>
                                <ul className="space-y-2">
                                    {lesson.keyTakeaways.map((takeaway, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{takeaway}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exercises' && (
                        <div className="space-y-6">
                            {exercises.map((exercise, index) => (
                                <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold">
                                                {index + 1}
                                            </span>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {exercise.title}
                                            </h3>
                                        </div>
                                        {exercise.completed && (
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <Check className="w-4 h-4" />
                                                <span className="text-sm font-medium">Hoàn thành</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300 mb-4">{exercise.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Code của bạn
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    value={exercise.userCode}
                                                    onChange={(e) => handleExerciseChange(exercise.id, e.target.value)}
                                                    className="w-full h-40 p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder="# Viết code của bạn ở đây..."
                                                />
                                                <div className="absolute bottom-3 right-3 flex gap-2">
                                                    <button
                                                        onClick={() => runCode(exercise)}
                                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                                                    >
                                                        Chạy
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Hướng dẫn
                                            </label>
                                            <div className="space-y-2">
                                                {exercise.hints.map((hint, idx) => (
                                                    <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                                                        <span className="font-medium">💡 Gợi ý {idx + 1}: </span>
                                                        {hint}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => checkExercise(exercise.id)}
                                                disabled={exercise.completed}
                                                className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Quiz ({quiz.length} câu)
                                </h3>
                                <button
                                    onClick={submitQuiz}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Nộp bài
                                </button>
                            </div>

                            <div className="space-y-6">
                                {quiz.map((question, qIndex) => (
                                    <div key={qIndex} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                                        <h4 className="text-gray-900 dark:text-white font-medium mb-3">
                                            {qIndex + 1}. {question.question}
                                        </h4>
                                        <div className="space-y-2">
                                            {question.options.map((option, oIndex) => (
                                                <label
                                                    key={oIndex}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${quiz[qIndex].selectedAnswer === oIndex
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${qIndex}`}
                                                        checked={quiz[qIndex].selectedAnswer === oIndex}
                                                        onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {quiz[qIndex].selectedAnswer !== null && (
                                            <div className={`mt-3 p-3 rounded-lg text-sm ${quiz[qIndex].selectedAnswer === question.answerIndex
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                                }`}>
                                                {quiz[qIndex].selectedAnswer === question.answerIndex
                                                    ? '✅ Đúng!'
                                                    : '❌ Sai!'}
                                                <span className="ml-2">
                                                    {question.explanation}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Lesson Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tóm tắt bài học</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Thời gian</span>
                                <span className="font-medium text-gray-900 dark:text-white">{lesson.duration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Độ khó</span>
                                <span className="font-medium text-gray-900 dark:text-white capitalize">{lesson.difficulty}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Bài tập</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {exercises.filter(e => e.completed).length}/{exercises.length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Quiz</span>
                                <span className="font-medium text-gray-900 dark:text-white">{quiz.length} câu</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Preview */}
                    {showNotes && notes.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Ghi chú</h3>
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                                    {notes.length} ghi chú
                                </span>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {notes.slice(-3).map((note, index) => (
                                    <div key={index} className="text-sm bg-white dark:bg-gray-800 p-2 rounded-lg">
                                        <p className="line-clamp-2 text-gray-600 dark:text-gray-300">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
