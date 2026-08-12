'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, CheckCircle, XCircle, FileText, Upload } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { PracticeSet, STATUS_LABELS } from '@/types/luyentap.type';
import { mapBackendExercise, mapBackendStatusToFrontend } from '@/lib/utils/luyentap.mapper';
import { parseExerciseFile } from '@/lib/utils/parseExerciseFile';
import { CustomButton } from '@/components/custom/CustomButton';
import LuyentapExerciseEditorOverlay from '@/components/luyentap/LuyentapExerciseEditorOverlay';
import LuyentapFileParsingModal from '@/components/luyentap/LuyentapFileParsingModal';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomToggle } from '@/components/custom/CustomToggle';
import { toast } from 'sonner';
import type { PracticeTier } from '@/types/luyentap.type';

interface CreateFormState {
    title: string;
    tier: PracticeTier;
    price: string;
    discountType: 'percent' | 'vnd';
    discountValue: string;
    allowCoinPayment: boolean;
}

const DEFAULT_CREATE_FORM: CreateFormState = {
    title: '',
    tier: 'free',
    price: '',
    discountType: 'percent',
    discountValue: '',
    allowCoinPayment: false,
};

export default function AdminLuyenTapPage() {
    const [items, setItems] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<CreateFormState>(DEFAULT_CREATE_FORM);
    const [creating, setCreating] = useState(false);
    const [parsingMessage, setParsingMessage] = useState<string | null>(null);
    const [activeEditor, setActiveEditor] = useState<{
        id: string;
        uploadMarkdown?: string;
    } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PracticeSet | null>(null);
    const [rejectTarget, setRejectTarget] = useState<PracticeSet | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const trimmed = search.trim();
            const res = await luyentapApi.adminList({
                search: trimmed || undefined,
                status: status === 'all' ? undefined : (status === 'approved' ? 'published' : status),
            });
            if (res.success !== false) {
                const raw = res.data?.exercises || res.exercises || res.data || [];
                setItems((Array.isArray(raw) ? raw : []).map((item: PracticeSet) => ({
                    ...mapBackendExercise(item as Parameters<typeof mapBackendExercise>[0]),
                    status: mapBackendStatusToFrontend((item as { status: string }).status),
                })));
            }
        } catch {
            toast.error('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => { fetchList(); }, [fetchList]);

    const resetCreateForm = () => setCreateForm(DEFAULT_CREATE_FORM);

    const openCreateModal = () => {
        resetCreateForm();
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        resetCreateForm();
    };

    const buildCreatePayload = (method: 'editor' | 'upload') => ({
        title: createForm.title.trim(),
        duration: 30,
        description: '',
        status: 'draft' as const,
        tier: createForm.tier,
        price: createForm.tier === 'pro' ? parseInt(createForm.price.replace(/\D/g, ''), 10) || 0 : 0,
        discountType: createForm.discountType,
        discountValue: createForm.tier === 'pro' ? parseFloat(createForm.discountValue) || 0 : 0,
        allowCoinPayment: createForm.tier === 'pro' ? createForm.allowCoinPayment : false,
        creationMethod: method,
        questions: [],
    });

    const validateCreateForm = () => {
        if (!createForm.title.trim()) {
            toast.error('Nhập tên bài tập');
            return false;
        }
        if (createForm.tier === 'pro') {
            const price = parseInt(createForm.price.replace(/\D/g, ''), 10) || 0;
            if (price <= 0) {
                toast.error('Nhập giá bán cho bài tập trả phí');
                return false;
            }
            const discount = parseFloat(createForm.discountValue) || 0;
            if (createForm.discountType === 'percent' && discount > 100) {
                toast.error('Giảm giá không được vượt quá 100%');
                return false;
            }
            if (createForm.discountType === 'vnd' && discount > price) {
                toast.error('Giảm giá không được lớn hơn giá bán');
                return false;
            }
        }
        return true;
    };

    const handleCreate = async (method: 'editor' | 'upload' = 'editor') => {
        if (!validateCreateForm()) return;
        setCreating(true);
        try {
            const res = await luyentapApi.adminCreate(buildCreatePayload(method));
            if (res.success !== false) {
                toast.success('Đã tạo bài tập');
                closeCreateModal();
                const exerciseId = res.data?.exercise?._id || res.data?._id;
                if (exerciseId) setActiveEditor({ id: exerciseId });
            }
        } catch {
            toast.error('Lỗi khi tạo bài tập');
        } finally {
            setCreating(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!validateCreateForm()) return;

        closeCreateModal();
        setParsingMessage('Đang phân tích file...');

        try {
            const text = await parseExerciseFile(file);
            if (!text.trim()) {
                throw new Error('File không có nội dung hoặc không đọc được');
            }

            setParsingMessage('Đang tạo bài tập...');
            const res = await luyentapApi.adminCreate({
                ...buildCreatePayload('upload'),
                description: `Import từ ${file.name}`,
            });

            if (res.success === false) {
                throw new Error('Không tạo được bài tập');
            }

            const exerciseId = res.data?.exercise?._id || res.data?._id;
            if (!exerciseId) {
                throw new Error('Không tạo được bài tập');
            }

            setParsingMessage(null);
            setActiveEditor({ id: exerciseId, uploadMarkdown: text });
            toast.success('Phân tích file thành công');
        } catch (err: unknown) {
            setParsingMessage(null);
            toast.error(err instanceof Error ? err.message : 'Không đọc được file');
        }
    };

    const closeEditor = () => {
        setActiveEditor(null);
        fetchList();
    };

    const computedFinalPrice = (() => {
        if (createForm.tier !== 'pro') return 0;
        const price = parseInt(createForm.price.replace(/\D/g, ''), 10) || 0;
        const discount = parseFloat(createForm.discountValue) || 0;
        if (price <= 0) return 0;
        if (createForm.discountType === 'percent') {
            return Math.max(0, Math.round(price * (1 - discount / 100)));
        }
        return Math.max(0, price - discount);
    })();

    const openEditor = (id: string) => {
        setActiveEditor({ id });
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

    return (
        <div className="space-y-6 pb-8 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl font-bold">Quản lý Luyện tập</h1>
                <CustomButton onClick={openCreateModal}><Plus className="w-4 h-4" /> Tạo bài tập</CustomButton>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
                                    <td className="p-3 hidden sm:table-cell text-xs">
                                        <span className={`px-2 py-0.5 rounded-full font-medium ${item.tier === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {item.tier === 'pro' ? 'Trả phí' : 'Miễn phí'}
                                        </span>
                                    </td>
                                    <td className="p-3 hidden md:table-cell">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                                            {STATUS_LABELS[item.status]}
                                        </span>
                                    </td>
                                    <td className="p-3 hidden md:table-cell">{item.questions?.length || 0}</td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEditor(item._id)} className="p-2 hover:bg-gray-100 rounded-lg" title="Soạn bài"><Edit2 className="w-4 h-4" /></button>
                                            {(item.status === 'pending' || item.status === 'draft') && (
                                                <>
                                                    <button onClick={() => handleApprove(item)} className="p-2 hover:bg-green-50 rounded-lg text-green-600" title="Duyệt / Xuất bản"><CheckCircle className="w-4 h-4" /></button>
                                                    <button onClick={() => setRejectTarget(item)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Từ chối"><XCircle className="w-4 h-4" /></button>
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

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeCreateModal}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tạo bài tập mới</h3>
                            <p className="text-sm text-gray-500 mt-1">Nhập thông tin và chọn cách soạn nội dung</p>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            <CustomInput
                                label="Tên bài tập"
                                value={createForm.title}
                                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="VD: Bài 17 - Quản trị CSDL"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { value: 'free' as const, label: 'Miễn phí', desc: 'Mọi người đều làm được' },
                                        { value: 'pro' as const, label: 'Trả phí', desc: 'Cần mua để làm bài' },
                                    ]).map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCreateForm((f) => ({ ...f, tier: opt.value }))}
                                            className={`p-3 rounded-xl border-2 text-left transition ${
                                                createForm.tier === opt.value
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="font-semibold text-sm">{opt.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {createForm.tier === 'pro' && (
                                <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                    <CustomInput
                                        label="Giá bán (VNĐ)"
                                        value={createForm.price}
                                        onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))}
                                        placeholder="VD: 50000"
                                        type="text"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giảm giá</label>
                                        <div className="flex gap-2">
                                            <div className="w-20">
                                                <CustomSelect
                                                    value={createForm.discountType}
                                                    onChange={(value) => setCreateForm((f) => ({
                                                        ...f,
                                                        discountType: value as 'percent' | 'vnd',
                                                    }))}
                                                    options={[
                                                        { value: 'percent', label: '%' },
                                                        { value: 'vnd', label: 'VNĐ' },
                                                    ]}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <CustomInput
                                                    type="number"
                                                    min={0}
                                                    value={createForm.discountValue}
                                                    onChange={(e) => setCreateForm((f) => ({ ...f, discountValue: e.target.value }))}
                                                    placeholder={createForm.discountType === 'percent' ? 'VD: 20' : 'VD: 10000'}
                                                />
                                            </div>
                                        </div>
                                        {computedFinalPrice > 0 && (
                                            <p className="text-xs text-blue-600 mt-2 font-medium">
                                                Giá sau giảm: {computedFinalPrice.toLocaleString('vi-VN')}đ
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Cho phép thanh toán bằng xu</p>
                                            <p className="text-xs text-gray-500">Học viên có thể dùng xu thay vì tiền mặt</p>
                                        </div>
                                        <CustomToggle
                                            checked={createForm.allowCoinPayment}
                                            onChange={(checked) => setCreateForm((f) => ({ ...f, allowCoinPayment: checked }))}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cách tạo nội dung</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleCreate('editor')}
                                        disabled={creating || !!parsingMessage}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition disabled:opacity-50"
                                    >
                                        <FileText className="w-8 h-8 text-blue-600" />
                                        <span className="font-semibold text-sm">Trình soạn thảo</span>
                                        <span className="text-xs text-gray-500 text-center">Soạn câu hỏi trực tiếp</span>
                                    </button>
                                    <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition cursor-pointer ${parsingMessage ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Upload className="w-8 h-8 text-green-600" />
                                        <span className="font-semibold text-sm">Upload</span>
                                        <span className="text-xs text-gray-500 text-center">PDF, Word (.docx)</span>
                                        <input type="file" accept=".pdf,.doc,.docx,.txt,.md" className="hidden" onChange={handleFileUpload} disabled={!!parsingMessage} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <CustomButton variant="secondary" onClick={closeCreateModal}>Hủy</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {parsingMessage && <LuyentapFileParsingModal message={parsingMessage} />}

            {activeEditor && (
                <LuyentapExerciseEditorOverlay
                    exerciseId={activeEditor.id}
                    isUpload={!!activeEditor.uploadMarkdown}
                    uploadMarkdown={activeEditor.uploadMarkdown}
                    onClose={closeEditor}
                />
            )}

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
