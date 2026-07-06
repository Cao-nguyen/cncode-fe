'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { adminChatApi } from '@/lib/api/adminchat.api';
import { Send, Loader2, MessageCircle, Image as ImageIcon, X, Settings, Clock, Heart } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import type { AdminChatMessage, AdminChatConversation, UserStatusEvent, OnlineUser, WorkingHours } from '@/types/adminchat.type';
import { ImagePreviewModal } from '@/components/custom/ImagePreviewModal';
import { getImageUrl } from '@/lib/utils/imageUrl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function AdminChatPage() {
    const { token, user } = useAuthStore();
    const [conversations, setConversations] = useState<(AdminChatConversation & { unreadCount?: number })[]>([]);
    const [selectedConv, setSelectedConv] = useState<string | null>(null);
    const [messages, setMessages] = useState<AdminChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
    const [savingHours, setSavingHours] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const selectedConvRef = useRef(selectedConv);

    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    // Scroll to bottom instantly without visible scrolling (like Zalo)
    useLayoutEffect(() => {
        if (messagesContainerRef.current && messages.length > 0) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Fetch conversations with pagination
    const fetchConversations = useCallback(async (page = 1, append = false) => {
        if (!token || !user) return;
        try {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            const res = await adminChatApi.getAllConversations(token, page, 20);
            if (res.success) {
                const filtered = (res.data || []).filter(conv => conv.userId?._id !== user._id);
                if (append) {
                    setConversations(prev => {
                        const existingIds = new Set(prev.map(c => c.userId?._id));
                        const newItems = filtered.filter(c => !existingIds.has(c.userId?._id));
                        return [...prev, ...newItems];
                    });
                } else {
                    setConversations(filtered);
                }
                setHasMore(res.hasMore || false);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [token, user]);

    useEffect(() => {
        fetchConversations(1, false);
    }, [fetchConversations]);

    const loadMoreConversations = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchConversations(currentPage + 1, true);
        }
    }, [fetchConversations, currentPage, loadingMore, hasMore]);

    // Fetch messages for selected conversation
    useEffect(() => {
        if (!selectedConv || !token) return;

        const fetchMessages = async () => {
            try {
                const res = await adminChatApi.getConversationMessages(token, selectedConv);
                if (res.success) {
                    setMessages(res.data || []);
                    // Mark as read via socket
                    socketRef.current?.emit('mark_read', { conversationId: selectedConv });
                    // Also call REST API as fallback
                    adminChatApi.adminMarkAsRead(token, selectedConv).catch(() => { });
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        // Immediately clear unread count in UI
        setConversations(prev => {
            const updated = prev.map(conv => {
                if (conv._id === selectedConv || conv.userId?._id === selectedConv) {
                    return { ...conv, unreadCount: 0 };
                }
                return conv;
            });
            // Update chat store after state update completes
            queueMicrotask(() => {
                const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
                useChatStore.getState().setUnreadAdminChatCount(totalUnread);
            });
            return updated;
        });

        fetchMessages();
    }, [selectedConv, token]);

    // Fetch working hours
    useEffect(() => {
        const fetchHours = async () => {
            try {
                const res = await adminChatApi.getWorkingHours();
                if (res.success && Array.isArray(res.data)) {
                    setWorkingHours(res.data);
                }
            } catch (error) {
                console.error('Error fetching working hours:', error);
            }
        };
        fetchHours();
    }, []);

    // Socket connection
    useEffect(() => {
        if (!token || !user) return;

        const socket = io(`${API_URL}/admin-chat`, {
            auth: { token },
            transports: ['polling', 'websocket']
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Admin connected to chat');
        });

        socket.on('new_message', (msg: AdminChatMessage & { conversationUserId?: string; unreadCount?: number }) => {
            // Check if this message was sent by the current admin (to avoid duplicates from REST + socket)
            const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
            const isOwnMessage = msgSenderId === user?._id;

            // Update conversations list state directly for real-time feel
            setConversations(prev => {
                const conversationId = msg.conversationId;
                const userId = msg.conversationUserId;

                const index = prev.findIndex(c =>
                    (c._id && String(c._id) === String(conversationId)) ||
                    (c.userId?._id && String(c.userId._id) === String(userId))
                );

                if (index !== -1) {
                    const updatedConversations = [...prev];
                    const conv = updatedConversations[index];

                    const currentConv = selectedConvRef.current;
                    const isCurrent = (conv._id && String(currentConv) === String(conv._id)) ||
                        (conv.userId?._id && String(currentConv) === String(conv.userId._id));

                    // For own messages, don't increment unread count
                    updatedConversations[index] = {
                        ...conv,
                        lastMessage: {
                            content: msg.type === 'image' ? '📷 Hình ảnh' : msg.content,
                            senderId: msgSenderId,
                            createdAt: msg.createdAt
                        },
                        unreadCount: isOwnMessage || isCurrent ? 0 : (msg.unreadCount !== undefined ? msg.unreadCount : (conv.unreadCount || 0) + 1)
                    };

                    // Move to top
                    const [movedConv] = updatedConversations.splice(index, 1);

                    // Update chat store with total unread count after state update
                    queueMicrotask(() => {
                        const totalUnread = [movedConv, ...updatedConversations].reduce((sum, c) => sum + (c.unreadCount || 0), 0);
                        useChatStore.getState().setUnreadAdminChatCount(totalUnread);
                    });

                    return [movedConv, ...updatedConversations];
                } else {
                    // If conversation not in list (new user), fetch to refresh
                    fetchConversations();
                    return prev;
                }
            });

            // Skip adding own messages to chat - REST response already handles that
            if (isOwnMessage) return;

            const currentConv = selectedConvRef.current;
            const isSelectedConversation =
                String(msg.conversationId) === String(currentConv) ||
                String(msg.conversationUserId) === String(currentConv);

            if (isSelectedConversation) {
                setMessages(prev => {
                    const exists = prev.some(m => String(m._id) === String(msg._id));
                    if (!exists) return [...prev, msg];
                    return prev;
                });

                // Message is from user, mark as read
                socket.emit('mark_read', { conversationId: currentConv });
            }
        });

        socket.on('online_users', (users: OnlineUser[]) => {
            setOnlineUsers(new Set(users.map(u => u.userId)));
        });

        socket.on('user_status', (data: UserStatusEvent) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (data.status === 'online') {
                    newSet.add(data.userId);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });
        });

        socket.on('user_typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (data.isTyping) {
                    newSet.add(data.userId);
                    setTimeout(() => {
                        setTypingUsers(s => {
                            const n = new Set(s);
                            n.delete(data.userId);
                            return n;
                        });
                    }, 3000);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });
        });

        socket.on('messages_read', (data: { conversationId: string; userId?: string }) => {
            setConversations(prev => prev.map(conv => {
                if (conv._id === data.conversationId || conv._id === data.userId || conv.userId?._id === data.userId || conv.userId?._id === data.conversationId) {
                    return { ...conv, unreadCount: 0 };
                }
                return conv;
            }));

            const currentConv = selectedConvRef.current;
            if (String(data.conversationId) === String(currentConv) || String(data.userId) === String(currentConv)) {
                setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
            }
        });

        socket.on('message_hearted', (data: { messageId: string; isHearted: boolean; heartedBy?: string }) => {
            setMessages(prev => prev.map(msg => {
                if (String(msg._id) === String(data.messageId)) {
                    return { ...msg, isHearted: data.isHearted, heartedBy: data.heartedBy };
                }
                return msg;
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, [token, user, fetchConversations]);

    const handleTyping = useCallback(() => {
        if (!socketRef.current?.connected || !selectedConv) return;

        socketRef.current.emit('typing', { conversationId: selectedConv, isTyping: true });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('typing', { conversationId: selectedConv, isTyping: false });
        }, 1000);
    }, [selectedConv]);

    const handleHeartMessage = useCallback(async (messageId: string) => {
        if (!socketRef.current?.connected) return;
        
        socketRef.current.emit('heart_message', { messageId }, (response: { success: boolean; data?: any }) => {
            if (response.success && response.data) {
                // Update local state immediately for optimistic UI
                setMessages(prev => prev.map(msg => {
                    if (String(msg._id) === String(messageId)) {
                        return { ...msg, isHearted: response.data.isHearted, heartedBy: response.data.heartedBy };
                    }
                    return msg;
                }));
            }
        });
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const sendImage = async () => {
        if (!selectedImage || !token || !selectedConv || uploadingImage) return;

        setUploadingImage(true);
        try {
            const selectedData = conversations.find(c => c._id === selectedConv || c.userId?._id === selectedConv);
            const convId = selectedData?._id || undefined;
            const userId = selectedData?.userId?._id || selectedConv;

            const res = await adminChatApi.adminSendImage(token, {
                conversationId: convId,
                userId: userId,
                file: selectedImage
            });
            if (res.success) {
                setMessages(prev => {
                    const exists = prev.some(m => String(m._id) === String(res.data._id));
                    if (exists) return prev;
                    return [...prev, res.data];
                });
                clearImage();

                setConversations(prev => {
                    const updated = prev.map(conv => {
                        const convId2 = conv._id || conv.userId?._id;
                        if (convId2 === selectedConv || conv._id === res.data.conversationId) {
                            return {
                                ...conv,
                                _id: res.data.conversationId,
                                lastMessage: {
                                    content: '📷 Hình ảnh',
                                    senderId: user?._id,
                                    createdAt: new Date().toISOString()
                                }
                            };
                        }
                        return conv;
                    });
                    return updated.sort((a, b) => {
                        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                        return timeB - timeA;
                    });
                });

                if (res.data.conversationId && res.data.conversationId !== selectedConv) {
                    setSelectedConv(res.data.conversationId);
                }
            }
        } catch (error) {
            console.error('Error sending image:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedImage) {
            await sendImage();
            return;
        }

        if (!inputText.trim() || sending || !token || !selectedConv) return;

        const text = inputText.trim();
        setInputText('');
        setSending(true);

        // Optimistic UI: Add message immediately with temporary ID
        const tempId = `temp_${Date.now()}`;
        const optimisticMessage: AdminChatMessage = {
            _id: tempId,
            conversationId: selectedConv,
            senderId: {
                _id: user?._id || '',
                fullName: user?.fullName || '',
                avatar: user?.avatar,
                role: user?.role || 'admin'
            },
            content: text,
            type: 'text',
            attachments: [],
            isRead: false,
            isDelivered: false,
            isDeleted: false,
            isHearted: false,
            createdAt: new Date().toISOString()
        };

        // Add optimistic message to UI
        setMessages(prev => [...prev, optimisticMessage]);

        // Update conversations list optimistically
        setConversations(prev => {
            const updated = prev.map(conv => {
                const convId = conv._id || conv.userId?._id;
                if (convId === selectedConv) {
                    return {
                        ...conv,
                        lastMessage: {
                            content: text,
                            senderId: user?._id,
                            createdAt: new Date().toISOString()
                        }
                    };
                }
                return conv;
            });
            return updated.sort((a, b) => {
                const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                return timeB - timeA;
            });
        });

        try {
            const selectedData = conversations.find(c => c._id === selectedConv || c.userId?._id === selectedConv);
            const userId = selectedData?.userId?._id || selectedConv;
            const payload = { userId, content: text };

            const res = await adminChatApi.adminSendMessage(token, payload);
            if (res.success) {
                // Replace optimistic message with real message from server
                const messageWithSender = {
                    ...res.data,
                    senderId: res.data.senderId?._id ? res.data.senderId : {
                        _id: user?._id || '',
                        fullName: user?.fullName || '',
                        avatar: user?.avatar,
                        role: user?.role || 'admin'
                    },
                    isDelivered: true
                };

                setMessages(prev => {
                    // Replace temporary message with real one
                    return prev.map(m => m._id === tempId ? messageWithSender : m);
                });

                // Update conversationId if it changed
                if (res.data.conversationId && res.data.conversationId !== selectedConv) {
                    setSelectedConv(res.data.conversationId);
                    setConversations(prev => prev.map(conv => {
                        const convId = conv._id || conv.userId?._id;
                        if (convId === selectedConv) {
                            return { ...conv, _id: res.data.conversationId };
                        }
                        return conv;
                    }));
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m._id !== tempId));
        } finally {
            setSending(false);
        }
    };


    // Ref to always access latest working hours in async callbacks
    const workingHoursRef = useRef<WorkingHours[]>([]);
    useEffect(() => {
        workingHoursRef.current = workingHours;
    }, [workingHours]);

    const updateWorkingHourLocal = useCallback((day: WorkingHours) => {
        setWorkingHours(prev => prev.map(h => h.dayOfWeek === day.dayOfWeek ? day : h));
    }, []);

    const saveWorkingHours = useCallback(async (dayOfWeek: number) => {
        if (!token) return;
        const day = workingHoursRef.current.find(h => h.dayOfWeek === dayOfWeek);
        if (!day) return;
        setSavingHours(true);
        try {
            await adminChatApi.updateWorkingHours(token, day);
        } catch (error) {
            console.error('Error saving working hours:', error);
            const res = await adminChatApi.getWorkingHours();
            if (res.success && Array.isArray(res.data)) setWorkingHours(res.data);
        } finally {
            setSavingHours(false);
        }
    }, [token]);

    const filteredConversations = conversations
        .filter(c => {
            if (filter === 'unread') return (c.unreadCount || 0) > 0;
            return true;
        })
        .sort((a, b) => {
            // Priority: unread > read > empty
            const unreadA = (a.unreadCount || 0) > 0;
            const unreadB = (b.unreadCount || 0) > 0;

            const hasMessageA = a.lastMessage?.createdAt && a.lastMessage?.content && a.lastMessage.content.trim() !== '';
            const hasMessageB = b.lastMessage?.createdAt && b.lastMessage?.content && b.lastMessage.content.trim() !== '';

            // Empty conversations always come last
            if (!hasMessageA && hasMessageB) return 1;
            if (hasMessageA && !hasMessageB) return -1;

            // Unread always comes first (among conversations with messages)
            if (unreadA && !unreadB) return -1;
            if (!unreadA && unreadB) return 1;

            // If both unread or both read, sort by time
            if (unreadA === unreadB && hasMessageA && hasMessageB && a.lastMessage && b.lastMessage) {
                const timeA = new Date(a.lastMessage.createdAt || 0).getTime();
                const timeB = new Date(b.lastMessage.createdAt || 0).getTime();
                return timeB - timeA;
            }

            return 0;
        });

    const selectedConvData = conversations.find(c => c._id === selectedConv || c.userId?._id === selectedConv);
    const isUserOnline = selectedConvData ? onlineUsers.has(selectedConvData.userId?._id || '') : false;
    const isUserTyping = selectedConvData ? typingUsers.has(selectedConvData.userId?._id || '') : false;

    return (
        <div className="flex h-[calc(100vh-125px)] bg-white">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

            {/* Sidebar - Conversations */}
            <aside className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50 ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-slate-800">Tin nhắn hỗ trợ</h2>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                            title="Cài đặt giờ làm việc"
                        >
                            <Settings className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Chưa đọc
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                            {filter === 'unread' ? 'Không có tin nhắn chưa đọc' : 'Chưa có cuộc trò chuyện'}
                        </div>
                    ) : (
                        <>
                            {filteredConversations.map((conv) => {
                                const isOnline = onlineUsers.has(conv.userId?._id || '');
                                const unread = conv.unreadCount || 0;
                                return (
                                    <button
                                        key={conv._id || conv.userId?._id}
                                        onClick={() => setSelectedConv(conv._id || conv.userId?._id || '')}
                                        className={`w-full p-4 border-b border-slate-100 hover:bg-white transition text-left ${selectedConv === (conv._id || conv.userId?._id) ? 'bg-white border-l-4 border-l-indigo-600' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative shrink-0">
                                                {conv.userId?.avatar ? (
                                                    <img src={getImageUrl(conv.userId.avatar)} alt="" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                                        {conv.userId?.fullName?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className="font-semibold text-slate-800 truncate">{conv.userId?.fullName || 'User'}</h3>
                                                    {unread > 0 && (
                                                        <span className="shrink-0 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                                            {unread}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 truncate">
                                                    {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                            {hasMore && filter === 'all' && (
                                <div className="p-3">
                                    <button
                                        onClick={loadMoreConversations}
                                        disabled={loadingMore}
                                        className="w-full py-2.5 px-4 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Đang tải...
                                            </>
                                        ) : (
                                            'Xem thêm'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                {!selectedConv ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400">Chọn một cuộc trò chuyện để bắt đầu</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <header className="px-4 md:px-6 py-4 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedConv(null)}
                                        className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
                                    >
                                        <X className="w-5 h-5 text-slate-600" />
                                    </button>
                                    {selectedConvData?.userId?.avatar ? (
                                        <img src={getImageUrl(selectedConvData.userId.avatar)} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                            {selectedConvData?.userId?.fullName?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-sm md:text-base">{selectedConvData?.userId?.fullName || 'User'}</h3>
                                        <p className="text-xs text-slate-500">
                                            {isUserTyping ? 'Đang soạn tin...' : isUserOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isUserOnline ? 'bg-green-50' : 'bg-slate-100'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isUserOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                    <span className="text-xs font-medium text-slate-700">{isUserOnline ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </header>

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-400">Chưa có tin nhắn</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    {messages.map((msg, index) => {
                                        const isMe = msg.senderId._id === user?._id;
                                        const isImage = msg.type === 'image' && msg.attachments?.[0];

                                        // Show date badge if different day from previous message
                                        const showDateBadge = index === 0 ||
                                            new Date(messages[index - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                                        const msgDate = new Date(msg.createdAt);
                                        const today = new Date();
                                        const yesterday = new Date(today);
                                        yesterday.setDate(yesterday.getDate() - 1);

                                        let dateLabel = msgDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                        if (msgDate.toDateString() === today.toDateString()) {
                                            dateLabel = 'Hôm nay';
                                        } else if (msgDate.toDateString() === yesterday.toDateString()) {
                                            dateLabel = 'Hôm qua';
                                        }

                                        return (
                                            <div key={msg._id}>
                                                {showDateBadge && (
                                                    <div className="flex justify-center my-4">
                                                        <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-full">
                                                            {dateLabel}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    {!isMe && (
                                                        msg.senderId.avatar ? (
                                                            <img src={getImageUrl(msg.senderId.avatar)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">
                                                                {msg.senderId.fullName.charAt(0).toUpperCase()}
                                                            </div>
                                                        )
                                                    )}
                                                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                                        <div className="relative group">
                                                            {isImage ? (
                                                                <div
                                                                    className="rounded-2xl overflow-hidden shadow-sm max-w-xs cursor-pointer hover:opacity-90 transition"
                                                                    onClick={() => {
                                                                        setPreviewImageUrl(msg.attachments[0].url);
                                                                        setIsPreviewOpen(true);
                                                                    }}
                                                                >
                                                                    <img src={msg.attachments[0].url} alt="Image" className="w-full h-auto" />
                                                                </div>
                                                            ) : (
                                                                <div className={`p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${isMe
                                                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                                                                    }`}>
                                                                    {msg.content}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                                                            <span>{new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <button
                                                                onClick={() => handleHeartMessage(msg._id)}
                                                                className={`hover:scale-110 transition ${msg.isHearted ? 'text-red-500' : 'text-slate-400'}`}
                                                                title={msg.isHearted ? 'Bỏ thả tim' : 'Thả tim'}
                                                            >
                                                                <Heart 
                                                                    className={`w-4 h-4 ${msg.isHearted ? 'fill-red-500' : ''}`} 
                                                                    data-filled={msg.isHearted}
                                                                />
                                                            </button>
                                                            {isMe && (
                                                                <>
                                                                    {msg.isRead ? (
                                                                        <span className="text-blue-500">• Đã xem</span>
                                                                    ) : msg.isDelivered ? (
                                                                        <span className="text-slate-400">• Đã nhận</span>
                                                                    ) : (
                                                                        <span className="text-slate-300">• Đang gửi</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Typing Indicator */}
                        {isUserTyping && (
                            <div className="px-6 py-2 bg-slate-50">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    {selectedConvData?.userId?.fullName || 'User'} đang soạn tin...
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <footer className="p-4 bg-white border-t border-slate-200">
                            {imagePreview && (
                                <div className="mb-3">
                                    <div className="relative inline-block">
                                        <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-lg border-2 border-indigo-200 object-cover" />
                                        <button onClick={clearImage} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={sendMessage} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-11 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition"
                                    disabled={sending || uploadingImage}
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => {
                                        setInputText(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                    disabled={sending || uploadingImage}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || uploadingImage || (!inputText.trim() && !selectedImage)}
                                    className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition shadow-sm"
                                >
                                    {sending || uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </footer>
                    </>
                )}
            </main>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                src={previewImageUrl}
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false);
                    setPreviewImageUrl(null);
                }}
            />

            {/* Working Hours Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-800">Cấu hình giờ làm việc</h3>
                            </div>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {workingHours.map((day) => (
                                <div key={day.dayOfWeek} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-24 font-semibold text-slate-700">{DAYS[day.dayOfWeek]}</div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={day.isWorkingDay}
                                            onChange={(e) => {
                                                const updated = { ...day, isWorkingDay: e.target.checked };
                                                updateWorkingHourLocal(updated);
                                                saveWorkingHours(updated.dayOfWeek);
                                            }}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                            disabled={savingHours}
                                        />
                                        <span className="text-sm text-slate-600">Làm việc</span>
                                    </label>
                                    {day.isWorkingDay && (
                                        <>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={2}
                                                value={String(parseInt(day.startTime.split(':')[0]) || 0).padStart(2, '0')}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                    const h = Math.min(23, Math.max(0, parseInt(raw) || 0));
                                                    const m = (day.startTime.split(':')[1] || '00');
                                                    const t = `${String(h).padStart(2, '0')}:${m}`;
                                                    updateWorkingHourLocal({ ...day, startTime: t });
                                                }}
                                                onBlur={() => saveWorkingHours(day.dayOfWeek)}
                                                className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                disabled={savingHours}
                                                placeholder="08"
                                            />
                                            <span className="text-slate-400">:</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={2}
                                                value={String(parseInt(day.startTime.split(':')[1]) || 0).padStart(2, '0')}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                    const m = Math.min(59, Math.max(0, parseInt(raw) || 0));
                                                    const h = (day.startTime.split(':')[0] || '00');
                                                    const t = `${h}:${String(m).padStart(2, '0')}`;
                                                    updateWorkingHourLocal({ ...day, startTime: t });
                                                }}
                                                onBlur={() => saveWorkingHours(day.dayOfWeek)}
                                                className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                disabled={savingHours}
                                                placeholder="00"
                                            />
                                            <span className="text-slate-400">→</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={2}
                                                value={String(parseInt(day.endTime.split(':')[0]) || 0).padStart(2, '0')}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                    const h = Math.min(23, Math.max(0, parseInt(raw) || 0));
                                                    const m = (day.endTime.split(':')[1] || '00');
                                                    const t = `${String(h).padStart(2, '0')}:${m}`;
                                                    updateWorkingHourLocal({ ...day, endTime: t });
                                                }}
                                                onBlur={() => saveWorkingHours(day.dayOfWeek)}
                                                className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                disabled={savingHours}
                                                placeholder="17"
                                            />
                                            <span className="text-slate-400">:</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={2}
                                                value={String(parseInt(day.endTime.split(':')[1]) || 0).padStart(2, '0')}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                    const m = Math.min(59, Math.max(0, parseInt(raw) || 0));
                                                    const h = (day.endTime.split(':')[0] || '00');
                                                    const t = `${h}:${String(m).padStart(2, '0')}`;
                                                    updateWorkingHourLocal({ ...day, endTime: t });
                                                }}
                                                onBlur={() => saveWorkingHours(day.dayOfWeek)}
                                                className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                disabled={savingHours}
                                                placeholder="00"
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}