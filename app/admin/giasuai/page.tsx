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
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { DashboardCard } from '@/components/custom/DashboardCard';

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
  }>>([]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchAllChats();
  }, [token, user]);

  useEffect(() => {
    // Flatten all user messages from all chats
    const allMessages = chats.flatMap(chat =>
      chat.messages
        .filter(m => m.role === 'user')
        .map(msg => ({ chat, message: msg }))
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

  const stats = {
    totalChats: chats.length,
    totalMessages: chats.reduce((acc, chat) => acc + chat.messages.filter(m => m.role === 'user').length, 0),
    totalUsers: new Set(chats.map(chat => chat.userId)).size
  };

  if (!token || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600">Bạn cần quyền admin để truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Gia sư AI</h1>
            <p className="text-sm text-gray-600 mt-1">Theo dõi các cuộc trò chuyện của người dùng</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <DashboardCard
            title="Tổng cuộc trò chuyện"
            value={stats.totalChats}
            icon={<MessageSquare className="w-5 h-5" />}
            iconBgColor="#EEF2FF"
            iconColor="#4F46E5"
          />
          <DashboardCard
            title="Tổng tin nhắn"
            value={stats.totalMessages}
            icon={<MessageSquare className="w-5 h-5" />}
            iconBgColor="#ECFDF5"
            iconColor="#059669"
          />
          <DashboardCard
            title="Người dùng"
            value={stats.totalUsers}
            icon={<Users className="w-5 h-5" />}
            iconBgColor="#E0F2FE"
            iconColor="#0284C7"
          />
        </div>

      </div>

      {/* Chat List */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <div className="mb-6">
          <CustomInputSearch
            placeholder="Tìm kiếm theo tên, email, tiêu đề..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tin nhắn</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMessages.map(({ chat, message }, index) => (
                    <tr key={`${chat._id}-${index}`} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{chat.user?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{chat.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap max-w-xl">{message.content}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatMessageTime(message.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
