'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Plus, GripVertical, Trash2, ChevronDown, ChevronRight, BookOpen, FileQuestion, LayoutGrid, Menu } from 'lucide-react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    pointerWithin,
    useDroppable,
    useSensor,
    useSensors,
    type CollisionDetection,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConfirmModalDelete } from '../custom/ConfirmationModal';
import {
    createAdminChapter as createChapter,
    updateAdminChapter as updateChapter,
    deleteAdminChapter as deleteChapter,
    reorderAdminChapters as reorderChapters,
    getAdminCourseChapters as getCourseChapters,
    createAdminLesson,
    updateAdminLesson,
    deleteAdminLesson,
    reorderAdminLessons as reorderLessons,
} from '@/lib/api/khoahoc.api';
import { Chapter, Lesson, Exercise } from '@/types/khoahoc.type';
import LessonForm from './LessonForm';
import ExerciseForm from './ExerciseForm';
import CourseBuilderOverview from './CourseBuilderOverview';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    readBuilderActive,
    writeBuilderActive,
    type BuilderActiveTarget,
} from '@/lib/courseBuilderStorage';
import { cn } from '@/lib/utils';

interface CourseBuilderOverlayProps {
    courseId: string;
    courseName: string;
    onClose: () => void;
}

interface LessonWithExercise extends Lesson {
    exercise?: Exercise;
}

interface ChapterWithLessons extends Chapter {
    lessons: LessonWithExercise[];
}

function findChapterIdForLesson(chapters: ChapterWithLessons[], lessonId: string): string | null {
    for (const chapter of chapters) {
        if (chapter.lessons.some((lesson) => lesson._id === lessonId)) return chapter._id;
    }
    return null;
}

function findLessonById(chapters: ChapterWithLessons[], lessonId: string): Lesson | null {
    for (const chapter of chapters) {
        const lesson = chapter.lessons.find((item) => item._id === lessonId);
        if (lesson) return lesson;
    }
    return null;
}

function isSameLessonLayout(a: ChapterWithLessons[], b: ChapterWithLessons[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i]._id !== b[i]._id || a[i].lessons.length !== b[i].lessons.length) return false;
        for (let j = 0; j < a[i].lessons.length; j++) {
            if (a[i].lessons[j]._id !== b[i].lessons[j]._id) return false;
        }
    }
    return true;
}

function resolveOverChapterId(
    chapters: ChapterWithLessons[],
    overId: string,
    overData: { type?: string; chapterId?: string } | undefined,
): string | null {
    if (overData?.type === 'lesson') {
        return findChapterIdForLesson(chapters, overId);
    }
    if (overData?.type === 'chapter-drop') {
        return overData.chapterId ?? null;
    }
    if (overData?.type === 'chapter') {
        return overId;
    }
    return null;
}

function computeLessonMove(
    chapters: ChapterWithLessons[],
    activeLessonId: string,
    overId: string,
    overData: { type?: string; chapterId?: string } | undefined,
): ChapterWithLessons[] | null {
    const activeChapterId = findChapterIdForLesson(chapters, activeLessonId);
    if (!activeChapterId) return null;

    const overChapterId = resolveOverChapterId(chapters, overId, overData);
    if (!overChapterId) return null;

    const sourceChapter = chapters.find((ch) => ch._id === activeChapterId);
    const activeLesson = sourceChapter?.lessons.find((l) => l._id === activeLessonId);
    if (!activeLesson) return null;

    if (activeChapterId === overChapterId && overData?.type === 'lesson') {
        const fromIndex = sourceChapter!.lessons.findIndex((l) => l._id === activeLessonId);
        const toIndex = sourceChapter!.lessons.findIndex((l) => l._id === overId);
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return null;

        return chapters.map((ch) =>
            ch._id === activeChapterId
                ? { ...ch, lessons: arrayMove(ch.lessons, fromIndex, toIndex) }
                : ch,
        );
    }

    if (activeChapterId === overChapterId) return null;

    const stripped = chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.filter((l) => l._id !== activeLessonId),
    }));

    return stripped.map((ch) => {
        if (ch._id !== overChapterId) return ch;

        const lessons = [...ch.lessons];
        let insertAt = lessons.length;

        if (overData?.type === 'lesson') {
            const overIndex = lessons.findIndex((l) => l._id === overId);
            if (overIndex >= 0) insertAt = overIndex;
        }

        lessons.splice(insertAt, 0, { ...activeLesson, chapterId: overChapterId });
        return { ...ch, lessons };
    });
}

const lessonCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCorners(args);
};

function HoverTitleTip({
    label,
    children,
    className,
    disabled,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const trimmed = label.trim();

    if (!trimmed || disabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            className={cn('relative', className)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
            {hovered && (
                <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0 z-[120] max-w-[min(18rem,calc(100vw-2rem))] rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
                >
                    {trimmed}
                    <span
                        aria-hidden
                        className="absolute left-4 top-full border-[5px] border-transparent border-t-gray-900 dark:border-t-gray-100"
                    />
                </div>
            )}
        </div>
    );
}

function SidebarInput({
    value,
    onChange,
    onBlur,
    onKeyDown,
    placeholder,
    className,
    inputRef,
    autoFocus,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    autoFocus?: boolean;
}) {
    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
                'w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800',
                'placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15',
                'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100',
                className,
            )}
        />
    );
}

async function persistLessonLayout(before: ChapterWithLessons[], after: ChapterWithLessons[]) {
    const beforeMap = new Map<string, { chapterId: string; order: number }>();
    before.forEach((chapter) => {
        chapter.lessons.forEach((lesson, index) => {
            beforeMap.set(lesson._id, { chapterId: chapter._id, order: index + 1 });
        });
    });

    const movedUpdates: Promise<unknown>[] = [];
    const chaptersToReorder = new Set<string>();

    after.forEach((chapter) => {
        chapter.lessons.forEach((lesson, index) => {
            const prev = beforeMap.get(lesson._id);
            if (!prev) return;

            const nextOrder = index + 1;
            if (prev.chapterId !== chapter._id) {
                movedUpdates.push(
                    updateAdminLesson(lesson._id, { chapterId: chapter._id, order: nextOrder }),
                );
                chaptersToReorder.add(prev.chapterId);
                chaptersToReorder.add(chapter._id);
            } else if (prev.order !== nextOrder) {
                chaptersToReorder.add(chapter._id);
            }
        });
    });

    before.forEach((chapter) => {
        const nextChapter = after.find((item) => item._id === chapter._id);
        if (nextChapter && nextChapter.lessons.length !== chapter.lessons.length) {
            chaptersToReorder.add(chapter._id);
        }
    });

    await Promise.all(movedUpdates);

    await Promise.all(
        [...chaptersToReorder].map(async (chapterId) => {
            const chapter = after.find((item) => item._id === chapterId);
            if (!chapter) return;
            await reorderLessons(
                chapterId,
                chapter.lessons.map((lesson, index) => ({ _id: lesson._id, order: index + 1 })),
            );
        }),
    );
}

