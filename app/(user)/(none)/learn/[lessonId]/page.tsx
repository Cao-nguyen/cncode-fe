'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    getLessonDetail,
    saveProgress,
    getProgress,
    getCourseLearnData,
    getExerciseByLessonId,
    getCourseProgress,
    createNote,
    getNotesByLesson
} from '@/lib/api/khoahoc.api';
import { Lesson, Progress, Exercise, ChapterWithLessons, ExerciseSubmitResult } from '@/types/khoahoc.type';
import { setCourseLastLesson, removeCourseLastLesson } from '@/lib/localProgress';
import {
    clampWatchTime,
    getAnsweredQuizTimes,
    getPlaybackPrevTimeForCrossing,
    markQuizAnswered,
    resolveQuizDuringPlayback,
    skipQuizzesBeforeTime,
    skipQuizzesBetweenTimes,
} from '@/lib/lessonQuizProgress';
import {
    Loader2, ChevronLeft, ChevronRight,
    AlertCircle, MessageCircle, X, FileText, NotebookPen, BookOpen
} from 'lucide-react';

import CourseExercisePanel from '@/components/learn/CourseExercisePanel';
import StaticContent from '@/components/common/StaticContent';
import { CustomButton } from '@/components/custom/CustomButton';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import CommentSection from '@/components/comment/CommentSection';
import QuizPopup from '@/components/learn/QuizPopup';
import {
    gradeVideoQuizAnswerAsync,
    normalizeVideoQuizPlaybackQuestion,
    normalizeVideoQuizPlaybackQuestions,
    type VideoQuizPlaybackQuestion,
} from '@/lib/khoahoc/video-quiz-answer.utils';
import { LearnCourseSidebar } from '@/components/learn/LearnCourseSidebar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LessonWithExercise extends Lesson {
    exercise?: Exercise;
}

interface QuizQuestion extends VideoQuizPlaybackQuestion {}

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
const notFoundLessonIds = new Set<string>();

type LessonLoadError = 'not-found' | 'network' | 'invalid-lesson-id';

