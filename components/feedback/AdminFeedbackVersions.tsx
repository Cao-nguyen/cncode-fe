'use client';

import { useCallback, useEffect, useState } from 'react';
import { feedbackApi, getErrorMessage } from '@/lib/api/feedback.api';
import { ReleaseVersion } from '@/types/feedback.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { Edit2, GitBranch, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EMPTY_CHANGES = ['', '', ''];

function normalizeChanges(changes: string[]) {
    return changes.map((item) => item.trim()).filter(Boolean);
}

export default function AdminFeedbackVersions() {
    const [versions, setVersions] = useState<ReleaseVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<ReleaseVersion | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ReleaseVersion | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [versionInput, setVersionInput] = useState('');
    const [changes, setChanges] = useState<string[]>(EMPTY_CHANGES);

    const fetchVersions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await feedbackApi.adminGetVersions();
            if (res.success) setVersions(res.data || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    const openCreate = () => {
        setEditTarget(null);
        setVersionInput('');
        setChanges([...EMPTY_CHANGES]);
        setShowForm(true);
    };

    const openEdit = (item: ReleaseVersion) => {
        setEditTarget(item);
        setVersionInput(item.version);
        setChanges(item.changes.length > 0 ? [...item.changes, ''] : [...EMPTY_CHANGES]);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditTarget(null);
    };

    const updateChange = (index: number, value: string) => {
        setChanges((prev) => prev.map((item, i) => (i === index ? value : item)));
    };

    const addChangeRow = () => {
        setChanges((prev) => [...prev, '']);
    };

    const removeChangeRow = (index: number) => {
        setChanges((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const version = versionInput.trim();
        const normalizedChanges = normalizeChanges(changes);

        if (!version) {
            toast.error('Vui lòng nhập version');
            return;
        }
        if (normalizedChanges.length === 0) {
            toast.error('Cần ít nhất một thay đổi');
            return;
        }

        setSubmitting(true);
        try {
            if (editTarget) {
                const res = await feedbackApi.adminUpdateVersion(editTarget._id, { version, changes: normalizedChanges });
                if (res.success && res.data) {
                    setVersions((prev) => prev
                        .map((item) => (item._id === res.data._id ? res.data : item))
                        .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()));
                }
                toast.success('Đã cập nhật phiên bản');
            } else {
                const res = await feedbackApi.adminCreateVersion({ version, changes: normalizedChanges });
                if (res.success && res.data) {
                    setVersions((prev) => [res.data, ...prev]
                        .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()));
                }
                toast.success('Đã tạo phiên bản');
            }
            closeForm();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const removedId = deleteTarget._id;
        setDeleting(true);
        try {
            await feedbackApi.adminDeleteVersion(removedId);
            setVersions((prev) => prev.filter((item) => item._id !== removedId));
            toast.success('Đã xóa phiên bản');
            setDeleteTarget(null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    const fmtDate = (date: string) => format(new Date(date), 'dd/MM/yyyy', { locale: vi });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Cập nhật phiên bản</h2>
                    <p className="text-sm text-gray-500">Quản lý changelog hiển thị ở tab Phiên bản trên /gopy</p>
                </div>
                <CustomButton onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Thêm phiên bản
                </CustomButton>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="space-y-3 p-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
                        ))}
                    </div>
                ) : versions.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <GitBranch className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        Chưa có phiên bản nào
                    </div>
                ) : (
                    <div className="divide-y">
                        {versions.map((item) => (
                            <div key={item._id} className="p-5">
                                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">Version {item.version}</p>
                                        <p className="text-xs text-gray-500">{fmtDate(item.releasedAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Sửa">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Xóa">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-2 text-sm font-medium text-gray-600">Những thay đổi ở phiên bản này</p>
                                <ul className="space-y-1.5">
                                    {item.changes.map((change, index) => (
                                        <li key={`${item._id}-${index}`} className="flex gap-2 text-sm text-gray-700">
                                            <Plus className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeForm}>
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
                            <h3 className="text-lg font-semibold">{editTarget ? 'Sửa phiên bản' : 'Thêm phiên bản'}</h3>
                            <button type="button" onClick={closeForm} className="rounded-lg p-1 hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-5 p-5">
                            <CustomInput
                                label="Version mấy"
                                value={versionInput}
                                onChange={(e) => setVersionInput(e.target.value)}
                                placeholder="VD: 1.2.0"
                            />

                            <div>
                                <p className="mb-3 text-sm font-medium text-gray-700">Những thay đổi ở phiên bản này</p>
                                <div className="space-y-2">
                                    {changes.map((change, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                                <Plus className="h-4 w-4" />
                                            </span>
                                            <input
                                                type="text"
                                                value={change}
                                                onChange={(e) => updateChange(index, e.target.value)}
                                                placeholder="Mô tả thay đổi..."
                                                className={cn(
                                                    'min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition',
                                                    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                                                )}
                                            />
                                            {changes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeChangeRow(index)}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                    title="Xóa dòng"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addChangeRow}
                                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Thêm dòng
                                </button>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <CustomButton variant="secondary" fullWidth onClick={closeForm}>Hủy</CustomButton>
                                <CustomButton fullWidth loading={submitting} onClick={handleSubmit}>
                                    {editTarget ? 'Cập nhật' : 'Tạo phiên bản'}
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa phiên bản"
                message={deleteTarget ? `Xóa version ${deleteTarget.version}?` : ''}
                warning="Phiên bản sẽ bị xóa khỏi tab Phiên bản trên /gopy."
                isDeleting={deleting}
            />
        </div>
    );
}
