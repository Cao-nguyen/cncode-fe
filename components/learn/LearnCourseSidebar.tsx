'use client';

import React from 'react';
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Lock,
    Play,
    Video,
    X,
} from 'lucide-react';
import { ChapterWithLessons, LessonWithExercise } from '@/types/khoahoc.type';
import { cn } from '@/lib/utils';

interface LearnCourseSidebarProps {
    open: boolean;
    onClose: () => void;
    chapters: ChapterWithLessons[];
    lessonId: string;
    expandedChapters: Set<string>;
    onToggleChapter: (chapterId: string) => void;
    onNavigate: (lessonId: string) => void;
}

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function isLessonLocked(
    chapter: ChapterWithLessons,
    lessonIndex: number,
    lesson: LessonWithExercise,
    currentLessonId: string,
) {
    if (lesson._id === currentLessonId) return false;
    const prev = lessonIndex > 0 ? chapter.lessons[lessonIndex - 1] : null;
    if (!prev) return false;
    return !prev.progress?.isCompleted;
}

function LessonTypeBadge({
    type,
    active,
    locked,
}: {
    type: 'video' | 'exercise';
    active: boolean;
    locked: boolean;
}) {
    const isVideo = type === 'video';
    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                active
                    ? 'bg-white/20 text-white'
                    : locked
                        ? 'bg-gray-100 text-gray-400'
                        : isVideo
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-violet-50 text-violet-700',
            )}
        >
            {isVideo ? <Video className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
            {isVideo ? 'Bài học' : 'Bài tập'}
        </span>
    );
}

export function LearnCourseSidebar({
    open,
    onClose,
    chapters,
    lessonId,
    expandedChapters,
    onToggleChapter,
    onNavigate,
}: LearnCourseSidebarProps) {
    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 top-12 z-40 bg-black/40 backdrop-blur-[1px] sm:top-14 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    'fixed bottom-0 right-0 top-12 z-50 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out sm:top-14',
                    open ? 'translate-x-0' : 'translate-x-full',
                    'lg:static lg:z-auto lg:h-full lg:w-[min(100%,22rem)] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:shadow-none xl:w-96',
                )}
                aria-hidden={!open}
            >
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Nội dung khoá học
                    </span>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 lg:hidden"
                        aria-label="Đóng danh sách bài học"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-3 no-scrollbar">
                    {chapters.map((chapter, chapterIndex) => {
                        const chapterId = chapter._id;
                        if (!chapterId) return null;

                        const isExpanded = expandedChapters.has(chapterId);
                        const hasActiveLesson = chapter.lessons.some((l) => l._id === lessonId);
                        const completedInChapter = chapter.lessons.filter((l) => l.progress?.isCompleted).length;

                        return (
                            <section
                                key={chapterId}
                                className={cn(
                                    'overflow-hidden rounded-2xl border transition-shadow',
                                    hasActiveLesson
                                        ? 'border-blue-200 bg-blue-50/40 shadow-sm'
                                        : 'border-gray-200 bg-white',
                                )}
                            >
                                <button
                                    onClick={() => onToggleChapter(chapterId)}
                                    className="flex w-full items-start justify-between gap-3 p-3 text-left transition hover:bg-white/60"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-blue-600 shadow-sm">
                                                {chapterIndex + 1}
                                            </span>
                                            <h4 className="truncate text-sm font-bold text-gray-900">{chapter.title}</h4>
                                        </div>
                                        <p className="mt-1 pl-8 text-[11px] text-gray-500">
                                            {completedInChapter}/{chapter.lessons.length} hoàn thành
                                        </p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="space-y-1.5 border-t border-gray-100 bg-white/70 p-2">
                                        {chapter.lessons.map((les, lessonIndex) => {
                                            const isActive = les._id === lessonId;
                                            const isLocked = isLessonLocked(chapter, lessonIndex, les, lessonId);
                                            const isCompleted = !!les.progress?.isCompleted;

                                            return (
                                                <button
                                                    key={les._id}
                                                    onClick={() => !isLocked && les._id && onNavigate(les._id)}
                                                    disabled={isLocked}
                                                    className={cn(
                                                        'group relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition',
                                                        isActive
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                            : isLocked
                                                                ? 'cursor-not-allowed bg-gray-50 opacity-60'
                                                                : 'hover:bg-gray-50',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                                            isActive
                                                                ? 'bg-white/15'
                                                                : isCompleted
                                                                    ? 'bg-green-50 text-green-600'
                                                                    : 'bg-gray-100 text-gray-600',
                                                        )}
                                                    >
                                                        {isLocked ? (
                                                            <Lock className="h-4 w-4" />
                                                        ) : isCompleted && !isActive ? (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        ) : les.type === 'video' ? (
                                                            <Play className={cn('h-4 w-4', isActive && 'fill-current')} />
                                                        ) : (
                                                            <ClipboardList className="h-4 w-4" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                                            <LessonTypeBadge
                                                                type={les.type}
                                                                active={isActive}
                                                                locked={isLocked}
                                                            />
                                                            {les.type === 'video' && les.duration ? (
                                                                <span className={cn(
                                                                    'text-[10px] font-medium',
                                                                    isActive ? 'text-white/75' : 'text-gray-400',
                                                                )}>
                                                                    {formatDuration(les.duration)}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <p className={cn(
                                                            'line-clamp-2 text-sm font-semibold leading-snug',
                                                            isActive ? 'text-white' : 'text-gray-900',
                                                        )}>
                                                            {les.title}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        );
                    })}

                    {chapters.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
                            Chưa có nội dung khoá học
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
