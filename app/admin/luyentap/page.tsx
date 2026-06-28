'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { PracticeSet, STATUS_LABELS } from '@/types/luyentap.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import PracticeForm from '@/components/luyentap/PracticeForm';
import { toast } from 'sonner';

export default function AdminLuyenTapPage() {
    const [items, setItems] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PracticeSet | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PracticeSet | null>(null);
    const [rejectTarget, setRejectTarget] = useState<PracticeSet | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const trimmed = search.trim();
            const res = await luyentapApi.adminList({
                search: trimmed || undefined,
                status: status === 'all' ? undefined : status,
            });
            if (res.success) setItems(res.data.items);
        } catch {
            toast.error('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => { fetchList(); }, [fetchList]);

    const openCreate = () => { setEditing(null); setShowForm(true); };
    const openEdit = async (item: PracticeSet) => {
        try {
            const res = await luyentapApi.adminGetById(item._id);
            if (res.success) { setEditing(res.data); setShowForm(true); }
        } catch { toast.error('Không tải được bài tập'); }
    };

    const handleSave = async (data: Partial<PracticeSet>) => {
        if (editing) {
            await luyentapApi.adminUpdate(editing._id, data);
        } else {
            await luyentapApi.adminCreate(data as Parameters<typeof luyentapApi.adminCreate>[0]);
        }
        setShowForm(false);
        fetchList();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await luyentapApi.adminDelete(deleteTarget._id);
        toast.success('Đã xóa');
        setDeleteTarget(null);
        fetchList();
    };

    const handleApprove = async (item: PracticeSet) => {
        await luyentapApi.adminApprove(item._id);
        toast.success('Đã duyệt bài tập');
        fetchList();
    };

    const handleReject = async () => {
        if (!rejectTarget) return;
        await luyentapApi.adminReject(rejectTarget._id, rejectReason);
        toast.success('Đã từ chối');
        setRejectTarget(null);
        setRejectReason('');
        fetchList();
    };

    if (showForm) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold">{editing ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}</h1>
                    <CustomButton variant="secondary" onClick={() => setShowForm(false)}>Quay lại</CustomButton>
                </div>
                <PracticeForm initial={editing || undefined} onSave={handleSave} mode="admin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-xl font-bold">Quản lý Luyện tập</h1>
                <CustomButton onClick={openCreate}><Plus className="w-4 h-4" /> Tạo bài tập</CustomButton>
            </div>

            <div className="rounded-xl p-4 mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0">
                        <CustomInputSearch
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={setSearch}
                            size="medium"
                        />
                    </div>
                    <div className="w-full sm:w-48 shrink-0">
                        <CustomSelect value={status} onChange={setStatus} options={[
                            { value: 'all', label: 'Tất cả' },
                            ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
                        ]} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="text-left p-3">Tiêu đề</th>
                                <th className="text-left p-3 hidden sm:table-cell">Loại</th>
                                <th className="text-left p-3 hidden md:table-cell">Trạng thái</th>
                                <th className="text-left p-3 hidden md:table-cell">Câu hỏi</th>
                                <th className="text-right p-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item._id} className="border-t border-gray-100 dark:border-gray-800">
                                    <td className="p-3 font-medium">{item.title}</td>
                                    <td className="p-3 hidden sm:table-cell uppercase text-xs">{item.tier}</td>
                                    <td className="p-3 hidden md:table-cell">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                                            {STATUS_LABELS[item.status]}
                                        </span>
                                    </td>
                                    <td className="p-3 hidden md:table-cell">{item.questions?.length || 0}</td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                            {item.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(item)} className="p-2 hover:bg-green-50 rounded-lg text-green-600"><CheckCircle className="w-4 h-4" /></button>
                                                    <button onClick={() => setRejectTarget(item)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><XCircle className="w-4 h-4" /></button>
                                                </>
                                            )}
                                            <button onClick={() => setDeleteTarget(item)} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmModalDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Xóa bài tập" message={`Xóa "${deleteTarget?.title}"?`} />

            {rejectTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="font-bold mb-3">Từ chối bài tập</h3>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full border rounded-lg p-3 text-sm mb-4 dark:bg-gray-800 dark:border-gray-600" rows={3} placeholder="Lý do từ chối..." />
                        <div className="flex gap-2">
                            <CustomButton onClick={handleReject}>Từ chối</CustomButton>
                            <CustomButton variant="secondary" onClick={() => setRejectTarget(null)}>Hủy</CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
