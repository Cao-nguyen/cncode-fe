'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    getLessonDetail,
    saveProgress,
    getProgress,
    submitExercise,
    getCourseLearnData,
    getExerciseByLessonId,
    getCourseProgress,
    createNote,
    getNotesByLesson
} from '@/lib/api/khoahoc.api';
import { Lesson, Progress, Exercise, ChapterWithLessons, ExerciseAnswer } from '@/types/khoahoc.type';
import { setCourseLastLesson } from '@/lib/localProgress';
import {
    Loader2, Play, CheckCircle2, ChevronLeft, ChevronRight,
    AlertCircle, ChevronDown, ChevronUp, HelpCircle, MessageSquare, X, FileText, Lock, StickyNote
} from 'lucide-react';

import StaticContent from '@/components/common/StaticContent';
import { CustomButton } from '@/components/custom/CustomButton';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import CommentSection from '@/components/comment/CommentSection';
import QuizPopup from '@/components/learn/QuizPopup';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LessonWithExercise extends Lesson {
    exercise?: Exercise;
}

interface ExerciseQuestion {
    type: 'quiz' | 'true-false' | 'short-answer' | 'ide';
    question: string;
    options?: { text: string; isCorrect: boolean }[];
    correctAnswer?: string;
    language?: string;
    starterCode?: string;
}

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

// YouTube Player Types
interface YTPlayer {
    destroy: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    playVideo: () => void;
    pauseVideo: () => void;
}

interface YTPlayerEvent {
    target: YTPlayer;
    data: number;
}

interface YTPlayerConstructor {
    new(elementId: string, options: {
        videoId: string;
        playerVars?: Record<string, number>;
        events?: {
            onReady?: (event: YTPlayerEvent) => void;
            onStateChange?: (event: YTPlayerEvent) => void;
        };
    }): YTPlayer;
}

interface YTNamespace {
    Player: YTPlayerConstructor;
    PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
    };
}

declare global {
    interface Window {
        YT?: YTNamespace;
    }
}

// ─── Module-level cache (tồn tại suốt session, không reset khi re-render) ────
//
// lessonCache   : lessonId → lesson data
// chaptersCache : courseId → chapters (fetch 1 lần duy nhất)
// progressCache : lessonId → progress  (cập nhật local khi user học)
// prefetchSet   : đang prefetch (tránh gọi API trùng)

const lessonCache = new Map<string, LessonWithExercise>();
const chaptersCache = new Map<string, ChapterWithLessons[]>();
const progressCache = new Map<string, Progress>();
const prefetchSet = new Set<string>();

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function hasRealContent(html: string | undefined): boolean {
    if (!html?.trim()) return false;
    // Strip HTML tags and check if there's actual text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 0;
}

function extractYouTubeVideoId(url: string): string | null {
    if (url.includes('youtube.com/watch?v=')) {
        return url.split('watch?v=')[1]?.split('&')[0] ?? null;
    } else if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split('?')[0] ?? null;
    } else if (url.includes('youtube.com/embed/')) {
        return url.split('youtube.com/embed/')[1]?.split('?')[0] ?? null;
    }
    return null;
}

function isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

