'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { adminChatApi } from '@/lib/api/adminchat.api';
import { ArrowLeft, Send, Loader2, MessageCircle, Image as ImageIcon, X, Heart } from 'lucide-react';
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';
import type { AdminChatMessage, UserStatusEvent, OnlineUser } from '@/types/adminchat.type';
import { ImagePreviewModal } from '@/components/custom/ImagePreviewModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatWithAdminPage() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const [messages, setMessages] = useState<AdminChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isWithinWorkingHours, setIsWithinWorkingHours] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [adminTyping, setAdminTyping] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const conversationIdRef = useRef(conversationId);

    // Redirect admin users away from this page
    useEffect(() => {
        if (user && user.role === 'admin') {
            setIsRedirecting(true);
            router.replace('/admin/chatwithadmin');
        }
    }, [user, router]);

    // Keep ref updated to avoid socket effect dependency
    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    // Scroll to bottom instantly without visible scrolling (like Zalo)
    useLayoutEffect(() => {
        if (messagesContainerRef.current && messages.length > 0) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Check working hours and admin online status
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await adminChatApi.checkWorkingHours();
                setIsWithinWorkingHours(res.isWithinWorkingHours);
            } catch (error) {
                console.error('Error checking working hours:', error);
            }
        };
        checkStatus();

        // Refresh working hours status every minute
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    // Load conversation & messages
    useEffect(() => {
        if (!token) return;

        const loadData = async () => {
            try {
                const convRes = await adminChatApi.getMyConversation(token);
                if (convRes.success && convRes.data?.[0]) {
                    const conv = convRes.data[0];
                    setConversationId(conv._id);

                    const msgRes = await adminChatApi.getMyMessages(token);
                    if (msgRes.success) {
                        setMessages(msgRes.data || []);

                        // Mark messages as read when first loading
                        if (conv._id && socketRef.current?.connected) {
                            socketRef.current.emit('mark_read', { conversationId: conv._id });
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        loadData();
    }, [token]);

    // Mark messages as read when page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && conversationId && socketRef.current?.connected) {
                socketRef.current.emit('mark_read', { conversationId });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [conversationId]);

    // Socket connection
    useEffect(() => {
        if (!token || !user) return;

        const socket = io(`${API_URL}/admin-chat`, {
            auth: { token },
            transports: ['polling', 'websocket']
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ User connected to chat socket');
        });

        socket.on('new_message', (msg: AdminChatMessage) => {
            console.log('📩 User received new_message:', msg);
            console.log('📩 Current messages count:', messages.length);
            console.log('📩 Message sender:', msg.senderId);
            console.log('📩 Current user:', user);

            setMessages(prev => {
                const exists = prev.some(m => m._id === msg._id);
                if (exists) {
                    console.log('⚠️ Message already exists, skipping');
                    return prev;
                }
                console.log('✅ Adding new message to state');
                console.log('✅ Previous messages:', prev.length);
                return [...prev, msg];
            });

            // Only mark as read if user is actively viewing the page (not in background tab)
            if (conversationIdRef.current && msg.senderId._id !== user._id && document.visibilityState === 'visible') {
                console.log('📩 Marking as read, conversationId:', conversationIdRef.current);
                socket.emit('mark_read', { conversationId: conversationIdRef.current });
            }
        });

        socket.on('online_users', (users: OnlineUser[]) => {
            const hasAdmin = users.some(u => u.role === 'admin');
            console.log('👥 Online users update. Admin online:', hasAdmin);
            setAdminOnline(hasAdmin);
        });

        socket.on('user_status', (data: UserStatusEvent) => {
            if (data.role === 'admin') {
                console.log('🔄 Admin status changed:', data.status);
                setAdminOnline(data.status === 'online');
            }
        });

        socket.on('admin_typing', (data: { isTyping: boolean }) => {
            setAdminTyping(data.isTyping);
            if (data.isTyping) {
                setTimeout(() => setAdminTyping(false), 3000);
            }
        });

        socket.on('messages_read', (data: { conversationId?: string; readBy?: string }) => {
            console.log('📖 User received messages_read event:', data);
            // Only update messages if they belong to current conversation
            if (data.conversationId === conversationIdRef.current) {
                setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
            }
        });

        socket.on('message_hearted', (data: { messageId: string; isHearted: boolean; heartedBy?: string }) => {
            console.log('❤️ User received message_hearted event:', data);
            setMessages(prev => prev.map(msg => {
                if (String(msg._id) === String(data.messageId)) {
                    return { ...msg, isHearted: data.isHearted, heartedBy: data.heartedBy };
                }
                return msg;
            }));
        });

        socket.on('disconnect', () => {
            console.log('❌ User disconnected from chat socket');
        });

        return () => {
            socket.disconnect();
        };
    }, [token, user]);

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

    const handleTyping = useCallback(() => {
        if (!socketRef.current?.connected || !conversationIdRef.current) return;

        socketRef.current.emit('typing', { conversationId: conversationIdRef.current, isTyping: true });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('typing', { conversationId: conversationIdRef.current, isTyping: false });
        }, 1000);
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
        if (!selectedImage || !token || uploadingImage) return;

        setUploadingImage(true);
        try {
            const res = await adminChatApi.sendImage(token, selectedImage);
            if (res.success) {
                // Add message to state immediately for instant feedback
                setMessages(prev => {
                    const exists = prev.some(m => m._id === res.data._id);
                    if (exists) return prev;
                    return [...prev, res.data];
                });
                clearImage();

                if (!conversationId && res.data.conversationId) {
                    setConversationId(res.data.conversationId);
                }
            }
        } catch (error) {
            console.error('❌ Error sending image:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const sendMessage = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();

        if (selectedImage) {
            await sendImage();
            return;
        }

        if (!inputText.trim() || sending || !token) return;

        const text = inputText.trim();
        setInputText('');

        // Optimistic UI update
        const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const optimisticMsg: AdminChatMessage = {
            _id: tempId,
            conversationId: conversationId || '',
            senderId: {
                _id: user?._id || '',
                fullName: user?.fullName || '',
                avatar: user?.avatar,
                role: user?.role || 'user'
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

        setMessages(prev => [...prev, optimisticMsg]);
        setSending(true);

        if (socketRef.current?.connected) {
            // Realtime via socket
            socketRef.current.emit('user_send_message', { content: text, type: 'text' }, (res: { success: boolean; data?: AdminChatMessage; message?: string }) => {
                setSending(false);
                if (res?.success && res.data) {
                    const responseData = res.data;
                    setMessages(prev => {
                        const exists = prev.some(m => m._id === responseData._id);
                        if (exists) {
                            // If socket new_message event arrived before callback, remove the optimistic message
                            return prev.filter(m => m._id !== tempId);
                        }
                        return prev.map(m => m._id === tempId ? responseData : m);
                    });
                    if (!conversationId && responseData.conversationId) {
                        setConversationId(responseData.conversationId);
                    }
                } else {
                    setMessages(prev => prev.filter(m => m._id !== tempId));
                    console.error('❌ Error sending message via socket:', res?.message);
                }
            });
        } else {
            // Fallback to API
            try {
                const res = await adminChatApi.sendMessage(token, { content: text, type: 'text' });
                if (res.success) {
                    setMessages(prev => {
                        const exists = prev.some(m => m._id === res.data._id);
                        if (exists) {
                            return prev.filter(m => m._id !== tempId);
                        }
                        return prev.map(m => m._id === tempId ? res.data : m);
                    });
                    if (!conversationId && res.data.conversationId) {
                        setConversationId(res.data.conversationId);
                    }
                }
            } catch (error) {
                console.error('❌ Error sending message:', error);
                setMessages(prev => prev.filter(m => m._id !== tempId));
            } finally {
                setSending(false);
            }
        }
    };

    if (isRedirecting || !user || !token || user.role === 'admin') {
        return (
            <div className="h-[100dvh] bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    {isRedirecting || user?.role === 'admin' ? (
                        <>
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-slate-500">Đang tải...</p>
                        </>
                    ) : (
                        <>
                            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 mb-4">Vui lòng đăng nhập để chat với admin</p>
                            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                                Đăng nhập
                            </Link>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] bg-slate-50 flex flex-col">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 shrink-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                AD
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-800">Chat với Admin</h1>
                                <p className="text-xs text-slate-500">
                                    {adminTyping
                                        ? 'Đang soạn tin...'
                                        : isWithinWorkingHours
                                            ? adminOnline
                                                ? 'Đang trực tuyến'
                                                : 'Sẵn sàng hỗ trợ'
                                            : 'Hiện tại chưa đến giờ làm việc của chúng tôi. Bạn hãy gửi tin nhắn và chờ chúng tôi phản hồi nhé!'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isWithinWorkingHours ? 'bg-green-50' : 'bg-slate-100'}`}>
                        <span className={`w-2 h-2 rounded-full ${isWithinWorkingHours ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span className="text-xs font-medium text-slate-700">{isWithinWorkingHours ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </header>

            {/* Working hours notice */}
            {!isWithinWorkingHours && (
                <div className="max-w-4xl mx-auto px-4 py-3 shrink-0">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                        <strong>Lưu ý:</strong> Hiện tại chưa đến giờ làm việc của chúng tôi. Bạn hãy gửi tin nhắn và chờ chúng tôi phản hồi nhé!
                    </div>
                </div>
            )}

            {/* Messages */}
            <main ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    {initialLoading ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                            <MessageCircle className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Chưa có tin nhắn</h3>
                            <p className="text-slate-500 text-sm">Gửi tin nhắn đầu tiên để bắt đầu trò chuyện với admin</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId._id === user._id;
                                const isImage = msg.type === 'image' && msg.attachments?.[0];

                                // Show date badge
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
                                    <div key={`${msg._id}_${index}`}>
                                        {showDateBadge && (
                                            <div className="flex justify-center my-4">
                                                <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-full">
                                                    {dateLabel}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {!isMe && (
                                                msg.senderId?.avatar ? (
                                                    <img src={msg.senderId.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                                                        {msg.senderId?.fullName?.charAt(0).toUpperCase() || 'A'}
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
                                                            ) : msg.isDelivered || (!msg._id.toString().startsWith('temp_') && msg._id) ? (
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
            </main>

            {/* Typing indicator */}
            {adminTyping && (
                <div className="max-w-4xl mx-auto px-4 pb-2 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        Admin đang soạn tin...
                    </div>
                </div>
            )}

            {/* Input */}
            <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
                <div className="max-w-4xl mx-auto">
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
                    <div className="flex items-center gap-2">
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    sendMessage(e);
                                }
                            }}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                            disabled={sending || uploadingImage}
                        />
                        <button
                            type="button"
                            onClick={sendMessage}
                            disabled={sending || uploadingImage || (!inputText.trim() && !selectedImage)}
                            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition shadow-sm"
                        >
                            {sending || uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </footer>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                src={previewImageUrl}
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false);
                    setPreviewImageUrl(null);
                }}
            />
        </div>
    );
}