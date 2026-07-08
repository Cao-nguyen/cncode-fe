'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, Users, Clock, Play, ArrowLeft, Calendar, Volume2, VolumeX, X, Coins } from 'lucide-react';
import * as dautruongApi from '@/lib/api/dautruong.api';
import { Contest, LeaderboardEntry } from '@/lib/api/dautruong.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function ContestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuthStore();
    const contestId = params.id as string;

    const [contest, setContest] = useState<Contest | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [canAttempt, setCanAttempt] = useState(true);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [submissionHistory, setSubmissionHistory] = useState<Array<{
        _id: string;
        totalScore: number;
        percentage: number;
        coinsAwarded: number;
        timeSpent: number;
        submittedAt: string;
    }>>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isMuted, setIsMuted] = useState(() => {
        // Load mute preference from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dautruong-muted');
            return saved === 'true';
        }
        return true; // Default to muted
    });
    const audioRef = useRef<HTMLAudioElement>(null);

    // Handle audio based on mute preference
    useEffect(() => {
        if (audioRef.current && !isMuted) {
            audioRef.current.play().catch(console.error);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [contestId]);

    // Handle audio
    useEffect(() => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [isMuted]);

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        // Save preference to localStorage
        localStorage.setItem('dautruong-muted', String(newMutedState));
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [contestRes, leaderboardRes] = await Promise.all([
                dautruongApi.getPublicContestById(contestId),
                dautruongApi.getContestLeaderboard(contestId, 50)
            ]);
            console.log('contestRes:', contestRes);
            console.log('leaderboardRes:', leaderboardRes);

            setContest(contestRes);
            setLeaderboard(Array.isArray(leaderboardRes) ? leaderboardRes : []);

            // Check if user has submitted and can attempt
            if (token) {
                try {
                    const userAnswer = await dautruongApi.getUserAnswer(contestId);
                    setHasSubmitted(!!userAnswer);
                } catch (error) {
                    // User hasn't submitted yet
                    setHasSubmitted(false);
                }

                // Check remaining attempts
                try {
                    const attemptsInfo = await dautruongApi.checkUserAttempts(contestId);
                    setCanAttempt(attemptsInfo.canAttempt);
                    setRemainingAttempts(attemptsInfo.remainingAttempts);
                } catch (error) {
                    // Default to can attempt
                    setCanAttempt(true);
                    setRemainingAttempts(null);
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            setContest(null);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = () => {
        if (!token) {
            router.push('/login');
            return;
        }
        router.push(`/dautruonghoctap/${contestId}/lambai`);
    };

    const loadHistory = async () => {
        if (!token) return;

        try {
            setLoadingHistory(true);
            const history = await dautruongApi.getUserContestHistory(contestId);
            setSubmissionHistory(Array.isArray(history) ? history : []);
            setShowHistoryModal(true);
        } catch (error) {
            console.error('Failed to load history:', error);
            toast.error('Không thể tải lịch sử làm bài');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleViewResult = () => {
        if (token) {
            loadHistory();
        } else {
            router.push('/login');
        }
    };

    const handleViewSubmission = (submissionId: string) => {
        router.push(`/dautruonghoctap/${contestId}/check?submission=${submissionId}`);
    };

    const getContestStatus = (contest: Contest) => {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = contest.endTime ? new Date(contest.endTime) : new Date(start.getTime() + contest.duration * 60000);

        if (isNaN(start.getTime())) return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800', canStart: false };
        if (now < start) return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800', canStart: false };
        if (now > end) return { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800', canStart: false };
        return { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800', canStart: true };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Không tìm thấy cuộc thi
                    </h2>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const status = getContestStatus(contest);

    // Format dates safely
    const formatDateTime = (dateString: string | undefined) => {
        if (!dateString) return 'Chưa xác định';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Chưa xác định';
        return date.toLocaleString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Background Audio */}
            <audio
                ref={audioRef}
                src="/sounds/dautruong.mp3"
                loop
                preload="auto"
                autoPlay
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back button and audio toggle */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Quay lại
                    </button>
                    <button
                        onClick={toggleMute}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        <span className="text-sm font-medium">
                            {isMuted ? 'Bật nhạc' : 'Tắt nhạc'}
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contest Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {contest.thumbnail && (
                            <div className="h-64 rounded-xl overflow-hidden">
                                <img
                                    src={contest.thumbnail}
                                    alt={contest.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                                    {status.label}
                                </span>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {contest.participantCount} người tham gia
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {contest.title}
                            </h1>

                            {contest.description && (
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {contest.description}
                                </p>
                            )}

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {contest.duration}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">phút</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                                    <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {contest.totalPoints}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">điểm</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                                    <Calendar className="h-6 w-6 mx-auto mb-2 text-green-500" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {contest.questions?.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">câu hỏi</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Bắt đầu: {formatDateTime(contest.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Kết thúc: {formatDateTime(contest.endTime)}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {remainingAttempts !== null && contest.maxAttempts > 0 && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                        Còn lại: <span className="font-semibold text-blue-500">{remainingAttempts}</span> / {contest.maxAttempts} lượt
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    {status.canStart && canAttempt ? (
                                        <button
                                            onClick={handleStartTest}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Play className="h-5 w-5" />
                                            {hasSubmitted ? 'Làm lại' : 'Làm bài ngay'}
                                        </button>
                                    ) : !status.canStart ? (
                                        <button
                                            disabled
                                            className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Clock className="h-5 w-5" />
                                            {status.label}
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-3 px-6 rounded-lg cursor-not-allowed"
                                        >
                                            Đã hết lượt làm bài
                                        </button>
                                    )}

                                    {hasSubmitted && (
                                        <button
                                            onClick={handleViewResult}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trophy className="h-5 w-5" />
                                            Xem kết quả
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden sticky top-4">
                            <div className="p-4 border-b dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Bảng xếp hạng
                                </h2>
                            </div>
                            <div className="divide-y dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                                {leaderboard.slice(0, 20).map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center font-bold text-sm">
                                            {index === 0 ? (
                                                <span className="text-lg">🥇</span>
                                            ) : index === 1 ? (
                                                <span className="text-lg">🥈</span>
                                            ) : index === 2 ? (
                                                <span className="text-lg">🥉</span>
                                            ) : (
                                                <span className="text-gray-600 dark:text-gray-400">#{entry.rank}</span>
                                            )}
                                        </div>
                                        {entry.userAvatar ? (
                                            <img
                                                src={entry.userAvatar}
                                                alt={entry.userName}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                    {entry.userName?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                                {entry.userName}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-blue-500 text-sm">
                                                {entry.score} điểm
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {leaderboard.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                    Chưa có người tham gia
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Lịch sử làm bài
                            </h2>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[60vh]">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : submissionHistory.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Chưa có lần làm bài nào
                                </div>
                            ) : (
                                <div className="divide-y dark:divide-gray-700">
                                    {submissionHistory.map((submission, index) => (
                                        <button
                                            key={submission._id}
                                            onClick={() => handleViewSubmission(submission._id)}
                                            className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                                        #{submissionHistory.length - index}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            Lần {submissionHistory.length - index}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-500">
                                                        {submission.totalScore}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        điểm
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Trophy className="h-4 w-4" />
                                                    {submission.percentage != null ? submission.percentage.toFixed(1) : '0.0'}%
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-4 w-4" />
                                                    {Math.floor((submission.timeSpent || 0) / 60)}:{String((submission.timeSpent || 0) % 60).padStart(2, '0')}
                                                </div>
                                                {(submission.coinsAwarded || 0) > 0 && (
                                                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                        <Coins className="h-4 w-4" />
                                                        +{submission.coinsAwarded} xu
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
