'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Plus, Edit2, Trash2, Loader2, CheckCircle, XCircle, FileText, Upload,
    Folder, FolderPlus, FileQuestion, Pencil, ChevronLeft, MoreVertical, FolderInput,
} from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { PracticeSet, STATUS_LABELS, LuyentapFolder } from '@/types/luyentap.type';
import { mapBackendExercise, mapBackendStatusToFrontend } from '@/lib/utils/luyentap.mapper';
import { parseExerciseFile } from '@/lib/utils/parseExerciseFile';
import { CustomButton } from '@/components/custom/CustomButton';
import LuyentapExerciseEditorOverlay from '@/components/luyentap/LuyentapExerciseEditorOverlay';
import LuyentapAdminOverviewClient from '@/components/luyentap/LuyentapAdminOverviewClient';
import LuyentapFileParsingModal from '@/components/luyentap/LuyentapFileParsingModal';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomToggle } from '@/components/custom/CustomToggle';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AdminPageShell, adminTitleClass } from '@/components/admin/AdminPageShell';
import { AdminTableScroll } from '@/components/admin/AdminTableScroll';
import type { PracticeTier } from '@/types/luyentap.type';
import type { Exercise } from '@/lib/api/luyentap.api';

interface CreateFormState {
    title: string;
    tier: PracticeTier;
    folderId: string;
    price: string;
    discountType: 'percent' | 'vnd';
    discountValue: string;
    allowCoinPayment: boolean;
}

const DEFAULT_CREATE_FORM: CreateFormState = {
    title: '',
    tier: 'free',
    folderId: '',
    price: '',
    discountType: 'percent',
    discountValue: '',
    allowCoinPayment: false,
};

type BrowseView =
    | { type: 'root' }
    | { type: 'folder'; folderId: string };

function toListItem(raw: Exercise & { status?: string }): PracticeSet {
    return {
        ...mapBackendExercise(raw),
        status: mapBackendStatusToFrontend(raw.status || 'draft'),
    };
}

function extractExerciseFromResponse(res: {
    data?: { exercise?: Exercise; _id?: string } & Partial<Exercise>;
    exercise?: Exercise;
}): Exercise | null {
    const candidate = res.data?.exercise ?? (res.data?._id ? res.data as Exercise : null) ?? res.exercise;
    return candidate?._id ? candidate : null;
}

function statusBadgeClass(status: PracticeSet['status']) {
    if (status === 'approved') return 'text-emerald-700';
    if (status === 'pending') return 'text-amber-700';
    if (status === 'rejected') return 'text-red-600';
    return 'text-slate-400';
}