function buildVideoUrl(videoFileId: string): string {
    if (isYouTubeUrl(videoFileId)) {
        const videoId = extractYouTubeVideoId(videoFileId);
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Check if it's a base64 video (data URI)
    if (videoFileId.startsWith('data:video/')) {
        return videoFileId;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Check if it's a UUID format (encrypted video system)
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx or uuid_timestamp format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoFileId) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_\d+$/i.test(videoFileId);

    if (isUUID) {
        // New encrypted video system
        return `${apiUrl}/api/test-up/stream/video/${videoFileId}`;
    }

    // Old system with messageId
    return `${apiUrl}/api/upload/proxy/${videoFileId}`;
}

// Fetch lesson + progress + exercise song song, dùng cache nếu có
async function fetchLessonData(lessonId: string): Promise<{
    lesson: LessonWithExercise;
    progress: Progress | null;
}> {
    const [lessonResult, progressResult, exerciseResult] = await Promise.allSettled([
        lessonCache.has(lessonId)
            ? Promise.resolve(lessonCache.get(lessonId)!)
            : getLessonDetail(lessonId).then(data => {
                const l = data as LessonWithExercise;
                lessonCache.set(lessonId, l);
                return l;
            }),
        progressCache.has(lessonId)
            ? Promise.resolve(progressCache.get(lessonId)!)
            : getProgress(lessonId).then(p => {
                const prog = p as Progress;
                progressCache.set(lessonId, prog);
                return prog;
            }).catch(() => null),
        getExerciseByLessonId(lessonId),
    ]);

    if (lessonResult.status === 'rejected') throw new Error('Lesson fetch failed');

    const lesson = lessonResult.value;
    // Attach exercise data if exists
    if (exerciseResult.status === 'fulfilled' && exerciseResult.value) {
        lesson.exercise = exerciseResult.value;
        lessonCache.set(lessonId, lesson);
    }

    return {
        lesson,
        progress: progressResult.status === 'fulfilled' ? progressResult.value : null,
    };
}

// Fetch chapters, cache vĩnh viễn trong session
async function fetchChapters(courseId: string): Promise<ChapterWithLessons[]> {
    if (chaptersCache.has(courseId)) return chaptersCache.get(courseId)!;
    const data = await getCourseLearnData(courseId);
    const chapters = data.chapters || [];
    chaptersCache.set(courseId, chapters);
    return chapters;
}

// Prefetch ngầm vào cache, bỏ qua nếu đang fetch hoặc đã có
async function prefetchLesson(lessonId: string): Promise<void> {
    if (lessonCache.has(lessonId) || prefetchSet.has(lessonId)) return;
    prefetchSet.add(lessonId);
    try {
        await fetchLessonData(lessonId);
    } catch {
        // prefetch fail không sao — sẽ fetch lại khi user thực sự navigate
    } finally {
        prefetchSet.delete(lessonId);
    }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params?.lessonId as string;

    // Khởi tạo state từ cache ngay — không chờ useEffect
    const [lesson, setLesson] = useState<LessonWithExercise | null>(() => lessonCache.get(lessonId) ?? null);

    // Get courseId for chapters - persists across lesson changes
    const getCachedCourseId = () => {
        const cached = lessonCache.get(lessonId);
        return cached?.courseId || '';
    };
    const courseIdRef = useRef<string>(getCachedCourseId());

    // Initialize chapters from cache using courseId - won't reset when lessonId changes
    const [chapters, setChapters] = useState<ChapterWithLessons[]>(() => {
        if (!courseIdRef.current) return [];
        return chaptersCache.get(courseIdRef.current) ?? [];
    });

    const [progress, setProgress] = useState<Progress | null>(() => progressCache.get(lessonId) ?? null);
    const [courseTitle, setCourseTitle] = useState<string>('');
    const [courseProgress, setCourseProgress] = useState<{ total: number; completed: number; percent: number } | null>(null);

    // Chỉ show spinner lần đầu tiên mở app (cache còn rỗng)
    const [initialLoading, setInitialLoading] = useState(!lessonCache.has(lessonId));

    // Video loading state riêng để tránh màn hình đen khi chuyển bài học
    const [videoLoading, setVideoLoading] = useState(false);

    // Video
    const videoRef = useRef<HTMLVideoElement>(null);
    const youtubePlayerRef = useRef<YTPlayer | null>(null);
    const youtubeContainerRef = useRef<HTMLDivElement | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>(() => {
        const cached = lessonCache.get(lessonId);
        return cached?.type === 'video' && cached.videoFileId
            ? buildVideoUrl(cached.videoFileId)
            : '';
    });
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
    const [youtubeVideoId, setYoutubeVideoId] = useState('');
    const watchedSecondsRef = useRef(progressCache.get(lessonId)?.watchedSeconds ?? 0);
    const initialSeekDone = useRef<string | null>(null);
    const videoTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastValidTimeRef = useRef(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false); // For non-YouTube videos

    // Exercise
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<ExerciseQuestion | null>(null);
    const [quizSelected, setQuizSelected] = useState<string | null>(null);
    const [tfSelected, setTfSelected] = useState<Record<string, boolean>>({});
    const [shortAnswerText, setShortAnswerText] = useState('');
    const [ideCode, setIdeCode] = useState('');
    const [exerciseSubmitting, setExerciseSubmitting] = useState(false);
    const [exerciseResult, setExerciseResult] = useState<{ isCorrect: boolean; canProceed: boolean } | null>(null);

    // Notes
    const [notes, setNotes] = useState<{ time: number; timeStr: string; text: string; _id?: string }[]>([]);
    const [showNotePopup, setShowNotePopup] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const noteEditorRef = useRef<CustomEditorRef>(null);

    // Sidebar
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

    // Comment popup
    const [showCommentPopup, setShowCommentPopup] = useState(false);

    // Notes inline toggle
    const [showNotesInline, setShowNotesInline] = useState(false);

    // Quiz popup state
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuizQuestion, setCurrentQuizQuestion] = useState<QuizQuestion | null>(null);
    const [showQuizPopup, setShowQuizPopup] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
    const answeredQuizIds = useRef<Set<number>>(new Set());

    // ─── Navigation helpers ───────────────────────────────────────────────────

    const flattenedLessons = useMemo(() => chapters.flatMap(c => c.lessons), [chapters]);
    const currentIdx = useMemo(
        () => flattenedLessons.findIndex(l => l._id === lessonId),
        [flattenedLessons, lessonId]
    );
    const prevLesson = useMemo(
        () => currentIdx > 0 ? flattenedLessons[currentIdx - 1] : null,
        [currentIdx, flattenedLessons]
    );
    const nextLesson = useMemo(
        () => currentIdx < flattenedLessons.length - 1 ? flattenedLessons[currentIdx + 1] : null,
        [currentIdx, flattenedLessons]
    );

    // ─── Apply lesson vào state ───────────────────────────────────────────────

    const applyLesson = useCallback((lessonData: LessonWithExercise) => {
        setLesson(lessonData);

        // Load quiz questions from lesson
        if (lessonData.quizQuestions && lessonData.quizQuestions.length > 0) {
            setQuizQuestions(lessonData.quizQuestions as QuizQuestion[]);
        } else {
            setQuizQuestions([]);
        }

        if (lessonData.type === 'video' && lessonData.videoFileId) {
            const url = buildVideoUrl(lessonData.videoFileId);
            setVideoUrl(url);

            // Check if it's a YouTube video
            const isYT = isYouTubeUrl(lessonData.videoFileId);
            setIsYouTubeVideo(isYT);

            if (isYT) {
                const videoId = extractYouTubeVideoId(lessonData.videoFileId);
                setYoutubeVideoId(videoId || '');
            } else {
                setYoutubeVideoId('');
                // For non-YouTube, set loading false immediately!
                setVideoLoading(false);
            }
        } else {
            setVideoUrl('');
            setIsYouTubeVideo(false);
            setYoutubeVideoId('');
            setVideoLoading(false); // Không phải video, tắt loading
        }

        if (lessonData.type === 'exercise' && lessonData.exercise) {
            setExercise(lessonData.exercise);
            const firstQ = lessonData.exercise.questions?.[0];
            if (firstQ) {
                setCurrentQuestion(firstQ as ExerciseQuestion);
                if (firstQ.type === 'ide') setIdeCode(firstQ.starterCode || '');
            }
        } else {
            setExercise(null);
            setCurrentQuestion(null);
        }
    }, [videoUrl]);

    // ─── Save unanswered quizzes to localStorage ──────────────────────────────

    useEffect(() => {
        if (!lesson || !quizQuestions.length) return;

        // Save all unanswered quiz times to localStorage
        const unansweredQuizzes = quizQuestions
            .filter(q => !answeredQuizIds.current.has(q.time))
            .map(q => q.time);

        if (unansweredQuizzes.length > 0) {
            const quizData = {
                lessonId,
                unansweredTimes: unansweredQuizzes,
                timestamp: Date.now()
            };
            localStorage.setItem(`quizProgress_${lessonId}`, JSON.stringify(quizData));
        } else {
            localStorage.removeItem(`quizProgress_${lessonId}`);
        }
    }, [lesson, quizQuestions, lessonId]);

    // ─── Check unanswered quizzes from localStorage ───────────────────────────

    useEffect(() => {
        if (!lesson || !quizQuestions.length || showQuizPopup) return;

        const quizDataStr = localStorage.getItem(`quizProgress_${lessonId}`);
        if (!quizDataStr) return;

        try {
            const quizData = JSON.parse(quizDataStr);

            // Check if data is not too old (within 24 hours)
            const dayInMs = 24 * 60 * 60 * 1000;
            if (Date.now() - quizData.timestamp > dayInMs) {
                localStorage.removeItem(`quizProgress_${lessonId}`);
                return;
            }

            // Check if there are any unanswered quizzes that user has passed
            const unansweredPassed = quizData.unansweredTimes.find((time: number) =>
                currentVideoTime >= time && !answeredQuizIds.current.has(time)
            );

            if (unansweredPassed !== undefined) {
                // Find the question
                const question = quizQuestions.find(q => q.time === unansweredPassed);
                if (question) {
                    console.log('[Quiz Enforcement] User passed unanswered quiz at', unansweredPassed);

                    // Pause video
                    if (isYouTubeVideo && youtubePlayerRef.current) {
                        youtubePlayerRef.current.pauseVideo();
                    }

                    // Show quiz popup
                    setCurrentQuizQuestion(question);
                    setShowQuizPopup(true);
                    setQuizAnswer(null);
                    setQuizAnswered(false);
                    setQuizCorrect(null);
                }
            }
        } catch (err) {
            console.error('Failed to parse quiz progress:', err);
            localStorage.removeItem(`quizProgress_${lessonId}`);
        }
    }, [lesson, quizQuestions, lessonId, currentVideoTime, showQuizPopup, isYouTubeVideo]);

    // ─── Main fetch effect ────────────────────────────────────────────────────

    useEffect(() => {
        if (!lessonId) return;

        // Reset states khi chuyển lesson
        setQuizSelected(null);
        setTfSelected({});
        setShortAnswerText('');
        setExerciseResult(null);
        watchedSecondsRef.current = 0;
        initialSeekDone.current = null;

        // Nếu đã cache → render ngay, không chờ
        const cachedLesson = lessonCache.get(lessonId);
        const cachedProgress = progressCache.get(lessonId);
        if (cachedLesson) {
            applyLesson(cachedLesson);
            setProgress(cachedProgress ?? null);
            watchedSecondsRef.current = cachedProgress?.watchedSeconds ?? 0;
            setInitialLoading(false);
        }

        // Fetch ngầm (hoặc fetch lần đầu nếu chưa cache)
        const load = async () => {
            try {
                const { lesson: lessonData, progress: prog } = await fetchLessonData(lessonId);

                applyLesson(lessonData);
                // Video loading sẽ được set false trong applyLesson hoặc khi video ready

                // Save last lesson to localStorage
                setCourseLastLesson(lessonData.courseId, lessonId);

                if (prog) {
                    progressCache.set(lessonId, prog);
                    setProgress(prog);
                    watchedSecondsRef.current = prog.watchedSeconds ?? 0;
                }

                // Chapters: fetch 1 lần duy nhất cho toàn bộ course
                const chaps = await fetchChapters(lessonData.courseId);
                setChapters(chaps);

                // Fetch course progress
                try {
                    const courseProg = await getCourseProgress(lessonData.courseId);
                    setCourseProgress({ total: courseProg.total, completed: courseProg.completed, percent: courseProg.percent });
                } catch (err) {
                    console.error('[LearnPage] Failed to fetch course progress:', err);
                }

                // Fetch notes from backend instead of localStorage
                try {
                    const fetchedNotes = await getNotesByLesson(lessonId);
                    setNotes(fetchedNotes);
                } catch (err) {
                    console.error('[LearnPage] Failed to fetch notes:', err);
                    setNotes([]);
                }
            } catch (err) {
                console.error('[LearnPage] fetch failed:', err);
                setVideoLoading(false); // Reset loading nếu có lỗi
            } finally {
                setInitialLoading(false);
            }
        };

        load();
    }, [lessonId, applyLesson]);

    // ─── YouTube Player handlers ──────────────────────────────────────────────

    const handlePlayerReady = useCallback((event: YTPlayerEvent) => {
        console.log('[YouTube] Player ready');
        // Seek to saved progress
        if (watchedSecondsRef.current > 0 && initialSeekDone.current !== lessonId) {
            event.target.seekTo(watchedSecondsRef.current, true);
            // Update lastValidTimeRef to prevent anti-skip from triggering on restore
            lastValidTimeRef.current = watchedSecondsRef.current;
            initialSeekDone.current = lessonId;
        }
        // Video is ready, turn off loading
        setVideoLoading(false);
        // Don't autoplay - let user click play button
        console.log('[YouTube] Player ready, waiting for user to play');
    }, [lessonId]);

    const handleStateChange = useCallback((event: YTPlayerEvent) => {
        const player = event.target;
        // Update isPlaying state
        if (event.data === window.YT!.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else if (event.data === window.YT!.PlayerState.PAUSED || event.data === window.YT!.PlayerState.ENDED) {
            setIsPlaying(false);
        }

        // Update time when playing
        if (event.data === window.YT!.PlayerState.PLAYING) {
            // Clear any existing interval
            if (videoTimeIntervalRef.current) {
                clearInterval(videoTimeIntervalRef.current);
            }

            // Start new interval to track time from YouTube player
            videoTimeIntervalRef.current = setInterval(() => {
                const currentTime = Math.floor(player.getCurrentTime());
                const timeDiff = currentTime - lastValidTimeRef.current;

                // Check if user seeked forward more than 30 seconds
                if (timeDiff > 30) {
                    // Seek back to last valid position
                    player.seekTo(lastValidTimeRef.current, true);
                    toast.error('Không thể tua bài học! Bạn cần xem từ đầu.', {
                        duration: 3000,
                    });
                    return;
                }

                // Update last valid time
                lastValidTimeRef.current = currentTime;
                setCurrentVideoTime(currentTime);

                if (currentTime > 0 && currentTime % 10 === 0 && currentTime !== watchedSecondsRef.current) {
                    watchedSecondsRef.current = currentTime;
                    const duration = lesson?.duration || player.getDuration() || 0;
                    const isCompleted = duration > 0 && currentTime >= (duration - 10);
                    const update = { watchedSeconds: currentTime, isCompleted };
                    progressCache.set(lessonId, { ...progressCache.get(lessonId), ...update } as Progress);
                    saveProgress(lessonId, update).catch(console.error);

                    // Refresh course progress and chapters when lesson is completed
                    if (isCompleted && lesson?.courseId) {
                        getCourseProgress(lesson.courseId).then(courseProg => {
                            setCourseProgress({ total: courseProg.total, completed: courseProg.completed, percent: courseProg.percent });
                        }).catch(console.error);

                        // Refresh chapters to update lesson lock states
                        getCourseLearnData(lesson.courseId).then(data => {
                            setChapters(data.chapters || []);
                            // Update cache to reflect new progress states
                            chaptersCache.set(lesson.courseId, data.chapters || []);
                        }).catch(console.error);
                    }
                }
            }, 1000);
        } else {
            // Pause or ended - stop interval
            if (videoTimeIntervalRef.current) {
                clearInterval(videoTimeIntervalRef.current);
                videoTimeIntervalRef.current = null;
            }

            // Save progress on pause/end
            if (event.data === window.YT!.PlayerState.PAUSED || event.data === window.YT!.PlayerState.ENDED) {
                const currentTime = Math.floor(player.getCurrentTime());
                const duration = lesson?.duration || player.getDuration() || 0;
                const isCompleted = event.data === window.YT!.PlayerState.ENDED || (duration > 0 && currentTime >= (duration - 10));
                const update = { watchedSeconds: currentTime, isCompleted };
                saveProgress(lessonId, update).catch(console.error);
            }
        }
    }, [lessonId, lesson]);

    // ─── Load YouTube IFrame API ──────────────────────────────────────────────

    useEffect(() => {
        // Load YouTube IFrame API script if not already loaded
        if (typeof window !== 'undefined' && !window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
    }, []);

    // ─── Prefetch bài kề ─────────────────────────────────────────────────────

    useEffect(() => {
        if (nextLesson?._id) {
            router.prefetch(`/learn/${nextLesson._id}`);
            prefetchLesson(nextLesson._id);
        }
        if (prevLesson?._id) {
            router.prefetch(`/learn/${prevLesson._id}`);
            prefetchLesson(prevLesson._id);
        }
    }, [nextLesson, prevLesson, router]);

    // ─── Initialize YouTube Player function ───────────────────────────────────

    const initYouTubePlayer = useCallback((videoId: string, elementId: string) => {
        const tryInit = () => {
            if (!window.YT?.Player) {
                setTimeout(tryInit, 100);
                return;
            }

            // Check if element still exists in DOM
            if (!document.getElementById(elementId)) return;

            // Destroy old player if exists
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }

            // Create new player
            youtubePlayerRef.current = new window.YT.Player(elementId, {
                videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    fs: 1,
                    disablekb: 0,
                    iv_load_policy: 3,
                },
                events: {
                    onReady: handlePlayerReady,
                    onStateChange: handleStateChange,
                },
            });
        };
        tryInit();
    }, [handlePlayerReady, handleStateChange]);

    // ─── YouTube Container Ref Callback ───────────────────────────────────────

    const youtubeContainerCallback = useCallback((node: HTMLDivElement | null) => {
        youtubeContainerRef.current = node;
        if (node && youtubeVideoId) {
            initYouTubePlayer(youtubeVideoId, 'youtube-player');
        }
    }, [youtubeVideoId, initYouTubePlayer]);

    // ─── Reinit YouTube Player when videoId changes ──────────────────────────

    useEffect(() => {
        if (isYouTubeVideo && youtubeVideoId && youtubeContainerRef.current) {
            initYouTubePlayer(youtubeVideoId, 'youtube-player');
        }
    }, [youtubeVideoId, isYouTubeVideo, initYouTubePlayer]);

    // ─── Cleanup on unmount or video change ───────────────────────────────────

    useEffect(() => {
        return () => {
            if (videoTimeIntervalRef.current) {
                clearInterval(videoTimeIntervalRef.current);
                videoTimeIntervalRef.current = null;
            }
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }
        };
    }, [youtubeVideoId]);

    // ─── Video progress tracking (non-YouTube videos) ─────────────────────────

    // Effect 1: Initialize currentVideoTime when lesson changes (NOT dependent on isVideoPlaying)
    useEffect(() => {
        if (!lesson || lesson.type !== 'video' || isYouTubeVideo) return;
        setCurrentVideoTime(watchedSecondsRef.current);
    }, [lessonId, lesson?.type, isYouTubeVideo]);

    // Effect 2: Interval tracking ONLY for iframe videos (not data:video/)
    useEffect(() => {
        if (!lesson || lesson.type !== 'video' || isYouTubeVideo) return;

        const isIframeVideo = !videoUrl.startsWith('data:video/');
        if (!isIframeVideo) return; // data:video/ uses onTimeUpdate, no interval needed

        if (isVideoPlaying) {
            videoTimeIntervalRef.current = setInterval(() => {
                setCurrentVideoTime(prev => {
                    const newTime = prev + 1;
                    if (newTime > 0 && newTime % 10 === 0 && newTime !== watchedSecondsRef.current) {
                        watchedSecondsRef.current = newTime;
                        const duration = lesson.duration || 0;
                        const isCompleted = duration > 0 && newTime >= (duration - 10);
                        const update = { watchedSeconds: newTime, isCompleted };
                        progressCache.set(lessonId, { ...progressCache.get(lessonId), ...update } as Progress);
                        saveProgress(lessonId, update).catch(console.error);

                        if (isCompleted && lesson?.courseId) {
                            getCourseProgress(lesson.courseId).then(courseProg => {
                                setCourseProgress({ total: courseProg.total, completed: courseProg.completed, percent: courseProg.percent });
                            }).catch(console.error);

                            getCourseLearnData(lesson.courseId).then(data => {
                                setChapters(data.chapters || []);
                                chaptersCache.set(lesson.courseId, data.chapters || []);
                            }).catch(console.error);
                        }
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (videoTimeIntervalRef.current) {
                clearInterval(videoTimeIntervalRef.current);
                videoTimeIntervalRef.current = null;
            }
        };
    }, [lesson, lessonId, isYouTubeVideo, isVideoPlaying, videoUrl]);

    // ─── Video control helpers ────────────────────────────────────────────────

    const pauseVideo = useCallback(() => {
        if (isYouTubeVideo && youtubePlayerRef.current && typeof youtubePlayerRef.current.pauseVideo === 'function') {
            youtubePlayerRef.current.pauseVideo();
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isYouTubeVideo]);

    const playVideo = useCallback(() => {
        if (isYouTubeVideo && youtubePlayerRef.current) {
            youtubePlayerRef.current.playVideo();
        } else if (videoRef.current) {
            videoRef.current.play();
        }
    }, [isYouTubeVideo]);

    // ─── Quiz popup logic ─────────────────────────────────────────────────────

    // Check time and show quiz popup if needed
    useEffect(() => {
        // Skip if no quiz questions or popup is already showing
        if (!quizQuestions.length || showQuizPopup) return;

        // Debug logs
        console.log('[Quiz Debug] Current time:', currentVideoTime);
        console.log('[Quiz Debug] Quiz questions:', quizQuestions);
        console.log('[Quiz Debug] Answered IDs:', Array.from(answeredQuizIds.current));

        const question = quizQuestions.find(q => {
            const match = q.time === currentVideoTime && !answeredQuizIds.current.has(q.time);
            if (match) {
                console.log('[Quiz Debug] Found matching question:', q);
            }
            return match;
        });

        if (question) {
            console.log('[Quiz Debug] Showing popup for question at time:', question.time);
            setCurrentQuizQuestion(question);
            setShowQuizPopup(true);
            setQuizAnswer(null);
            setQuizAnswered(false);
            setQuizCorrect(null);
            pauseVideo();
        }
    }, [currentVideoTime, quizQuestions, showQuizPopup, pauseVideo]);

    // ─── Notes ───────────────────────────────────────────────────────────────

    const handleAddNote = useCallback(async (content: string) => {
        if (!content.trim()) return;

        // Capture current playing state in a local variable
        const wasPlaying = isPlaying;

        // Pause video
        pauseVideo();

        setIsSavingNote(true);

        try {
            // Use actual video time from ref if available, otherwise use state
            const time = videoRef.current ? Math.floor(videoRef.current.currentTime) : currentVideoTime;
            const m = Math.floor(time / 60).toString().padStart(2, '0');
            const s = (time % 60).toString().padStart(2, '0');
            const timeStr = `${m}:${s}`;

            // Call backend API to save note
            const savedNote = await createNote({
                lessonId,
                courseId: lesson?.courseId || '',
                time,
                timeStr,
                text: content.trim()
            });

            // Add the saved note to state
            const newNotes = [...notes, savedNote];
            setNotes(newNotes);

            toast.success('Ghi chú đã được lưu thành công!');

            setShowNotePopup(false);

            // Resume video if it was playing before
            if (wasPlaying) {
                playVideo();
            }
        } catch (error) {
            console.error('Failed to save note:', error);
            toast.error('Lưu ghi chú thất bại, vui lòng thử lại!');
            // Do NOT resume video on failure
        } finally {
            setIsSavingNote(false);
        }
    }, [notes, lessonId, lesson, currentVideoTime, pauseVideo, playVideo, isPlaying]);

    const handleOpenNotePopup = useCallback(() => {
        // Sync currentVideoTime before opening popup
        if (isYouTubeVideo && youtubePlayerRef.current) {
            const currentTime = Math.floor(youtubePlayerRef.current.getCurrentTime());
            setCurrentVideoTime(currentTime);
        } else if (videoRef.current) {
            setCurrentVideoTime(Math.floor(videoRef.current.currentTime));
        }

        setShowNotePopup(true);
        if (noteEditorRef.current) {
            noteEditorRef.current.setContent('');
        }
        // Pause video when opening note popup
        pauseVideo();
    }, [pauseVideo, isYouTubeVideo]);

    const handleNoteClick = useCallback((noteTime: number) => {
        // Seek video to note time
        if (isYouTubeVideo && youtubePlayerRef.current) {
            youtubePlayerRef.current.seekTo(noteTime, true);
        } else if (videoRef.current) {
            videoRef.current.currentTime = noteTime;
        }
        setCurrentVideoTime(noteTime);
        watchedSecondsRef.current = noteTime;
    }, [isYouTubeVideo]);

    // ─── Quiz answer handlers ─────────────────────────────────────────────────

    const handleQuizSubmit = useCallback(() => {
        if (!currentQuizQuestion || !quizAnswer) return;

        setQuizAnswered(true);

        // Check if answer is correct
        let isCorrect = false;
        if (currentQuizQuestion.type === 'multiple-choice') {
            const correctLetter = currentQuizQuestion.correctAnswers?.[0];
            isCorrect = quizAnswer === correctLetter;
        } else if (currentQuizQuestion.type === 'true-false') {
            // For true-false, compare answers
            // Handle 3 formats:
            // 1. ["a:true", "b:false", "c:true", "d:false"] - letter:value format
            // 2. ["true", "true", "false", "false"] - direct boolean array
            // 3. ["a", "b"] - only correct answer letters (rest are false)

            const correctAnswers = currentQuizQuestion.correctAnswers || [];

            if (correctAnswers[0]?.includes(':')) {
                // Format 1: "a:true,b:false,c:true,d:false"
                const userAnswers = quizAnswer.split(',').sort().join(',');
                const correctAnswersStr = correctAnswers.sort().join(',');
                isCorrect = userAnswers === correctAnswersStr;
            } else if (correctAnswers.length < 4 && !correctAnswers[0]?.includes('true') && !correctAnswers[0]?.includes('false')) {
                // Format 3: ["a", "b"] - only letters of correct answers
                // Parse user answers
                const userAnswersObj: Record<string, boolean> = {};
                quizAnswer.split(',').forEach(part => {
                    const [letter, value] = part.split(':');
                    if (letter && value !== undefined) {
                        userAnswersObj[letter] = value === 'true';
                    }
                });

                // Check if all correct letters are marked true and all others are marked false
                const correctLetters = new Set(correctAnswers);
                const allLetters = ['a', 'b', 'c', 'd'];
                isCorrect = allLetters.every(letter =>
                    userAnswersObj[letter] === correctLetters.has(letter)
                );
            } else {
                // Format 2: ["true", "true", "false", "false"]
                // Parse user answers
                const userAnswersObj: Record<string, boolean> = {};
                quizAnswer.split(',').forEach(part => {
                    const [letter, value] = part.split(':');
                    if (letter && value !== undefined) {
                        userAnswersObj[letter] = value === 'true';
                    }
                });

                // Get user answers in order a, b, c, d
                const correctValues = correctAnswers.map(ans => ans === 'true');

                // Compare each letter's answer
                const userAnswerArray = ['a', 'b', 'c', 'd'].map(letter => userAnswersObj[letter]);
                isCorrect = userAnswerArray.every((userVal, idx) => userVal === correctValues[idx]);
            }
        } else if (currentQuizQuestion.type === 'short-answer') {
            // For short-answer, compare trimmed values
            isCorrect = quizAnswer.trim() === currentQuizQuestion.correctAnswers?.[0]?.trim();
        }

        setQuizCorrect(isCorrect);
    }, [currentQuizQuestion, quizAnswer]);

    const handleQuizContinue = useCallback(() => {
        if (currentQuizQuestion) {
            answeredQuizIds.current.add(currentQuizQuestion.time);
        }
        setShowQuizPopup(false);
        setCurrentQuizQuestion(null);
        setQuizAnswer(null);
        setQuizAnswered(false);
        setQuizCorrect(null);
        playVideo();
    }, [currentQuizQuestion, playVideo]);

    // ─── Exercise submit ──────────────────────────────────────────────────────

    const handleExerciseSubmit = useCallback(async () => {
        if (!exercise || !currentQuestion) return;
        setExerciseSubmitting(true);
        try {
            let answer: ExerciseAnswer;
            if (currentQuestion.type === 'quiz') answer = quizSelected as string;
            else if (currentQuestion.type === 'true-false') answer = tfSelected as Record<string, boolean>;
            else if (currentQuestion.type === 'short-answer') answer = shortAnswerText;
            else if (currentQuestion.type === 'ide') answer = ideCode;
            else answer = shortAnswerText;

            const res = await submitExercise(exercise._id as string, { answer }) as { isCorrect: boolean; canProceed: boolean };
            setExerciseResult(res);

            if (res.isCorrect) {
                const saved = await saveProgress(lessonId, { isCompleted: true, watchedSeconds: 0 });
                const next = (saved as Progress) ?? { ...progressCache.get(lessonId), isCompleted: true } as Progress;
                progressCache.set(lessonId, next);
                setProgress(next);

                // Refresh course progress after completing exercise
                if (lesson?.courseId) {
                    try {
                        const courseProg = await getCourseProgress(lesson.courseId);
                        setCourseProgress({ total: courseProg.total, completed: courseProg.completed, percent: courseProg.percent });
                    } catch (err) {
                        console.error('[LearnPage] Failed to refresh course progress:', err);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setExerciseSubmitting(false);
        }
    }, [exercise, currentQuestion, quizSelected, tfSelected, shortAnswerText, ideCode, lessonId]);

    // ─── Navigation actions ───────────────────────────────────────────────────

    // Instant — không có loading state, cache đã lo
    const handleNavigateToLesson = useCallback((id: string) => {
        router.push(`/learn/${id}`);
    }, [router]);

    const handlePrevLesson = useCallback(() => { if (prevLesson?._id) handleNavigateToLesson(prevLesson._id); }, [prevLesson, handleNavigateToLesson]);
    const handleNextLesson = useCallback(() => { if (nextLesson?._id) handleNavigateToLesson(nextLesson._id); }, [nextLesson, handleNavigateToLesson]);
    const handleBackToCourses = useCallback(() => router.push('/khoahoc'), [router]);

    const toggleChapter = useCallback((chapterId: string) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(chapterId)) {
                next.delete(chapterId);
            } else {
                next.add(chapterId);
            }
            return next;
        });
    }, []);

    // Auto-expand chapter chứa bài học hiện tại
    useEffect(() => {
        const currentChapter = chapters.find(ch => ch.lessons.some(l => l._id === lessonId));
        if (currentChapter?._id) {
            setExpandedChapters(prev => {
                // Only update if not already expanded
                if (!prev.has(currentChapter._id!)) {
                    const next = new Set(prev);
                    next.add(currentChapter._id!);
                    return next;
                }
                return prev;
            });
        }
    }, [chapters, lessonId]);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden">

            {/* Header */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={handleBackToCourses} className="hover:text-blue-600 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <img src="/images/logo.png" alt="CNCode" width={100} height={32} className="h-8 w-auto" />
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-3 text-xs text-gray-600 font-semibold max-w-2xl">
                        <span className="truncate">
                            {initialLoading
                                ? <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                : (lesson?.title || 'Đang tải...')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Progress Circle */}
                    <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 transform -rotate-90">
                            <circle
                                cx="20"
                                cy="20"
                                r="16"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r="16"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 16}`}
                                strokeDashoffset={`${2 * Math.PI * 16 * (1 - (courseProgress?.percent || 0) / 100)}`}
                                className="text-blue-600 transition-all duration-300"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-700">
                                {courseProgress?.percent || 0}%
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowNotesInline(!showNotesInline)}
                        className={`flex items-center gap-2 transition-colors ${showNotesInline ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        title="Ghi chú"
                    >
                        <StickyNote className="w-4 h-4" />
                        <span className="text-sm font-semibold">Ghi chú</span>
                    </button>

                    <button
                        onClick={() => setShowCommentPopup(true)}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-semibold">Bình luận</span>
                    </button>
                </div>
            </header>

            {/* Main */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left content */}
                <div className="flex-1 overflow-y-auto flex flex-col no-scrollbar">

                    {/* Video / Exercise */}
                    <div className={`w-full relative shrink-0 ${lesson?.type === 'exercise' ? 'flex-1 bg-gray-50' : 'h-[550px] bg-black'}`}>
                        {initialLoading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : !lesson ? (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm">
                                Không tìm thấy bài học
                            </div>
                        ) : lesson.type === 'video' ? (
                            videoLoading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : isYouTubeVideo ? (
                                <div
                                    id="youtube-player"
                                    ref={youtubeContainerCallback}
                                    className="w-full h-full"
                                />
                            ) : videoUrl.startsWith('data:video/') ? (
                                <video
                                    key={videoUrl}
                                    ref={videoRef}
                                    src={videoUrl}
                                    controls
                                    className="w-full h-full"
                                    onLoadedMetadata={() => {
                                        if (videoRef.current && watchedSecondsRef.current > 0) {
                                            videoRef.current.currentTime = watchedSecondsRef.current;
                                        }
                                    }}
                                    onTimeUpdate={() => {
                                        // Only update currentVideoTime when video is playing
                                        if (videoRef.current && isVideoPlaying) {
                                            const currentTime = Math.floor(videoRef.current.currentTime);
                                            setCurrentVideoTime(currentTime);

                                            // Save progress every 10 seconds
                                            if (currentTime > 0 && currentTime % 10 === 0 && currentTime !== watchedSecondsRef.current) {
                                                watchedSecondsRef.current = currentTime;
                                                const duration = lesson.duration || 0;
                                                const isCompleted = duration > 0 && currentTime >= (duration - 10);
                                                const update = { watchedSeconds: currentTime, isCompleted };
                                                progressCache.set(lessonId, { ...progressCache.get(lessonId), ...update } as Progress);
                                                saveProgress(lessonId, update).catch(console.error);

                                                // Refresh course progress when lesson is completed
                                                if (isCompleted && lesson?.courseId) {
                                                    getCourseProgress(lesson.courseId).then(courseProg => {
                                                        setCourseProgress({ total: courseProg.total, completed: courseProg.completed, percent: courseProg.percent });
                                                    }).catch(console.error);

                                                    // Refresh chapters to update lesson lock states
                                                    getCourseLearnData(lesson.courseId).then(data => {
                                                        setChapters(data.chapters || []);
                                                        // Update cache to reflect new progress states
                                                        chaptersCache.set(lesson.courseId, data.chapters || []);
                                                    }).catch(console.error);
                                                }
                                            }
                                        }
                                    }}
                                    onPlay={() => {
                                        setIsVideoPlaying(true);
                                        // Sync currentVideoTime when play starts
                                        if (videoRef.current) {
                                            setCurrentVideoTime(Math.floor(videoRef.current.currentTime));
                                        }
                                    }}
                                    onPause={() => {
                                        setIsVideoPlaying(false);
                                        // Sync currentVideoTime when pause
                                        if (videoRef.current) {
                                            setCurrentVideoTime(Math.floor(videoRef.current.currentTime));
                                        }
                                    }}
                                    onSeeking={() => {
                                        // Sync currentVideoTime when user seeks/scrubs
                                        if (videoRef.current) {
                                            setCurrentVideoTime(Math.floor(videoRef.current.currentTime));
                                        }
                                    }}
                                    onSeeked={() => {
                                        // Sync currentVideoTime after seek completes
                                        if (videoRef.current) {
                                            setCurrentVideoTime(Math.floor(videoRef.current.currentTime));
                                        }
                                    }}
                                    onEnded={() => {
                                        setIsVideoPlaying(false);
                                        // Sync currentVideoTime when ended
                                        if (videoRef.current) {
                                            setCurrentVideoTime(Math.floor(videoRef.current.currentTime));
                                        }
                                    }}
                                />
                            ) : (
                                <iframe
                                    key={videoUrl}
                                    src={videoUrl}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    onLoad={() => {
                                        // For iframe videos, we rely on interval tracking
                                        // as we can't directly access video time due to cross-origin
                                        setVideoLoading(false);
                                    }}
                                />
                            )
                        ) : (
                            <div className="w-full h-full flex flex-col p-8 overflow-y-auto">
                                {currentQuestion ? (
                                    <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl p-8 border border-gray-200 shadow-lg flex-grow flex flex-col">
                                        <div className="text-base text-gray-700 mb-6 leading-relaxed">
                                            <StaticContent content={currentQuestion.question} />
                                        </div>

                                        {currentQuestion.type === 'quiz' && (
                                            <div className="space-y-3 mb-6">
                                                {currentQuestion.options?.map((opt, i) => {
                                                    // Handle both new format (string) and legacy format (object)
                                                    let letter: string;
                                                    let text: string;
                                                    if (typeof opt === 'string') {
                                                        const optStr = opt as string;
                                                        letter = optStr.charAt(0);
                                                        text = optStr.slice(optStr.indexOf(' ') + 1);
                                                    } else {
                                                        letter = String.fromCharCode(65 + i);
                                                        text = opt.text;
                                                    }
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => setQuizSelected(letter)}
                                                            className={`w-full flex items-center gap-3 p-3 border rounded-2xl text-left font-semibold text-sm transition-all ${quizSelected === letter ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'}`}
                                                        >
                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${quizSelected === letter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                                {letter.toUpperCase()}
                                                            </span>
                                                            <span className="flex-1 self-center"><StaticContent content={text} /></span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {currentQuestion.type === 'true-false' && (
                                            <div className="space-y-4 mb-6">
                                                {currentQuestion.options?.map((opt, i) => {
                                                    // Handle both new format (string) and legacy format (object)
                                                    let letter: string;
                                                    let text: string;
                                                    if (typeof opt === 'string') {
                                                        const optStr = opt as string;
                                                        letter = optStr.charAt(0).toLowerCase();
                                                        text = optStr.slice(optStr.indexOf(' ') + 1);
                                                    } else {
                                                        letter = String.fromCharCode(97 + i);
                                                        text = opt.text;
                                                    }
                                                    return (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                                                            <span className="font-semibold text-sm text-gray-700"><StaticContent content={text} /></span>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => setTfSelected(prev => ({ ...prev, [letter]: true }))} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tfSelected[letter] === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Đúng</button>
                                                                <button onClick={() => setTfSelected(prev => ({ ...prev, [letter]: false }))} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tfSelected[letter] === false ? 'bg-red-600   text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Sai</button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {currentQuestion.type === 'short-answer' && (
                                            <input
                                                type="text"
                                                value={shortAnswerText}
                                                onChange={e => setShortAnswerText(e.target.value)}
                                                placeholder="Nhập câu trả lời..."
                                                className="w-full bg-white border border-gray-300 rounded-2xl px-5 py-4 text-sm text-gray-900 focus:outline-none focus:border-blue-500 mb-6"
                                            />
                                        )}

                                        {currentQuestion.type === 'ide' && (
                                            <div className="flex-grow flex flex-col mb-6">
                                                <div className="bg-gray-900 border border-gray-300 rounded-2xl overflow-hidden flex flex-col flex-grow min-h-[300px]">
                                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 text-xs font-mono text-gray-600">
                                                        {currentQuestion.language || 'javascript'}
                                                    </div>
                                                    <textarea
                                                        value={ideCode}
                                                        onChange={e => setIdeCode(e.target.value)}
                                                        className="w-full flex-grow bg-gray-900 text-gray-100 font-mono text-sm p-4 outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {exerciseResult && (
                                            <div className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 ${exerciseResult.isCorrect ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <span>{exerciseResult.isCorrect ? 'Tuyệt vời! Bạn đã hoàn thành đúng bài tập.' : 'Đáp án chưa chính xác, hãy thử lại.'}</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleExerciseSubmit}
                                            disabled={exerciseSubmitting}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {exerciseSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Nộp bài tập
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-gray-600 text-sm">Chưa có bài tập cho bài học này.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title Section - Only for video lessons */}
                    {lesson?.type === 'video' && (
                        <div className="p-8 lg:px-12 lg:pt-8 lg:pb-4 w-full bg-white border-b border-gray-200">
                            <div className="max-w-5xl mx-auto">
                                {initialLoading ? (
                                    <div className="space-y-3">
                                        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                                    </div>
                                ) : lesson ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                                            <CustomButton
                                                onClick={handleOpenNotePopup}
                                                variant="outline"
                                                size="medium"
                                                className="whitespace-nowrap !text-blue-600 !border-blue-600 hover:!bg-blue-50"
                                            >
                                                <FileText className="w-4 h-4 mr-1.5" />
                                                Ghi chú tại {(() => {
                                                    const m = Math.floor(currentVideoTime / 60).toString().padStart(2, '0');
                                                    const s = (currentVideoTime % 60).toString().padStart(2, '0');
                                                    return `${m}:${s}`;
                                                })()}
                                            </CustomButton>
                                        </div>
                                        <p className="text-gray-500 text-xs">
                                            {(() => {
                                                const date = new Date(lesson.updatedAt || '');
                                                const day = date.getDate();
                                                const month = date.getMonth() + 1;
                                                const year = date.getFullYear();
                                                return `Cập nhật ngày ${day} tháng ${month} năm ${year}`;
                                            })()}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Description Section - Only for video lessons */}
                    {lesson?.type === 'video' && (
                        <div className="p-8 lg:p-12 w-full bg-white">
                            <div className="max-w-5xl mx-auto">
                                {initialLoading ? (
                                    <div className="space-y-4 border-t border-gray-200 pt-10">
                                        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                                    </div>
                                ) : hasRealContent(lesson?.description) && lesson?.description && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Nội dung bài học</h3>
                                        <StaticContent content={lesson.description} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-96 bg-white border-l border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-200 font-bold text-sm tracking-wide text-gray-900">NỘI DUNG KHOÁ HỌC</div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                        {chapters.map((chapter, index) => {
                            if (!chapter._id) return null;
                            const isExpanded = expandedChapters.has(chapter._id);
                            const hasActiveLesson = chapter.lessons.some(l => l._id === lessonId);

                            // Calculate metadata
                            const totalLessons = chapter.lessons.length;
                            const exerciseCount = chapter.lessons.filter(l => l.type === 'exercise').length;
                            const totalDuration = chapter.lessons
                                .filter(l => l.type === 'video' && l.duration)
                                .reduce((sum, l) => sum + (l.duration || 0), 0);
                            const durationMinutes = Math.floor(totalDuration / 60);
                            const durationSeconds = totalDuration % 60;

                            return (
                                <div key={chapter._id} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                                    <button
                                        onClick={() => toggleChapter(chapter._id!)}
                                        className={`w-full p-3 transition-colors ${hasActiveLesson ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold ${hasActiveLesson ? 'text-blue-600' : 'text-gray-500'}`}>
                                                    {index + 1}
                                                </span>
                                                <h4 className={`text-xs font-bold ${hasActiveLesson ? 'text-blue-600' : 'text-gray-900'}`}>
                                                    {chapter.title}
                                                </h4>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className={`w-4 h-4 ${hasActiveLesson ? 'text-blue-600' : 'text-gray-500'}`} />
                                            ) : (
                                                <ChevronDown className={`w-4 h-4 ${hasActiveLesson ? 'text-blue-600' : 'text-gray-500'}`} />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                            <span>{totalLessons} bài học</span>
                                            {exerciseCount > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{exerciseCount} bài tập</span>
                                                </>
                                            )}
                                            {totalDuration > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{durationMinutes}:{durationSeconds.toString().padStart(2, '0')}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <div className="border-t border-gray-200 p-2 space-y-1 bg-gray-50">
                                            {chapter.lessons.map((les, lessonIndex) => {
                                                const isActive = les._id === lessonId;
                                                const duration = les.duration || 0;
                                                const durationMin = Math.floor(duration / 60);
                                                const durationSec = duration % 60;
                                                const durationStr = `${durationMin.toString().padStart(2, '0')}:${durationSec.toString().padStart(2, '0')}`;

                                                // Check if previous lesson is completed using the progress data from API
                                                const prevLessonInChapter = lessonIndex > 0 ? chapter.lessons[lessonIndex - 1] : null;
                                                // Use progress from lesson object (returned by API) instead of cache
                                                const prevLessonProgress = prevLessonInChapter?.progress;
                                                const isPrevCompleted = !prevLessonInChapter || prevLessonProgress?.isCompleted || false;
                                                const isLocked = !isPrevCompleted && !isActive;

                                                return (
                                                    <button
                                                        key={les._id}
                                                        onClick={() => !isLocked && les._id && handleNavigateToLesson(les._id)}
                                                        disabled={isLocked}
                                                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${isActive
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : isLocked
                                                                ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                                                : 'hover:bg-white text-gray-600'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-200'}`}>
                                                            {isLocked ? (
                                                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                                            ) : les.type === 'video' ? (
                                                                <Play className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                                            ) : (
                                                                <HelpCircle className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>{les.title}</p>
                                                            <p className={`text-[10px] ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                                                                {durationStr}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer nav */}
            <footer className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
                <CustomButton
                    onClick={handlePrevLesson}
                    disabled={!prevLesson}
                    variant="outline"
                    size="medium"
                >
                    <ChevronLeft className="w-4 h-4" /> BÀI TRƯỚC
                </CustomButton>
                <CustomButton
                    onClick={handleNextLesson}
                    disabled={!nextLesson}
                    variant="primary"
                    size="medium"
                >
                    BÀI TIẾP THEO <ChevronRight className="w-4 h-4" />
                </CustomButton>
            </footer>

            {/* Comment Popup Overlay */}
            {showCommentPopup && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                        onClick={() => setShowCommentPopup(false)}
                    />
                    <div
                        className={`fixed top-0 right-0 h-full w-[494px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${showCommentPopup ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4">
                            <h2 className="text-lg font-bold text-gray-900">Bình luận</h2>
                            <button
                                onClick={() => setShowCommentPopup(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Comment Section */}
                        <div className="flex-1 overflow-hidden">
                            <CommentSection
                                targetType="lesson"
                                targetId={lessonId}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Notes Inline Section - REMOVED, using popup instead */}

            {/* Note Popup */}
            {showNotePopup && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                        onClick={() => setShowNotePopup(false)}
                    />
                    <div
                        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${showNotePopup ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Ghi chú tại {(() => {
                                    // Use actual video time from ref if available, otherwise use state
                                    const actualTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : currentVideoTime;
                                    const m = Math.floor(actualTime / 60).toString().padStart(2, '0');
                                    const s = (actualTime % 60).toString().padStart(2, '0');
                                    return `${m}:${s}`;
                                })()}
                            </h2>
                            <button
                                onClick={() => setShowNotePopup(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={isSavingNote}
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 overflow-hidden p-4">
                            <CustomEditor
                                ref={noteEditorRef}
                                initialValue=""
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200">
                            <CustomButton
                                onClick={() => handleAddNote(noteEditorRef.current?.getContent() || '')}
                                variant="primary"
                                size="medium"
                                className="w-full"
                                disabled={isSavingNote}
                            >
                                {isSavingNote ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu ghi chú'
                                )}
                            </CustomButton>
                        </div>
                    </div>
                </>
            )}

            {/* Notes List Popup (from header) */}
            {showNotesInline && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                        onClick={() => setShowNotesInline(false)}
                    />
                    <div
                        className={`fixed top-0 right-0 h-full w-[494px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${showNotesInline ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Ghi chú của tôi ({notes.length})
                            </h2>
                            <button
                                onClick={() => setShowNotesInline(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Notes List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {notes.map((n, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleNoteClick(n.time)}
                                        className="p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                {n.timeStr}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700 leading-relaxed">
                                            <StaticContent content={n.text} />
                                        </div>
                                    </div>
                                ))}
                                {notes.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-8">Chưa có ghi chú nào</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Quiz Popup */}
            {showQuizPopup && currentQuizQuestion && (
                <QuizPopup
                    key={currentQuizQuestion.time}
                    question={currentQuizQuestion}
                    answer={quizAnswer}
                    answered={quizAnswered}
                    correct={quizCorrect}
                    onAnswerChange={setQuizAnswer}
                    onSubmit={handleQuizSubmit}
                    onContinue={handleQuizContinue}
                />
            )}

        </div>
    );
}
