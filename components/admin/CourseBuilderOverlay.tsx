'use client';

import { useState, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2, ChevronDown, ChevronRight, BookOpen, FileQuestion } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CustomButton } from '../custom/CustomButton';
import { CustomInput } from '../custom/CustomInput';
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
    reorderAdminLessons as reorderLessons
} from '@/lib/api/khoahoc.api';
import { Chapter, Lesson, Exercise } from '@/types/khoahoc.type';
import LessonForm from './LessonForm';
import ExerciseForm from './ExerciseForm';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function CourseBuilderOverlay({ courseId, courseName, onClose }: CourseBuilderOverlayProps) {
    const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
    const [loading, setLoading] = useState(true);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<ChapterWithLessons | null>(null);
    const [deleteLessonConfirm, setDeleteLessonConfirm] = useState<{ chapterId: string; lesson: Lesson } | null>(null);
    const [activeTarget, setActiveTarget] = useState<{
        chapterId: string;
        lessonId: string;
        type: 'lesson' | 'exercise';
    } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            const chapters = await getCourseChapters(courseId);
            setChapters((chapters || []).map(ch => ({ ...ch, lessons: (ch as unknown as ChapterWithLessons).lessons || [] })) as ChapterWithLessons[]);
        } catch (error) {
            toast.error('Không thể tải nội dung khoá học');
        } finally {
            setLoading(false);
        }
    };

    const handleAddChapter = async () => {
        if (!newChapterTitle.trim()) {
            toast.error('Vui lòng nhập tên chương');
            return;
        }
        try {
            const chapter = await createChapter(courseId, {
                courseId,
                title: newChapterTitle,
                order: chapters.length + 1,
            });
            setChapters([...chapters, { ...chapter, lessons: [] }]);
            setNewChapterTitle('');
            toast.success('Đã thêm chương');
        } catch (error) {
            toast.error('Không thể thêm chương');
        }
    };

    const handleUpdateChapter = async (chapterId: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        try {
            await updateChapter(chapterId, { title: newTitle });
            setChapters(chapters.map(ch => ch._id === chapterId ? { ...ch, title: newTitle } : ch));
            toast.success('Đã cập nhật chương');
        } catch (error) {
            toast.error('Không thể cập nhật chương');
        }
    };

    const handleDeleteChapter = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteChapter(deleteConfirm._id);
            setChapters(chapters.filter(ch => ch._id !== deleteConfirm._id));
            setDeleteConfirm(null);
            if (activeTarget?.chapterId === deleteConfirm._id) {
                setActiveTarget(null);
            }
            toast.success('Đã xoá chương');
        } catch (error) {
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
            setChapters(chapters.map(ch => ch._id === chapter._id ? { ...ch, lessons: [...(ch.lessons || []), newLesson] } : ch));
            setActiveTarget({ chapterId: chapter._id, lessonId: newLesson._id, type: 'lesson' });
            toast.success('Đã thêm bài học');
        } catch (error) {
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
            setChapters(chapters.map(ch => ch._id === chapter._id ? { ...ch, lessons: [...(ch.lessons || []), newLesson] } : ch));
            setActiveTarget({ chapterId: chapter._id, lessonId: newLesson._id, type: 'exercise' });
            toast.success('Đã thêm bài tập');
        } catch (error) {
            toast.error('Không thể tạo bài tập');
        }
    };

    const handleUpdateLessonTitle = async (chapterId: string, lessonId: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        try {
            await updateAdminLesson(lessonId, { title: newTitle });
            setChapters(chapters.map(ch => {
                if (ch._id === chapterId) {
                    return { ...ch, lessons: ch.lessons.map(l => l._id === lessonId ? { ...l, title: newTitle } : l) };
                }
                return ch;
            }));
        } catch (error) {
            toast.error('Không thể cập nhật tên bài học/bài tập');
        }
    };

    const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
        try {
            await deleteAdminLesson(lessonId);
            setChapters(chapters.map(ch => {
                if (ch._id === chapterId) {
                    return { ...ch, lessons: ch.lessons.filter(l => l._id !== lessonId) };
                }
                return ch;
            }));
            if (activeTarget?.lessonId === lessonId) {
                setActiveTarget(null);
            }
            toast.success('Đã xoá thành công');
        } catch (error) {
            toast.error('Không thể xoá');
        }
    };

    const handleReorderLessons = async (chapterId: string, lessons: { _id: string; order: number }[]) => {
        try {
            await reorderLessons(chapterId, lessons);
        } catch (error) {
            toast.error('Không thể sắp xếp lại bài học');
        }
    };

    const handleChapterDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = chapters.findIndex(ch => ch._id === active.id);
        const newIndex = chapters.findIndex(ch => ch._id === over.id);

        const newChapters = arrayMove(chapters, oldIndex, newIndex);
        setChapters(newChapters);

        try {
            await reorderChapters(courseId, newChapters.map((ch, idx) => ({ _id: ch._id, order: idx + 1 })));
        } catch (error) {
            toast.error('Không thể sắp xếp lại');
            setChapters(chapters);
        }
    };

    const handleLessonDragEnd = async (chapterId: string, event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const chapter = chapters.find(ch => ch._id === chapterId);
        if (!chapter) return;

        const lessons = chapter.lessons;
        const oldIndex = lessons.findIndex(l => l._id === active.id);
        const newIndex = lessons.findIndex(l => l._id === over.id);

        const newLessons = arrayMove(lessons, oldIndex, newIndex);
        setChapters(chapters.map(ch => ch._id === chapterId ? { ...ch, lessons: newLessons } : ch));

        await handleReorderLessons(chapterId, newLessons.map((l, idx) => ({ _id: l._id, order: idx + 1 })));
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Chapters */}
                <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
                    {/* Header with close button */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            {courseName}
                        </h3>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add chapter */}
                    <div className="px-4 py-3">
                        <div className="flex gap-2">
                            <CustomInput
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                placeholder="Tên chương mới"
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => e.key === 'Enter' && handleAddChapter()}
                            />
                            <CustomButton onClick={handleAddChapter}>
                                <Plus className="w-4 h-4" />
                            </CustomButton>
                        </div>
                    </div>

                    {/* Chapter list */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500 text-sm">Đang tải...</div>
                        ) : chapters.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Chưa có chương nào</div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChapterDragEnd}>
                                <SortableContext items={chapters.map(ch => ch._id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {chapters.map((chapter) => (
                                            <ChapterItem
                                                key={chapter._id}
                                                chapter={chapter}
                                                onUpdate={handleUpdateChapter}
                                                onDelete={() => setDeleteConfirm(chapter)}
                                                onCreateLesson={() => handleCreateLesson(chapter)}
                                                onCreateExercise={() => handleCreateExercise(chapter)}
                                                onUpdateLessonTitle={(lessonId, title) => handleUpdateLessonTitle(chapter._id, lessonId, title)}
                                                onDeleteLesson={(lesson) => setDeleteLessonConfirm({ chapterId: chapter._id, lesson })}
                                                activeLessonId={activeTarget?.lessonId}
                                                onSelectLesson={(lesson) => setActiveTarget({ chapterId: chapter._id, lessonId: lesson._id, type: lesson.type === 'video' ? 'lesson' : 'exercise' })}
                                                onLessonDragEnd={(event) => handleLessonDragEnd(chapter._id, event)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
                    {activeTarget ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {activeTarget.type === 'lesson' ? (() => {
                                // Find lesson data from chapters state
                                let lessonData: Lesson | undefined;
                                for (const ch of chapters) {
                                    if (ch._id === activeTarget.chapterId) {
                                        lessonData = ch.lessons.find(l => l._id === activeTarget.lessonId);
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
                                        initialQuizQuestions={lessonData?.quizQuestions || []}
                                        onSave={(lesson) => {
                                            if (lesson) {
                                                setChapters(prev => prev.map(ch =>
                                                    ch._id === activeTarget.chapterId
                                                        ? { ...ch, lessons: ch.lessons.some(l => l._id === lesson._id) ? ch.lessons.map(l => l._id === lesson._id ? lesson : l) : [...ch.lessons, lesson] }
                                                        : ch
                                                ));
                                            }
                                            // Re-fetch data to ensure the display is updated correctly
                                            // loadCourseData(); // Removed to prevent full sidebar reload
                                            // Keep the lesson active after save
                                            if (lesson) {
                                                setActiveTarget({ chapterId: activeTarget.chapterId, lessonId: lesson._id, type: lesson.type === 'video' ? 'lesson' : 'exercise' });
                                            }
                                        }}
                                        onCancel={() => setActiveTarget(null)}
                                    />
                                );
                            })() : (() => {
                                // Find lesson and exercise data from chapters state
                                let lessonData: LessonWithExercise | undefined;
                                for (const ch of chapters) {
                                    if (ch._id === activeTarget.chapterId) {
                                        lessonData = ch.lessons.find(l => l._id === activeTarget.lessonId);
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
                                        onSave={(exercise: Exercise) => {
                                            if (exercise) {
                                                setChapters(prev => prev.map(ch =>
                                                    ch._id === activeTarget.chapterId
                                                        ? {
                                                            ...ch,
                                                            lessons: ch.lessons.some(l => l._id === exercise.lessonId)
                                                                ? ch.lessons.map(l => l._id === exercise.lessonId ? { ...l, exercise: exercise } : l)
                                                                : [...ch.lessons, {
                                                                    _id: exercise.lessonId,
                                                                    courseId,
                                                                    chapterId: activeTarget.chapterId,
                                                                    title: lessonData?.title || '',
                                                                    type: 'exercise',
                                                                    order: ch.lessons.length + 1,
                                                                    isPreview: false,
                                                                    exercise: exercise,
                                                                    createdAt: new Date().toISOString(),
                                                                    updatedAt: new Date().toISOString()
                                                                } as LessonWithExercise]
                                                        }
                                                        : ch
                                                ));
                                            }
                                            // Keep the exercise active after save
                                            if (exercise) {
                                                setActiveTarget({ chapterId: activeTarget.chapterId, lessonId: exercise.lessonId, type: 'exercise' });
                                            }
                                        }}
                                        onCancel={() => setActiveTarget(null)}
                                    />
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-gray-400">
                            Chọn một bài học/bài tập hoặc tạo mới để chỉnh sửa
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
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
    onLessonDragEnd,
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
    onLessonDragEnd: (event: DragEndEvent) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const [title, setTitle] = useState(chapter.title);


    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter._id });

    const style = { transform: CSS.Transform.toString(transform), transition };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (title.trim() && title !== chapter.title) {
            onUpdate(chapter._id, title);
        } else if (!title.trim()) {
            setTitle(chapter.title);
        }
    };

    const lessonSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const lessonIds = chapter.lessons?.map(l => l._id) || [];

    return (
        <div ref={setNodeRef} style={style} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Chapter header */}
            <div className="flex items-center gap-1 px-2 py-2">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                    {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                </button>
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5">
                    <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <div className="flex-1">
                    <CustomInput
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                            if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                            }
                        }}
                    />
                </div>

                <div className="flex items-center gap-0.5">
                    <button onClick={onDelete} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                        <Trash2 className="w-3 h-3 text-red-400" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                                <Plus className="w-3 h-3 text-blue-500" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={onCreateLesson} className="cursor-pointer gap-2">
                                <BookOpen className="w-3.5 h-3.5" />
                                Tạo bài học mới
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onCreateExercise} className="cursor-pointer gap-2">
                                <FileQuestion className="w-3.5 h-3.5" />
                                Tạo bài tập mới
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Lessons list */}
            {expanded && chapter.lessons?.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                    <DndContext sensors={lessonSensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd}>
                        <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-0.5 p-1">
                                {chapter.lessons.map((lesson) => (
                                    <LessonItem
                                        key={lesson._id}
                                        lesson={lesson}
                                        onUpdateTitle={(title) => onUpdateLessonTitle(lesson._id, title)}
                                        onDelete={() => onDeleteLesson(lesson)}
                                        isActive={activeLessonId === lesson._id}
                                        onClick={() => onSelectLesson(lesson)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

function LessonItem({
    lesson,
    onUpdateTitle,
    onDelete,
    isActive,
    onClick,
}: {
    lesson: Lesson;
    onUpdateTitle: (title: string) => void;
    onDelete: () => void;
    isActive: boolean;
    onClick: () => void;
}) {
    const [title, setTitle] = useState(lesson.title);


    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson._id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTitle(e.target.value);
    const handleTitleBlur = () => {
        if (title.trim() && title !== lesson.title) onUpdateTitle(title);
        else if (!title.trim()) setTitle(lesson.title);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded group cursor-pointer transition-colors ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/30'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                }`}
            onClick={onClick}
        >
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5">
                <GripVertical className="w-3 h-3 text-gray-400" />
            </button>
            <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                <CustomInput
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                />
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">
                {lesson.type === 'video' ? 'Video' : 'Bài tập'}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded shrink-0 transition-opacity"
            >
                <Trash2 className="w-3 h-3 text-red-400" />
            </button>
        </div>
    );
}