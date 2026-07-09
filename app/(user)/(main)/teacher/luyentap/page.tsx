'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Send, AlertCircle } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { PracticeSet, STATUS_LABELS } from '@/types/luyentap.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import PracticeForm from '@/components/luyentap/PracticeForm';
import { toast } from 'sonner';

export default function TeacherLuyenTapPage() {
    const [items, setItems] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PracticeSet | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PracticeSet | null>(null);

    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await luyentapApi.teacherList({ status: status === 'all' ? undefined : status });
            if (res.success) setItems(res.data.items);
        } catch {
            toast.error('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchList(); }, [status]);

    const openEdit = async (item: PracticeSet) => {
        const res = await luyentapApi.teacherGetById(item._id);
        if (res.success) { setEditing(res.data); setShowForm(true); }
    };

    const handleSave = async (data: Partial<PracticeSet>) => {
        if (editing) await luyentapApi.teacherUpdate(editing._id, data);
        else await luyentapApi.teacherCreate(data as Parameters<typeof luyentapApi.teacherCreate>[0]);
        setShowForm(false);
        fetchList();
    };

    const handleSubmitReview = async () => {
        if (!editing) return;
        await luyentapApi.teacherSubmitForReview(editing._id);
        toast.success('Đã gửi duyệt — bạn sẽ nhận thông báo khi được duyệt');
        setShowForm(false);
        fetchList();
    };

    if (showForm) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold">{editing ? 'Chỉnh sửa bài tập' : 'Đăng bài tập mới'}</h1>
                    <CustomButton variant="secondary" onClick={() => setShowForm(false)}>Quay lại</CustomButton>
                </div>
                {editing?.rejectionReason && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Bị từ chối: {editing.rejectionReason}
                    </div>
                )}
                <PracticeForm initial={editing || undefined} onSave={handleSave} onSubmitReview={handleSubmitReview} mode="teacher" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold">Bài luyện tập của tôi</h1>
                    <p className="text-sm text-gray-500">Tạo và gửi duyệt bài luyện tập</p>
                </div>
                <CustomButton onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4" /> Đăng bài tập</CustomButton>
            </div>

            <CustomSelect value={status} onChange={setStatus} options={[
                { value: 'all', label: 'Tất cả' },
                ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
            ]} />

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 text-gray-400">Chưa có bài tập nào</div>
            ) : (
                <div className="mt-4 space-y-3">
                    {items.map(item => (
                        <div key={item._id} className="bg-white dark:bg-gray-900 rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.title}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs uppercase text-gray-400">{item.tier}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>
                                        {STATUS_LABELS[item.status]}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <CustomButton size="small" variant="secondary" onClick={() => openEdit(item)}><Edit2 className="w-3 h-3" /></CustomButton>
                                {item.status === 'draft' || item.status === 'rejected' ? (
                                    <CustomButton size="small" variant="secondary" onClick={async () => {
                                        await luyentapApi.teacherSubmitForReview(item._id);
                                        toast.success('Đã gửi duyệt');
                                        fetchList();
                                    }}><Send className="w-3 h-3" /></CustomButton>
                                ) : null}
                                <CustomButton size="small" variant="secondary" onClick={() => setDeleteTarget(item)}><Trash2 className="w-3 h-3 text-red-400" /></CustomButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModalDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => {
                if (deleteTarget) { await luyentapApi.teacherDelete(deleteTarget._id); toast.success('Đã xóa'); setDeleteTarget(null); fetchList(); }
            }} title="Xóa bài tập" message={`Xóa "${deleteTarget?.title}"?`} />
        </div>
    );
}
