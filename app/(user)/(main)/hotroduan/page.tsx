
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { helpProjectApi } from '@/lib/api/helpproject.api';
import { HelpProject } from '@/types/helpproject.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomBadge } from '@/components/custom/CustomBadge';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';
import { Plus, Search, ChevronLeft, ChevronRight, Edit2, Trash2, MessageCircle, Folder } from 'lucide-react';

type BadgeVariant = 'pending' | 'solved' | 'admin' | 'expert' | 'grade10' | 'grade11' | 'grade12' | 'other';

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ trả lời',
    answered: 'Đã trả lời'
};

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
    pending: 'pending',
    answered: 'solved'
};

interface ProjectCardProps {
    project: HelpProject;
    onDelete: (id: string) => void;
}

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
    const router = useRouter();

    const formatDate = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <Link href={`/hotroduan/${project._id}`}>
                <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
                    {project.thumbnail ? (
                        <img
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Folder className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <CustomBadge variant={STATUS_VARIANTS[project.status] || 'pending'}>
                            {STATUS_LABELS[project.status] || project.status}
                        </CustomBadge>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition">
                        {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {project.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{project.replies?.length || 0} phản hồi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(`/hotroduan/edit/${project._id}`);
                                }}
                                className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(project._id);
                                }}
                                className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default function HelpProjectPage() {
    const [projects, setProjects] = useState<HelpProject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchInput, setSearchInput] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        fetchProjects();
    }, [page, debouncedSearch]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await helpProjectApi.getUserProjects({
                page,
                limit: 9,
                search: debouncedSearch
            });

            if (res.success) {
                setProjects(res.projects);
                setTotalPages(res.totalPages);
            }
        } catch {
            toast.error('Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await helpProjectApi.deleteProject(deleteTarget);
            toast.success('Xóa dự án thành công');
            setDeleteTarget(null);
            fetchProjects();
        } catch {
            toast.error('Có lỗi xảy ra khi xóa');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dự án của tôi</h1>
                        <p className="text-sm text-gray-500 mt-1">Quản lý các dự án bạn đã gửi</p>
                    </div>
                    <Link href="/hotroduan/create">
                        <CustomButton>
                            <Plus className="w-4 h-4" /> Gửi dự án mới
                        </CustomButton>
                    </Link>
                </div>

                <div className="mb-6">
                    <CustomInput
                        placeholder="Tìm kiếm dự án..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                            {debouncedSearch ? `Không tìm thấy kết quả cho "${debouncedSearch}"` : 'Bạn chưa có dự án nào'}
                        </p>
                        {!debouncedSearch && (
                            <Link href="/hotroduan/create">
                                <CustomButton>Gửi dự án đầu tiên</CustomButton>
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-gray-600 font-medium text-sm">
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa dự án"
                message="Bạn có chắc chắn muốn xóa dự án này?"
                warning="Hành động này không thể hoàn tác."
            />
        </div>
    );
}
