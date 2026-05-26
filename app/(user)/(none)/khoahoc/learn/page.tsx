'use client';

import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubePlayer, YouTubeEvent } from 'react-youtube';
import {
    Lock, Play, CheckCircle2,
    Save, MessageSquare, Award,
    AlertCircle, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

// --- ĐỊNH NGHĨA INTERFACES ---
interface ILesson {
    id: number;
    title: string;
    videoId: string;
}

interface ISection {
    title: string;
    lessons: number[];
}

interface IQuiz {
    lessonId: number;
    timeTrigger: number;
    question: string;
    options: string[];
    correct: number;
}

interface INote {
    id: string;
    time: number;
    timeStr: string;
    text: string;
}

// --- DỮ LIỆU CỨNG ---
const SECTIONS: ISection[] = [
    { title: "Phần 1: Tổng quan", lessons: [1, 2] },
    { title: "Phần 2: Khởi động", lessons: [3, 4, 5] },
    { title: "Phần 3: Bứt phá", lessons: [6, 7, 8, 9, 10, 11, 12, 13] },
    { title: "Phần 4: Kết thúc", lessons: [14] }
];

const VIDEO_IDS: Record<number, string> = {
    1: "HBd4szq-hkM", 2: "R4aTGrN4U1U", 3: "-xRPlCB6vaU", 4: "OfGlc2vsncw",
    5: "cwuCgRScT0I", 6: "Fhz6EODIRX4", 7: "FW0H9dHdKA8", 8: "kaK03Yw7my4",
    9: "EghBvFl1Zdw", 10: "CpUeXfeAcN8", 11: "pvVCjvWAU3Q", 12: "JzQspujJ4ns",
    13: "EiGfmM__4x0", 14: "uYu2-J4XNEE"
};

const LESSONS_DATA: ILesson[] = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    title: `Bài ${i + 1}: Hướng dẫn Google Site`,
    videoId: VIDEO_IDS[i + 1]
}));

const POPUP_QUIZZES: IQuiz[] = [
    {
        lessonId: 1,
        timeTrigger: 43,
        question: "Google Site là gì?",
        options: ["Phần mềm làm phim", "Ứng dụng trực tuyến giúp tạo ra website dễ dàng", "Ứng dụng offline giúp tạo ra website", "Tất cả đều sai"],
        correct: 1
    },
    {
        lessonId: 2,
        timeTrigger: 50,
        question: "Làm sao để tạo một website rỗng?",
        options: ["Tìm kiếm Google Site -> bấm vào dấu cộng -> bấm vào cây viết", "Bấm vào dấu cộng -> Bấm vào cây viết", "Bấm vào dấu cộng", "Chỉ cần search Google Site là trang trống tự tạo"],
        correct: 0
    }
];

// Helper function to load completed lessons from localStorage
const loadCompletedLessons = (): number[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('gs_completed');
    return saved ? JSON.parse(saved) : [];
};

// Helper function to load notes for a specific lesson
const loadNotesForLesson = (lessonId: number): INote[] => {
    if (typeof window === 'undefined') return [];
    const savedNotes = localStorage.getItem(`gs_notes_${lessonId}`);
    return savedNotes ? JSON.parse(savedNotes) : [];
};

