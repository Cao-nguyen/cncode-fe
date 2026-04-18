"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, updateUserStats } from "@/store/userSlice";
import {
    ArrowLeft, Note, Book, MessageText, Heart, Add, CloseCircle,
    Like1, Play, Pause, Maximize, VolumeUp, VolumeMute
} from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getLessonById, getAdjacentLessons, LessonData, CourseData, QuestionData } from "@/lib/courseData";

interface NoteItem {
    _id: string;
    content: string;
    timestamp: number;
    createdAt: string;
}

interface Comment {
    _id: string;
    content: string;
    user: { _id: string; name: string; avatar: string | null };
    likes: number;
    userLiked: boolean;
    createdAt: string;
}

const REACTIONS = [
    { key: "like", icon: "/icons/like.svg", label: "Thích" },
    { key: "love", icon: "/icons/love.svg", label: "Yêu thích" },
    { key: "care", icon: "/icons/care.svg", label: "Quan tâm" },
    { key: "haha", icon: "/icons/haha.svg", label: "Haha" },
    { key: "wow", icon: "/icons/wow.svg", label: "Wow" },
    { key: "sad", icon: "/icons/sad.svg", label: "Buồn" },
    { key: "angry", icon: "/icons/angry.svg", label: "Phẫn nộ" },
];

