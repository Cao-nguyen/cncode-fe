'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Book, Clock, Award, CheckCircle, PenTool, Code,
    ChevronLeft, ChevronRight, Check, X, ChevronDown, ChevronUp,
    Save, Undo, Redo, Brush, Type, FileText, Edit3, StickyNote, Eraser
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

interface PositionNote {
    id: string;
    x: number;
    y: number;
    text: string;
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

    // Drawing overlay state
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingTool, setDrawingTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Position notes state
    const [isNoteMode, setIsNoteMode] = useState(false);
    const [positionNotes, setPositionNotes] = useState<PositionNote[]>([]);
    const [editingNote, setEditingNote] = useState<{ id: string; text: string } | null>(null);
    const [noteInputPosition, setNoteInputPosition] = useState<{ x: number; y: number } | null>(null);
    const [tempNoteText, setTempNoteText] = useState('');

    // Initialize canvas size and context
    useEffect(() => {
        const updateCanvasSize = () => {
            const width = Math.max(
                document.documentElement.scrollWidth,
                window.innerWidth
            );
            const height = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
                window.innerHeight
            );
            setCanvasSize({ width, height });

            if (overlayCanvasRef.current) {
                const canvas = overlayCanvasRef.current;
                // Save current drawing before resize
                const imageData = overlayCtxRef.current?.getImageData(0, 0, canvas.width, canvas.height);

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                overlayCtxRef.current = ctx;

                // Restore drawing after resize
                if (imageData && ctx) {
                    ctx.putImageData(imageData, 0, 0);
                }
            }
        };

        // Initial setup with delay to ensure DOM is ready
        setTimeout(updateCanvasSize, 100);

        window.addEventListener('resize', updateCanvasSize);
        window.addEventListener('scroll', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            window.removeEventListener('scroll', updateCanvasSize);
        };
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

    // Drawing functions
    const handleOverlayMouseDown = (e: React.MouseEvent) => {
        if (!isDrawingMode || !overlayCanvasRef.current) return;

        const canvas = overlayCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        if (overlayCtxRef.current) {
            overlayCtxRef.current.beginPath();
            overlayCtxRef.current.moveTo(x, y);

            if (drawingTool === 'eraser') {
                overlayCtxRef.current.globalCompositeOperation = 'destination-out';
                overlayCtxRef.current.lineWidth = 20;
            } else {
                overlayCtxRef.current.globalCompositeOperation = 'source-over';
                overlayCtxRef.current.lineWidth = drawingTool === 'highlighter' ? 20 : 3;
                overlayCtxRef.current.strokeStyle = drawingTool === 'highlighter'
                    ? 'rgba(255, 255, 0, 0.15)'
                    : '#ff0000';
            }
            overlayCtxRef.current.lineCap = 'round';
        }
    };

    const handleOverlayMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !overlayCanvasRef.current || !overlayCtxRef.current) return;

