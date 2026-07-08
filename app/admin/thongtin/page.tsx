'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { 
  MessageSquare, 
  Trash2, 
  Search, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Pin,
  MoreVertical,
  CheckCircle,
  XCircle,
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
import { forumApi, IForumPost } from '@/lib/api/forum.api';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ForumStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  activePosts: number;
}

export default function AdminThongtinPage() {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState<IForumPost[]>([]);
  const [stats, setStats] = useState<ForumStats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    activePosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [page]);

  const fetchPosts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await forumApi.getPosts(page, 20);
      setPosts(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      toast.error('Lỗi khi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const result = await forumApi.getPosts(1, 1000);
      const allPosts = result.data;
      setStats({
        totalPosts: allPosts.length,
        totalLikes: allPosts.reduce((sum, p) => sum + (p.likeCount || 0), 0),
        totalComments: allPosts.reduce((sum, p) => sum + (p.commentCount || 0), 0),
        activePosts: allPosts.filter(p => !p.isDeleted).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    try {
      setDeleting(true);
      await forumApi.deletePost(deleteId, token);
      toast.success('Đã xóa bài viết');
      setDeleteId(null);
      fetchPosts();
      fetchStats();
    } catch (error) {
      toast.error('Lỗi khi xóa bài viết');
    } finally {
      setDeleting(false);
    }
  };

  const handlePin = async (postId: string, currentPinned: boolean) => {
    if (!token) return;
    try {
      await forumApi.togglePinPost(postId, token);
      toast.success(currentPinned ? 'Đã bỏ ghim' : 'Đã ghim bài viết');
      fetchPosts();
    } catch (error) {
      toast.error('Lỗi khi ghim bài viết');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(search.toLowerCase()) ||
    post.author.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Thông tin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý bài viết diễn đàn</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Tổng bài viết"
          value={stats.totalPosts}
          icon={<MessageSquare size={18} className="text-blue-500" />}
        />
        <DashboardCard
          title="Tổng lượt thích"
          value={stats.totalLikes}
          icon={<Heart size={18} className="text-red-500" />}
        />
        <DashboardCard
          title="Tổng bình luận"
          value={stats.totalComments}
          icon={<MessageCircle size={18} className="text-green-500" />}
        />
        <DashboardCard
          title="Bài viết hoạt động"
          value={stats.activePosts}
          icon={<TrendingUp size={18} className="text-purple-500" />}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Không có bài viết nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{post.author.fullName}</span>
                    {post.isPinned && <Pin size={14} className="text-blue-500" />}
                    {post.isDeleted && (
                      <span className="text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">Đã xóa</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {post.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {post.privacy}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePin(post._id, post.isPinned)}>
                      <Pin size={14} className="mr-2" />
                      {post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeleteId(post._id)}
                      className="text-red-500"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Xóa bài viết
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <span className="text-sm text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Trang sau
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này không?"
        isDeleting={deleting}
      />
    </div>
  );
}
