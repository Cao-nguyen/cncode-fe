'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { aitutorApi, AIChat, AIMessage, RateLimitInfo } from '@/lib/api/aitutor.api';
import { toast } from 'sonner';
import { Send, Plus, Trash2, Loader2, MessageSquare, Clock, Zap, ArrowLeft } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

export default function AITutorPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [chats, setChats] = useState<AIChat[]>([]);
  const [currentChat, setCurrentChat] = useState<AIChat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      fetchChats();
      fetchRateLimit();
    }
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await aitutorApi.getChats(token);
      if (res.success) {
        setChats(res.data);
        if (res.data.length > 0 && !currentChat) {
          setCurrentChat(res.data[0]);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const fetchRateLimit = async () => {
    if (!token) return;
    try {
      const res = await aitutorApi.getRateLimit(token);
      if (res.success) {
        setRateLimit(res.data);
      }
    } catch (error) {
      console.error('Error fetching rate limit:', error);
    }
  };

  const createNewChat = async () => {
    if (!token) return;
    try {
      const res = await aitutorApi.createChat(token);
      if (res.success) {
        setCurrentChat(res.data);
        setChats(prev => [res.data, ...prev]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tạo cuộc trò chuyện mới');
    }
  };

  const selectChat = async (chatId: string) => {
    if (!token) return;
    try {
      const res = await aitutorApi.getChatById(chatId, token);
      if (res.success) {
        setCurrentChat(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải cuộc trò chuyện');
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await aitutorApi.deleteChat(chatId, token);
      if (res.success) {
        setChats(prev => prev.filter(c => c._id !== chatId));
        if (currentChat?._id === chatId) {
          setCurrentChat(null);
        }
        toast.success('Đã xóa cuộc trò chuyện');
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa cuộc trò chuyện');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !token || sending) return;

    // Check rate limit
    if (rateLimit && !rateLimit.allowed) {
      toast.error(`Bạn đã dùng hết 5 lần dùng AI hôm nay. Hãy quay lại vào ngày mai!`);
      return;
    }

    try {
      setSending(true);
      const chatId = currentChat?._id || null;
      
      const res = await aitutorApi.sendMessage(chatId, message, token);
      if (res.success) {
        setCurrentChat(res.data.chat);
        setChats(prev => {
          const updated = prev.map(c => c._id === res.data.chat._id ? res.data.chat : c);
          if (!chatId) {
            return [res.data.chat, ...updated.filter(c => c._id !== res.data.chat._id)];
          }
          return updated;
        });
        setRateLimit(prev => prev ? { ...prev, remaining: res.data.remaining, used: prev.used + 1 } : null);
        setMessage('');
      }
    } catch (error: any) {
      if (error.message.includes('hôm nay')) {
        toast.error(error.message);
        await fetchRateLimit();
      } else {
        toast.error(error.message || 'Lỗi khi gửi tin nhắn');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Vui lòng đăng nhập để sử dụng Gia sư AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Gia sư AI</h1>
        </div>
        {rateLimit && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full">
            <Zap 
              className="w-3 h-3 text-yellow-600" 
              fill="currentColor"
              data-filled={true}
            />
            <span className="text-xs font-medium text-yellow-800">
              {rateLimit.remaining}/3
            </span>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowSidebar(false)}>
          <div className="w-80 h-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <CustomButton
                onClick={createNewChat}
                className="w-full flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Cuộc trò chuyện mới
              </CustomButton>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 max-h-[calc(100vh-200px)]">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : chats.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có cuộc trò chuyện nào</p>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => {
                      selectChat(chat._id);
                      setShowSidebar(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer mb-2 transition ${
                      currentChat?._id === chat._id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{chat.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(chat.lastMessageAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteChat(chat._id, e)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rate Limit Info */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Zap 
                  className="w-4 h-4 text-yellow-600" 
                  fill="currentColor"
                  data-filled={true}
                />
                <span className="text-sm font-semibold text-gray-900">Giới hạn dùng AI</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600">
                  {rateLimit?.remaining ?? 3}/3 lần hôm nay
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <CustomButton
            onClick={createNewChat}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cuộc trò chuyện mới
          </CustomButton>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : chats.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Chưa có cuộc trò chuyện nào</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => selectChat(chat._id)}
                className={`p-3 rounded-lg cursor-pointer mb-2 transition ${
                  currentChat?._id === chat._id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(chat.lastMessageAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat._id, e)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rate Limit Info */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Zap 
              className="w-4 h-4 text-yellow-600" 
              fill="currentColor"
              data-filled={true}
            />
            <span className="text-sm font-semibold text-gray-900">Giới hạn dùng AI</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600">
              {rateLimit?.remaining ?? 5}/5 lần hôm nay
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <div className="hidden md:flex bg-white border-b border-gray-200 p-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Gia sư AI</h1>
          </div>
          {rateLimit && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full">
              <Zap 
                className="w-4 h-4 text-yellow-600" 
                fill="currentColor"
                data-filled={true}
              />
              <span className="text-sm font-medium text-yellow-800">
                {rateLimit.remaining}/3 lần hôm nay
              </span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {!currentChat ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mb-4" />
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Chào mừng đến với Gia sư AI</h2>
              <p className="text-gray-600 mb-4 max-w-md">Hãy bắt đầu một cuộc trò chuyện mới để được hỗ trợ học tập</p>
              <CustomButton onClick={createNewChat}>
                <Plus className="w-4 h-4 mr-2" />
                Bắt đầu ngay
              </CustomButton>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {currentChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-3 md:p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={!currentChat ? "Nhập câu hỏi để bắt đầu cuộc trò chuyện mới..." : "Nhập câu hỏi của bạn..."}
                disabled={sending}
                className="flex-1 px-4 py-2 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
              />
              <CustomButton
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="px-3 md:px-4"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
