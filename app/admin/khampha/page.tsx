'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { 
  Video, 
  Trash2, 
  Search, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  ShieldAlert,
  CheckCircle,
  XCircle,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface KhamphaVideo {
  _id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  author: {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
    role: string;
  };
  music?: {
    title: string;
    artist: string;
  };
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  favoriteCount: number;
  isReported: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: {
    fullName: string;
  };
  deleteReason?: string;
  createdAt: string;
}

interface Stats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  reportedVideos: number;
  deletedVideos: number;
}

export default function AdminKhamphaPage() {
  const { token } = useAuthStore();
  const [videos, setVideos] = useState<KhamphaVideo[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    reportedVideos: 0,
    deletedVideos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'reported' | 'deleted'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
    fetchVideos();
  }, [page, statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/khampha?page=1&limit=1000`);
      const data = await res.json();
      if (data.success) {
        const allVideos = data.data;
        setStats({
          totalVideos: allVideos.length,
          totalViews: allVideos.reduce((sum: number, v: KhamphaVideo) => sum + v.viewCount, 0),
          totalLikes: allVideos.reduce((sum: number, v: KhamphaVideo) => sum + v.likeCount, 0),
          reportedVideos: allVideos.filter((v: KhamphaVideo) => v.isReported).length,
          deletedVideos: allVideos.filter((v: KhamphaVideo) => v.isDeleted).length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/khampha?page=${page}&limit=20`;
      
      if (statusFilter === 'reported') {
        url = `${API_URL}/api/khampha/admin/all?status=reported&page=${page}&limit=20`;
      } else if (statusFilter === 'deleted') {
        url = `${API_URL}/api/khampha/admin/all?status=deleted&page=${page}&limit=20`;
      } else if (statusFilter === 'active') {
        url = `${API_URL}/api/khampha?page=${page}&limit=20`;
      }

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data.success) {
        setVideos(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || deleting) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/khampha/admin/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Vi phạm nội dung' }),
      });

      const data = await res.json();
      if (data.success) {
        setVideos(prev => prev.filter(v => v._id !== deleteId));
        fetchStats();
        setDeleteId(null);
      } else {
        alert(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Có lỗi xảy ra khi xóa');
    } finally {
      setDeleting(false);
    }
  };

  const handleReport = async (videoId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/khampha/admin/${videoId}/report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setVideos(prev => prev.map(v => 
          v._id === videoId ? { ...v, isReported: true } : v
        ));
        fetchStats();
      } else {
        alert(data.message || 'Báo cáo thất bại');
      }
    } catch (error) {
      console.error('Error reporting video:', error);
      alert('Có lỗi xảy ra khi báo cáo');
    }
  };

  const filteredVideos = videos.filter(video => {
    if (!search) return true;
    const caption = (video.caption || '').toLowerCase();
    const username = video.author.username.toLowerCase();
    const fullName = video.author.fullName.toLowerCase();
    return caption.includes(search.toLowerCase()) || 
           username.includes(search.toLowerCase()) || 
           fullName.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cn-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--cn-text-sub)]">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 px-3 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý Khám Phá</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý video ngắn kiểu TikTok</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <DashboardCard 
          title="Tổng video" 
          value={stats.totalVideos} 
          icon={<Video size={18} />} 
          iconBgColor="#EFF6FF" 
          iconColor="#3B82F6" 
        />
        <DashboardCard 
          title="Tổng lượt xem" 
          value={stats.totalViews} 
          icon={<Eye size={18} />} 
          iconBgColor="#F0FDF4" 
          iconColor="#22C55E" 
        />
        <DashboardCard 
          title="Tổng lượt thích" 
          value={stats.totalLikes} 
          icon={<Heart size={18} />} 
          iconBgColor="#FDF2F8" 
          iconColor="#EC4899" 
        />
        <DashboardCard 
          title="Đã báo cáo" 
          value={stats.reportedVideos} 
          icon={<AlertTriangle size={18} />} 
          iconBgColor="#FEF2F2" 
          iconColor="#EF4444" 
        />
        <DashboardCard 
          title="Đã xóa" 
          value={stats.deletedVideos} 
          icon={<Trash2 size={18} />} 
          iconBgColor="#F3F4F6" 
          iconColor="#6B7280" 
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--cn-text-sub)]" />
          <Input
            placeholder="Tìm kiếm video..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
          >
            Tất cả
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('active')}
            size="sm"
          >
            Hoạt động
          </Button>
          <Button
            variant={statusFilter === 'reported' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('reported')}
            size="sm"
          >
            Báo cáo
          </Button>
          <Button
            variant={statusFilter === 'deleted' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('deleted')}
            size="sm"
          >
            Đã xóa
          </Button>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-main/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-main/5 border-b border-main/20">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Video</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Người đăng</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Thống kê</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Trạng thái</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Ngày đăng</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-main">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main/10">
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không có video nào
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => (
                  <tr key={video._id} className="hover:bg-main/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img 
                              src={video.thumbnailUrl} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {video.caption || 'Không có tiêu đề'}
                          </p>
                          {video.hashtags.length > 0 && (
                            <p className="text-xs text-gray-500 truncate">
                              {video.hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={video.author.avatar} />
                          <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)] text-xs">
                            {video.author.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            @{video.author.username}
                          </p>
                          <p className="text-xs text-gray-500">{video.author.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.viewCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {video.likeCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {video.commentCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {video.shareCount}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {video.isDeleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <XCircle className="w-3 h-3" />
                          Đã xóa
                        </span>
                      ) : video.isReported ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          Báo cáo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(video.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {!video.isDeleted && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(video.videoUrl, '_blank')}>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem video
                              </DropdownMenuItem>
                              {!video.isReported && (
                                <DropdownMenuItem onClick={() => handleReport(video._id)}>
                                  <ShieldAlert className="w-4 h-4 mr-2" />
                                  Báo cáo vi phạm
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => setDeleteId(video._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa video
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-main/20">
            <p className="text-sm text-gray-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa video"
        message="Bạn có chắc chắn muốn xóa video này? Hành động này không thể hoàn tác."
        isDeleting={deleting}
      />
    </div>
  );
}