function fmtDate(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function publishLabel(status: PracticeSet['status']) {
    if (status === 'approved') return 'Đã xuất bản';
    if (status === 'draft') return 'Chưa xuất bản';
    return STATUS_LABELS[status];
}

function exerciseBelongsInView(item: PracticeSet, currentView: BrowseView) {
    if (currentView.type === 'root') return !item.folderId;
    return item.folderId === currentView.folderId;
}

function FolderRowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="rounded-lg p-1.5 text-[var(--cn-text-muted)] hover:bg-[var(--cn-hover)]"
            >
                <MoreVertical className="h-4 w-4" />
            </button>
            {open && (
                <>
                    <button type="button" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-8 z-20 min-w-[120px] rounded-lg border border-[var(--cn-border)] bg-white py-1 shadow-lg">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--cn-hover)]">
                            <Pencil className="h-3.5 w-3.5" /> Đổi tên
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" /> Xóa
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function RowActions({
    onEdit,
    onMove,
    onApprove,
    onReject,
    onDelete,
    showApprove,
}: {
    onEdit?: () => void;
    onMove?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onDelete?: () => void;
    showApprove?: boolean;
}) {
    return (
        <div className="flex items-center justify-end gap-0.5">
            {onMove && (
                <button type="button" onClick={onMove} className="rounded-lg p-1.5 text-[var(--cn-text-muted)] hover:bg-[var(--cn-hover)]" title="Chuyển vào thư mục">
                    <FolderInput className="h-4 w-4" />
                </button>
            )}
            {onEdit && (
                <button type="button" onClick={onEdit} className="rounded-lg p-1.5 text-[var(--cn-text-muted)] hover:bg-[var(--cn-hover)]" title="Soạn bài">
                    <Edit2 className="h-4 w-4" />
                </button>
            )}
            {showApprove && onApprove && (
                <button type="button" onClick={onApprove} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" title="Duyệt">
                    <CheckCircle className="h-4 w-4" />
                </button>
            )}
            {showApprove && onReject && (
                <button type="button" onClick={onReject} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Từ chối">
                    <XCircle className="h-4 w-4" />
                </button>
            )}
            {onDelete && (
                <button type="button" onClick={onDelete} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50" title="Xóa">
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

const ADMIN_LUYENTAP_PATH = '/admin/luyentap';
const uploadMarkdownStorageKey = (exerciseId: string) => `luyentap-upload-${exerciseId}`;

function buildOverviewUrl(exerciseId: string) {
    return `${ADMIN_LUYENTAP_PATH}?overview=${encodeURIComponent(exerciseId)}`;
}

function buildEditUrl(exerciseId: string, upload = false) {
    const params = new URLSearchParams({ edit: exerciseId });
    if (upload) params.set('upload', '1');
    return `${ADMIN_LUYENTAP_PATH}?${params.toString()}`;
}

export default function AdminLuyenTapPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const overviewExerciseId = searchParams.get('overview');
    const editExerciseId = searchParams.get('edit');
    const isUploadEdit = searchParams.get('upload') === '1';
    const [editorUploadMarkdown, setEditorUploadMarkdown] = useState<string | undefined>();
    const [items, setItems] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [view, setView] = useState<BrowseView>({ type: 'root' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<CreateFormState>(DEFAULT_CREATE_FORM);
    const [creating, setCreating] = useState(false);
    const [parsingMessage, setParsingMessage] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PracticeSet | null>(null);
    const [rejectTarget, setRejectTarget] = useState<PracticeSet | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [folders, setFolders] = useState<LuyentapFolder[]>([]);
    const [folderStats, setFolderStats] = useState({ unassignedCount: 0, totalCount: 0 });
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [folderForm, setFolderForm] = useState({ name: '', description: '' });
    const [editFolderTarget, setEditFolderTarget] = useState<LuyentapFolder | null>(null);
    const [deleteFolderTarget, setDeleteFolderTarget] = useState<LuyentapFolder | null>(null);
    const [savingFolder, setSavingFolder] = useState(false);
    const [moveTarget, setMoveTarget] = useState<PracticeSet | null>(null);
    const [moveFolderId, setMoveFolderId] = useState('');
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        if (!editExerciseId || !isUploadEdit) {
            setEditorUploadMarkdown(undefined);
            return;
        }
        setEditorUploadMarkdown(sessionStorage.getItem(uploadMarkdownStorageKey(editExerciseId)) ?? undefined);
    }, [editExerciseId, isUploadEdit]);

    const activeEditor = useMemo(() => {
        if (!editExerciseId) return null;
        return {
            id: editExerciseId,
            uploadMarkdown: isUploadEdit ? editorUploadMarkdown : undefined,
        };
    }, [editExerciseId, isUploadEdit, editorUploadMarkdown]);

    const openOverview = useCallback((exerciseId: string) => {
        router.replace(buildOverviewUrl(exerciseId));
    }, [router]);

    const openEditor = useCallback((exerciseId: string, uploadMarkdown?: string) => {
        if (uploadMarkdown) {
            sessionStorage.setItem(uploadMarkdownStorageKey(exerciseId), uploadMarkdown);
            router.replace(buildEditUrl(exerciseId, true));
            return;
        }
        router.replace(buildEditUrl(exerciseId));
    }, [router]);

    const closeOverlays = useCallback(() => {
        if (editExerciseId) {
            sessionStorage.removeItem(uploadMarkdownStorageKey(editExerciseId));
        }
        router.replace(ADMIN_LUYENTAP_PATH);
    }, [router, editExerciseId]);

    const activeFolder = useMemo(() => (
        view.type === 'folder' ? folders.find((f) => f._id === view.folderId) : null
    ), [view, folders]);

    const fetchFolders = useCallback(async () => {
        setFoldersLoading(true);
        try {
            const res = await luyentapApi.adminListFolders();
            const data = res.data || res;
            setFolders(data.folders || []);
            setFolderStats({
                unassignedCount: data.unassignedCount || 0,
                totalCount: data.totalCount || 0,
            });
        } catch {
            toast.error('Không tải được danh sách thư mục');
        } finally {
            setFoldersLoading(false);
        }
    }, []);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const trimmed = search.trim();
            const res = await luyentapApi.adminList({
                search: trimmed || undefined,
                status: status === 'all' ? undefined : (status === 'approved' ? 'published' : status),
                folderId: view.type === 'folder' ? view.folderId : 'none',
                limit: 100,
            });
            if (res.success !== false) {
                const raw = res.data?.exercises || res.exercises || res.data || [];
                setItems((Array.isArray(raw) ? raw : []).map((item) => toListItem(item as Exercise & { status?: string })));
            }
        } catch {
            toast.error('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    }, [search, status, view]);

    useEffect(() => { fetchFolders(); }, [fetchFolders]);
    useEffect(() => { fetchList(); }, [fetchList]);

    const visibleFolders = useMemo(() => {
        if (view.type !== 'root') return [];
        const q = search.trim().toLowerCase();
        if (!q) return folders;
        return folders.filter((f) => f.name.toLowerCase().includes(q));
    }, [folders, search, view]);

    const upsertItem = useCallback((raw: Exercise & { status?: string }) => {
        const mapped = toListItem(raw);
        setItems((prev) => {
            const belongs = exerciseBelongsInView(mapped, view);
            const index = prev.findIndex((item) => item._id === mapped._id);
            if (!belongs) {
                return index >= 0 ? prev.filter((item) => item._id !== mapped._id) : prev;
            }
            if (index >= 0) {
                const next = [...prev];
                next[index] = {
                    ...prev[index],
                    title: mapped.title,
                    status: mapped.status,
                    description: mapped.description ?? prev[index].description,
                    tier: mapped.tier || prev[index].tier,
                    questions: mapped.questions?.length ? mapped.questions : prev[index].questions,
                    folderId: mapped.folderId ?? prev[index].folderId,
                    folder: mapped.folder ?? prev[index].folder,
                };
                return next;
            }
            return [mapped, ...prev];
        });
        fetchFolders();
    }, [fetchFolders, view]);

    const patchItemStatus = useCallback((id: string, nextStatus: PracticeSet['status']) => {
        setItems((prev) => prev.map((item) => (
            item._id === id ? { ...item, status: nextStatus } : item
        )));
    }, []);

    const defaultFolderIdForCreate = () => {
        if (view.type === 'folder') return view.folderId;
        return '';
    };

    const resetCreateForm = () => setCreateForm({
        ...DEFAULT_CREATE_FORM,
        folderId: defaultFolderIdForCreate(),
    });

    const openFolderModal = (folder?: LuyentapFolder) => {
        if (folder) {
            setEditFolderTarget(folder);
            setFolderForm({ name: folder.name, description: folder.description || '' });
        } else {
            setEditFolderTarget(null);
            setFolderForm({ name: '', description: '' });
        }
        setShowFolderModal(true);
    };

    const closeFolderModal = () => {
        setShowFolderModal(false);
        setEditFolderTarget(null);
        setFolderForm({ name: '', description: '' });
    };

    const handleSaveFolder = async () => {
        if (!folderForm.name.trim()) {
            toast.error('Nhập tên thư mục');
            return;
        }
        setSavingFolder(true);
        try {
            if (editFolderTarget) {
                const res = await luyentapApi.adminUpdateFolder(editFolderTarget._id, {
                    name: folderForm.name.trim(),
                    description: folderForm.description.trim(),
                });
                const updated = res.data?.folder || res.folder;
                if (updated?._id) {
                    setFolders((prev) => prev.map((f) => (f._id === updated._id ? { ...f, ...updated } : f)));
                } else {
                    fetchFolders();
                }
                toast.success('Đã cập nhật thư mục');
            } else {
                const res = await luyentapApi.adminCreateFolder({
                    name: folderForm.name.trim(),
                    description: folderForm.description.trim(),
                });
                const created = res.data?.folder || res.folder;
                if (created?._id) {
                    setFolders((prev) => [{ ...created, exerciseCount: 0 }, ...prev]);
                } else {
                    fetchFolders();
                }
                toast.success('Đã tạo thư mục');
            }
            closeFolderModal();
        } catch {
            toast.error('Không lưu được thư mục');
        } finally {
            setSavingFolder(false);
        }
    };

    const handleDeleteFolder = async () => {
        if (!deleteFolderTarget) return;
        const removedId = deleteFolderTarget._id;
        setSavingFolder(true);
        try {
            await luyentapApi.adminDeleteFolder(removedId);
            setFolders((prev) => prev.filter((f) => f._id !== removedId));
            if (view.type === 'folder' && view.folderId === removedId) {
                setView({ type: 'root' });
            }
            fetchFolders();
            fetchList();
            toast.success('Đã xóa thư mục');
            setDeleteFolderTarget(null);
        } catch {
            toast.error('Không xóa được thư mục');
        } finally {
            setSavingFolder(false);
        }
    };

    const folderSelectOptions = [
        { value: '', label: 'Ngoài thư mục' },
        ...folders.map((f) => ({ value: f._id, label: f.name })),
    ];

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
        folderId: createForm.folderId || null,
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
                const created = extractExerciseFromResponse(res);
                if (created) upsertItem(created);
                else fetchFolders();
                closeCreateModal();
                const exerciseId = created?._id || res.data?.exercise?._id || res.data?._id;
                if (exerciseId) openEditor(exerciseId);
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
        if (!file || !validateCreateForm()) return;

        closeCreateModal();
        setParsingMessage('Đang phân tích file...');

        try {
            const text = await parseExerciseFile(file);
            if (!text.trim()) throw new Error('File không có nội dung hoặc không đọc được');

            setParsingMessage('Đang tạo bài tập...');
            const res = await luyentapApi.adminCreate({
                ...buildCreatePayload('upload'),
                description: `Import từ ${file.name}`,
            });

            if (res.success === false) throw new Error('Không tạo được bài tập');

            const exerciseId = res.data?.exercise?._id || res.data?._id;
            if (!exerciseId) throw new Error('Không tạo được bài tập');

            const created = extractExerciseFromResponse(res);
            if (created) upsertItem(created);
            else fetchFolders();

            setParsingMessage(null);
            openEditor(exerciseId, text);
            toast.success('Phân tích file thành công');
        } catch (err: unknown) {
            setParsingMessage(null);
            toast.error(err instanceof Error ? err.message : 'Không đọc được file');
        }
    };

    const closeEditor = (updated?: Parameters<typeof upsertItem>[0] | null) => {
        closeOverlays();
        if (updated?._id) upsertItem(updated);
        else fetchFolders();
    };

    const computedFinalPrice = (() => {
        if (createForm.tier !== 'pro') return 0;
        const price = parseInt(createForm.price.replace(/\D/g, ''), 10) || 0;
        const discount = parseFloat(createForm.discountValue) || 0;
        if (price <= 0) return 0;
        if (createForm.discountType === 'percent') return Math.max(0, Math.round(price * (1 - discount / 100)));
        return Math.max(0, price - discount);
    })();

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const removedId = deleteTarget._id;
        await luyentapApi.adminDelete(removedId);
        setItems((prev) => prev.filter((item) => item._id !== removedId));
        fetchFolders();
        toast.success('Đã xóa');
        setDeleteTarget(null);
    };

    const handleApprove = async (item: PracticeSet) => {
        const res = await luyentapApi.adminApprove(item._id);
        const updated = extractExerciseFromResponse(res);
        if (updated) upsertItem(updated);
        else patchItemStatus(item._id, 'approved');
        toast.success('Đã duyệt bài tập');
    };

    const handleReject = async () => {
        if (!rejectTarget) return;
        const targetId = rejectTarget._id;
        const res = await luyentapApi.adminReject(targetId, rejectReason);
        const updated = extractExerciseFromResponse(res);
        if (updated) upsertItem(updated);
        else patchItemStatus(targetId, 'rejected');
        toast.success('Đã từ chối');
        setRejectTarget(null);
        setRejectReason('');
    };

    const openMoveModal = (item: PracticeSet) => {
        setMoveTarget(item);
        setMoveFolderId(item.folderId || '');
    };

    const closeMoveModal = () => {
        setMoveTarget(null);
        setMoveFolderId('');
    };

    const handleMoveToFolder = async () => {
        if (!moveTarget) return;
        const nextFolderId = moveFolderId || null;
        if ((moveTarget.folderId || null) === nextFolderId) {
            closeMoveModal();
            return;
        }
        setMoving(true);
        try {
            const res = await luyentapApi.adminUpdate(moveTarget._id, { folderId: nextFolderId });
            const updated = extractExerciseFromResponse(res);
            if (updated) {
                upsertItem(updated);
            } else {
                setItems((prev) => prev.filter((item) => item._id !== moveTarget._id));
                fetchFolders();
            }
            toast.success(nextFolderId ? 'Đã chuyển vào thư mục' : 'Đã chuyển ra ngoài thư mục');
            closeMoveModal();
        } catch {
            toast.error('Không chuyển được đề');
        } finally {
            setMoving(false);
        }
    };

    const isEmpty = view.type === 'root'
        ? !foldersLoading && visibleFolders.length === 0 && !loading && items.length === 0
        : !loading && items.length === 0;

    return (
        <>
        <AdminPageShell
            title="Quản lý luyện tập"
            description={`${folderStats.totalCount} đề · ${folders.length} thư mục`}
            titleSlot={
                view.type === 'folder' && activeFolder ? (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setView({ type: 'root' })}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Quay lại
                        </button>
                        <h1 className={adminTitleClass}>{activeFolder.name}</h1>
                    </div>
                ) : undefined
            }
            action={
                <div className="flex flex-wrap gap-2">
                    <CustomButton variant="secondary" onClick={() => openFolderModal()} className="w-full sm:w-auto">
                        <FolderPlus className="h-4 w-4" /> Tạo thư mục
                    </CustomButton>
                    <CustomButton onClick={openCreateModal} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4" /> Tạo đề
                    </CustomButton>
                </div>
            }
        >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="min-w-0 flex-1">
                        <CustomInputSearch placeholder="Tìm kiếm..." value={search} onChange={setSearch} size="medium" />
                    </div>
                    <div className="w-full sm:w-44">
                        <CustomSelect
                            value={status}
                            onChange={setStatus}
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
                            ]}
                        />
                    </div>
                </div>

                {foldersLoading && view.type === 'root' && loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : isEmpty ? (
                    <div className="rounded-xl border border-dashed border-[var(--cn-border)] py-16 text-center">
                        <FileQuestion className="mx-auto mb-4 h-14 w-14 text-[var(--cn-text-muted)]/40" />
                        <p className="mb-4 text-[var(--cn-text-sub)]">
                            {view.type === 'root' ? 'Chưa có thư mục hay đề nào' : 'Chưa có đề trong thư mục này'}
                        </p>
                        <div className="flex justify-center gap-2">
                            {view.type === 'root' && (
                                <CustomButton variant="secondary" onClick={() => openFolderModal()}>
                                    <FolderPlus className="h-4 w-4" /> Tạo thư mục
                                </CustomButton>
                            )}
                            <CustomButton onClick={openCreateModal}>
                                <Plus className="h-4 w-4" /> Tạo đề
                            </CustomButton>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-white">
                        <AdminTableScroll minWidth={720}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--cn-border)] text-left text-xs font-medium text-[var(--cn-text-muted)]">
                                    <th className="px-4 py-3 font-medium">Tên</th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Trạng thái</th>
                                    <th className="hidden px-4 py-3 font-medium md:table-cell">Thời gian tạo</th>
                                    <th className="hidden px-4 py-3 font-medium lg:table-cell">Giá đề thi</th>
                                    <th className="w-28 px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {view.type === 'root' && visibleFolders.map((folder) => (
                                    <tr
                                        key={folder._id}
                                        className="group cursor-pointer border-b border-[var(--cn-border)] transition hover:bg-[var(--cn-hover)]/50"
                                        onClick={() => setView({ type: 'folder', folderId: folder._id })}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Folder className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={1.5} />
                                                <span className="font-medium text-[var(--cn-text-main)]">{folder.name}</span>
                                                <span className="text-xs text-[var(--cn-text-muted)]">({folder.exerciseCount || 0} đề)</span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-4 py-3" />
                                        <td className="hidden md:table-cell px-4 py-3" />
                                        <td className="hidden lg:table-cell px-4 py-3" />
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <FolderRowMenu
                                                onEdit={() => openFolderModal(folder)}
                                                onDelete={() => setDeleteFolderTarget(folder)}
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                        </td>
                                    </tr>
                                ) : items.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="group cursor-pointer border-b border-[var(--cn-border)] transition last:border-b-0 hover:bg-[var(--cn-hover)]/50"
                                        onClick={() => openOverview(item._id)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex w-full items-center gap-3 text-left">
                                                <FileQuestion className="h-5 w-5 shrink-0 text-orange-500" />
                                                <span className="font-medium text-[var(--cn-text-main)] group-hover:text-blue-600">{item.title}</span>
                                            </div>
                                        </td>
                                        <td className={cn('hidden px-4 py-3 sm:table-cell', statusBadgeClass(item.status))}>
                                            {publishLabel(item.status)}
                                        </td>
                                        <td className="hidden px-4 py-3 text-[var(--cn-text-sub)] md:table-cell">
                                            {fmtDate(item.createdAt)}
                                        </td>
                                        <td className="hidden px-4 py-3 text-[var(--cn-text-sub)] lg:table-cell">
                                            {item.tier === 'pro'
                                                ? `${(item.price || 0).toLocaleString('vi-VN')}đ`
                                                : 'Miễn phí'}
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <RowActions
                                                onMove={() => openMoveModal(item)}
                                                onEdit={() => openEditor(item._id)}
                                                onApprove={() => handleApprove(item)}
                                                onReject={() => setRejectTarget(item)}
                                                onDelete={() => setDeleteTarget(item)}
                                                showApprove={item.status === 'pending'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </AdminTableScroll>
                    </div>
                )}
        </AdminPageShell>

            <ConfirmModalDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Xóa bài tập" message={`Xóa "${deleteTarget?.title}"?`} />

            <ConfirmModalDelete
                isOpen={!!deleteFolderTarget}
                onClose={() => setDeleteFolderTarget(null)}
                onConfirm={handleDeleteFolder}
                title="Xóa thư mục"
                message={deleteFolderTarget ? `Xóa "${deleteFolderTarget.name}"? Các đề sẽ chuyển ra ngoài thư mục.` : ''}
                isDeleting={savingFolder}
            />

            {showFolderModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4" onClick={closeFolderModal}>
                    <div className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                            <h3 className="font-bold text-slate-900">{editFolderTarget ? 'Đổi tên thư mục' : 'Tạo thư mục mới'}</h3>
                        </div>
                        <div className="px-4 py-4 sm:px-5">
                            <CustomInput
                                label="Tên thư mục"
                                value={folderForm.name}
                                onChange={(e) => setFolderForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="VD: Tin học 10 - HK1"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
                            <CustomButton variant="secondary" onClick={closeFolderModal} className="w-full sm:w-auto">Hủy</CustomButton>
                            <CustomButton onClick={handleSaveFolder} loading={savingFolder} className="w-full sm:w-auto">
                                {editFolderTarget ? 'Lưu' : 'Tạo'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {moveTarget && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4" onClick={closeMoveModal}>
                    <div className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                            <h3 className="font-bold text-slate-900">Chuyển vào thư mục</h3>
                            <p className="mt-1 truncate text-sm text-slate-500">{moveTarget.title}</p>
                        </div>
                        <div className="px-4 py-4 sm:px-5">
                            <CustomSelect
                                label="Thư mục đích"
                                value={moveFolderId}
                                onChange={setMoveFolderId}
                                options={folderSelectOptions}
                            />
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
                            <CustomButton variant="secondary" onClick={closeMoveModal} className="w-full sm:w-auto">Hủy</CustomButton>
                            <CustomButton onClick={handleMoveToFolder} loading={moving} className="w-full sm:w-auto">Chuyển</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4" onClick={closeCreateModal}>
                    <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                            <h3 className="text-lg font-bold text-slate-900">Tạo đề mới</h3>
                        </div>
                        <div className="space-y-4 px-4 py-5 sm:px-6">
                            <CustomInput
                                label="Tên đề"
                                value={createForm.title}
                                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="VD: Kiểm tra 15 phút"
                                required
                            />
                            <CustomSelect
                                label="Thư mục"
                                value={createForm.folderId}
                                onChange={(value) => setCreateForm((f) => ({ ...f, folderId: value }))}
                                options={folderSelectOptions}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    { value: 'free' as const, label: 'Miễn phí' },
                                    { value: 'pro' as const, label: 'Trả phí' },
                                ]).map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setCreateForm((f) => ({ ...f, tier: opt.value }))}
                                        className={cn(
                                            'rounded-xl border-2 py-2.5 text-sm font-medium transition',
                                            createForm.tier === opt.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300',
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {createForm.tier === 'pro' && (
                                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <CustomInput label="Giá (VNĐ)" value={createForm.price} onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))} />
                                    <div className="flex gap-2">
                                        <div className="w-20">
                                            <CustomSelect value={createForm.discountType} onChange={(v) => setCreateForm((f) => ({ ...f, discountType: v as 'percent' | 'vnd' }))} options={[{ value: 'percent', label: '%' }, { value: 'vnd', label: 'VNĐ' }]} />
                                        </div>
                                        <CustomInput type="number" min={0} value={createForm.discountValue} onChange={(e) => setCreateForm((f) => ({ ...f, discountValue: e.target.value }))} />
                                    </div>
                                    {computedFinalPrice > 0 && (
                                        <p className="text-xs font-medium text-blue-600">Giá sau giảm: {computedFinalPrice.toLocaleString('vi-VN')}đ</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-700">Thanh toán bằng xu</span>
                                        <CustomToggle checked={createForm.allowCoinPayment} onChange={(c) => setCreateForm((f) => ({ ...f, allowCoinPayment: c }))} />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button type="button" onClick={() => handleCreate('editor')} disabled={creating || !!parsingMessage} className="flex flex-col items-center gap-2 rounded-xl border-2 border-blue-200 p-4 transition hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50">
                                    <FileText className="h-7 w-7 text-blue-600" />
                                    <span className="text-sm font-semibold">Soạn đề</span>
                                </button>
                                <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-emerald-200 p-4 transition hover:border-emerald-500 hover:bg-emerald-50 ${parsingMessage ? 'pointer-events-none opacity-50' : ''}`}>
                                    <Upload className="h-7 w-7 text-emerald-600" />
                                    <span className="text-sm font-semibold">Upload file</span>
                                    <input type="file" accept=".pdf,.doc,.docx,.txt,.md" className="hidden" onChange={handleFileUpload} disabled={!!parsingMessage} />
                                </label>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
                            <CustomButton variant="secondary" onClick={closeCreateModal} className="w-full sm:w-auto">Đóng</CustomButton>
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

            {overviewExerciseId && (
                <LuyentapAdminOverviewClient
                    exerciseId={overviewExerciseId}
                    onClose={closeOverlays}
                />
            )}

            {rejectTarget && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
                    <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-6">
                        <h3 className="mb-3 font-bold">Từ chối bài tập</h3>
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mb-4 w-full rounded-lg border border-slate-200 p-3 text-sm" rows={3} placeholder="Lý do..." />
                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <CustomButton variant="secondary" onClick={() => setRejectTarget(null)} className="w-full sm:w-auto">Hủy</CustomButton>
                            <CustomButton onClick={handleReject} className="w-full sm:w-auto">Từ chối</CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