export default function CourseBuilderOverlay({ courseId, courseName, onClose }: CourseBuilderOverlayProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contentParam = searchParams.get('content');
    const lessonParam = searchParams.get('lesson');
    const isOverview = contentParam === 'tongquan' || (!contentParam && !lessonParam);

    const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<ChapterWithLessons | null>(null);
    const [deleteLessonConfirm, setDeleteLessonConfirm] = useState<{ chapterId: string; lesson: Lesson } | null>(null);
    const [activeTarget, setActiveTarget] = useState<BuilderActiveTarget | null>(null);
    const [focusChapterId, setFocusChapterId] = useState<string | null>(null);
    const [lessonDragSnapshot, setLessonDragSnapshot] = useState<ChapterWithLessons[] | null>(null);
    const [draggingType, setDraggingType] = useState<'chapter' | 'lesson' | null>(null);
    const [activeDragLesson, setActiveDragLesson] = useState<Lesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const dragChaptersRef = useRef<ChapterWithLessons[]>([]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const update = () => {
            setIsLargeScreen(mq.matches);
            if (mq.matches) setSidebarOpen(true);
        };
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        dragChaptersRef.current = chapters;
    }, [chapters]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const updateBuilderUrl = useCallback(
        (next: { content: 'tongquan' } | { content: 'lesson'; lessonId: string }) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('quiz');
            if (next.content === 'tongquan') {
                params.set('content', 'tongquan');
                params.delete('lesson');
            } else {
                params.set('content', 'lesson');
                params.set('lesson', next.lessonId);
            }
            router.replace(`/admin/khoahoc?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

    const goToOverview = useCallback(() => {
        setActiveTarget(null);
        writeBuilderActive(courseId, null);
        updateBuilderUrl({ content: 'tongquan' });
        if (!isLargeScreen) setSidebarOpen(false);
    }, [courseId, isLargeScreen, updateBuilderUrl]);

    const selectLesson = useCallback(
        (chapterId: string, lesson: Lesson) => {
            const target: BuilderActiveTarget = {
                chapterId,
                lessonId: lesson._id,
                type: lesson.type === 'video' ? 'lesson' : 'exercise',
            };
            setActiveTarget(target);
            updateBuilderUrl({ content: 'lesson', lessonId: lesson._id });
            if (!isLargeScreen) setSidebarOpen(false);
        },
        [isLargeScreen, updateBuilderUrl],
    );

    useEffect(() => {
        if (contentParam === 'tongquan') {
            setActiveTarget(null);
            return;
        }
        if (contentParam === 'lesson' && lessonParam) return;

        const saved = readBuilderActive(courseId);
        if (saved) {
            setActiveTarget(saved);
            updateBuilderUrl({ content: 'lesson', lessonId: saved.lessonId });
        }
    }, [courseId, contentParam, lessonParam, updateBuilderUrl]);

    useEffect(() => {
        writeBuilderActive(courseId, activeTarget);
    }, [courseId, activeTarget]);

    const loadCourseData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getCourseChapters(courseId);
            const mapped = (data || []).map((ch) => ({
                ...ch,
                lessons: (ch as unknown as ChapterWithLessons).lessons || [],
            })) as ChapterWithLessons[];
            setChapters(mapped);

            setActiveTarget((prev) => {
                if (!prev) return prev;
                const lessonExists = mapped.some(
                    (ch) => ch._id === prev.chapterId && ch.lessons.some((l) => l._id === prev.lessonId),
                );
                return lessonExists ? prev : null;
            });
        } catch {
            toast.error('Không thể tải nội dung khoá học');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        loadCourseData();
    }, [loadCourseData]);

    useEffect(() => {
        if (contentParam !== 'lesson' || !lessonParam || chapters.length === 0) return;

        for (const chapter of chapters) {
            const lesson = chapter.lessons.find((item) => item._id === lessonParam);
            if (lesson) {
                setActiveTarget({
                    chapterId: chapter._id,
                    lessonId: lesson._id,
                    type: lesson.type === 'video' ? 'lesson' : 'exercise',
                });
                break;
            }
        }
    }, [chapters, contentParam, lessonParam]);

    useEffect(() => {
        if (!contentParam && !lessonParam) {
            updateBuilderUrl({ content: 'tongquan' });
        }
    }, [contentParam, lessonParam, updateBuilderUrl]);

    const handleAddChapter = async () => {
        try {
            const chapter = await createChapter(courseId, {
                courseId,
                title: 'Chương mới',
                order: chapters.length + 1,
            });
            setChapters((prev) => [...prev, { ...chapter, lessons: [] }]);
            setFocusChapterId(chapter._id);
        } catch {
            toast.error('Không thể thêm chương');
        }
    };

    const handleUpdateChapter = async (chapterId: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        try {
            await updateChapter(chapterId, { title: newTitle });
            setChapters((prev) => prev.map((ch) => (ch._id === chapterId ? { ...ch, title: newTitle } : ch)));
        } catch {
            toast.error('Không thể cập nhật chương');
        }
    };

    const handleDeleteChapter = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteChapter(deleteConfirm._id);
            setChapters((prev) => prev.filter((ch) => ch._id !== deleteConfirm._id));
            setDeleteConfirm(null);
            if (activeTarget?.chapterId === deleteConfirm._id) {
                setActiveTarget(null);
            }
            toast.success('Đã xoá chương');
        } catch {
            toast.error('Không thể xoá chương');
        }
    };

    const handleCreateLesson = async (chapter: ChapterWithLessons) => {
        try {
            const newLesson = await createAdminLesson(chapter._id, {
                courseId,
                chapterId: chapter._id,
                title: 'Bài học mới',
                order: (chapter.lessons || []).length + 1,
                type: 'video',
            });
            setChapters((prev) =>
                prev.map((ch) =>
                    ch._id === chapter._id ? { ...ch, lessons: [...(ch.lessons || []), newLesson] } : ch,
                ),
            );
            setActiveTarget({ chapterId: chapter._id, lessonId: newLesson._id, type: 'lesson' });
            updateBuilderUrl({ content: 'lesson', lessonId: newLesson._id });
            toast.success('Đã thêm bài học');
        } catch {
            toast.error('Không thể tạo bài học');
        }
    };

    const handleCreateExercise = async (chapter: ChapterWithLessons) => {
        try {
            const newLesson = await createAdminLesson(chapter._id, {
                courseId,
                chapterId: chapter._id,
                title: 'Bài tập mới',
                order: (chapter.lessons || []).length + 1,
                type: 'exercise',
            });
            setChapters((prev) =>
                prev.map((ch) =>
                    ch._id === chapter._id ? { ...ch, lessons: [...(ch.lessons || []), newLesson] } : ch,
                ),
            );
            setActiveTarget({ chapterId: chapter._id, lessonId: newLesson._id, type: 'exercise' });
            updateBuilderUrl({ content: 'lesson', lessonId: newLesson._id });
            toast.success('Đã thêm bài tập');
        } catch {
            toast.error('Không thể tạo bài tập');
        }
    };

    const handleUpdateLessonTitle = async (chapterId: string, lessonId: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        try {
            await updateAdminLesson(lessonId, { title: newTitle });
            setChapters((prev) =>
                prev.map((ch) => {
                    if (ch._id === chapterId) {
                        return {
                            ...ch,
                            lessons: ch.lessons.map((l) => (l._id === lessonId ? { ...l, title: newTitle } : l)),
                        };
                    }
                    return ch;
                }),
            );
        } catch {
            toast.error('Không thể cập nhật tên bài học/bài tập');
        }
    };

    const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
        try {
            await deleteAdminLesson(lessonId);
            setChapters((prev) =>
                prev.map((ch) => {
                    if (ch._id === chapterId) {
                        return { ...ch, lessons: ch.lessons.filter((l) => l._id !== lessonId) };
                    }
                    return ch;
                }),
            );
            if (activeTarget?.lessonId === lessonId) {
                setActiveTarget(null);
            }
            toast.success('Đã xoá thành công');
        } catch {
            toast.error('Không thể xoá');
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const type = event.active.data.current?.type;
        if (type === 'lesson') {
            const lesson = findLessonById(chapters, String(event.active.id));
            setDraggingType('lesson');
            setActiveDragLesson(lesson);
            setLessonDragSnapshot(structuredClone(chapters));
            dragChaptersRef.current = chapters;
        } else if (type === 'chapter') {
            setDraggingType('chapter');
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        if (active.data.current?.type !== 'lesson') return;

        const activeLessonId = String(active.id);
        const currentChapters = dragChaptersRef.current;

        const next = computeLessonMove(
            currentChapters,
            activeLessonId,
            String(over.id),
            over.data.current as { type?: string; chapterId?: string },
        );

        if (!next || isSameLessonLayout(currentChapters, next)) return;

        dragChaptersRef.current = next;
        setChapters(next);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const type = active.data.current?.type;
        setDraggingType(null);
        setActiveDragLesson(null);

        if (type === 'chapter') {
            if (!over || active.id === over.id) return;

            const oldIndex = chapters.findIndex((ch) => ch._id === active.id);
            const newIndex = chapters.findIndex((ch) => ch._id === over.id);
            if (oldIndex < 0 || newIndex < 0) return;

            const next = arrayMove(chapters, oldIndex, newIndex);
            setChapters(next);
            try {
                await reorderChapters(
                    courseId,
                    next.map((ch, idx) => ({ _id: ch._id, order: idx + 1 })),
                );
            } catch {
                toast.error('Không thể sắp xếp lại chương');
                loadCourseData();
            }
            return;
        }

        if (type === 'lesson' && lessonDragSnapshot) {
            const snapshot = lessonDragSnapshot;
            const finalLayout = dragChaptersRef.current;
            setLessonDragSnapshot(null);

            if (!over) {
                setChapters(snapshot);
                dragChaptersRef.current = snapshot;
                return;
            }

            try {
                await persistLessonLayout(snapshot, finalLayout);
                if (activeTarget) {
                    const nextChapterId = findChapterIdForLesson(finalLayout, activeTarget.lessonId);
                    if (nextChapterId && nextChapterId !== activeTarget.chapterId) {
                        setActiveTarget({ ...activeTarget, chapterId: nextChapterId });
                    }
                }
            } catch {
                toast.error('Không thể cập nhật vị trí bài học');
                setChapters(snapshot);
                dragChaptersRef.current = snapshot;
            }
        }
    };

    const handleDragCancel = () => {
        if (lessonDragSnapshot) {
            setChapters(lessonDragSnapshot);
            dragChaptersRef.current = lessonDragSnapshot;
            setLessonDragSnapshot(null);
        }
        setDraggingType(null);
        setActiveDragLesson(null);
    };

    const handleClose = () => {
        writeBuilderActive(courseId, null);
        onClose();
    };

    const isLessonDragging = draggingType === 'lesson';

    const activeLessonTitle = useMemo(() => {
        if (!activeTarget?.lessonId) return null;
        return findLessonById(chapters, activeTarget.lessonId)?.title || null;
    }, [activeTarget?.lessonId, chapters]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-gray-950">
            <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 dark:border-gray-800 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden"
                        aria-label="Mở menu nội dung"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                        {!isLargeScreen && activeLessonTitle ? (
                            <>
                                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                    {courseName}
                                </p>
                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {activeLessonTitle}
                                </p>
                            </>
                        ) : (
                            <h1 className="truncate text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                                {courseName}
                            </h1>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    aria-label="Đóng trình biên tập"
                >
                    <X className="h-5 w-5" />
                </button>
            </header>

            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                {!isLargeScreen && sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Đóng menu"
                        className="fixed left-0 right-0 top-14 bottom-0 z-[101] bg-black/55 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={cn(
                        'flex min-h-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
                        isLargeScreen
                            ? 'relative z-0 h-full w-full max-w-[22rem] shrink-0'
                            : cn(
                                  'fixed left-0 top-14 bottom-0 z-[102] h-[calc(100dvh-3.5rem)] w-[min(100vw,20rem)] max-w-[20rem] shadow-2xl transition-transform duration-200 ease-out',
                                  sidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none',
                              ),
                    )}
                >
                    <nav className="border-b border-gray-100 p-2 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={goToOverview}
                            className={cn(
                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                                isOverview
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900',
                            )}
                        >
                            <LayoutGrid className="h-4 w-4 shrink-0" />
                            Tổng quan
                        </button>
                    </nav>

                    <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Nội dung khoá học
                        </span>
                        <button
                            type="button"
                            onClick={handleAddChapter}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-blue-500 transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/40"
                            aria-label="Thêm chương mới"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-24 animate-pulse rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                                    />
                                ))}
                            </div>
                        ) : chapters.length === 0 ? (
                            <div className="py-12 text-center text-sm text-gray-400">
                                Bấm <span className="font-medium text-blue-500">+</span> để thêm chương đầu tiên
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={isLessonDragging ? lessonCollisionDetection : closestCorners}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDragEnd={handleDragEnd}
                                onDragCancel={handleDragCancel}
                            >
                                <SortableContext
                                    items={chapters.map((ch) => ch._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {chapters.map((chapter) => (
                                            <ChapterItem
                                                key={chapter._id}
                                                chapter={chapter}
                                                onUpdate={handleUpdateChapter}
                                                onDelete={() => setDeleteConfirm(chapter)}
                                                onCreateLesson={() => handleCreateLesson(chapter)}
                                                onCreateExercise={() => handleCreateExercise(chapter)}
                                                onUpdateLessonTitle={(lessonId, title) =>
                                                    handleUpdateLessonTitle(chapter._id, lessonId, title)
                                                }
                                                onDeleteLesson={(lesson) =>
                                                    setDeleteLessonConfirm({ chapterId: chapter._id, lesson })
                                                }
                                                activeLessonId={!isOverview ? activeTarget?.lessonId : undefined}
                                                onSelectLesson={(lesson) => selectLesson(chapter._id, lesson)}
                                                focusTitle={focusChapterId === chapter._id}
                                                onTitleFocused={() => setFocusChapterId(null)}
                                                isDropTarget={isLessonDragging}
                                                disableChapterDrag={isLessonDragging}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>

                                <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
                                    {activeDragLesson ? (
                                        <LessonDragPreview lesson={activeDragLesson} />
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        )}
                    </div>
                </aside>

                <main
                    className={cn(
                        'relative z-0 flex min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-gray-950',
                        !isLargeScreen && sidebarOpen && 'pointer-events-none max-lg:invisible',
                    )}
                >
                    {isOverview ? (
                        <CourseBuilderOverview courseId={courseId} />
                    ) : activeTarget ? (
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            {activeTarget.type === 'lesson'
                                ? (() => {
                                      let lessonData: Lesson | undefined;
                                      for (const ch of chapters) {
                                          if (ch._id === activeTarget.chapterId) {
                                              lessonData = ch.lessons.find((l) => l._id === activeTarget.lessonId);
                                              break;
                                          }
                                      }
                                      return (
                                          <LessonForm
                                              key={`lesson-${activeTarget.lessonId}`}
                                              courseId={courseId}
                                              chapterId={activeTarget.chapterId}
                                              lessonId={activeTarget.lessonId}
                                              initialTitle={lessonData?.title || ''}
                                              initialDescription={lessonData?.description || ''}
                                              initialVideoFileId={lessonData?.videoFileId || ''}
                                              initialDuration={lessonData?.duration || 0}
                                              initialQuizMarkdown={lessonData?.quizMarkdown || ''}
                                              initialQuizQuestions={lessonData?.quizQuestions}
                                              onQuizPersist={(lesson) => {
                                                  setChapters((prev) =>
                                                      prev.map((ch) =>
                                                          ch._id === activeTarget.chapterId
                                                              ? {
                                                                    ...ch,
                                                                    lessons: ch.lessons.map((l) =>
                                                                        l._id === lesson._id ? { ...l, ...lesson } : l,
                                                                    ),
                                                                }
                                                              : ch,
                                                      ),
                                                  );
                                              }}
                                              onSave={(lesson) => {
                                                  if (lesson) {
                                                      setChapters((prev) =>
                                                          prev.map((ch) =>
                                                              ch._id === activeTarget.chapterId
                                                                  ? {
                                                                        ...ch,
                                                                        lessons: ch.lessons.some((l) => l._id === lesson._id)
                                                                            ? ch.lessons.map((l) =>
                                                                                  l._id === lesson._id ? lesson : l,
                                                                              )
                                                                            : [...ch.lessons, lesson],
                                                                    }
                                                                  : ch,
                                                          ),
                                                      );
                                                      setActiveTarget({
                                                          chapterId: activeTarget.chapterId,
                                                          lessonId: lesson._id,
                                                          type: lesson.type === 'video' ? 'lesson' : 'exercise',
                                                      });
                                                  }
                                              }}
                                              onCancel={goToOverview}
                                          />
                                      );
                                  })()
                                : (() => {
                                      let lessonData: LessonWithExercise | undefined;
                                      for (const ch of chapters) {
                                          if (ch._id === activeTarget.chapterId) {
                                              lessonData = ch.lessons.find((l) => l._id === activeTarget.lessonId);
                                              break;
                                          }
                                      }
                                      return (
                                          <ExerciseForm
                                              key={`exercise-${activeTarget.lessonId}`}
                                              courseId={courseId}
                                              lessonId={activeTarget.lessonId}
                                              exerciseId={lessonData?.exercise?._id}
                                              initialExercise={lessonData?.exercise}
                                              onExercisePersist={(exercise) => {
                                                  setChapters((prev) =>
                                                      prev.map((ch) =>
                                                          ch._id === activeTarget.chapterId
                                                              ? {
                                                                    ...ch,
                                                                    lessons: ch.lessons.map((l) =>
                                                                        l._id === activeTarget.lessonId
                                                                            ? { ...l, exercise }
                                                                            : l,
                                                                    ),
                                                                }
                                                              : ch,
                                                      ),
                                                  );
                                              }}
                                              onSave={(exercise: Exercise) => {
                                                  if (exercise) {
                                                      setChapters((prev) =>
                                                          prev.map((ch) =>
                                                              ch._id === activeTarget.chapterId
                                                                  ? {
                                                                        ...ch,
                                                                        lessons: ch.lessons.some((l) => l._id === exercise.lessonId)
                                                                            ? ch.lessons.map((l) =>
                                                                                  l._id === exercise.lessonId
                                                                                      ? { ...l, exercise }
                                                                                      : l,
                                                                                  )
                                                                            : [
                                                                                  ...ch.lessons,
                                                                                  {
                                                                                      _id: exercise.lessonId,
                                                                                      courseId,
                                                                                      chapterId: activeTarget.chapterId,
                                                                                      title: lessonData?.title || '',
                                                                                      type: 'exercise',
                                                                                      order: ch.lessons.length + 1,
                                                                                      isPreview: false,
                                                                                      exercise,
                                                                                      createdAt: new Date().toISOString(),
                                                                                      updatedAt: new Date().toISOString(),
                                                                                  } as LessonWithExercise,
                                                                              ],
                                                                    }
                                                                  : ch,
                                                          ),
                                                      );
                                                      setActiveTarget({
                                                          chapterId: activeTarget.chapterId,
                                                          lessonId: exercise.lessonId,
                                                          type: 'exercise',
                                                      });
                                                  }
                                              }}
                                              onCancel={goToOverview}
                                          />
                                      );
                                  })()}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center px-6">
                            <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                                Chọn một bài học/bài tập hoặc tạo mới để chỉnh sửa
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {deleteConfirm && (
                <ConfirmModalDelete
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={handleDeleteChapter}
                    title="Xác nhận xoá chương"
                    message={`Bạn có chắc chắn muốn xoá chương "${deleteConfirm.title}"? Tất cả bài học trong chương sẽ bị xoá. Hành động này không thể hoàn tác.`}
                />
            )}

            {deleteLessonConfirm && (
                <ConfirmModalDelete
                    isOpen={!!deleteLessonConfirm}
                    onClose={() => setDeleteLessonConfirm(null)}
                    onConfirm={() => {
                        if (deleteLessonConfirm) {
                            handleDeleteLesson(deleteLessonConfirm.chapterId, deleteLessonConfirm.lesson._id);
                            setDeleteLessonConfirm(null);
                        }
                    }}
                    title="Xác nhận xoá bài học"
                    message={`Bạn có chắc chắn muốn xoá bài học "${deleteLessonConfirm.lesson.title}"? Hành động này không thể hoàn tác.`}
                />
            )}
        </div>
    );
}

function LessonDragPreview({ lesson }: { lesson: Lesson }) {
    return (
        <div className="ml-5 flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-1 py-1 shadow-lg ring-2 ring-blue-500/15 dark:border-blue-700 dark:bg-gray-900">
            <GripVertical className="ml-1 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1 truncate rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 text-sm font-medium text-blue-900 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-100">
                {lesson.title}
            </div>
            <span className="shrink-0 pr-2 text-xs font-medium text-blue-500">
                {lesson.type === 'video' ? 'Video' : 'Bài tập'}
            </span>
        </div>
    );
}

function ChapterDropZone({
    chapterId,
    isDropTarget,
    hasLessons,
    children,
}: {
    chapterId: string;
    isDropTarget: boolean;
    hasLessons: boolean;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `chapter-drop-${chapterId}`,
        data: { type: 'chapter-drop', chapterId },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'border-t border-gray-100 px-2 pb-2 pt-1 transition-colors dark:border-gray-800',
                isDropTarget && isOver && 'bg-blue-50/50 dark:bg-blue-950/25',
                !hasLessons && 'min-h-[48px]',
            )}
        >
            {children}
        </div>
    );
}

function ChapterItem({
    chapter,
    onUpdate,
    onDelete,
    onCreateLesson,
    onCreateExercise,
    onUpdateLessonTitle,
    onDeleteLesson,
    activeLessonId,
    onSelectLesson,
    focusTitle,
    onTitleFocused,
    isDropTarget,
    disableChapterDrag,
}: {
    chapter: ChapterWithLessons;
    onUpdate: (chapterId: string, newTitle: string) => Promise<void>;
    onDelete: () => void;
    onCreateLesson: () => void;
    onCreateExercise: () => void;
    onUpdateLessonTitle: (lessonId: string, title: string) => void;
    onDeleteLesson: (lesson: Lesson) => void;
    activeLessonId?: string;
    onSelectLesson: (lesson: Lesson) => void;
    focusTitle?: boolean;
    onTitleFocused?: () => void;
    isDropTarget: boolean;
    disableChapterDrag: boolean;
}) {
    const [expanded, setExpanded] = useState(true);
    const [title, setTitle] = useState(chapter.title);
    const titleRef = useRef<HTMLInputElement>(null);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: chapter._id,
        data: { type: 'chapter' },
        disabled: disableChapterDrag,
    });

    const style = { transform: CSS.Transform.toString(transform), transition };

    useEffect(() => {
        setTitle(chapter.title);
    }, [chapter.title]);

    useEffect(() => {
        if (!focusTitle || !titleRef.current) return;
        titleRef.current.focus();
        titleRef.current.select();
        onTitleFocused?.();
    }, [focusTitle, onTitleFocused]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
                isDragging && 'opacity-80 shadow-lg',
            )}
        >
            <div className="flex items-center gap-1.5 p-2">
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab rounded p-1 text-gray-400 active:cursor-grabbing hover:text-gray-600"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1">
                    <SidebarInput
                        inputRef={titleRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tên chương"
                        onBlur={() => {
                            if (title.trim() && title !== chapter.title) {
                                onUpdate(chapter._id, title);
                            } else if (!title.trim()) {
                                setTitle(chapter.title);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                    />
                </div>

                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="Xoá chương"
                >
                    <Trash2 className="h-4 w-4" />
                </button>

                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            aria-label="Thêm bài học hoặc bài tập"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[110] w-44">
                        <DropdownMenuItem
                            onSelect={() => onCreateLesson()}
                            className="cursor-pointer gap-2"
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            Tạo bài học mới
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => onCreateExercise()}
                            className="cursor-pointer gap-2"
                        >
                            <FileQuestion className="h-3.5 w-3.5" />
                            Tạo bài tập mới
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {expanded && (
                <ChapterDropZone
                    chapterId={chapter._id}
                    isDropTarget={isDropTarget}
                    hasLessons={chapter.lessons.length > 0}
                >
                    <SortableContext
                        items={chapter.lessons.map((lesson) => lesson._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {chapter.lessons.map((lesson) => (
                                <LessonItem
                                    key={lesson._id}
                                    lesson={lesson}
                                    chapterId={chapter._id}
                                    onUpdateTitle={(nextTitle) => onUpdateLessonTitle(lesson._id, nextTitle)}
                                    onDelete={() => onDeleteLesson(lesson)}
                                    isActive={activeLessonId === lesson._id}
                                    onClick={() => onSelectLesson(lesson)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </ChapterDropZone>
            )}
        </div>
    );
}

function LessonItem({
    lesson,
    chapterId,
    onUpdateTitle,
    onDelete,
    isActive,
    onClick,
}: {
    lesson: Lesson;
    chapterId: string;
    onUpdateTitle: (title: string) => void;
    onDelete: () => void;
    isActive: boolean;
    onClick: () => void;
}) {
    const [title, setTitle] = useState(lesson.title);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: lesson._id,
        data: { type: 'lesson', chapterId },
    });

    const style = {
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
    };

    useEffect(() => {
        setTitle(lesson.title);
    }, [lesson.title]);

    return (
        <div ref={setNodeRef} style={style} className={cn('ml-5', isDragging && 'z-10')}>
            <HoverTitleTip
                label={title}
                disabled={isDragging}
                className="group relative flex w-full items-center gap-1.5 rounded-lg"
            >
                {isDragging && (
                    <div
                        className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20"
                        aria-hidden
                    />
                )}

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className={cn(
                        'cursor-grab rounded p-1 text-gray-400 active:cursor-grabbing hover:text-gray-600',
                        isDragging && 'invisible',
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </button>

                <div
                    className={cn('min-w-0 flex-1', isDragging && 'invisible')}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                >
                    <SidebarInput
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            if (title.trim() && title !== lesson.title) onUpdateTitle(title);
                            else if (!title.trim()) setTitle(lesson.title);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        className={cn(
                            'truncate',
                            isActive &&
                                'border-blue-500 bg-blue-50/70 font-medium text-blue-900 dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-100',
                        )}
                    />
                </div>

                <span
                    className={cn(
                        'shrink-0 pr-1 text-xs',
                        isActive ? 'font-medium text-blue-500' : 'text-gray-400',
                        isDragging && 'invisible',
                    )}
                    onClick={onClick}
                >
                    {lesson.type === 'video' ? 'Video' : 'Bài tập'}
                </span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className={cn(
                        'rounded p-1.5 text-red-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20',
                        isDragging && 'invisible',
                    )}
                    aria-label="Xoá bài học"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </HoverTitleTip>
        </div>
    );
}
