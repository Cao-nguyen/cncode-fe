'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { helpProjectApi } from '@/lib/api/helpproject.api';
import { HelpProject, Reply } from '@/types/helpproject.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomBadge } from '@/components/custom/CustomBadge';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, MessageCircle, Edit2, Trash2, Send } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';

const getUserInitial = (name: string): string => name?.charAt(0).toUpperCase() || '?';
const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

const ReplyItem = ({ reply, isAdmin }: { reply: Reply; isAdmin: boolean }) => {
    const isAdminReply = reply.userId?.role === 'admin';
    const displayName = reply.userId?.fullName || (isAdminReply ? 'Admin' : 'Người dùng');
    const avatarUrl = reply.userId?.avatar;

    return (
        <div className={`flex gap-3 ${isAdminReply ? 'bg-blue-50' : 'bg-gray-50'} p-4 rounded-lg`}>
            <Avatar className="w-8 h-8">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                <AvatarFallback className={isAdminReply ? 'bg-purple-500 text-white' : 'bg-gray-400 text-white'}>
                    {getUserInitial(displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800 text-sm">{displayName}</span>
                    {isAdminReply && <CustomBadge variant="admin">Admin</CustomBadge>}
                    <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                </div>
                <StaticContent content={reply.content} />
            </div>
        </div>
    );
};

export default function HelpProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const editorRef = useRef<CustomEditorRef>(null);
    const [project, setProject] = useState<HelpProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user?._id : null;

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await helpProjectApi.getProjectById(params.id as string);
            if (res.success) setProject(res.data);
        } catch {
            toast.error('Không thể tải dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung phản hồi');
            return;
        }

        setSubmitting(true);
        try {
            const res = await helpProjectApi.addReply(project!._id, content);
            if (res.success && res.data) {
                toast.success('Đã gửi phản hồi');
                editorRef.current?.setContent('');
                // Update project state without full reload
                setProject(res.data);
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await helpProjectApi.deleteProject(project!._id);
            toast.success('Xóa dự án thành công');
            router.push('/hotroduan');
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const isOwner = currentUserId === project?.userId?._id;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Không tìm thấy dự án</p>
            </div>
        );
    }

    const displayName = project.userId?.fullName || 'Người dùng';
    const avatarUrl = project.userId?.avatar;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/hotroduan" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Link>
                    {isOwner && (
                        <div className="flex items-center gap-2">
                            <Link href={`/hotroduan/edit/${project._id}`}>
                                <CustomButton variant="secondary" size="small" className="!px-3 !py-1.5">
                                    <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                                </CustomButton>
                            </Link>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            >
                                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Xóa
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {project.thumbnail && (
                        <div className="relative h-80 w-full bg-gray-100">
                            \
                        </div>
                    )}

                    <div className="p-6">
                        <div className="mb-4">
                            <CustomBadge variant={project.status === 'answered' ? 'solved' : 'pending'}>
                                {project.status === 'answered' ? 'Đã trả lời' : 'Chờ trả lời'}
                            </CustomBadge>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-4">{project.title}</h1>

                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                                    <AvatarFallback className="bg-blue-500 text-white">{getUserInitial(displayName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{displayName}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(project.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <StaticContent content={project.content} />
                    </div>
                </div>

                {project.replies.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-500" /> Phản hồi ({project.replies.length})
                        </h3>
                        <div className="space-y-3">
                            {project.replies.map((reply) => (
                                <ReplyItem key={reply._id} reply={reply} isAdmin={reply.userId?.role === 'admin'} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Send className="w-4 h-4 text-green-500" /> Phản hồi của bạn
                    </h3>
                    <CustomEditor ref={editorRef} />
                    <div className="flex justify-end mt-4">
                        <CustomButton onClick={handleReply} loading={submitting}>
                            <Send className="w-4 h-4" /> Gửi phản hồi
                        </CustomButton>
                    </div>
                </div>
            </div>

            <ConfirmModalDelete isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title="Xóa dự án" message={`Bạn có chắc chắn muốn xóa dự án "${project.title}"?`} warning="Hành động này không thể hoàn tác." isDeleting={deleting} />
        </div>
    );
}
