// app/quanly/cnbooks/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cnbookApi } from '@/lib/api/cnbook.api';
import { Book } from '@/types/cnbook.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomBadge } from '@/components/custom/CustomBadge';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, Search, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'draft', label: 'Bản nháp' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'rejected', label: 'Bị từ chối' }
];

const STATUS_LABELS: Record<string, string> = {
    draft: 'Bản nháp',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Bị từ chối',
    published: 'Đã xuất bản'
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    published: 'bg-blue-100 text-blue-700'
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
};

const BookRow = ({ book, onDelete }: { book: Book; onDelete: (id: string) => void }) => {
    const router = useRouter();
    const finalPrice = book.isFree ? 0 : (book.discountPrice && book.discountPrice < book.price ? book.discountPrice : book.price);

    return (
        <tr className="hover:bg-gray-50 transition">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {book.thumbnail ? (
                            <Image src={book.thumbnail} alt={book.title} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-gray-400" /></div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{book.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-md">{book.description}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <CustomBadge variant={
                    book.status === 'published' ? 'solved' :
                        book.status === 'pending' ? 'pending' :
                            book.status === 'rejected' ? 'other' : 'pending'
                }>
                    {STATUS_LABELS[book.status]}
                </CustomBadge>
                {book.rejectReason && <p className="text-xs text-red-500 mt-1 line-clamp-1">{book.rejectReason}</p>}
            </td>
            <td className="px-4 py-3 text-center">{book.viewCount}</td>
            <td className="px-4 py-3 text-center">{book.purchaseCount}</td>
            <td className="px-4 py-3 text-center font-medium text-blue-600">
                {book.isFree ? 'Miễn phí' : formatCurrency(finalPrice)}
            </td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <button onClick={() => router.push(`/quanly/cnbooks/view/${book._id}`)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => router.push(`/quanly/cnbooks/edit/${book._id}`)} className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Chỉnh sửa"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(book._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

export default function TeacherCNBooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        fetchBooks();
    }, [page, status, search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await cnbookApi.getUserBooks({
                page,
                limit: 10,
                status: status !== 'all' ? status : undefined,
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

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await cnbookApi.deleteBook(deleteTarget);
            toast.success('Xóa sách thành công');
            setDeleteTarget(null);
            fetchBooks();
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const statusSelectOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'draft', label: 'Bản nháp' },
        { value: 'pending', label: 'Chờ duyệt' },
        { value: 'published', label: 'Đã xuất bản' },
        { value: 'rejected', label: 'Bị từ chối' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">📚 Quản lý sách của tôi</h1>
                        <p className="text-sm text-gray-500 mt-1">Quản lý các đầu sách bạn đã tạo</p>
                    </div>
                    <Link href="/quanly/cnbooks/create">
                        <CustomButton><Plus className="w-4 h-4" /> Tạo sách mới</CustomButton>
                    </Link>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <CustomInput
                                placeholder="Tìm kiếm sách..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="w-48">
                            <CustomSelect
                                options={statusSelectOptions}
                                value={status}
                                onChange={setStatus}
                                placeholder="Trạng thái"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Sách</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Lượt xem</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Đã bán</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Giá</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : books.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Bạn chưa có sách nào</td></tr>
                                ) : (
                                    books.map(book => <BookRow key={book._id} book={book} onDelete={setDeleteTarget} />)
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 px-4 py-4 border-t border-gray-200">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-gray-600">Trang {page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa sách"
                message="Bạn có chắc chắn muốn xóa sách này?"
                warning="Hành động này không thể hoàn tác."
            />
        </div>
    );
}