'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, Clock, Play, ArrowRight } from 'lucide-react';
import * as dautruongApi from '@/lib/api/dautruong.api';
import { Contest, LeaderboardEntry } from '@/lib/api/dautruong.api';

export default function DauTruongHocTapPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'contests' | 'leaderboard'>('contests');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [contestsRes, leaderboardRes] = await Promise.all([
                dautruongApi.getPublicContests({ page: 1, limit: 20 }),
                dautruongApi.getOverallLeaderboard(50)
            ]);
            console.log('contestsRes:', contestsRes);
            console.log('leaderboardRes:', leaderboardRes);

            // Handle different possible response structures
            let contestsData = [];
            if (Array.isArray(contestsRes)) {
                contestsData = contestsRes;
            } else if (contestsRes?.contests && Array.isArray(contestsRes.contests)) {
                contestsData = contestsRes.contests;
            } else if (contestsRes?.data && Array.isArray(contestsRes.data)) {
                contestsData = contestsRes.data;
            }

            setContests(contestsData);
            setLeaderboard(Array.isArray(leaderboardRes) ? leaderboardRes : []);
        } catch (error) {
            console.error('Failed to load data:', error);
            setContests([]);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const getContestStatus = (contest: Contest) => {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = contest.endTime ? new Date(contest.endTime) : new Date(start.getTime() + contest.duration * 60000);

        console.log('getContestStatus - contest.startTime:', contest.startTime);
        console.log('getContestStatus - contest.endTime:', contest.endTime);
        console.log('getContestStatus - start:', start);
        console.log('getContestStatus - end:', end);
        console.log('getContestStatus - isNaN(start):', isNaN(start.getTime()));
        console.log('getContestStatus - isNaN(end):', isNaN(end.getTime()));

        if (isNaN(start.getTime())) return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' };
        if (now < start) return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' };
        if (now > end) return { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' };
        return { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        🏆 Đấu trường học tập
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Tham gia các cuộc thi, thử thách kiến thức và leo rank bảng xếp hạng
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab('contests')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === 'contests'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Cuộc thi
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === 'leaderboard'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Bảng xếp hạng
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'contests' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contests.map((contest) => {
                                    const status = getContestStatus(contest);
                                    return (
                                        <Link
                                            key={contest._id}
                                            href={`/dautruonghoctap/${contest._id}`}
                                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                                        >
                                            {contest.thumbnail && (
                                                <div className="h-48 overflow-hidden">
                                                    <img
                                                        src={contest.thumbnail}
                                                        alt={contest.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <Users className="h-4 w-4" />
                                                        {contest.participantCount}
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                    {contest.title}
                                                </h3>
                                                {contest.description && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                                        {contest.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {contest.duration} phút
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Trophy className="h-4 w-4" />
                                                        {contest.totalPoints} điểm
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b dark:border-gray-700">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Bảng xếp hạng tổng
                                    </h2>
                                </div>
                                <div className="divide-y dark:divide-gray-700">
                                    {leaderboard.map((entry, index) => (
                                        <div
                                            key={entry.userId}
                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center font-bold rounded-full">
                                                {index === 0 ? (
                                                    <span className="text-2xl">🥇</span>
                                                ) : index === 1 ? (
                                                    <span className="text-2xl">🥈</span>
                                                ) : index === 2 ? (
                                                    <span className="text-2xl">🥉</span>
                                                ) : (
                                                    <span className="text-gray-600 dark:text-gray-400">#{entry.rank}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {entry.userName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {entry.totalContests} cuộc thi
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-blue-500">
                                                    {entry.totalScore} điểm
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {Math.floor((entry.totalTimeSpent || 0) / 60)} phút
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {leaderboard.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        Chưa có dữ liệu bảng xếp hạng
                                    </div>
                                )}
                            </div>
                        )}

                        {contests.length === 0 && activeTab === 'contests' && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Chưa có cuộc thi nào
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
