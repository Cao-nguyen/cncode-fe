'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Play,
    BookOpen,
    CheckCircle2,
    GraduationCap,
    ArrowRight,
    Layers,
    CircleDashed,
} from 'lucide-react';
import { toast } from 'sonner';
import { khoahocApi } from '@/lib/api/khoahoc.api';
import { MyCourse } from '@/types/khoahoc.type';
import { getAvatarUrl, avatarImageProps, getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import { CustomButton } from '@/components/custom/CustomButton';
import { MyCoursesPageSkeleton } from '@/components/ui/skeleton';

type TabType = 'all' | 'in-progress' | 'completed' | 'not-started';

function getProgressTone(progress: number) {
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
}

const PROGRESS_STYLES = {
    completed: {
        badge: 'bg-emerald-500/90 text-white',
        bar: 'from-emerald-500 to-teal-500',
        ring: 'text-emerald-500',
    },
    'in-progress': {
        badge: 'bg-[var(--cn-primary)]/90 text-white',
        bar: 'from-blue-500 to-indigo-500',
        ring: 'text-[var(--cn-primary)]',
    },
    'not-started': {
        badge: 'bg-black/60 text-white',
        bar: 'from-slate-400 to-slate-500',
        ring: 'text-[var(--cn-text-muted)]',
    },
} as const;

function TeacherAvatar({ name, avatar }: { name?: string; avatar?: string }) {
    const [imgError, setImgError] = useState(false);
    const initials = name?.charAt(0)?.toUpperCase() || 'G';

    if (avatar && !imgError) {
        return (
            <img
                src={getAvatarUrl(avatar)}
                alt={name || 'Giảng viên'}
                className="h-5 w-5 rounded-full object-cover"
                {...avatarImageProps}
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--cn-primary)]/10 text-[10px] font-semibold text-[var(--cn-primary)]">
            {initials}
        </div>
    );
}

function CourseThumbnail({ course }: { course: MyCourse }) {
    const tone = getProgressTone(course.progress);
    const styles = PROGRESS_STYLES[tone];

    return (
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[var(--cn-bg-section)]">
            {course.thumbnail ? (
                <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-[var(--cn-text-muted)]" />
                </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <div className={cn('absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm', styles.badge)}>
                {course.progress === 100 ? 'Xong' : `${course.progress}%`}
            </div>
        </div>
    );
}

function MyCourseCard({
    course,
    onContinue,
    continuing,
}: {
    course: MyCourse;
    onContinue: (course: MyCourse) => void;
    continuing?: boolean;
}) {
    const tone = getProgressTone(course.progress);
    const styles = PROGRESS_STYLES[tone];
    const isCompleted = course.progress === 100;
    const isNotStarted = course.progress === 0;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm transition-all hover:border-[var(--cn-primary)]/30 hover:shadow-md">
            <CourseThumbnail course={course} />

            <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-[var(--cn-text-main)] transition-colors group-hover:text-[var(--cn-primary)] sm:min-h-[2.5rem]">
                    {course.title}
                </h3>

                {course.teacherName && (
                    <div className="mb-2 flex items-center gap-1.5">
                        <TeacherAvatar name={course.teacherName} avatar={course.teacherAvatar} />
                        <span className="truncate text-xs text-[var(--cn-text-sub)]">{course.teacherName}</span>
                    </div>
                )}

                <div className="mb-2.5">
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="text-[var(--cn-text-sub)]">
                            {course.completedLessons}/{course.totalLessons} bài
                        </span>
                        <span className={cn('font-semibold', isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--cn-primary)]')}>
                            {course.progress}%
                        </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cn-bg-section)]">
                        <div
                            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', styles.bar)}
                            style={{ width: `${course.progress}%` }}
                        />
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    <CustomButton
                        onClick={() => onContinue(course)}
                        size="small"
                        fullWidth
                        disabled={continuing}
                        loading={continuing}
                    >
                        {isNotStarted ? (
                            <>
                                <Play className="h-3.5 w-3.5" />
                                Bắt đầu
                            </>
                        ) : isCompleted ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Xem lại
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5" />
                                Tiếp tục
                            </>
                        )}
                    </CustomButton>
                    <Link
                        href={`/khoahoc/${course.slug}`}
                        className="block text-center text-[11px] font-medium text-[var(--cn-text-sub)] transition-colors hover:text-[var(--cn-primary)]"
                    >
                        Chi tiết khóa học
                    </Link>
                </div>
            </div>
        </article>
    );
}

