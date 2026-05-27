
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cnbookApi } from '@/lib/api/cnbook.api';
import { Book } from '@/types/cnbook.type';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomBadge } from '@/components/custom/CustomBadge';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Eye, BookOpen, TrendingUp, Search } from 'lucide-react';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'grade10', label: 'Tin học 10' },
    { value: 'grade11', label: 'Tin học 11' },
    { value: 'grade12', label: 'Tin học 12' },
    { value: 'other', label: 'Khác' }
];

const SORT_OPTIONS = [
    { value: 'latest', label: 'Mới nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'price_asc', label: 'Giá thấp đến cao' },
    { value: 'price_desc', label: 'Giá cao đến thấp' }
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
};

const BookCard = ({ book }: { book: Book }) => {
    const finalPrice = book.isFree ? 0 : (book.discountPrice && book.discountPrice < book.price ? book.discountPrice : book.price);
    const discountPercent = book.price > 0 ? Math.round(((book.price - finalPrice) / book.price) * 100) : 0;

    return (
        <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link href={`/cnbooks/${book.slug}`}>
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {book.thumbnail ? (
                        <Image src={book.thumbnail} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                            <BookOpen className="w-12 h-12 text-blue-400" />
                        </div>
                    )}
                    {discountPercent > 0 && !book.isFree && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            -{discountPercent}%
                        </div>
                    )}
                    {book.isFree && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            Miễn phí
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CustomBadge variant={book.category === 'grade10' ? 'grade10' : book.category === 'grade11' ? 'grade11' : book.category === 'grade12' ? 'grade12' : 'other'}>
                            {CATEGORIES.find(c => c.value === book.category)?.label}
                        </CustomBadge>
                        {book.purchaseCount > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> {book.purchaseCount} đã mua
                            </span>
                        )}
                    </div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                        {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{book.description}</p>
                    <div className="flex items-center justify-between">
                        <div>
                            {book.isFree ? (
                                <span className="text-lg font-bold text-green-600">Miễn phí</span>
                            ) : discountPercent > 0 ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-blue-600">{formatCurrency(finalPrice)}</span>
                                    <span className="text-sm text-gray-400 line-through">{formatCurrency(book.price)}</span>
                                </div>
                            ) : (
                                <span className="text-lg font-bold text-blue-600">{formatCurrency(book.price)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default function CNBooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('latest');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        fetchBooks();
    }, [page, category, sort, search]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await cnbookApi.getBooks({
                page,
                limit: 12,
                category: category !== 'all' ? category : undefined,
                sort,
                search: search || undefined
            });
            if (res.success) {
                setBooks(res.books);
                setTotalPages(res.totalPages);
            }
        } catch {
            toast.error('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 CNBooks - Thư viện sách điện tử</h1>
                    <p className="text-gray-500">Khám phá kho tàng kiến thức với các đầu sách chất lượng cao</p>
                </div>

                {}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === cat.value
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <CustomInput
                            placeholder="Tìm kiếm sách..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="sm:w-48">
                        <CustomSelect
                            options={SORT_OPTIONS}
                            value={sort}
                            onChange={setSort}
                            placeholder="Sắp xếp"
                        />
                    </div>
                </div>

                {}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy sách nào</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {books.map(book => <BookCard key={book._id} book={book} />)}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-gray-600">Trang {page} / {totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