const fetchInFlight = new Map<string, Promise<{
    lesson: LessonWithExercise | null;
    progress: Progress | null;
    error?: LessonLoadError;
}>>();

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
    lesson: LessonWithExercise | null;
    progress: Progress | null;
    error?: LessonLoadError;
}> {
    if (!lessonId || lessonId === 'undefined' || lessonId === 'null') {
        return { lesson: null, progress: null, error: 'invalid-lesson-id' };
    }

    if (notFoundLessonIds.has(lessonId)) {
        return { lesson: null, progress: null, error: 'not-found' };
    }

    const inFlight = fetchInFlight.get(lessonId);
    if (inFlight) return inFlight;

    const promise = (async (): Promise<{
        lesson: LessonWithExercise | null;
        progress: Progress | null;
        error?: LessonLoadError;
    }> => {
        const [lessonResult, progressResult, exerciseResult] = await Promise.allSettled([
            getLessonDetail(lessonId).then(data => {
                if (!data) return null;
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

        if (lessonResult.status === 'rejected') {
            console.error('[fetchLessonData] lesson fetch rejected:', lessonResult.reason);
            return {
                lesson: null,
                progress: null,
                error: 'network',
            };
        }

        const lesson = lessonResult.value;
        if (!lesson) {
            notFoundLessonIds.add(lessonId);
            const staleCourseId = lessonCache.get(lessonId)?.courseId;
            lessonCache.delete(lessonId);
            progressCache.delete(lessonId);
            if (staleCourseId) removeCourseLastLesson(staleCourseId);
            return { lesson: null, progress: null, error: 'not-found' };
        }

        if (exerciseResult.status === 'fulfilled' && exerciseResult.value) {
            lesson.exercise = exerciseResult.value;
            lessonCache.set(lessonId, lesson);
        }

        return {
            lesson,
            progress: progressResult.status === 'fulfilled' ? progressResult.value : null,
        };
    })();

    fetchInFlight.set(lessonId, promise);
    try {
        return await promise;
    } finally {
        fetchInFlight.delete(lessonId);
    }
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
    const [loadError, setLoadError] = useState<LessonLoadError | null>(null);
    const [failedCourseId, setFailedCourseId] = useState<string | null>(null);

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
    const [exerciseCanProceed, setExerciseCanProceed] = useState(true);

    useEffect(() => {
        if (progress?.isCompleted) {
            setExerciseCanProceed(true);
        }
    }, [progress?.isCompleted]);

    // Notes
    const [notes, setNotes] = useState<{ time: number; timeStr: string; text: string; _id?: string }[]>([]);
    const [showNotePopup, setShowNotePopup] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const noteEditorRef = useRef<CustomEditorRef>(null);

    // Sidebar
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const [quizSubmitting, setQuizSubmitting] = useState(false);
    const answeredQuizIds = useRef<Set<number>>(new Set());
    const skippedQuizTimesRef = useRef<Set<number>>(new Set());
    const quizQuestionsRef = useRef<QuizQuestion[]>([]);

    useEffect(() => {
        quizQuestionsRef.current = quizQuestions;
    }, [quizQuestions]);

    const skipPastQuizzes = useCallback((beforeTime: number) => {
        skipQuizzesBeforeTime(
            quizQuestionsRef.current,
            skippedQuizTimesRef.current,
            answeredQuizIds.current,
            beforeTime,
        );
    }, []);

    const skipQuizzesOnSeek = useCallback((fromTime: number, toTime: number) => {
        if (toTime > fromTime) {
            skipQuizzesBetweenTimes(
                quizQuestionsRef.current,
                skippedQuizTimesRef.current,
                answeredQuizIds.current,
                fromTime,
                toTime,
            );
        }
        skipPastQuizzes(toTime);
    }, [skipPastQuizzes]);

    const openQuizPopup = useCallback((question: QuizQuestion) => {
        setCurrentQuizQuestion(normalizeVideoQuizPlaybackQuestion(question));
        setShowQuizPopup(true);
        setQuizAnswer(null);
        setQuizAnswered(false);
        setQuizCorrect(null);
        if (isYouTubeVideo && youtubePlayerRef.current?.pauseVideo) {
            youtubePlayerRef.current.pauseVideo();
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isYouTubeVideo]);

    const handleQuizPlaybackTick = useCallback((
        rawTime: number,
        prevTime: number,
        seekTo: (time: number) => void
    ): boolean => {
        const decision = resolveQuizDuringPlayback(
            quizQuestionsRef.current,
            answeredQuizIds.current,
            skippedQuizTimesRef.current,
            prevTime,
            rawTime
        );

        if (decision.action === 'none') {
            lastValidTimeRef.current = rawTime;
            setCurrentVideoTime(rawTime);
            return false;
        }

        seekTo(decision.seekTo);
        lastValidTimeRef.current = decision.seekTo;
        setCurrentVideoTime(decision.seekTo);
        openQuizPopup(decision.quiz);
        return true;
    }, [openQuizPopup]);

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

    const applyLesson = useCallback((lessonData: LessonWithExercise | null | undefined) => {
        if (!lessonData?._id) return;
        setLesson(lessonData);

        // Load quiz questions from lesson
        if (lessonData.quizQuestions && lessonData.quizQuestions.length > 0) {
            setQuizQuestions(
                normalizeVideoQuizPlaybackQuestions(lessonData.quizQuestions as VideoQuizPlaybackQuestion[]),
            );
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
            setExerciseCanProceed(!lessonData.exercise.mustPassToNext);
        } else {
            setExercise(null);
            setExerciseCanProceed(true);
        }
    }, []);

    // ─── Main fetch effect ────────────────────────────────────────────────────

    useEffect(() => {
        if (!lessonId) return;

        // Reset states khi chuyển lesson
        setLoadError(null);
        setFailedCourseId(null);
        setExerciseCanProceed(true);
        setShowQuizPopup(false);
        setCurrentQuizQuestion(null);
        setQuizAnswer(null);
        setQuizAnswered(false);
        setQuizCorrect(null);
        answeredQuizIds.current = getAnsweredQuizTimes(lessonId);
        skippedQuizTimesRef.current = new Set();
        lastValidTimeRef.current = 0;
        watchedSecondsRef.current = 0;
        initialSeekDone.current = null;

        // Hiển thị cache tạm nếu có (chờ API xác nhận lại)
        const cachedLesson = lessonCache.get(lessonId);
        const cachedProgress = progressCache.get(lessonId);
        if (cachedLesson) {
            applyLesson(cachedLesson);
            setProgress(cachedProgress ?? null);
            watchedSecondsRef.current = cachedProgress?.watchedSeconds ?? 0;
        }

        // Luôn fetch lại từ API để tránh cache/localStorage cũ
        const load = async () => {
            try {
                const { lesson: lessonData, progress: prog, error } = await fetchLessonData(lessonId);

                if (!lessonData) {
                    const staleCourseId = cachedLesson?.courseId || lessonCache.get(lessonId)?.courseId || lesson?.courseId;
                    if (staleCourseId) {
                        removeCourseLastLesson(staleCourseId);
                        setFailedCourseId(staleCourseId);
                    }
                    setLoadError(error ?? 'not-found');
                    setLesson(null);
                    setVideoLoading(false);
                    return;
                }

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
                setLoadError('network');
                setVideoLoading(false);
            } finally {
                setInitialLoading(false);
            }
        };

        load();
    }, [lessonId, applyLesson]);

    // ─── YouTube Player handlers ──────────────────────────────────────────────

    const handlePlayerReady = useCallback((event: YTPlayerEvent) => {
        const savedTime = watchedSecondsRef.current;

        if (savedTime > 0 && initialSeekDone.current !== lessonId) {
            skipPastQuizzes(savedTime);
            event.target.seekTo(savedTime, true);
            lastValidTimeRef.current = getPlaybackPrevTimeForCrossing(savedTime);
            setCurrentVideoTime(savedTime);
            initialSeekDone.current = lessonId;
        }

        setVideoLoading(false);
    }, [lessonId, skipPastQuizzes]);

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
            const currentTime = Math.floor(player.getCurrentTime());
            lastValidTimeRef.current = getPlaybackPrevTimeForCrossing(currentTime);

            // Clear any existing interval
            if (videoTimeIntervalRef.current) {
                clearInterval(videoTimeIntervalRef.current);
            }

            // Start new interval to track time from YouTube player
            videoTimeIntervalRef.current = setInterval(() => {
                const prevTime = lastValidTimeRef.current;
                const rawTime = Math.floor(player.getCurrentTime());
                const questions = quizQuestionsRef.current;
                const answered = answeredQuizIds.current;

                const timeDiff = rawTime - prevTime;
                if (timeDiff > 30) {
                    player.seekTo(prevTime, true);
                    toast.error('Không thể tua bài học! Bạn cần xem từ đầu.', {
                        duration: 3000,
                    });
                    return;
                }

                const handled = handleQuizPlaybackTick(
                    rawTime,
                    prevTime,
                    (time) => player.seekTo(time, true)
                );
                if (handled) {
                    player.pauseVideo();
                    return;
                }

                const currentTime = rawTime;

                if (currentTime > 0 && currentTime % 10 === 0 && currentTime !== watchedSecondsRef.current) {
                    const savableTime = clampWatchTime(currentTime, questions, answered);
                    watchedSecondsRef.current = savableTime;
                    const duration = lesson?.duration || player.getDuration() || 0;
                    const isCompleted = duration > 0 && savableTime >= (duration - 10);
                    const update = { watchedSeconds: savableTime, isCompleted };
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
            }, 250);
        } else {
            // Pause or ended - stop interval
            if (videoTimeIntervalRef.current) {
                clearInterval(videoTimeIntervalRef.current);
                videoTimeIntervalRef.current = null;
            }

            // Save progress on pause/end
            if (event.data === window.YT!.PlayerState.PAUSED || event.data === window.YT!.PlayerState.ENDED) {
                const rawTime = Math.floor(player.getCurrentTime());
                const savableTime = clampWatchTime(rawTime, quizQuestionsRef.current, answeredQuizIds.current);
                const duration = lesson?.duration || player.getDuration() || 0;
                const isCompleted = event.data === window.YT!.PlayerState.ENDED || (duration > 0 && savableTime >= (duration - 10));
                const update = { watchedSeconds: savableTime, isCompleted };
                saveProgress(lessonId, update).catch(console.error);
            }
        }
    }, [lessonId, lesson, handleQuizPlaybackTick]);

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
                        const savableTime = clampWatchTime(newTime, quizQuestionsRef.current, answeredQuizIds.current);
                        watchedSecondsRef.current = savableTime;
                        const duration = lesson.duration || 0;
                        const isCompleted = duration > 0 && savableTime >= (duration - 10);
                        const update = { watchedSeconds: savableTime, isCompleted };
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
            }, 250);
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

    const handleQuizSubmit = useCallback(async () => {
        if (!currentQuizQuestion || !quizAnswer) return;

        setQuizSubmitting(true);
        try {
            const isCorrect = await gradeVideoQuizAnswerAsync(currentQuizQuestion, quizAnswer);
            setQuizAnswered(true);
            setQuizCorrect(isCorrect);
        } finally {
            setQuizSubmitting(false);
        }
    }, [currentQuizQuestion, quizAnswer]);

    const handleQuizContinue = useCallback(() => {
        if (currentQuizQuestion) {
            answeredQuizIds.current.add(currentQuizQuestion.time);
            markQuizAnswered(lessonId, currentQuizQuestion.time);
        }
        setShowQuizPopup(false);
        setCurrentQuizQuestion(null);
        setQuizAnswer(null);
        setQuizAnswered(false);
        setQuizCorrect(null);
        setQuizSubmitting(false);
        playVideo();
    }, [currentQuizQuestion, playVideo, lessonId]);

    // ─── Exercise submit ──────────────────────────────────────────────────────

    const handleExerciseSubmitSuccess = useCallback(async (res: ExerciseSubmitResult) => {
        setExerciseCanProceed(res.canProceed);

        if (res.isCorrect) {
            try {
                const saved = await saveProgress(lessonId, { isCompleted: true, watchedSeconds: 0 });
                const next = (saved as Progress) ?? { ...progressCache.get(lessonId), isCompleted: true } as Progress;
                progressCache.set(lessonId, next);
                setProgress(next);

                if (lesson?.courseId) {
                    try {
                        const courseProg = await getCourseProgress(lesson.courseId);
                        setCourseProgress({ total: courseProg.total, completed: courseProg.completed, percent: courseProg.percent });
                    } catch (err) {
                        console.error('[LearnPage] Failed to refresh course progress:', err);
                    }
                }
            } catch (err) {
                console.error('[LearnPage] Failed to save exercise progress:', err);
            }
        }
    }, [lesson?.courseId, lessonId]);

    // ─── Navigation actions ───────────────────────────────────────────────────

    // Instant — không có loading state, cache đã lo
    const handleNavigateToLesson = useCallback((id: string) => {
        router.push(`/learn/${id}`);
        setSidebarOpen(false);
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

    useEffect(() => {
        setSidebarOpen(false);
    }, [lessonId]);

    // ─── Render ───────────────────────────────────────────────────────────────

    if (!initialLoading && loadError) {
        const errorMessage =
            loadError === 'network'
                ? 'Không thể kết nối máy chủ. Hãy bật backend (port 5000) và thử lại.'
                : 'Bài học này không tồn tại hoặc đã bị xóa. Có thể link cũ trong trình duyệt không còn hợp lệ.';

        return (
            <div className="flex flex-col h-screen bg-gray-50 items-center justify-center px-6 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                <h1 className="text-lg font-semibold text-gray-900 mb-2">Không tải được bài học</h1>
                <p className="text-sm text-gray-600 mb-2 max-w-md">{errorMessage}</p>
                <p className="text-xs text-gray-400 mb-6 font-mono">{lessonId}</p>
                <div className="flex flex-wrap gap-3 justify-center">
                    <CustomButton onClick={handleBackToCourses}>Danh sách khoá học</CustomButton>
                    {failedCourseId && (
                        <CustomButton
                            variant="outline"
                            onClick={() => router.push('/me/khoahoc')}
                        >
                            Khoá học của tôi
                        </CustomButton>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden">

            {/* Header */}
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm sm:h-14 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                    <button onClick={handleBackToCourses} className="shrink-0 transition-colors hover:text-blue-600">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <img src="/images/logo.png" alt="CNCode" width={100} height={32} className="hidden h-7 w-auto sm:block sm:h-8" />
                    <span className="hidden text-gray-400 sm:inline">|</span>
                    <div className="min-w-0 flex-1 text-xs font-semibold text-gray-600 sm:max-w-2xl sm:flex-none">
                        <span className="block truncate">
                            {initialLoading
                                ? <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200 sm:w-32" />
                                : (lesson?.title || 'Đang tải...')}
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <div className="relative h-9 w-9 sm:h-10 sm:w-10">
                        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90 transform">
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
                            <span className="text-[9px] font-bold text-gray-700 sm:text-[10px]">
                                {courseProgress?.percent || 0}%
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowNotesInline(!showNotesInline)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-xl p-2 transition-all sm:rounded-2xl sm:px-3',
                            showNotesInline
                                ? 'bg-amber-50 text-amber-600'
                                : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600',
                        )}
                        title="Ghi chú"
                    >
                        <NotebookPen className="h-[18px] w-[18px]" strokeWidth={2.25} />
                        <span className="hidden text-sm font-semibold sm:inline">Ghi chú</span>
                    </button>

                    <button
                        onClick={() => setShowCommentPopup(true)}
                        className="flex items-center gap-1.5 rounded-xl p-2 text-gray-500 transition-all hover:bg-sky-50 hover:text-sky-600 sm:rounded-2xl sm:px-3"
                        title="Bình luận"
                    >
                        <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.25} />
                        <span className="hidden text-sm font-semibold sm:inline">Bình luận</span>
                    </button>

                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-xl p-2 transition-all sm:rounded-2xl sm:px-3 lg:hidden',
                            sidebarOpen
                                ? 'bg-violet-50 text-violet-600'
                                : 'text-gray-500 hover:bg-violet-50 hover:text-violet-600',
                        )}
                        title="Nội dung khoá học"
                    >
                        <BookOpen className="h-[18px] w-[18px]" strokeWidth={2.25} />
                        <span className="hidden text-sm font-semibold sm:inline">Nội dung</span>
                    </button>
                </div>
            </header>

            {/* Main */}
            <div className="relative flex flex-1 overflow-hidden">

                {/* Left content */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">

                    {/* Video / Exercise */}
                    <div className={cn(
                        'relative w-full shrink-0',
                        lesson?.type === 'exercise'
                            ? 'min-h-0 flex-1 bg-gray-50'
                            : 'aspect-video bg-black lg:aspect-auto lg:h-[550px]',
                    )}>
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
                                        if (!videoRef.current) return;

                                        const savedTime = watchedSecondsRef.current;

                                        if (savedTime > 0) {
                                            skipPastQuizzes(savedTime);
                                            videoRef.current.currentTime = savedTime;
                                            lastValidTimeRef.current = getPlaybackPrevTimeForCrossing(savedTime);
                                            setCurrentVideoTime(savedTime);
                                        }
                                    }}
                                    onTimeUpdate={() => {
                                        if (videoRef.current && isVideoPlaying) {
                                            const rawTime = Math.floor(videoRef.current.currentTime);
                                            const prevTime = lastValidTimeRef.current;
                                            const questions = quizQuestionsRef.current;
                                            const answered = answeredQuizIds.current;

                                            const handled = handleQuizPlaybackTick(
                                                rawTime,
                                                prevTime,
                                                (time) => {
                                                    if (videoRef.current) videoRef.current.currentTime = time;
                                                }
                                            );
                                            if (handled) {
                                                videoRef.current.pause();
                                                return;
                                            }

                                            const currentTime = rawTime;

                                            if (currentTime > 0 && currentTime % 10 === 0 && currentTime !== watchedSecondsRef.current) {
                                                const savableTime = clampWatchTime(currentTime, questions, answered);
                                                watchedSecondsRef.current = savableTime;
                                                const duration = lesson.duration || 0;
                                                const isCompleted = duration > 0 && savableTime >= (duration - 10);
                                                const update = { watchedSeconds: savableTime, isCompleted };
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
                                        if (videoRef.current) {
                                            const t = Math.floor(videoRef.current.currentTime);
                                            lastValidTimeRef.current = getPlaybackPrevTimeForCrossing(t);
                                            setCurrentVideoTime(t);
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
                                        if (!videoRef.current) return;

                                        const rawTime = Math.floor(videoRef.current.currentTime);
                                        const prevTime = lastValidTimeRef.current;

                                        skipQuizzesOnSeek(prevTime, rawTime);

                                        lastValidTimeRef.current = getPlaybackPrevTimeForCrossing(rawTime);
                                        setCurrentVideoTime(rawTime);
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
                            <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto p-4 sm:p-6 lg:p-8">
                                {exercise ? (
                                    <CourseExercisePanel
                                        key={exercise._id}
                                        exercise={exercise}
                                        onSubmitSuccess={handleExerciseSubmitSuccess}
                                    />
                                ) : (
                                    <div className="text-sm text-gray-600">Chưa có bài tập cho bài học này.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title + content — white fills remaining height below video */}
                    {lesson?.type === 'video' && (
                        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-white no-scrollbar">
                            <div className="w-full border-b border-gray-200 p-4 sm:p-6 lg:px-12 lg:pt-8 lg:pb-4">
                                <div className="mx-auto max-w-5xl">
                                    {initialLoading ? (
                                        <div className="space-y-3">
                                            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                                        </div>
                                    ) : lesson ? (
                                        <div>
                                            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">{lesson.title}</h1>
                                                <CustomButton
                                                    onClick={handleOpenNotePopup}
                                                    variant="outline"
                                                    size="medium"
                                                    className="w-full whitespace-nowrap !border-blue-600 !text-blue-600 hover:!bg-blue-50 sm:w-auto"
                                                >
                                                    <FileText className="w-4 h-4 mr-1.5" />
                                                    Ghi chú tại {(() => {
                                                        const m = Math.floor(currentVideoTime / 60).toString().padStart(2, '0');
                                                        const s = (currentVideoTime % 60).toString().padStart(2, '0');
                                                        return `${m}:${s}`;
                                                    })()}
                                                </CustomButton>
                                            </div>
                                            <p className="text-xs text-gray-500">
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

                            <div className="flex-1 p-4 sm:p-6 lg:p-12">
                                <div className="mx-auto max-w-5xl">
                                    {initialLoading ? (
                                        <div className="space-y-4 border-t border-gray-200 pt-6 sm:pt-10">
                                            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                                            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                                            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                                            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
                                        </div>
                                    ) : hasRealContent(lesson?.description) && lesson?.description ? (
                                        <div>
                                            <h3 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">Nội dung bài học</h3>
                                            <StaticContent content={lesson.description} />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <LearnCourseSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    chapters={chapters}
                    lessonId={lessonId}
                    expandedChapters={expandedChapters}
                    onToggleChapter={toggleChapter}
                    onNavigate={handleNavigateToLesson}
                />
            </div>

            {/* Footer nav */}
            <footer className="flex h-14 shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 shadow-sm sm:h-16 sm:gap-4 sm:px-6">
                <CustomButton
                    onClick={handlePrevLesson}
                    disabled={!prevLesson}
                    variant="outline"
                    size="medium"
                    className="min-w-0 flex-1 text-xs sm:flex-none sm:text-sm"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">BÀI TRƯỚC</span>
                    <span className="sm:hidden">TRƯỚC</span>
                </CustomButton>
                <CustomButton
                    onClick={handleNextLesson}
                    disabled={!nextLesson || (lesson?.type === 'exercise' && exercise?.mustPassToNext && !exerciseCanProceed)}
                    variant="primary"
                    size="medium"
                    className="min-w-0 flex-1 text-xs sm:flex-none sm:text-sm"
                >
                    <span className="hidden sm:inline">BÀI TIẾP THEO</span>
                    <span className="sm:hidden">TIẾP</span>
                    <ChevronRight className="h-4 w-4" />
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
                        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[494px] flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[494px] ${showCommentPopup ? 'translate-x-0' : 'translate-x-full'}`}
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
                        <div className="flex-1 overflow-hidden px-4 pb-4">
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
                        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[600px] flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[600px] ${showNotePopup ? 'translate-x-0' : 'translate-x-full'}`}
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
                        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[494px] flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[494px] ${showNotesInline ? 'translate-x-0' : 'translate-x-full'}`}
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
                    submitting={quizSubmitting}
                    onAnswerChange={setQuizAnswer}
                    onSubmit={() => void handleQuizSubmit()}
                    onContinue={handleQuizContinue}
                />
            )}

        </div>
    );
}
