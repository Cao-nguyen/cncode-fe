'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { adminChatApi } from '@/lib/api/adminchat.api';
import type { AdminChatMessage } from '@/types/adminchat.type';
import {
    Send,
    Loader2,
    ImagePlus,
    Trash2,
    Heart,
    MessageCircle,
    ChevronDown,
    CheckCheck,
    X,
    FileText,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const QUICK_REPLIES = [
    'Tôi cần hỗ trợ về khóa học',
    'Tôi muốn báo lỗi hệ thống',
    'Tôi muốn hỏi về tài khoản',
    'Tôi gặp vấn đề về thanh toán',
    'Khác',
];

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước, ${time}`;
    if (days < 7) return `${days} ngày trước, ${time}`;
    return `${date}, ${time}`;
}

function shouldShowDateSeparator(prevDate: string | null, currDate: string): boolean {
    if (!prevDate) return true;
    const prev = new Date(prevDate).toDateString();
    const curr = new Date(currDate).toDateString();
    return prev !== curr;
}

function ChatBubble({ message, isOwn, onDelete, onHeart }: {
    message: AdminChatMessage;
    isOwn: boolean;
    onDelete: (id: string) => void;
    onHeart: (id: string) => void;
}) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
            <div className={`max-w-[80%] sm:max-w-[70%] ${isOwn ? 'order-1' : 'order-1'}`}>
                {/* Avatar + tên (admin) */}
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {message.senderId?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                            {message.senderId?.fullName || 'Admin'}
                        </span>
                        {message.senderId?.role === 'admin' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">Admin</span>
                        )}
                    </div>
                )}

                {/* Message content */}
                <div
                    className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                        ${isOwn
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md shadow-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                >
                    {/* Media type */}
                    {message.type === 'image' && message.attachments?.length > 0 && (
                        <div className="mb-2">
                            <img
                                src={message.attachments[0].url}
                                alt="Hình ảnh"
                                className="max-w-full rounded-lg max-h-60 object-cover cursor-pointer"
                                onClick={() => window.open(message.attachments[0].url, '_blank')}
                            />
                        </div>
                    )}
                    {message.type === 'file' && message.attachments?.length > 0 && (
                        <a
                            href={message.attachments[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? 'bg-blue-600' : 'bg-gray-200'} mb-1`}
                        >
                            <FileText className="w-4 h-4" />
                            <span className="text-xs truncate">{message.attachments[0].name || 'Tệp tin'}</span>
                        </a>
                    )}

                    {/* Text content */}
                    {message.content && <p>{message.content}</p>}

                    {/* Timestamp + actions */}
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                            {formatTime(message.createdAt)}
                        </span>
                        {isOwn && (
                            <CheckCheck className={`w-3 h-3 ${message.isRead ? 'text-blue-300' : 'text-blue-100'}`} />
                        )}
                    </div>
                </div>

                {/* Actions row */}
                <div className={`flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!message.isHearted && (
                        <button
                            onClick={() => onHeart(message._id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Thả tim"
                        >
                            <Heart className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {isOwn && (
                        <button
                            onClick={() => onDelete(message._id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Xóa"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Heart reaction */}
                {message.isHearted && (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mt-0.5`}>
                        <span className="text-xs text-red-500 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-red-500 text-red-500" /> Đã thả tim
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function DateSeparator({ date }: { date: string }) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) label = 'Hôm nay';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Hôm qua';
    else label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">{label}</span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>
    );
}

