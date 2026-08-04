'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { aitutorApi, AIChat, AIMessage, RateLimitInfo } from '@/lib/api/aitutor.api';
import { toast } from 'sonner';
import { Send, Plus, Trash2, MessageSquare, Clock, Zap, ArrowLeft, Sparkles, Bot, Home, MoreHorizontal, Pin, Edit2, X, Copy, ThumbsUp, ThumbsDown, ArrowUp, Menu } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function AITutorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuthStore();
  const [chats, setChats] = useState<AIChat[]>([]);
  const [currentChat, setCurrentChat] = useState<AIChat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTitle, setRenameTitle] = useState('');
  const [selectedChatForAction, setSelectedChatForAction] = useState<AIChat | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<number>>(new Set());
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const [typedContent, setTypedContent] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // NEW: ref tới container scroll của khu vực tin nhắn
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // NEW: cờ theo dõi user có đang ở đáy (bot-0) hay không, dùng ref để không gây re-render
  const isAutoScrollRef = useRef(true);

  useEffect(() => {
    if (token) {
      fetchChats();
      fetchRateLimit();
    }
  }, [token]);

  useEffect(() => {
    // Check for chatId in URL params
    const chatIdFromUrl = searchParams.get('id');
    if (chatIdFromUrl && chats.length > 0) {
      const chat = chats.find(c => c._id === chatIdFromUrl);
      if (chat && currentChat?._id !== chatIdFromUrl) {
        setCurrentChat(chat);
      }
    }
  }, [searchParams, chats]);

  useEffect(() => {
    // Chỉ auto-scroll nếu user đang ở đáy (hoặc vừa gửi/mở chat mới)
    if (isAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [currentChat?.messages, optimisticMessage]);

  // Typing effect for new AI messages
  useEffect(() => {
    if (currentChat && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      // Chỉ chạy typing effect nếu tin nhắn vừa được thêm (không phải khi quay lại chat cũ)
      if (lastMessage.role === 'assistant' && typingMessageIndex === null) {
        setTypingMessageIndex(currentChat.messages.length - 1);
        setTypedContent('');
        let index = 0;
        const content = lastMessage.content;

        const typeNextChunk = () => {
          if (index < content.length) {
            const charsToAdd = Math.min(10, content.length - index);
            setTypedContent(content.substring(0, index + charsToAdd));
            index += charsToAdd;
            requestAnimationFrame(typeNextChunk);
          } else {
            setTypingMessageIndex(null);
            setTypedContent('');
            // Sau khi "chốt" bằng ReactMarkdown, layout có thể đổi (code block, list...),
            // nên căn lại đáy 1 lần nếu user vẫn đang theo dõi đáy.
            if (isAutoScrollRef.current) {
              requestAnimationFrame(() => pinToBottom());
            }
          }
        };

        requestAnimationFrame(typeNextChunk);
      }
    }
  }, [currentChat?.messages]); // Chạy khi messages thay đổi (có tin nhắn mới)

  // Reset typing state khi chuyển chat
  useEffect(() => {
    setTypingMessageIndex(null);
    setTypedContent('');
  }, [currentChat?._id]);

  // NEW: mỗi khi typedContent tăng lên (đang gõ chữ), nếu user đang ở đáy thì
  // "ghim" xuống đáy ngay lập tức (không dùng smooth để tránh giật do animation chồng chéo).
  // Nếu user đang tự kéo lên xem lại, isAutoScrollRef.current = false nên sẽ không bị ép kéo xuống.
  useEffect(() => {
    if (typingMessageIndex !== null && isAutoScrollRef.current) {
      pinToBottom();
    }
  }, [typedContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // NEW: scroll tức thì xuống đáy (dùng khi đang gõ chữ để tránh giật)
  const pinToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  // NEW: theo dõi vị trí scroll của user để biết có đang ở đáy hay không
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 100; // px, cho phép sai số gần đáy
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAutoScrollRef.current = distanceFromBottom < threshold;
  };

  const fetchChats = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await aitutorApi.getChats(token);
      if (res.success) {
        // Sort: pinned chats first, then by lastMessageAt
        const sortedChats = res.data.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
        setChats(sortedChats);
        // Don't auto-select chat - only select if URL has ?id param
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Lỗi khi tải danh sách cuộc trò chuyện');
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
        isAutoScrollRef.current = true; // NEW: mở chat mới thì luôn theo dõi đáy
        setCurrentChat(res.data);
        setChats(prev => {
          // Insert new chat after all pinned chats
          const pinnedChats = prev.filter(c => c.isPinned);
          const otherChats = prev.filter(c => !c.isPinned);
          return [...pinnedChats, res.data, ...otherChats];
        });
        // Update URL with new chatId
        router.push(`/giasuai?id=${res.data._id}`, { scroll: false });
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Lỗi khi tạo cuộc trò chuyện mới');
    }
  };

  const selectChat = async (chatId: string) => {
    if (!token) return;
    try {
      const res = await aitutorApi.getChatById(chatId, token);
      if (res.success) {
        isAutoScrollRef.current = true; // NEW: chuyển chat thì luôn theo dõi đáy
        setCurrentChat(res.data);
        // Update URL with chatId
        router.push(`/giasuai?id=${chatId}`, { scroll: false });
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Lỗi khi tải cuộc trò chuyện');
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
          // Clear URL param
          router.push('/giasuai', { scroll: false });
        }
        toast.success('Đã xóa cuộc trò chuyện');
        setActiveMenu(null);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Lỗi khi xóa cuộc trò chuyện');
    }
  };

  const pinChat = async (chatId: string, isPinned: boolean) => {
    if (!token) return;
    try {
      const res = await aitutorApi.pinChat(chatId, isPinned, token);
      if (res.success) {
        setChats(prev => {
          const updated = prev.map(c => c._id === chatId ? res.data : c);
          // Re-sort: pinned chats first, then by lastMessageAt
          return updated.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          });
        });
        if (currentChat?._id === chatId) {
          setCurrentChat(res.data);
        }
        toast.success(isPinned ? 'Đã ghim cuộc trò chuyện' : 'Đã bỏ ghim cuộc trò chuyện');
        setActiveMenu(null);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Lỗi khi ghim cuộc trò chuyện');
    }
  };

  const openRenameModal = (chat: AIChat) => {
    setSelectedChatForAction(chat);
    setRenameTitle(chat.title);
    setShowRenameModal(true);
    setActiveMenu(null);
  };

  const renameChat = async () => {
    if (!token || !selectedChatForAction) return;
    try {
      const res = await aitutorApi.renameChat(selectedChatForAction._id, renameTitle, token);
      if (res.success) {
        setChats(prev => prev.map(c => c._id === selectedChatForAction._id ? res.data : c));
        if (currentChat?._id === selectedChatForAction._id) {
          setCurrentChat(res.data);
        }
        toast.success('Đã đổi tên cuộc trò chuyện');
        setShowRenameModal(false);
        setSelectedChatForAction(null);
        setRenameTitle('');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Lỗi khi đổi tên cuộc trò chuyện');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !token || sending) return;

    // Check rate limit (skip for admin)
    if (user?.role !== 'admin' && rateLimit && !rateLimit.allowed) {
      toast.error(`Bạn đã dùng hết 5 lần dùng AI hôm nay. Hãy quay lại vào ngày mai!`);
      return;
    }

    const messageToSend = message;
    const chatId = currentChat?._id || null;

    // NEW: user vừa gửi tin nhắn thì luôn kéo xuống đáy để thấy tin nhắn của mình + phản hồi AI
    isAutoScrollRef.current = true;

    // Optimistic UI: Show user message immediately
    setOptimisticMessage(messageToSend);
    setMessage('');
    setSending(true);

    try {
      const res = await aitutorApi.sendMessage(chatId, messageToSend, token);
      if (res.success) {
        setCurrentChat(res.data.chat);
        setChats(prev => {
          const updated = prev.map(c => c._id === res.data.chat._id ? res.data.chat : c);
          if (!chatId) {
            // Insert new chat after all pinned chats
            const pinnedChats = prev.filter(c => c.isPinned);
            const otherChats = prev.filter(c => !c.isPinned);
            return [...pinnedChats, res.data.chat, ...otherChats];
          }
          return updated;
        });
        setRateLimit(prev => prev ? { ...prev, remaining: res.data.remaining, used: prev.used + 1 } : null);
        // Update URL if this was a new chat
        if (!chatId) {
          router.push(`/giasuai?id=${res.data.chat._id}`, { scroll: false });
        }
      }
    } catch (error) {
      // Restore message to textarea on error
      setMessage(messageToSend);
      const err = error as Error;
      if (err.message.includes('hôm nay')) {
        toast.error(err.message);
        await fetchRateLimit();
      } else {
        toast.error(err.message || 'Lỗi khi gửi tin nhắn');
      }
    } finally {
      setSending(false);
      setOptimisticMessage(null);
    }
  };

  // Đổi tên: onKeyPress (deprecated) -> onKeyDown, có check isComposing để không "nuốt" Enter
  // giữa lúc đang gõ tiếng Việt qua IME (gây cảm giác giật/gãy chữ)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Đã sao chép tin nhắn');
  };

  const handleLike = (index: number) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setDislikedMessages(prev => {
          const newDislikeSet = new Set(prev);
          newDislikeSet.delete(index);
          return newDislikeSet;
        });
      }
      return newSet;
    });
  };

  const handleDislike = (index: number) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setLikedMessages(prev => {
          const newLikeSet = new Set(prev);
          newLikeSet.delete(index);
          return newLikeSet;
        });
      }
      return newSet;
    });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeStr = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (messageDate.getTime() === today.getTime()) {
      return `Hôm nay ${timeStr}`;
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return `Hôm qua ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })} ${timeStr}`;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép code');
  };

  // Auto-wrap math expressions in $...$ if AI forgot to wrap them
  const autoWrapMath = (text: string): string => {
    let result = text;

    // First, handle code blocks - don't process inside them
    const codeBlocks: string[] = [];
    result = result.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Replace escape characters with proper LaTeX
    result = result.replace(/\\\*/g, '\\times ');
    result = result.replace(/\\\//g, '\\div ');
    result = result.replace(/\\_/g, '_');

    // Detect and wrap math expressions - very conservative patterns only
    // Only process line by line to avoid breaking across lines
    const lines = result.split('\n');
    const processedLines = lines.map(line => {
      // Skip if already has $ or is empty
      if (line.includes('$') || !line.trim()) return line;

      // Pattern 1: Simple number operations like "50 * 9.8" (single operation only)
      line = line.replace(/(\d+[\.,]?\d*\s*[\*\/\^]\s*\d+[\.,]?\d*)/g, '$$$1$$');
      
      // Pattern 2: Simple variable equations like "F = ma" (short only)
      line = line.replace(/\b([a-zA-Z]{1,4}\s*=\s*[a-zA-Z]{1,4})\b/g, '$$$1$$');

      return line;
    });

    result = processedLines.join('\n');

    // Restore code blocks
    result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[parseInt(index)]);

    return result;
  };

  // Bỏ phần resize khỏi onChange, chỉ còn cập nhật state để tránh
  // đọc/ghi DOM (layout thrashing) ngay trong sự kiện gõ phím.
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // NEW: auto-resize textarea chuyển sang useLayoutEffect, chạy đồng bộ ngay sau khi
  // React commit DOM và trước khi trình duyệt vẽ lại khung hình -> mượt hơn, không bị
  // "nhấp nháy" chiều cao như khi resize trực tiếp trong handler onChange.
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 150)}px`;
    }
  }, [message]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gia sư AI</h2>
          <p className="text-gray-600">Vui lòng đăng nhập để sử dụng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-lg border-b border-white/20 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2.5 bg-white/50 hover:bg-white/80 rounded-xl transition-all shadow-sm hover:shadow-md group"
            title="Về trang chủ"
          >
            <Home className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/50 rounded-xl transition"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Gia sư AI</h1>
        </div>
        {rateLimit && user?.role !== 'admin' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200">
            <Zap className="w-3.5 h-3.5 text-amber-600" fill="currentColor" />
            <span className="text-xs font-semibold text-amber-800">
              {rateLimit.remaining}/5
            </span>
          </div>
        )}
      </div>

      {/* Sidebar - Responsive */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-72 lg:w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 flex-col flex-shrink-0 fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Cuộc trò chuyện mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  selectChat(chat._id);
                  if (window.innerWidth < 768) {
                    setShowSidebar(false);
                  }
                }}
                className={`px-4 py-2.5 rounded-2xl cursor-pointer mb-2 transition-all ${currentChat?._id === chat._id
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-sm'
                  : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{chat.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {chat.isPinned && (
                      <Pin className="w-4 h-4 text-indigo-500" fill="currentColor" />
                    )}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === chat._id ? null : chat._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {activeMenu === chat._id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              pinChat(chat._id, !chat.isPinned);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pin className="w-4 h-4" />
                            {chat.isPinned ? 'Bỏ ghim' : 'Ghim'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRenameModal(chat);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Đổi tên
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat._id, e);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rate Limit Info */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-600" fill="currentColor" />
            <span className="text-sm font-semibold text-gray-900">Giới hạn dùng AI</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{rateLimit?.remaining ?? 5}/5 lần hôm nay</span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Background */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Desktop Header */}
        <div className="hidden md:flex bg-white/80 backdrop-blur-lg border-b border-white/20 p-4 items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 bg-white/50 hover:bg-white/80 rounded-xl transition-all shadow-sm hover:shadow-md group"
              title="Về trang chủ"
            >
              <Home className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Gia sư AI</h1>
          </div>
          {rateLimit && user?.role !== 'admin' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200">
              <Zap className="w-4 h-4 text-amber-600" fill="currentColor" />
              <span className="text-sm font-semibold text-amber-800">
                {rateLimit.remaining}/5 lần hôm nay
              </span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 pb-32 md:pb-6"
        >
          {!currentChat ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Chào mừng đến với Gia sư AI</h2>
              <p className="text-gray-600 mb-6 max-w-md text-lg">Hãy bắt đầu một cuộc trò chuyện mới để được hỗ trợ học tập</p>
              <button
                onClick={createNewChat}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Bắt đầu ngay
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {currentChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-center'}`}
                >
                  <div
                    className={`${msg.role === 'user'
                      ? 'max-w-[85%] md:max-w-[75%] bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl px-4 py-2.5 md:py-3 shadow-sm'
                      : 'w-full'
                      }`}
                  >
                    {msg.role === 'assistant' ? (
                      typingMessageIndex === index ? (
                        // NEW: trong lúc đang "gõ chữ", render plain text (không qua ReactMarkdown)
                        // để tránh việc parse lại toàn bộ Markdown mỗi frame -> hết giật.
                        // Khi gõ xong sẽ tự chuyển sang nhánh ReactMarkdown bên dưới để có định dạng đầy đủ.
                        <div className="prose prose-sm max-w-none text-sm md:text-base text-justify whitespace-pre-wrap">
                          {typedContent}
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none text-sm md:text-base text-justify">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true, doubleDollar: true }]]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              pre: ({ children, ...props }) => {
                                const codeContent = typeof children === 'string'
                                  ? children
                                  : (React.isValidElement(children) && typeof (children as React.ReactElement<Record<string, unknown>>).props.children === 'string' ? (children as React.ReactElement<Record<string, unknown>>).props.children : '') || '';
                                return (
                                  <div className="relative">
                                    <button
                                      onClick={() => copyCode(String(codeContent))}
                                      className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition z-10"
                                      title="Sao chép code"
                                    >
                                      <Copy className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <pre className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-900 overflow-x-auto pt-8" {...props}>
                                      {children}
                                    </pre>
                                  </div>
                                );
                              },
                              code: ({ className, children, ...props }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-sm font-medium" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="text-gray-900" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {autoWrapMath(msg.content)}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap text-sm md:text-base text-left">{msg.content}</p>
                    )}
                    {msg.role === 'assistant' && typingMessageIndex !== index && (
                      <div className="flex items-center gap-3 mt-2 text-gray-400">
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                          title="Sao chép"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleLike(index)}
                          className={`p-1.5 hover:bg-gray-100 rounded-lg transition ${likedMessages.has(index) ? 'text-green-500' : ''}`}
                          title="Thích"
                        >
                          <ThumbsUp className="w-4 h-4" fill={likedMessages.has(index) ? 'currentColor' : 'none'} data-filled={likedMessages.has(index)} />
                        </button>
                        <button
                          onClick={() => handleDislike(index)}
                          className={`p-1.5 hover:bg-gray-100 rounded-lg transition ${dislikedMessages.has(index) ? 'text-red-500' : ''}`}
                          title="Không thích"
                        >
                          <ThumbsDown className="w-4 h-4" fill={dislikedMessages.has(index) ? 'currentColor' : 'none'} data-filled={dislikedMessages.has(index)} />
                        </button>
                        <span className="text-xs">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {optimisticMessage && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] md:max-w-[75%] bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl px-4 py-2.5 md:py-3 shadow-sm">
                    <p className="whitespace-pre-wrap text-sm md:text-base text-left">{optimisticMessage}</p>
                  </div>
                </div>
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-2.5 md:py-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom on mobile, normal on desktop */}
        <div className="fixed md:relative bottom-0 left-0 right-0 md:left-auto md:right-auto bg-white/80 backdrop-blur-lg border-t border-white/20 p-4 md:p-6 flex-shrink-0 z-40">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={!currentChat ? "Nhập câu hỏi để bắt đầu cuộc trò chuyện mới..." : "Nhập câu hỏi của bạn..."}
                disabled={sending}
                rows={1}
                className="w-full px-4 py-2.5 pr-14 bg-white border border-gray-200 rounded-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm md:text-base shadow-sm resize-none overflow-y-auto"
                style={{ minHeight: '42px', maxHeight: '150px', scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="absolute right-2 bottom-3 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Đổi tên cuộc trò chuyện</h3>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setSelectedChatForAction(null);
                  setRenameTitle('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Nhập tên mới..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setSelectedChatForAction(null);
                  setRenameTitle('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
              <button
                onClick={renameChat}
                disabled={!renameTitle.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}