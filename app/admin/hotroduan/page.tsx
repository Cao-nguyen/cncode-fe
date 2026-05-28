
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { helpProjectApi } from '@/lib/api/helpproject.api';
import { HelpProject } from '@/types/helpproject.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomEditorRef } from '@/components/custom/CustomEditor';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Eye, MessageCircle, CheckCircle, Clock, ChevronLeft, ChevronRight, Search, ShieldCheck, Send, FileText, Trash2, X } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import CustomEditor from '@/components/custom/CustomEditor';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ trả lời' },
    { value: 'answered', label: 'Đã trả lời' }
];

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ trả lời',
    answered: 'Đã trả lời'
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    answered: 'bg-green-100 text-green-700'
};

interface StatisticsData {
    total: number;
    pending: number;
    answered: number;
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
            <div><p className="text-2xl font-bold text-gray-800">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
        </div>
    </div>
);

const ViewProjectModal = ({ isOpen, onClose, project }: { isOpen: boolean; onClose: () => void; project: HelpProject | null }) => {
    if (!isOpen || !project) return null;

    const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const getUserInitial = (name: string): string => name?.charAt(0).toUpperCase() || '?';
    const displayName = project.userId?.fullName || 'Người dùng';
    const avatarUrl = project.userId?.avatar;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 z-50 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Chi tiết dự án</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6">
                        {project.thumbnail && (
                            <div className="relative h-64 w-full bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[project.status]}`}>{STATUS_LABELS[project.status]}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">{project.title}</h1>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <Avatar className="w-10 h-10">
                                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                                <AvatarFallback className="bg-blue-500 text-white">{getUserInitial(displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{displayName}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /><span>{formatDate(project.createdAt)}</span></div>
                            </div>
                        </div>
                        <StaticContent content={project.content} />

                        { }
                        {project.replies.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-blue-500" />
                                    Phản hồi ({project.replies.length})
                                </h3>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {project.replies.map((reply, idx) => {
                                        const isAdmin = reply.userId?.role === 'admin';
                                        const replyName = reply.userId?.fullName || (isAdmin ? 'Admin' : 'Người dùng');
                                        const replyAvatar = reply.userId?.avatar;
                                        return (
                                            <div key={idx} className={`flex gap-3 p-3 rounded-lg ${isAdmin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                <Avatar className="w-7 h-7">
                                                    {replyAvatar ? <AvatarImage src={replyAvatar} alt={replyName} /> : null}
                                                    <AvatarFallback className={isAdmin ? 'bg-purple-500 text-white text-xs' : 'bg-gray-400 text-white text-xs'}>
                                                        {replyName.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-800 text-sm">{replyName}</span>
                                                        {isAdmin && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span>}
                                                        <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                                                    </div>
                                                    <StaticContent content={reply.content} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const ReplyModal = ({ isOpen, onClose, project, onSuccess }: { isOpen: boolean; onClose: () => void; project: HelpProject | null; onSuccess: () => void }) => {
    const editorRef = useRef<CustomEditorRef>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !project) return null;

    const handleSubmit = async () => {
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung phản hồi');
            return;
        }
        setSubmitting(true);
        try {
            const res = await helpProjectApi.addReply(project._id, content);
            if (res.success) {
                toast.success('Đã gửi phản hồi');
                onSuccess();
                onClose();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 z-50 bg-white px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Phản hồi dự án</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-600 mb-3"><strong>Dự án:</strong> {project.title}</p>
                    <CustomEditor ref={editorRef} />
                </div>
                <div className="flex justify-end gap-3 p-5 pt-0">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSubmit} loading={submitting}><Send className="w-4 h-4" /> Gửi phản hồi</CustomButton>
                </div>
            </div>
        </div>
    );
};

const StatusModal = ({ isOpen, onClose, project, onSuccess }: { isOpen: boolean; onClose: () => void; project: HelpProject | null; onSuccess: () => void }) => {
    const [status, setStatus] = useState<HelpProject['status']>(project?.status || 'pending');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !project) return null;

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await helpProjectApi.updateStatus(project._id, status);
            if (res.success) {
                toast.success('Cập nhật trạng thái thành công');
                onSuccess();
                onClose();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const statusOptions = [
        { value: 'pending', label: 'Chờ trả lời' },
        { value: 'answered', label: 'Đã trả lời' }
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                { }
                <div className="sticky top-0 z-50 bg-white px-5 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Cập nhật trạng thái
                    </h3>

                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                { }
                <div className="p-5 space-y-4">
                    <CustomSelect
                        label="Trạng thái"
                        options={statusOptions}
                        value={status}
                        onChange={(val) =>
                            setStatus(val as HelpProject['status'])
                        }
                    />
                </div>

                { }
                <div className="flex justify-end gap-3 p-5 pt-0">
                    <CustomButton variant="secondary" onClick={onClose}>
                        Hủy
                    </CustomButton>
                    <CustomButton onClick={handleSubmit} loading={submitting}>
                        Cập nhật
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

const ViewRepliesModal = ({ isOpen, onClose, project, onSuccess }: { isOpen: boolean; onClose: () => void; project: HelpProject | null; onSuccess: () => void }) => {
    if (!isOpen || !project) return null;

    const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const getUserInitial = (name: string): string => name?.charAt(0).toUpperCase() || '?';

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 z-50 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-bold text-gray-800">Phản hồi dự án</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600">
                            <strong className="text-gray-800">Dự án:</strong> {project.title}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {project.replies.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400">Chưa có phản hồi nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {project.replies.map((reply, idx) => {
                                    const isAdmin = reply.userId?.role === 'admin';
                                    const displayName = reply.userId?.fullName || (isAdmin ? 'Admin' : 'Người dùng');
                                    const avatarUrl = reply.userId?.avatar;
                                    return (
                                        <div key={idx} className={`flex gap-3 p-4 rounded-lg ${isAdmin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                                                <AvatarFallback className={isAdmin ? 'bg-purple-500 text-white' : 'bg-gray-400 text-white'}>
                                                    {getUserInitial(displayName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-800 text-sm">{displayName}</span>
                                                    {isAdmin && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span>}
                                                    <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                                                </div>
                                                <StaticContent content={reply.content} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const AdminProjectRow = ({ project, onView, onViewReplies, onReply, onStatus, onDelete }: {
    project: HelpProject;
    onView: (p: HelpProject) => void;
    onViewReplies: (p: HelpProject) => void;
    onReply: (p: HelpProject) => void;
    onStatus: (p: HelpProject) => void;
    onDelete: (p: HelpProject) => void;
}) => {
    const getUserInitial = (name: string): string => name?.charAt(0).toUpperCase() || '?';

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {project.thumbnail ? (
                            <img src={project.thumbnail} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <FileText className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 line-clamp-1 max-w-xs">{project.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{project.content.replace(/<[^>]*>/g, '').substring(0, 50)}...</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                        {project.userId?.avatar ? <AvatarImage src={project.userId.avatar} alt={project.userId?.fullName} /> : null}
                        <AvatarFallback className="bg-blue-500 text-white text-xs">{getUserInitial(project.userId?.fullName || '')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">{project.userId?.fullName || 'Ẩn danh'}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[project.status]}`}>{STATUS_LABELS[project.status]}</span>
            </td>
            <td className="px-4 py-3 text-center">
                <button
                    onClick={() => onViewReplies(project)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mx-auto"
                >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {project.replies.length}
                </button>
            </td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onView(project)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => onReply(project)} className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Phản hồi"><MessageCircle className="w-4 h-4" /></button>
                    <button onClick={() => onStatus(project)} className="p-1.5 text-purple-500 hover:bg-purple-50 rounded" title="Cập nhật trạng thái"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(project)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

export default function AdminHelpProjectPage() {
    const [projects, setProjects] = useState<HelpProject[]>([]);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedProject, setSelectedProject] = useState<HelpProject | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showViewRepliesModal, setShowViewRepliesModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<HelpProject | null>(null);

    useEffect(() => {
        fetchStatistics();
        fetchProjects();
    }, [page, statusFilter, search]);

    const fetchStatistics = async () => {
        try {
            const res = await helpProjectApi.getStatistics();
            if (res.success && res.data) setStatistics(res.data);
        } catch {
            console.error('Failed to fetch stats');
        }
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await helpProjectApi.getAllProjects({
                page,
                limit: 10,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: search || undefined
            });
            if (res.success) {
                setProjects(res.projects);
                setTotalPages(res.totalPages);
            }
        } catch {
            toast.error('Không thể tải dự án');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await helpProjectApi.adminDeleteProject(deleteTarget._id);
            toast.success('Xóa thành công');
            setDeleteTarget(null);
            fetchProjects();
            fetchStatistics();
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleReplySuccess = () => {
        fetchProjects();
        fetchStatistics();
    };

    const handleStatusSuccess = () => {
        fetchProjects();
        fetchStatistics();
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý hỗ trợ dự án</h1>
                </div>

                {statistics && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatCard icon={<FileText className="w-5 h-5 text-blue-600" />} label="Tổng dự án" value={statistics.total} color="bg-blue-100" />
                        <StatCard icon={<Clock className="w-5 h-5 text-yellow-600" />} label="Chờ trả lời" value={statistics.pending} color="bg-yellow-100" />
                        <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} label="Đã trả lời" value={statistics.answered} color="bg-green-100" />
                    </div>
                )}

                <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1">
                            <CustomInput
                                placeholder="Tìm kiếm dự án..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="w-48">
                            <CustomSelect options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} placeholder="Trạng thái" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Dự án</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Người gửi</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Phản hồi</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : projects.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Không có dự án nào</td></tr>
                                ) : (
                                    projects.map((project) => (
                                        <AdminProjectRow
                                            key={project._id}
                                            project={project}
                                            onView={(p) => { setSelectedProject(p); setShowViewModal(true); }}
                                            onViewReplies={(p) => { setSelectedProject(p); setShowViewRepliesModal(true); }}
                                            onReply={(p) => { setSelectedProject(p); setShowReplyModal(true); }}
                                            onStatus={(p) => { setSelectedProject(p); setShowStatusModal(true); }}
                                            onDelete={(p) => setDeleteTarget(p)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 px-4 py-4 border-t border-gray-200">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="px-4 py-2 text-sm text-gray-600">Trang {page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>
            </div>

            <ViewProjectModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} project={selectedProject} />
            <ViewRepliesModal isOpen={showViewRepliesModal} onClose={() => setShowViewRepliesModal(false)} project={selectedProject} onSuccess={fetchProjects} />
            <ReplyModal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)} project={selectedProject} onSuccess={handleReplySuccess} />
            <StatusModal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} project={selectedProject} onSuccess={handleStatusSuccess} />
            <ConfirmModalDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Xóa dự án" message={`Bạn có chắc chắn muốn xóa dự án "${deleteTarget?.title}"?`} warning="Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn." />
        </div>
    );
}