export default function AdminChat() {
    const { user, token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<AdminChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [adminTyping, setAdminTyping] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom instantly without visible scrolling (like Zalo)
    React.useLayoutEffect(() => {
        if (messagesContainerRef.current && messages.length > 0) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // --- Fetch messages ---
    const fetchMessages = useCallback(async (pageNum = 1) => {
        if (!token) return;
        try {
            const res = await adminChatApi.getMyMessages(token, pageNum, 50);
            if (res.success) {
                if (pageNum === 1) {
                    setMessages(res.data.reverse()); // newest at bottom
                } else {
                    setMessages(prev => [...res.data.reverse(), ...prev]);
                }
                setHasMore(res.hasMore ?? false);
                setPage(pageNum);

                if (pageNum === 1 && res.data.length > 0) {
                    // Lấy conversationId từ message đầu tiên
                    setConversationId(res.data[0]?.conversationId || null);
                }
                if (pageNum === 1 && res.data.length === 0) {
                    setShowQuickReplies(true);
                }
            }
        } catch (err) {
            console.error('Fetch messages error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // --- Get conversation ---
    const fetchConversation = useCallback(async () => {
        if (!token) return;
        try {
            const res = await adminChatApi.getMyConversation(token);
            if (res.success && res.data?.[0]) {
                setConversationId(res.data[0]._id);
            }
        } catch (err) {
            console.error('Fetch conversation error:', err);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchConversation();
            fetchMessages(1);
        }
    }, [token, fetchConversation, fetchMessages]);

    // --- Scroll to bottom ---
    const scrollToBottom = useCallback((smooth = true) => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }, []);

    // --- Socket events ---
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewMessage = (msg: AdminChatMessage) => {
            setMessages(prev => {
                if (prev.some(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            setConversationId(msg.conversationId);
            setShowQuickReplies(false);
            scrollToBottom();

            // Mark as read
            if (msg.senderId?._id !== user?._id && conversationId) {
                adminChatApi.markAsRead(token!, conversationId).catch(() => { });
            }
        };

        const handleAdminTyping = (data: { isTyping: boolean }) => {
            setAdminTyping(data.isTyping);
        };

        const handleMessagesRead = (data: { conversationId: string }) => {
            setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
        };

        // Admin namespace events will come through main socket
        socket.on('new_message', handleNewMessage);
        socket.on('admin_typing', handleAdminTyping);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('admin_typing', handleAdminTyping);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, isConnected, user?._id, token, conversationId, scrollToBottom]);

    // --- Send message ---
    const sendMessage = async () => {
        if (!input.trim() || !token || sending) return;

        const content = input.trim();
        setInput('');
        setSending(true);

        try {
            // Send via REST
            const res = await adminChatApi.sendMessage(token, { content });
            if (!res.success) {
                toast.error('Gửi tin nhắn thất bại');
                setInput(content);
                return;
            }

            setMessages(prev => [...prev, res.data]);
            setConversationId(res.data.conversationId);
            setShowQuickReplies(false);
            scrollToBottom();
        } catch (err) {
            toast.error('Lỗi kết nối');
            setInput(content);
        } finally {
            setSending(false);
        }
    };

    // --- Send quick reply ---
    const sendQuickReply = (text: string) => {
        setInput(text);
        setShowQuickReplies(false);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    // --- Handle Enter ---
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // --- Delete message ---
    const deleteMessage = async (messageId: string) => {
        if (!token) return;
        try {
            await adminChatApi.deleteMessage(token, messageId);
            setMessages(prev => prev.filter(m => m._id !== messageId));
            toast.success('Đã xóa tin nhắn');
        } catch (err) {
            toast.error('Xóa thất bại');
        }
    };

    // --- Heart message ---
    const heartMessage = async (messageId: string) => {
        if (!token) return;
        try {
            await adminChatApi.heartMessage(token, messageId);
            setMessages(prev => prev.map(m =>
                m._id === messageId ? { ...m, isHearted: true } : m
            ));
        } catch (err) {
            toast.error('Thả tim thất bại');
        }
    };

    // --- Load more ---
    const loadMore = () => {
        if (!hasMore || loading) return;
        setLoading(true);
        fetchMessages(page + 1);
    };

    // --- Typing indicator ---
    useEffect(() => {
        if (!socket || !isConnected || !conversationId) return;

        const handleTyping = () => {
            socket.emit('typing', { conversationId, isTyping: true });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { conversationId, isTyping: false });
            }, 2000);
        };

        if (input) handleTyping();

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [input, socket, isConnected, conversationId]);

    // --- Scroll to bottom button ---
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
    }, []);

    // --- Send image ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setSending(true);
        try {
            const res = await adminChatApi.sendImage(token, file);
            if (res.success) {
                setMessages(prev => [...prev, res.data]);
                setConversationId(res.data.conversationId);
                setShowQuickReplies(false);
                scrollToBottom();
            } else {
                toast.error('Gửi hình ảnh thất bại');
            }
        } catch (err) {
            toast.error('Lỗi khi gửi hình ảnh');
        } finally {
            setSending(false);
            e.target.value = '';
        }
    };

    if (!user?._id) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Vui lòng đăng nhập để sử dụng tính năng chat</p>
                    <Link href="/login" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px-80px)] max-h-[calc(100vh-80px-80px)] bg-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm">Chat với Admin</h2>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`} />
                            <span className="text-xs text-white/70">
                                {isConnected ? 'Đang hoạt động' : 'Mất kết nối'}
                            </span>
                        </div>
                    </div>
                </div>
                <Link href="/" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                    <X className="w-4 h-4" />
                </Link>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 py-4 space-y-1 bg-gradient-to-b from-gray-50 to-white"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="font-semibold text-gray-700 mb-2">Chào {user?.fullName?.split(' ').pop() || 'bạn'}! 👋</h3>
                        <p className="text-sm text-gray-500 mb-4">Bạn cần hỗ trợ gì? Hãy chọn một chủ đề hoặc nhập tin nhắn bên dưới.</p>

                        {/* Quick replies */}
                        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                            {QUICK_REPLIES.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendQuickReply(reply)}
                                    className="px-4 py-2.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition border border-indigo-100"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Load more */}
                        {hasMore && (
                            <div className="text-center py-2">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-4 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Xem thêm tin nhắn cũ'}
                                </button>
                            </div>
                        )}

                        {/* Messages list */}
                        {messages.map((msg, index) => {
                            const prevMsg = index > 0 ? messages[index - 1] : null;
                            const showDate = shouldShowDateSeparator(prevMsg?.createdAt || null, msg.createdAt);
                            const isOwn = msg.senderId?._id === user?._id;

                            return (
                                <React.Fragment key={msg._id}>
                                    {showDate && <DateSeparator date={msg.createdAt} />}
                                    <ChatBubble
                                        message={msg}
                                        isOwn={isOwn}
                                        onDelete={deleteMessage}
                                        onHeart={heartMessage}
                                    />
                                </React.Fragment>
                            );
                        })}

                        {/* Admin typing indicator */}
                        {adminTyping && (
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-[10px]">Admin</span>
                                </div>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}

                {/* Scroll to bottom button */}
                {showScrollBtn && (
                    <button
                        onClick={() => scrollToBottom()}
                        className="sticky bottom-2 left-1/2 -translate-x-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition z-10"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Quick replies (when showing) */}
            {showQuickReplies && messages.length > 0 && (
                <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex-shrink-0 overflow-x-auto">
                    <div className="flex gap-2">
                        {QUICK_REPLIES.map((reply, i) => (
                            <button
                                key={i}
                                onClick={() => sendQuickReply(reply)}
                                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition border border-indigo-100 whitespace-nowrap"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input area */}
            <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-end gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                            className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                            disabled={sending}
                        />
                    </div>

                    {/* Image button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition flex-shrink-0"
                        disabled={sending}
                    >
                        <imgPlus className="w-5 h-5" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={sendImage}
                        className="hidden"
                    />

                    {/* Send button */}
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0
                            ${input.trim() && !sending
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}