        const canvas = overlayCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        overlayCtxRef.current.lineTo(x, y);
        overlayCtxRef.current.stroke();
    };

    const handleOverlayMouseUp = () => {
        if (overlayCtxRef.current) {
            overlayCtxRef.current.closePath();
        }
        setIsDrawing(false);
    };

    const clearOverlayCanvas = () => {
        if (overlayCanvasRef.current && overlayCtxRef.current) {
            overlayCtxRef.current.clearRect(0, 0, canvasSize.width, canvasSize.height);
        }
    };

    // Position note functions
    const handlePageClick = (e: React.MouseEvent) => {
        if (!isNoteMode) return;

        const x = e.clientX + window.scrollX;
        const y = e.clientY + window.scrollY;

        setNoteInputPosition({ x, y });
        setTempNoteText('');
    };

    const savePositionNote = () => {
        if (!noteInputPosition || !tempNoteText.trim()) return;

        const newNote: PositionNote = {
            id: `note-${Date.now()}`,
            x: noteInputPosition.x,
            y: noteInputPosition.y,
            text: tempNoteText.trim()
        };

        setPositionNotes([...positionNotes, newNote]);
        setNoteInputPosition(null);
        setTempNoteText('');
    };

    const deletePositionNote = (id: string) => {
        setPositionNotes(positionNotes.filter(n => n.id !== id));
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
        <div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 relative"
            onClick={isNoteMode ? handlePageClick : undefined}
        >
            {/* Drawing Overlay Canvas - Always rendered to preserve drawings */}
            <canvas
                ref={overlayCanvasRef}
                className={`absolute top-0 left-0 z-40 ${isDrawingMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
                style={{
                    cursor: isDrawingMode ? 'crosshair' : 'default',
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    display: 'block'
                }}
                onMouseDown={isDrawingMode ? handleOverlayMouseDown : undefined}
                onMouseMove={isDrawingMode ? handleOverlayMouseMove : undefined}
                onMouseUp={isDrawingMode ? handleOverlayMouseUp : undefined}
                onMouseLeave={isDrawingMode ? handleOverlayMouseUp : undefined}
            />

            {/* Position Notes */}
            {positionNotes.map(note => (
                <div
                    key={note.id}
                    className="fixed z-50 bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg shadow-lg border-2 border-yellow-400 dark:border-yellow-600 max-w-xs"
                    style={{
                        left: note.x,
                        top: note.y,
                        pointerEvents: isNoteMode ? 'auto' : 'none'
                    }}
                >
                    <div className="flex items-start gap-2">
                        <StickyNote className="w-4 h-4 text-yellow-600 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-800 dark:text-gray-200 flex-1">{note.text}</p>
                        {isNoteMode && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deletePositionNote(note.id);
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {/* Note Input Popup */}
            {noteInputPosition && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border-2 border-blue-500"
                    style={{ left: noteInputPosition.x, top: noteInputPosition.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <StickyNote className="w-4 h-4" />
                            Thêm ghi chú
                        </h4>
                        <textarea
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            placeholder="Nhập ghi chú..."
                            className="w-64 h-20 p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={savePositionNote}
                                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={() => setNoteInputPosition(null)}
                                className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toolbar */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 space-y-2 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 text-center">
                        Công cụ
                    </div>

                    {/* Drawing Mode Toggle */}
                    <button
                        onClick={() => {
                            setIsDrawingMode(!isDrawingMode);
                            setIsNoteMode(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDrawingMode
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        title="Chế độ vẽ"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Vẽ</span>
                    </button>

                    {/* Drawing Tools */}
                    {isDrawingMode && (
                        <div className="space-y-1 pl-2 border-l-2 border-blue-500">
                            <button
                                onClick={() => setDrawingTool('pen')}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs ${drawingTool === 'pen' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <PenTool className="w-3 h-3" />
                                Bút
                            </button>
                            <button
                                onClick={() => setDrawingTool('highlighter')}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs ${drawingTool === 'highlighter' ? 'bg-yellow-100 dark:bg-yellow-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Brush className="w-3 h-3" />
                                Đánh dấu
                            </button>
                            <button
                                onClick={() => setDrawingTool('eraser')}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs ${drawingTool === 'eraser' ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Eraser className="w-3 h-3" />
                                Tẩy
                            </button>
                            <button
                                onClick={clearOverlayCanvas}
                                className="w-full px-2 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                                Xóa hết
                            </button>
                        </div>
                    )}

                    {/* Note Mode Toggle */}
                    <button
                        onClick={() => {
                            setIsNoteMode(!isNoteMode);
                            setIsDrawingMode(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isNoteMode
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        title="Chế độ ghi chú"
                    >
                        <StickyNote className="w-4 h-4" />
                        <span>Ghi chú</span>
                    </button>

                    {isNoteMode && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center px-2">
                            Click vào trang để thêm ghi chú
                        </div>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
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

                                        {item.type === 'note' && (
                                            <div className={`p-4 rounded-lg border-l-4 ${item.style === 'tip' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                                                item.style === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                                                    'bg-red-50 dark:bg-red-900/20 border-red-500'
                                                }`}>
                                                <div className="flex items-start gap-2">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {item.style === 'tip' ? '💡 Mẹo:' :
                                                            item.style === 'warning' ? '⚠️ Lưu ý:' : '❌ Cảnh báo:'}
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
                            </div>

                            {/* Key Takeaways */}
                            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    📌 Điểm chính
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
                                            <textarea
                                                value={exercise.userCode}
                                                onChange={(e) => handleExerciseChange(exercise.id, e.target.value)}
                                                className="w-full h-40 p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                placeholder="# Viết code của bạn ở đây..."
                                            />
                                            <button
                                                onClick={() => runCode(exercise)}
                                                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                            >
                                                Chạy code
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Gợi ý
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

                    {/* Position Notes Summary */}
                    {positionNotes.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Ghi chú của bạn</h3>
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                                    {positionNotes.length}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {positionNotes.slice(-5).map((note) => (
                                    <div key={note.id} className="text-sm bg-white dark:bg-gray-800 p-2 rounded-lg">
                                        <p className="line-clamp-2 text-gray-600 dark:text-gray-300">{note.text}</p>
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