export default function LearningPage() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [course, setCourse] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [newNote, setNewNote] = useState("");
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [showNotesList, setShowNotesList] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [activeQuestion, setActiveQuestion] = useState<QuestionData | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [answerResult, setAnswerResult] = useState<{ correct: boolean; message: string } | null>(null);
    const [prevLesson, setPrevLesson] = useState<LessonData | null>(null);
    const [nextLesson, setNextLesson] = useState<LessonData | null>(null);
    const [reactionPickerVisible, setReactionPickerVisible] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const videoRef = useRef<HTMLIFrameElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const questionsMapRef = useRef<Map<number, QuestionData>>(new Map());
    const hasShownQuestionRef = useRef<Set<number>>(new Set());

    const getYouTubeId = useCallback((url: string): string => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/);
        return match ? match[1] : "";
    }, []);

    useEffect(() => {
        const result = getLessonById(lessonId);
        if (result) {
            setLesson(result.lesson);
            setCourse(result.course);
            const adjacent = getAdjacentLessons(result.course._id, lessonId);
            setPrevLesson(adjacent.prev);
            setNextLesson(adjacent.next);

            if (result.lesson.questions) {
                result.lesson.questions.forEach(q => {
                    questionsMapRef.current.set(Math.floor(q.timestamp), q);
                });
            }
        }
        setLoading(false);
    }, [lessonId]);

    const sendMessageToPlayer = useCallback((func: string, args: unknown[] = []) => {
        if (videoRef.current && videoRef.current.contentWindow) {
            videoRef.current.contentWindow.postMessage(
                JSON.stringify({ event: "command", func, args }),
                "*"
            );
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            sendMessageToPlayer("pauseVideo");
            setIsPlaying(false);
        } else {
            sendMessageToPlayer("playVideo");
            setIsPlaying(true);
        }
    }, [isPlaying, sendMessageToPlayer]);

    const toggleMute = useCallback(() => {
        if (isMuted) {
            sendMessageToPlayer("unMute");
            setIsMuted(false);
        } else {
            sendMessageToPlayer("mute");
            setIsMuted(true);
        }
    }, [isMuted, sendMessageToPlayer]);

    const seekTo = useCallback((seconds: number) => {
        sendMessageToPlayer("seekTo", [seconds, true]);
    }, [sendMessageToPlayer]);

    useEffect(() => {
        if (!lesson?.videoUrl) return;

        const handlePlayerStateChange = (event: MessageEvent) => {
            if (event.data && typeof event.data === "object") {
                if (event.data.event === "onStateChange") {
                    const playerState = event.data.info;
                    if (playerState === 1) {
                        setIsPlaying(true);
                    } else if (playerState === 2) {
                        setIsPlaying(false);
                    }
                }
                if (event.data.event === "onCurrentTime") {
                    const current = event.data.info;
                    setCurrentTime(current);
                    if (duration > 0) {
                        const newProgress = (current / duration) * 100;
                        setProgress(newProgress);
                    }

                    const currentSec = Math.floor(current);
                    const question = questionsMapRef.current.get(currentSec);
                    if (question && !hasShownQuestionRef.current.has(currentSec) && !activeQuestion && !showAnswer) {
                        hasShownQuestionRef.current.add(currentSec);
                        setActiveQuestion(question);
                        sendMessageToPlayer("pauseVideo");
                        setIsPlaying(false);
                    }
                }
                if (event.data.event === "onDuration") {
                    setDuration(event.data.info);
                }
            }
        };

        window.addEventListener("message", handlePlayerStateChange);
        return () => window.removeEventListener("message", handlePlayerStateChange);
    }, [lesson, duration, activeQuestion, showAnswer, sendMessageToPlayer]);

    const createNote = () => {
        if (!newNote.trim()) return;
        const newNoteItem: NoteItem = {
            _id: Date.now().toString(),
            content: newNote,
            timestamp: currentTime,
            createdAt: new Date().toISOString(),
        };
        setNotes([newNoteItem, ...notes]);
        setNewNote("");
        setShowNoteInput(false);
        toast.success("Đã lưu ghi chú");
    };

    const jumpToNote = (timestamp: number) => {
        seekTo(timestamp);
        sendMessageToPlayer("playVideo");
        setIsPlaying(true);
        setShowNotesList(false);
    };

    const deleteNote = (noteId: string) => {
        setNotes(notes.filter(n => n._id !== noteId));
        toast.success("Đã xóa ghi chú");
    };

    const submitComment = () => {
        if (!newComment.trim()) return;
        const newCommentItem: Comment = {
            _id: Date.now().toString(),
            content: newComment,
            user: {
                _id: user?._id || "guest",
                name: user?.name || "Khách",
                avatar: user?.avatar || null,
            },
            likes: 0,
            userLiked: false,
            createdAt: new Date().toISOString(),
        };
        setComments([newCommentItem, ...comments]);
        setNewComment("");
        toast.success("Đã đăng bình luận");
    };

    const likeComment = (commentId: string) => {
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                return { ...c, likes: c.userLiked ? c.likes - 1 : c.likes + 1, userLiked: !c.userLiked };
            }
            return c;
        }));
    };

    const reactToComment = (commentId: string, reaction: string) => {
        setReactionPickerVisible(null);
        toast.success(`Đã thả cảm xúc ${reaction}`);
    };

    const handleQuestionAnswer = () => {
        if (selectedAnswer === null || !activeQuestion) return;
        const isCorrect = selectedAnswer === activeQuestion.correctAnswer;
        setAnswerResult({
            correct: isCorrect,
            message: isCorrect ? "Chính xác! Bạn đã trả lời đúng." : `Sai rồi! Đáp án đúng là: ${activeQuestion.options[activeQuestion.correctAnswer]}`,
        });
        if (isCorrect && activeQuestion.rewardCoins) {
            dispatch(updateUserStats({ cncoins: (user?.cncoins || 0) + activeQuestion.rewardCoins }));
            toast.success(`+${activeQuestion.rewardCoins} CNcoins!`);
        }
        setShowAnswer(true);
    };

    const closeQuestion = () => {
        setActiveQuestion(null);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setAnswerResult(null);
        sendMessageToPlayer("playVideo");
        setIsPlaying(true);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!lesson || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Không tìm thấy bài học</h1>
                    <Link href="/khoahoc">
                        <Button>Quay lại danh sách khóa học</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const videoEmbedUrl = `https://www.youtube.com/embed/${getYouTubeId(lesson.videoUrl)}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&playsinline=1`;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Link href={`/khoahoc/${course._id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                                <ArrowLeft size={18} variant="Outline" /> Quay lại
                            </Button>
                        </Link>
                        <div className="hidden md:block">
                            <h1 className="text-sm font-medium text-foreground line-clamp-1 max-w-md">{lesson.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{Math.floor(progress)}%</span>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotesList(!showNotesList)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition"
                            >
                                <Note size={18} variant="Outline" />
                                <span className="hidden sm:inline text-sm">Ghi chú</span>
                            </button>

                            {showNotesList && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-30 max-h-96 overflow-y-auto">
                                    <div className="p-3 border-b border-border flex justify-between items-center">
                                        <h3 className="font-semibold">Ghi chú của bạn</h3>
                                        <button onClick={() => setShowNotesList(false)}>
                                            <CloseCircle size={18} variant="Outline" />
                                        </button>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setShowNoteInput(true);
                                                setShowNotesList(false);
                                            }}
                                            className="w-full flex items-center gap-2 p-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition"
                                        >
                                            <Add size={16} variant="Outline" /> Thêm ghi chú tại {formatTime(currentTime)}
                                        </button>
                                        {notes.length === 0 ? (
                                            <p className="text-center text-muted-foreground text-sm py-8">Chưa có ghi chú nào</p>
                                        ) : (
                                            notes.map((note) => (
                                                <div key={note._id} className="p-2 border-b border-border last:border-0 hover:bg-muted/30 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <button
                                                            onClick={() => jumpToNote(note.timestamp)}
                                                            className="flex-1 text-left"
                                                        >
                                                            <span className="text-xs text-primary font-mono">{formatTime(note.timestamp)}</span>
                                                            <p className="text-sm mt-1 line-clamp-2">{note.content}</p>
                                                        </button>
                                                        <button onClick={() => deleteNote(note._id)} className="text-muted-foreground hover:text-red-500 p-1">
                                                            <CloseCircle size={14} variant="Outline" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? "lg:mr-80" : ""}`}>
                    <div className="max-w-4xl mx-auto p-4">
                        <div className="relative bg-black rounded-xl overflow-hidden mb-6">
                            <iframe
                                ref={videoRef}
                                src={videoEmbedUrl}
                                className="w-full aspect-video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={togglePlay} className="text-white hover:text-primary transition">
                                        {isPlaying ? <Pause size={24} variant="Bold" /> : <Play size={24} variant="Bold" />}
                                    </button>
                                    <button onClick={toggleMute} className="text-white hover:text-primary transition">
                                        {isMuted ? <VolumeMute size={20} variant="Bold" /> : <VolumeUp size={20} variant="Bold" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-1 bg-white/30 rounded-full cursor-pointer">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-white text-sm">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                    <button className="text-white hover:text-primary transition">
                                        <Maximize size={20} variant="Outline" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showNoteInput && (
                            <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">Thêm ghi chú tại {formatTime(currentTime)}</h3>
                                    <button onClick={() => setShowNoteInput(false)}>
                                        <CloseCircle size={18} variant="Outline" />
                                    </button>
                                </div>
                                <Textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Nhập ghi chú của bạn..."
                                    rows={3}
                                    className="mb-2"
                                />
                                <Button onClick={createNote}>Lưu ghi chú</Button>
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        </div>

                        <div className="border-t border-border pt-8">
                            <h3 className="font-semibold mb-4 text-lg">Bình luận ({comments.length})</h3>
                            <div className="flex gap-3 mb-6">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.avatar || undefined} />
                                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Viết bình luận..."
                                        rows={2}
                                        className="mb-2"
                                    />
                                    <Button onClick={submitComment} size="sm">Đăng bình luận</Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={comment.user.avatar || undefined} />
                                            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="bg-muted/30 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm">{comment.user.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm">{comment.content}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <button
                                                    onClick={() => likeComment(comment._id)}
                                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
                                                >
                                                    <Heart size={14} variant={comment.userLiked ? "Bold" : "Outline"} />
                                                    <span>{comment.likes}</span>
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setReactionPickerVisible(comment._id)}
                                                        className="text-xs text-muted-foreground hover:text-primary transition"
                                                    >
                                                        <Like1 size={14} variant="Outline" />
                                                    </button>
                                                    {reactionPickerVisible === comment._id && (
                                                        <div className="absolute bottom-6 left-0 bg-card border border-border rounded-full shadow-lg p-2 flex gap-1 z-10">
                                                            {REACTIONS.map((reaction) => (
                                                                <button
                                                                    key={reaction.key}
                                                                    onClick={() => reactToComment(comment._id, reaction.key)}
                                                                    className="p-1 hover:scale-110 transition"
                                                                >
                                                                    <Image src={reaction.icon} alt={reaction.label} width={24} height={24} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`fixed top-0 right-0 h-full w-80 border-l border-border bg-background transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
                    <div className="sticky top-0 bg-background p-4 border-b border-border flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Book size={18} variant="Outline" /> Danh sách bài học
                        </h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                            <CloseCircle size={18} variant="Outline" />
                        </button>
                    </div>
                    <div className="overflow-y-auto h-full pb-20">
                        {course.lessons.map((l, idx) => (
                            <Link
                                key={l._id}
                                href={`/khoahoc/learning/${l._id}`}
                                className={`block p-4 border-b border-border transition ${l._id === lesson._id ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted"}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{idx + 1}. {l.title}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{l.duration}</div>
                                    </div>
                                    {l.isPreview && (
                                        <span className="text-xs text-primary">Xem thử</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 flex justify-between z-10">
                {prevLesson ? (
                    <Link href={`/khoahoc/learning/${prevLesson._id}`}>
                        <Button variant="outline" className="gap-1">
                            <ArrowLeft size={18} variant="Outline" /> Bài trước
                        </Button>
                    </Link>
                ) : (
                    <div />
                )}

                {nextLesson ? (
                    <Link href={`/khoahoc/learning/${nextLesson._id}`}>
                        <Button className="gap-1">
                            Bài tiếp theo <ArrowLeft size={18} variant="Outline" className="rotate-180" />
                        </Button>
                    </Link>
                ) : (
                    <Link href={`/khoahoc/${course._id}`}>
                        <Button>Hoàn thành khóa học</Button>
                    </Link>
                )}
            </div>

            {activeQuestion && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl max-w-lg w-full p-6">
                        <h3 className="text-lg font-bold mb-4">{activeQuestion.question}</h3>
                        <div className="space-y-2 mb-4">
                            {activeQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => !showAnswer && setSelectedAnswer(index)}
                                    className={`w-full text-left p-3 rounded-xl border transition ${selectedAnswer === index ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {!showAnswer ? (
                            <Button onClick={handleQuestionAnswer} disabled={selectedAnswer === null} className="w-full">
                                Trả lời
                            </Button>
                        ) : (
                            <div>
                                <div className={`p-3 rounded-xl mb-4 ${answerResult?.correct ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                                    {answerResult?.message}
                                </div>
                                {activeQuestion.explanation && (
                                    <div className="p-3 bg-muted rounded-xl mb-4 text-sm">
                                        <p className="font-medium mb-1">Giải thích:</p>
                                        <p>{activeQuestion.explanation}</p>
                                    </div>
                                )}
                                <Button onClick={closeQuestion} className="w-full">Tiếp tục</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}