export default function LearnCoursePage() {
    // Use lazy initialization for state that depends on localStorage
    const [completedLessons, setCompletedLessons] = useState<number[]>(loadCompletedLessons);
    const [currentLesson, setCurrentLesson] = useState<ILesson>(LESSONS_DATA[0]);
    const [notes, setNotes] = useState<INote[]>(() => loadNotesForLesson(LESSONS_DATA[0].id));
    const [noteInput, setNoteInput] = useState<string>("");
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const [activeQuiz, setActiveQuiz] = useState<IQuiz | null>(null);
    const [displayProgress, setDisplayProgress] = useState<number>(0);

    const maxTimeRef = useRef<number>(0);
    const quizTriggeredRef = useRef<Set<string>>(new Set());

    // Update notes when current lesson changes (without direct setState warning)
    useEffect(() => {
        const loadNotes = () => {
            const savedNotes = loadNotesForLesson(currentLesson.id);
            setNotes(savedNotes);
            maxTimeRef.current = 0;
            setDisplayProgress(0);
        };

        loadNotes();
    }, [currentLesson.id]);

    // Save completed lessons to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('gs_completed', JSON.stringify(completedLessons));
        }
    }, [completedLessons]);

    const handleLessonComplete = (id: number) => {
        if (!completedLessons.includes(id)) {
            setCompletedLessons(prev => [...prev, id]);
            toast.success("🎉 Bài học hoàn tất!");
        }
    };

    const checkVideoStatus = (targetPlayer: YouTubePlayer) => {
        const currentTime: number = targetPlayer.getCurrentTime();
        const roundedTime: number = Math.floor(currentTime);

        // Chặn tua
        if (currentTime > maxTimeRef.current + 3) {
            targetPlayer.seekTo(maxTimeRef.current, true);
            toast.error("Vui lòng không tua nhanh!");
            return;
        } else if (currentTime > maxTimeRef.current) {
            maxTimeRef.current = currentTime;
            const duration = targetPlayer.getDuration();
            if (duration) setDisplayProgress(Math.round((maxTimeRef.current / duration) * 100));
        }

        // Hiện Quiz
        const quizKey = `${currentLesson.id}-${roundedTime}`;
        const quiz = POPUP_QUIZZES.find(q =>
            q.lessonId === currentLesson.id && q.timeTrigger === roundedTime
        );

        if (quiz && !activeQuiz && !quizTriggeredRef.current.has(quizKey)) {
            quizTriggeredRef.current.add(quizKey);
            targetPlayer.pauseVideo();
            setActiveQuiz(quiz);
        }
    };

    const handleAnswer = (idx: number) => {
        if (activeQuiz && idx === activeQuiz.correct) {
            toast.success("✅ Chính xác!");
            setActiveQuiz(null);
            if (player) player.playVideo();
        } else {
            toast.error("❌ Chưa đúng, hãy suy nghĩ lại!");
        }
    };

    const addNote = () => {
        if (!noteInput.trim() || !player) return;
        const currentTime: number = player.getCurrentTime();
        const mins = Math.floor(currentTime / 60);
        const secs = Math.floor(currentTime % 60);
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const newNote: INote = {
            id: Date.now().toString(),
            time: currentTime,
            timeStr,
            text: noteInput.trim()
        };

        const updated = [...notes, newNote];
        setNotes(updated);
        // Save to localStorage immediately
        localStorage.setItem(`gs_notes_${currentLesson.id}`, JSON.stringify(updated));
        setNoteInput("");
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[#0f172a] text-white overflow-hidden">
            <div className="flex-1 overflow-y-auto flex flex-col relative">
                {/* VIDEO AREA */}
                <div className="aspect-video w-full bg-black relative shadow-2xl">
                    <YouTube
                        videoId={currentLesson.videoId}
                        opts={{ width: '100%', height: '100%', playerVars: { controls: 1, rel: 0, modestbranding: 1 } }}
                        className="w-full h-full"
                        onReady={(e: YouTubeEvent) => setPlayer(e.target)}
                        onPlay={(e: YouTubeEvent) => {
                            const timer = setInterval(() => {
                                if (e.target.getPlayerState() !== 1) clearInterval(timer);
                                else checkVideoStatus(e.target);
                            }, 1000);
                        }}
                        onStateChange={(e: YouTubeEvent) => {
                            if (e.data === 0) handleLessonComplete(currentLesson.id);
                        }}
                    />

                    {activeQuiz && (
                        <div className="absolute inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white text-slate-900 p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                                <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase text-xs tracking-widest">
                                    <Award className="w-5 h-5" /> Câu hỏi tương tác
                                </div>
                                <h3 className="text-xl font-bold mb-6 leading-tight">{activeQuiz.question}</h3>
                                <div className="space-y-3">
                                    {activeQuiz.options.map((opt: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            className="w-full p-4 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-semibold text-sm"
                                        >
                                            {String.fromCharCode(65 + i)}. {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENT AREA */}
                <div className="p-6 lg:p-10">
                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black">{currentLesson.title}</h1>
                            <p className="text-slate-400 text-sm">Học tập trung - Chống tua nhanh</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl min-w-[160px] border border-slate-700">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tiến trình</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${displayProgress}%` }} />
                                </div>
                                <span className="text-xs font-bold text-blue-400">{displayProgress}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-xs uppercase text-slate-500 flex items-center gap-2 tracking-widest text-center">
                                <MessageSquare className="w-4 h-4" /> Ghi chú bài giảng
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    value={noteInput}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteInput(e.target.value)}
                                    placeholder="Lưu ý quan trọng tại giây này..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 ring-blue-500"
                                />
                                <button onClick={addNote} className="px-5 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all">
                                    <Save className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto custom-scrollbar">
                                {notes.map((n: INote) => (
                                    <div key={n.id} className="p-3 bg-slate-800/40 rounded-xl text-sm flex gap-3 border border-slate-800 group">
                                        <button
                                            onClick={() => player?.seekTo(n.time, true)}
                                            className="text-blue-500 font-mono font-bold text-xs bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-all h-fit"
                                        >
                                            {n.timeStr}
                                        </button>
                                        <span className="text-slate-300">{n.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-500/5 p-6 rounded-[32px] border border-blue-500/10 h-fit">
                            <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-sm uppercase leading-none">
                                <AlertCircle className="w-4 h-4" /> Lưu ý học tập
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                - Xem video tuần tự, hệ thống khóa chức năng tua nhanh.<br />
                                - Trả lời đúng câu hỏi để tiếp tục bài giảng.<br />
                                - Hoàn thành bài trước để mở khóa bài tiếp theo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SIDEBAR */}
            <div className="w-full lg:w-96 bg-[#0f172a] border-l border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <h2 className="font-bold uppercase text-sm tracking-tighter">Nội dung bài học</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    {SECTIONS.map((section: ISection, sIdx: number) => (
                        <div key={sIdx} className="mb-6">
                            <h3 className="px-3 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{section.title}</h3>
                            <div className="space-y-1">
                                {section.lessons.map((num: number) => {
                                    const lesson = LESSONS_DATA[num - 1];
                                    const isLocked = num > 1 && !completedLessons.includes(num - 1);
                                    const isActive = currentLesson.id === num;
                                    const isDone = completedLessons.includes(num);

                                    return (
                                        <button
                                            key={num}
                                            disabled={isLocked}
                                            onClick={() => setCurrentLesson(lesson)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${isActive ? 'bg-blue-600 text-white shadow-lg' : isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {isLocked ? <Lock className="w-4 h-4" /> : isDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4" />}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>{lesson.title}</p>
                                                <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">BÀI {num}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
            `}</style>
        </div>
    );
}