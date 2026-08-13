'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import {
  MessageSquare,
  Users,
  Clock,
  User,
  Loader2,
  Shield,
  Trash2,
  Layers,
  Eye,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { AdminTableScroll } from '@/components/admin/AdminTableScroll';

interface AdminChat {
  _id: string;
  userId: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function AITutorAdminPage() {
  const { token, user } = useAuthStore();
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Array<{
    chat: AdminChat;
    message: { role: 'user' | 'assistant'; content: string; timestamp: string };
    originalIndex: number;
  }>>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchAllChats();
  }, [token, user]);

  useEffect(() => {
    // Flatten all user messages from all chats with their actual indices
    const allMessages = chats.flatMap(chat =>
      chat.messages
        .filter(m => m.role === 'user')
        .map((msg, originalIndex) => ({ chat, message: msg, originalIndex }))
    );

    if (searchTerm) {
      const filtered = allMessages.filter(({ chat, message }) =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(allMessages);
    }
  }, [searchTerm, chats]);

  const fetchAllChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/aitutor/admin/chats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.data);
      } else {
        toast.error(data.message || 'Lỗi khi tải danh sách cuộc trò chuyện');
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
  };

  const deleteMessage = async (chatId: string, messageIndex: number) => {
    setSelectedChatId(chatId);
    setSelectedMessageIndex(messageIndex);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedChatId || selectedMessageIndex === null) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/aitutor/admin/chats/${selectedChatId}/messages/${selectedMessageIndex}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Đã xóa tin nhắn');
        // Update chat with the returned data (includes both user and assistant messages removed)
        setChats(prev => prev.map(chat => {
          if (chat._id === selectedChatId) {
            return data.data;
          }
          return chat;
        }));
        setDeleteModalOpen(false);
        setSelectedChatId(null);
        setSelectedMessageIndex(null);
      } else {
        toast.error(data.message || 'Lỗi khi xóa tin nhắn');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa tin nhắn');
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = {
    totalChats: chats.length,
    totalMessages: chats.reduce((acc, chat) => acc + chat.messages.filter(m => m.role === 'user').length, 0),
    totalUsers: new Set(chats.map(chat => chat.userId)).size
  };

  const statCards = [
    {
      key: 'totalChats',
      title: 'Tổng cuộc trò chuyện',
      value: stats.totalChats,
      description: `${stats.totalUsers} người dùng đang hoạt động`,
      icon: <Layers size={20} />,
      iconBgColor: '#EFF6FF',
      iconColor: '#3B82F6',
      accentColor: '#3B82F6',
    },
    {
      key: 'totalMessages',
      title: 'Tổng tin nhắn',
      value: stats.totalMessages,
      description: stats.totalChats > 0 ? `${Math.round(stats.totalMessages / stats.totalChats)} tin nhắn/trò chuyện trung bình` : 'Chưa có tin nhắn',
      icon: <MessageSquare size={20} />,
      iconBgColor: '#ECFDF5',
      iconColor: '#059669',
      accentColor: '#10B981',
    },
    {
      key: 'totalUsers',
      title: 'Người dùng',
      value: stats.totalUsers,
      description: stats.totalChats > 0 ? `${Math.round((stats.totalUsers / stats.totalChats) * 100)}% người dùng có hoạt động` : 'Chưa có người dùng',
      icon: <Users size={20} />,
      iconBgColor: '#FDF2F8',
      iconColor: '#DB2777',
      accentColor: '#EC4899',
    },
    {
      key: 'avgMessages',
      title: 'Tương tác',
      value: stats.totalChats > 0 ? Math.round(stats.totalMessages / stats.totalUsers) : 0,
      description: 'Tin nhắn trung bình/người dùng',
      icon: <Heart size={20} />,
      iconBgColor: '#FEF3C7',
      iconColor: '#D97706',
      accentColor: '#F59E0B',
    },
  ];

  if (!token || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-500">Bạn cần quyền admin để truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <AdminPageShell
      title="Quản lý Gia sư AI"
      description="Theo dõi các cuộc trò chuyện của người dùng"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <DashboardCard
              key={card.key}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconColor}
              accentColor={card.accentColor}
            />
          ))}
      </div>

      {/* Search */}
      <CustomInputSearch
        placeholder="Tìm kiếm theo tên, email, tiêu đề..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">
              {searchTerm ? 'Không tìm thấy tin nhắn nào' : 'Chưa có tin nhắn nào'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <AdminTableScroll minWidth={860}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase sm:px-6">Người dùng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase sm:px-6">Tin nhắn</th>
                    <th className="hidden px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase md:table-cell">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase sm:px-6">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMessages.map(({ chat, message, originalIndex }, index) => (
                    <tr key={`${chat._id}-${index}`} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 sm:px-6">
                        <div>
                          <p className="font-medium text-gray-900">{chat.user?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-gray-600 truncate max-w-[140px] sm:max-w-none">{chat.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap line-clamp-3 max-w-[200px] sm:max-w-xl">{message.content}</p>
                        <p className="mt-1 text-xs text-gray-500 md:hidden">{formatMessageTime(message.timestamp)}</p>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-gray-600 md:table-cell">
                        {formatMessageTime(message.timestamp)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <button
                          onClick={() => deleteMessage(chat._id, originalIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa tin nhắn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableScroll>
          </div>
        )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedChatId(null);
          setSelectedMessageIndex(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Xóa tin nhắn"
        message="Bạn có chắc chắn muốn xóa tin nhắn này không?"
      />
    </AdminPageShell>
  );
}
