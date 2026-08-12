'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Play, ShoppingBag, RotateCcw, Calendar, Loader2 } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { mapBackendExercise } from '@/lib/utils/luyentap.mapper';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

type ExerciseItem = ReturnType<typeof mapBackendExercise>;

export default function LuyentapPage() {
    const { token } = useAuthStore();
    const [exercises, setExercises] = useState<ExerciseItem[]>([]);
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('all');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await luyentapApi.getPublicExercises({ limit: 100 });
            const list = (res.exercises || []).map(mapBackendExercise);
            setExercises(list);

            if (token) {
                const userRes = await luyentapApi.getUserExercises();
                const done = new Set<string>();
                const items = userRes.data || userRes || [];
                (Array.isArray(items) ? items : []).forEach((item: { exerciseId?: { _id?: string } | string }) => {
                    const id = typeof item.exerciseId === 'object' ? item.exerciseId?._id : item.exerciseId;
                    if (id) done.add(id);
                });
                setCompletedIds(done);
            }
        } catch {
            toast.error('Không tải được danh sách bài tập');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredExercises = useMemo(() => {
        return exercises.map((ex) => ({
            ...ex,
            completionStatus: completedIds.has(ex._id) ? 'completed' : 'not_started',
        })).filter((exercise) => {
            const matchesSearch = search === '' ||
                exercise.title.toLowerCase().includes(search.toLowerCase()) ||
                (exercise.description || '').toLowerCase().includes(search.toLowerCase());
            const matchesDifficulty = difficulty === 'all' || exercise.difficulty === difficulty;
            return matchesSearch && matchesDifficulty;
        });
    }, [exercises, search, difficulty, completedIds]);

    const getDifficultyLabel = (d: string) => ({ easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }[d] || 'Trung bình');
    const getDifficultyColor = (d: string) => ({
        easy: 'bg-green-100 text-green-700',
        medium: 'bg-yellow-100 text-yellow-700',
        hard: 'bg-red-100 text-red-700',
    }[d] || 'bg-green-100 text-green-700');

    const getActionButton = (exercise: ExerciseItem & { completionStatus: string }) => {
        if (exercise.type === 'vip' && exercise.completionStatus === 'not_started') {
            return (
                <CustomButton variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50 text-xs px-3 py-1.5 whitespace-nowrap shrink-0">
                    <ShoppingBag size={14} className="mr-1" /> Mua ngay
                </CustomButton>
            );
        }
        if (exercise.completionStatus === 'completed') {
            return (
                <Link href={`/luyentap/${exercise._id}`}>
                    <CustomButton variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1.5 whitespace-nowrap shrink-0">
                        <RotateCcw size={14} className="mr-1" /> Làm lại
                    </CustomButton>
                </Link>
            );
        }
        return (
            <Link href={`/luyentap/${exercise._id}`}>
                <CustomButton variant="primary" className="text-xs px-3 py-1.5 whitespace-nowrap shrink-0">
                    <Play size={14} className="mr-1" /> Làm bài
                </CustomButton>
            </Link>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-7 md:pt-8 lg:pt-0">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Luyện tập</h1>
                    <p className="text-gray-600 dark:text-gray-400">Rèn luyện kỹ năng qua các bài tập thực hành</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 min-w-0">
                        <CustomInputSearch placeholder="Tìm kiếm bài tập..." value={search} onChange={setSearch} />
                    </div>
                    <div className="w-full sm:w-48">
                        <CustomSelect value={difficulty} onChange={setDifficulty} options={[
                            { value: 'all', label: 'Tất cả độ khó' },
                            { value: 'easy', label: 'Dễ' },
                            { value: 'medium', label: 'Trung bình' },
                            { value: 'hard', label: 'Khó' },
                        ]} />
                    </div>
                </div>

                <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] table-fixed">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr className="text-left">
                                    <th className="px-3 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[52px] whitespace-nowrap">STT</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Bài tập</th>
                                    <th className="px-3 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[72px] whitespace-nowrap">Số câu</th>
                                    <th className="px-3 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[88px] whitespace-nowrap">Thời gian</th>
                                    <th className="px-3 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[96px] whitespace-nowrap">Độ khó</th>
                                    <th className="px-3 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[72px] whitespace-nowrap">Loại</th>
                                    <th className="px-3 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[96px] whitespace-nowrap">Trạng thái</th>
                                    <th className="px-3 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[112px] whitespace-nowrap">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredExercises.map((exercise, index) => (
                                    <tr key={exercise._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                        <td className="px-3 py-4 text-center text-sm text-gray-500 whitespace-nowrap">{index + 1}</td>
                                        <td className="px-4 py-4 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{exercise.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{exercise.description}</p>
                                            {exercise.createdAt && (
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                    {format(new Date(exercise.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-500 whitespace-nowrap">{exercise.questionCount || exercise.questions?.length || 0}</td>
                                        <td className="px-3 py-4 text-center text-sm text-gray-500 whitespace-nowrap">{exercise.duration || exercise.timeLimit} phút</td>
                                        <td className="px-3 py-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getDifficultyColor(exercise.difficulty || 'medium')}`}>
                                                {getDifficultyLabel(exercise.difficulty || 'medium')}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${exercise.type === 'free' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {exercise.type === 'free' ? 'Free' : 'Vip'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${exercise.completionStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {exercise.completionStatus === 'completed' ? 'Đã làm' : 'Chưa làm'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <div className="flex justify-center">{getActionButton(exercise)}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="md:hidden space-y-3">
                    {filteredExercises.map((exercise, index) => (
                        <div key={exercise._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-600">{index + 1}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{exercise.title}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{exercise.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{exercise.questionCount || 0} câu</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exercise.duration}p</span>
                                </div>
                                {getActionButton(exercise)}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredExercises.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Không tìm thấy bài tập nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}