function EmptyState({ tab, onExplore }: { tab: TabType; onExplore: () => void }) {
    const isAll = tab === 'all';

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-4 py-12 text-center sm:rounded-2xl sm:py-16">
            <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-blue-200/50 blur-2xl dark:bg-blue-900/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <GraduationCap className="h-10 w-10 text-white" />
                </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--cn-text-main)]">
                {isAll ? 'Chưa có khóa học nào' : 'Không có khóa học trong mục này'}
            </h3>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-[var(--cn-text-sub)]">
                {isAll
                    ? 'Khám phá thư viện khóa học và bắt đầu hành trình học lập trình của bạn ngay hôm nay.'
                    : 'Thử chọn tab khác hoặc tiếp tục học để cập nhật tiến độ.'}
            </p>
            {isAll && (
                <CustomButton onClick={onExplore}>
                    Khám phá khóa học
                    <ArrowRight className="h-4 w-4" />
                </CustomButton>
            )}
        </div>
    );
}

export default function MyCoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<MyCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [continuingCourseId, setContinuingCourseId] = useState<string | null>(null);

    const fetchMyCourses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await khoahocApi.getMyCourses();
            setCourses(data || []);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách khóa học của bạn');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyCourses();
    }, [fetchMyCourses]);

    const stats = useMemo(() => {
        const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100).length;
        const completed = courses.filter((c) => c.progress === 100).length;
        const notStarted = courses.filter((c) => c.progress === 0).length;
        const avgProgress = courses.length
            ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
            : 0;

        return {
            total: courses.length,
            inProgress,
            completed,
            notStarted,
            avgProgress,
        };
    }, [courses]);

    const filteredCourses = useMemo(() => {
        switch (activeTab) {
            case 'in-progress':
                return courses.filter((c) => c.progress > 0 && c.progress < 100);
            case 'completed':
                return courses.filter((c) => c.progress === 100);
            case 'not-started':
                return courses.filter((c) => c.progress === 0);
            default:
                return courses;
        }
    }, [courses, activeTab]);

    const handleContinueLearning = async (course: MyCourse) => {
        setContinuingCourseId(course._id);
        try {
            const { chapters } = await khoahocApi.getCourseLearnData(String(course.courseId));
            const lessons = chapters.flatMap((chapter) => chapter.lessons || []);
            const nextLesson = lessons.find((lesson) => !lesson.progress?.isCompleted);
            const targetLessonId = nextLesson?._id || lessons[0]?._id;

            if (targetLessonId) {
                router.push(`/learn/${targetLessonId}`);
                return;
            }

            router.push(`/khoahoc/${course.slug}`);
        } catch (error) {
            console.error(error);
            toast.error('Không thể mở bài học tiếp theo');
        } finally {
            setContinuingCourseId(null);
        }
    };

    const tabs: { key: TabType; label: string; shortLabel: string; count: number; icon: React.ElementType }[] = [
        { key: 'all', label: 'Tất cả', shortLabel: 'Tất cả', count: stats.total, icon: Layers },
        { key: 'in-progress', label: 'Đang học', shortLabel: 'Đang học', count: stats.inProgress, icon: Play },
        { key: 'completed', label: 'Hoàn thành', shortLabel: 'Xong', count: stats.completed, icon: CheckCircle2 },
        { key: 'not-started', label: 'Chưa bắt đầu', shortLabel: 'Mới', count: stats.notStarted, icon: CircleDashed },
    ];

    return (
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 md:py-8 lg:px-8">
            {loading ? (
                <MyCoursesPageSkeleton />
            ) : (
                <>
                    <div className="relative mb-5 overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-4 sm:mb-6 sm:rounded-2xl sm:p-6 md:mb-8 md:p-8">
                        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-gradient-to-bl from-blue-200/40 via-indigo-100/30 to-transparent sm:h-64 sm:w-64 dark:from-blue-900/20 dark:via-indigo-900/10" />
                        <div className="relative flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                                <h1 className="mb-1.5 text-xl font-bold text-[var(--cn-text-main)] sm:mb-2 sm:text-2xl md:text-3xl">
                                    Khóa học của tôi
                                </h1>
                                <p className="text-sm text-[var(--cn-text-sub)] sm:text-base md:max-w-xl">
                                    Theo dõi tiến độ, tiếp tục bài học dang dở và quay lại các khóa đã hoàn thành.
                                </p>
                            </div>

                            {stats.total > 0 && (
                                <div className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 shadow-md sm:w-auto sm:rounded-2xl sm:px-5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 sm:h-10 sm:w-10 sm:rounded-xl">
                                        <GraduationCap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-medium text-white/90 sm:text-xs">Tiến độ trung bình</p>
                                        <p className="text-lg font-bold text-white sm:text-xl">{stats.avgProgress}%</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-[var(--cn-border)] pt-4 sm:mt-6 sm:grid-cols-4 sm:gap-4 sm:pt-6">
                            <div className="min-w-0">
                                <p className="text-xl font-bold tabular-nums text-[var(--cn-text-main)] sm:text-2xl">{stats.total}</p>
                                <p className="mt-0.5 truncate text-[11px] text-[var(--cn-text-sub)] sm:text-xs">Tổng khóa học</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl font-bold tabular-nums text-[var(--cn-text-main)] sm:text-2xl">{stats.inProgress}</p>
                                <p className="mt-0.5 truncate text-[11px] text-[var(--cn-text-sub)] sm:text-xs">Đang học</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl font-bold tabular-nums text-[var(--cn-text-main)] sm:text-2xl">{stats.completed}</p>
                                <p className="mt-0.5 truncate text-[11px] text-[var(--cn-text-sub)] sm:text-xs">Hoàn thành</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl font-bold tabular-nums text-[var(--cn-text-main)] sm:text-2xl">{stats.notStarted}</p>
                                <p className="mt-0.5 truncate text-[11px] text-[var(--cn-text-sub)] sm:text-xs">Chưa bắt đầu</p>
                            </div>
                        </div>
                    </div>

                    <div className="-mx-3 mb-5 overflow-x-auto px-3 pb-1 sm:mx-0 sm:mb-6 sm:px-0 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex min-w-max gap-1.5 rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-1 sm:min-w-0 sm:w-full sm:gap-2">
                            {tabs.map(({ key, label, shortLabel, count, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveTab(key)}
                                    className={cn(
                                        'flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all sm:min-w-0 sm:flex-1 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm',
                                        activeTab === key
                                            ? 'bg-[var(--cn-primary)] text-white shadow-sm'
                                            : 'text-[var(--cn-text-sub)] hover:bg-black/5 hover:text-[var(--cn-text-main)] dark:hover:bg-white/5'
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                    <span className="hidden min-[400px]:inline sm:hidden">{shortLabel}</span>
                                    <span className="hidden sm:inline">{label}</span>
                                    <span className="min-[400px]:hidden sm:hidden">
                                        {key === 'all' ? 'Tất cả' : key === 'in-progress' ? 'Học' : key === 'completed' ? 'Xong' : 'Mới'}
                                    </span>
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-[11px]',
                                            activeTab === key
                                                ? 'bg-white/20 text-white'
                                                : 'bg-[var(--cn-bg-section)] text-[var(--cn-text-sub)]'
                                        )}
                                    >
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredCourses.length === 0 ? (
                        <EmptyState tab={activeTab} onExplore={() => router.push('/khoahoc')} />
                    ) : (
                        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            {filteredCourses.map((course) => (
                                <MyCourseCard
                                    key={course._id}
                                    course={course}
                                    onContinue={handleContinueLearning}
                                    continuing={continuingCourseId === course._id}
                                />
                            ))}
                        </div>
                    )}

                    {stats.total > 0 && activeTab === 'all' && (
                        <div className="mt-6 flex justify-center sm:mt-8">
                            <Link href="/khoahoc" className="w-full sm:w-auto">
                                <CustomButton variant="outline-primary" fullWidth className="sm:w-auto">
                                    Khám phá thêm khóa học
                                    <ArrowRight className="h-4 w-4" />
                                </CustomButton>
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
