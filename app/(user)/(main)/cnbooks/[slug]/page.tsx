
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cnbookApi } from '@/lib/api/cnbook.api';
import { Book } from '@/types/cnbook.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomBadge } from '@/components/custom/CustomBadge';
import { toast } from 'sonner';
import { ArrowLeft, Eye, BookOpen, Clock, Coins, ShoppingBag, Sparkles, CheckCircle, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CATEGORY_LABELS: Record<string, string> = {
    grade10: 'Tin học 10',
    grade11: 'Tin học 11',
    grade12: 'Tin học 12',
    other: 'Khác'
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
};

export default function CNBookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [useCoins, setUseCoins] = useState(false);

    useEffect(() => {
        fetchBook();
    }, [params.slug]);

    const fetchBook = async () => {
        setLoading(true);
        try {
            const res = await cnbookApi.getBookBySlug(params.slug as string);
            if (res.success) setBook(res.data);
        } catch {
            toast.error('Không thể tải thông tin sách');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!book) return;
        setPurchasing(true);
        try {
            const res = await cnbookApi.purchaseBook(book._id, useCoins);
            if (res.success) {
                toast.success(useCoins ? 'Đã mua sách bằng xu thành công!' : 'Đã tạo đơn hàng thành công!');
                router.push(`/cnbooks/learn/${book._id}`);
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
    }

    if (!book) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Không tìm thấy sách</p></div>;
    }

    const finalPrice = book.isFree ? 0 : (book.discountPrice && book.discountPrice < book.price ? book.discountPrice : book.price);
    const discountPercent = book.price > 0 ? Math.round(((book.price - finalPrice) / book.price) * 100) : 0;
    const isPurchased = false; 

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <Link href="/cnbooks" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại thư viện
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                            {book.status === 'published' && (
                                <CustomBadge variant="solved">Đã xuất bản</CustomBadge>
                            )}
                            {book.purchaseCount > 0 && (
                                <span className="text-sm text-gray-500 flex items-center gap-1"><Eye className="w-4 h-4" /> {book.viewCount} lượt xem</span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{book.title}</h1>
                        <p className="text-gray-600 mb-6 leading-relaxed">{book.description}</p>

                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {book.authorId?.fullName?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{book.authorId?.fullName || 'Tác giả'}</p>
                                    <p className="text-xs text-gray-400">Tác giả</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>Xuất bản: {book.publishedAt ? format(new Date(book.publishedAt), 'dd/MM/yyyy', { locale: vi }) : 'Chưa xuất bản'}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                {book.isFree ? (
                                    <div className="text-3xl font-bold text-green-600">Miễn phí</div>
                                ) : discountPercent > 0 ? (
                                    <div>
                                        <div className="text-3xl font-bold text-blue-600">{formatCurrency(finalPrice)}</div>
                                        <div className="text-sm text-gray-400 line-through">{formatCurrency(book.price)}</div>
                                        <div className="text-sm text-red-500">Tiết kiệm {discountPercent}%</div>
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold text-blue-600">{formatCurrency(book.price)}</div>
                                )}
                            </div>

                            {isPurchased ? (
                                <Link href={`/cnbooks/learn/${book._id}`}>
                                    <CustomButton className="!px-8 !py-3"><BookOpen className="w-5 h-5" /> Học ngay</CustomButton>
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {!book.isFree && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} className="w-4 h-4" />
                                            <span className="text-sm text-gray-600 flex items-center gap-1"><Coins className="w-4 h-4" /> Thanh toán bằng xu</span>
                                        </label>
                                    )}
                                    <CustomButton onClick={handlePurchase} loading={purchasing} className="!px-8 !py-3">
                                        <Link href="/cnbooks/ly-gc-ng-vn-tp-2-965211">Xem sách</Link>
                                    </CustomButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {}
                {book.sections && book.sections.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">📑 Mục lục</h2>
                        <div className="space-y-3">
                            {book.sections.map((section, idx) => (
                                <div key={section._id} className="border-b border-gray-100 pb-3">
                                    <h3 className="font-semibold text-gray-700 mb-2">{idx + 1}. {section.title}</h3>
                                    <div className="pl-4 space-y-1">
                                        {section.lessons.map((lesson, lessonIdx) => (
                                            <div key={lesson._id} className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="w-5">{idx + 1}.{lessonIdx + 1}</span>
                                                <span>{lesson.title}</span>
                                                {lesson.exercises.length > 0 && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">📝 {lesson.exercises.length} bài tập</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
