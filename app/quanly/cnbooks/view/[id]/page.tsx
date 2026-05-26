// app/quanly/cnbooks/view/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cnbookApi } from '@/lib/api/cnbook.api';
import { Book, Section, Lesson, Exercise } from '@/types/cnbook.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomBadge } from '@/components/custom/CustomBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Edit2, Trash2, Eye, Clock, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import StaticContent from '@/components/common/StaticContent';

const CATEGORY_LABELS: Record<string, string> = {
    grade10: 'Tin học 10',
    grade11: 'Tin học 11',
    grade12: 'Tin học 12',
    other: 'Khác'
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Bản nháp',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Bị từ chối',
    published: 'Đã xuất bản'
};

const STATUS_VARIANTS: Record<string, 'pending' | 'solved' | 'other'> = {
    draft: 'pending',
    pending: 'pending',
    approved: 'solved',
    rejected: 'other',
    published: 'solved'
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
};

const ExerciseCard = ({ exercise, index }: { exercise: Exercise; index: number }) => {
    const [showAnswer, setShowAnswer] = useState(false);

    const getExerciseTypeLabel = () => {
        switch (exercise.type) {
            case 'multiple_choice': return 'Trắc nghiệm';
            case 'true_false': return 'Đúng/Sai';
            case 'short_answer': return 'Trả lời ngắn';
            default: return 'Bài tập';
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {getExerciseTypeLabel()}
                    </span>
                    <span className="text-xs text-yellow-600">{exercise.points} điểm</span>
                </div>
                <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                    {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                    {showAnswer ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
            </div>
            <p className="text-sm text-gray-800 mb-3">{exercise.question}</p>
            {exercise.options && exercise.options.length > 0 && (
                <div className="space-y-1 mb-3">
                    {exercise.options.map((opt, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                            <span>{opt}</span>
                        </div>
                    ))}
                </div>
            )}
            {showAnswer && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">Đáp án:</p>
                    <p className="text-sm text-green-600">
                        {exercise.type === 'multiple_choice'
                            ? `${String.fromCharCode(65 + (exercise.correctAnswer as number))}. ${exercise.options?.[exercise.correctAnswer as number]}`
                            : exercise.correctAnswer as string}
                    </p>
                    {exercise.explanation && (
                        <p className="text-sm text-gray-600 mt-2">{exercise.explanation}</p>
                    )}
                </div>
            )}
        </div>
    );
};

const LessonCard = ({ lesson, index: lessonIndex }: { lesson: Lesson; index: number }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                        {lessonIndex + 1}
                    </span>
                    <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                    {lesson.exercises.length > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            📝 {lesson.exercises.length} bài tập
                        </span>
                    )}
                </div>
                {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>

            {expanded && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                    <StaticContent content={lesson.content} />
                    {lesson.exercises.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-3">📝 Bài tập ({lesson.exercises.length})</h4>
                            <div className="space-y-3">
                                {lesson.exercises.map((exercise, idx) => (
                                    <ExerciseCard key={exercise._id} exercise={exercise} index={idx} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SectionCard = ({ section, index: sectionIndex }: { section: Section; index: number }) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition"
            >
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">Phần {sectionIndex + 1}</span>
                    <h2 className="font-bold text-gray-800">{section.title}</h2>
                    <span className="text-xs text-gray-500">{section.lessons.length} bài học</span>
                </div>
                {expanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
            </button>

            {expanded && (
                <div className="p-4 space-y-3">
                    {section.lessons.map((lesson, idx) => (
                        <LessonCard key={lesson._id} lesson={lesson} index={idx} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ViewCNBookPage() {
    const params = useParams();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchBook();
    }, [params.id]);

    const fetchBook = async () => {
        setLoading(true);
        try {
            const res = await cnbookApi.getBookById(params.id as string);
            if (res.success) {
                setBook(res.data);
            } else {
                toast.error('Không thể tải thông tin sách');
                router.push('/quanly/cnbooks');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
            router.push('/quanly/cnbooks');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/quanly/cnbooks/edit/${book?._id}`);
    };

    const handleDelete = async () => {
        try {
            await cnbookApi.deleteBook(book!._id);
            toast.success('Xóa sách thành công');
            router.push('/quanly/cnbooks');
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!book) return null;

    const finalPrice = book.isFree ? 0 : (book.discountPrice && book.discountPrice < book.price ? book.discountPrice : book.price);
    const discountPercent = book.price > 0 ? Math.round(((book.price - finalPrice) / book.price) * 100) : 0;

    // Hiển thị đúng ngày xuất bản
    const publishedDate = book.publishedAt
        ? format(new Date(book.publishedAt), 'dd/MM/yyyy', { locale: vi })
        : book.status === 'published'
            ? format(new Date(book.updatedAt), 'dd/MM/yyyy', { locale: vi })
            : 'Chưa xuất bản';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/quanly/cnbooks" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Link>
                    <div className="flex items-center gap-2">
                        <CustomButton variant="secondary" onClick={handleEdit} size="small">
                            <Edit2 className="w-4 h-4" /> Chỉnh sửa
                        </CustomButton>
                        <CustomButton variant="danger" onClick={() => setShowDeleteConfirm(true)} size="small">
                            <Trash2 className="w-4 h-4" /> Xóa
                        </CustomButton>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                    <div className="relative h-80 w-full bg-gray-100">
                        {book.thumbnail ? (
                            <Image src={book.thumbnail} alt={book.title} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                <BookOpen className="w-20 h-20 text-blue-400" />
                            </div>
                        )}
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <CustomBadge variant={book.category === 'grade10' ? 'grade10' : book.category === 'grade11' ? 'grade11' : book.category === 'grade12' ? 'grade12' : 'other'}>
                                {CATEGORY_LABELS[book.category]}
                            </CustomBadge>
                            <CustomBadge variant={STATUS_VARIANTS[book.status]}>
                                {STATUS_LABELS[book.status]}
                            </CustomBadge>
                            {book.rejectReason && (
                                <span className="text-xs text-red-500">Lý do: {book.rejectReason}</span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{book.title}</h1>
                        <p className="text-gray-600 mb-6 leading-relaxed">{book.description}</p>

                        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Eye className="w-4 h-4" /> {book.viewCount} lượt xem
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <ShoppingBag className="w-4 h-4" /> {book.purchaseCount} đã bán
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {publishedDate}
                                </div>
                            </div>
                            <div>
                                {book.isFree ? (
                                    <span className="text-2xl font-bold text-green-600">Miễn phí</span>
                                ) : discountPercent > 0 ? (
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(finalPrice)}</span>
                                        <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(book.price)}</span>
                                        <span className="text-sm text-red-500 ml-2">-{discountPercent}%</span>
                                    </div>
                                ) : (
                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(book.price)}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <Avatar className="w-10 h-10">
                                {book.authorId?.avatar ? (
                                    <AvatarImage src={book.authorId.avatar} alt={book.authorId?.fullName || 'Tác giả'} />
                                ) : null}
                                <AvatarFallback className="bg-blue-500 text-white">
                                    {book.authorId?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{book.authorId?.fullName || 'Tác giả'}</p>
                                <p className="text-xs text-gray-400">Tác giả</p>
                            </div>
                        </div>
                    </div>
                </div>

                {book.sections && book.sections.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">📑 Mục lục</h2>
                        <div className="space-y-3">
                            {book.sections.map((section, idx) => (
                                <SectionCard key={section._id} section={section} index={idx} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có nội dung</p>
                        <CustomButton onClick={handleEdit} className="mt-4">
                            <Edit2 className="w-4 h-4" /> Thêm nội dung
                        </CustomButton>
                    </div>
                )}
            </div>

            <ConfirmModalDelete
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Xóa sách"
                message={`Bạn có chắc chắn muốn xóa sách "${book?.title}"?`}
                warning="Hành động này không thể hoàn tác. Tất cả nội dung liên quan sẽ bị xóa vĩnh viễn."
            />
        </div>
    );
}