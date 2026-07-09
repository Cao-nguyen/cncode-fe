'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUnreadMessagesStore } from '@/store/unreadMessages.store';
import { useSocket } from '@/providers/socket.provider';
import { Users, Search, ArrowLeft, MoreVertical, Send, UserPlus, Paperclip, Image as ImageIcon, BarChart3, Smile, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StickerPicker } from '@/components/custom/StickerPicker';
import { ImagePreview } from '@/components/custom/ImagePreview';
import { PollCreator } from '@/components/custom/PollCreator';
import { PollDisplay } from '@/components/custom/PollDisplay';
import { FileDisplay } from '@/components/custom/FileDisplay';
import { FriendRequestModal } from '@/components/custom/FriendRequestModal';
import { ChatMessageSkeleton } from '@/components/custom/ChatMessageSkeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
    _id: string;
    fullName: string;
    avatar?: string;
    email: string;
    role: string;
}

interface Participant {
    userId: User;
    role: string;
    joinedAt: string;
    lastReadAt: string;
}

interface Conversation {
    _id: string;
    name?: string;
    type: 'private' | 'group';
    avatar?: string;
    description?: string;
    participants: Participant[];
    lastMessage?: {
        content: string;
        senderId: string;
        sentAt: string;
    };
    unreadCount?: number;
    createdBy: User;
    updatedAt: string;
}

interface Message {
    _id: string;
    conversationId: string;
    senderId: User;
    content: string;
    type: string;
    readBy?: Array<{ userId: User; readAt: string }>;
    isRead?: boolean;
    isHearted?: boolean;
    heartedBy?: any[];
    createdAt: string;
}

export default function CongDongPage() {
    const { token, user } = useAuthStore();
    const { clearUnreadCount } = useUnreadMessagesStore();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [chatSearch, setChatSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [textareaRows, setTextareaRows] = useState(3);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [showChatSidebar, setShowChatSidebar] = useState(true);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isConversationAnimating, setIsConversationAnimating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedConvRef = useRef<Conversation | null>(null);
    const userRef = useRef(user);

    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        fetchConversations();

        const handleNewMessage = ({ conversationId, message }: { conversationId: string; message: Message }) => {
            if (message.senderId._id === userRef.current?._id) {
                return;
            }

            if (selectedConvRef.current?._id === conversationId) {
                setMessages(prev => {
                    const exists = prev.some(m => m._id === message._id);
                    if (exists) return prev;
                    return [...prev, message];
                });

                if (socket && socket.connected) {
                    socket.emit('mark_read', { conversationId });
                }
            }
        };

        const handlePollUpdated = ({ conversationId, message }: { conversationId: string; message: Message }) => {
            if (selectedConvRef.current?._id === conversationId) {
                setMessages(prev => prev.map(m => m._id === message._id ? message : m));
            }
        };

        const handleMessagesRead = (data: { conversationId: string; userId: string; readAt: string }) => {
            if (selectedConvRef.current?._id === data.conversationId) {
                setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
            }
        };

        const handleMessageHearted = (data: { messageId: string; isHearted: boolean; heartedBy: string[] }) => {
            setMessages(prev => prev.map(msg => {
                if (msg._id === data.messageId) {
                    return { ...msg, isHearted: data.isHearted, heartedBy: data.heartedBy };
                }
                return msg;
            }));
        };

        if (socket) {
            socket.on('new_message', handleNewMessage);
            socket.on('poll_updated', handlePollUpdated);
            socket.on('messages_read', handleMessagesRead);
            socket.on('message_hearted', handleMessageHearted);
        }

        return () => {
            if (socket) {
                socket.off('new_message', handleNewMessage);
                socket.off('poll_updated', handlePollUpdated);
                socket.off('messages_read', handleMessagesRead);
                socket.off('message_hearted', handleMessageHearted);
            }
        };
    }, [socket]);

    useEffect(() => {
        if (selectedConv) {
            // Reset animation and loading state when conversation changes
            setIsConversationAnimating(true);
            setLoadingMessages(true);
            setMessages([]);
            setHasMoreMessages(false);
            setCurrentPage(1);

            // Trigger animation
            const animationTimeout = setTimeout(() => {
                setIsConversationAnimating(false);
            }, 300);

            clearUnreadCount(selectedConv._id);
            fetchMessages(selectedConv._id).finally(() => {
                setLoadingMessages(false);
            });

            // Mark as read via API
            fetch(`${API_URL}/api/chat/conversations/${selectedConv._id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(console.error);

            if (socket && socket.connected) {
                socket.emit('join_conversation', selectedConv._id);
            }

            return () => {
                clearTimeout(animationTimeout);
            };
        }
    }, [selectedConv, clearUnreadCount, socket, token]);

    const fetchConversations = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations?type=group`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string, page: number = 1) => {
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages?limit=50&page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                if (page === 1) {
                    setMessages(data.data);
                    setHasMoreMessages(data.pagination.hasMore);
                    setCurrentPage(1);
                    // Scroll to bottom immediately after messages are set
                    requestAnimationFrame(() => {
                        const container = messagesContainerRef.current;
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    });
                } else {
                    // Load older messages - preserve scroll position
                    const container = messagesContainerRef.current;
                    const previousScrollHeight = container?.scrollHeight || 0;
                    const previousScrollTop = container?.scrollTop || 0;

                    setMessages(prev => [...data.data, ...prev]);
                    setHasMoreMessages(data.pagination.hasMore);
                    setCurrentPage(page);

                    // Restore scroll position after new messages are prepended
                    requestAnimationFrame(() => {
                        if (container) {
                            const newScrollHeight = container.scrollHeight;
                            const scrollDiff = newScrollHeight - previousScrollHeight;
                            container.scrollTop = previousScrollTop + scrollDiff;
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleLoadMoreMessages = () => {
        if (!selectedConv || loadingOlderMessages || !hasMoreMessages) return;

        setLoadingOlderMessages(true);
        const nextPage = currentPage + 1;
        fetchMessages(selectedConv._id, nextPage).finally(() => {
            setLoadingOlderMessages(false);
        });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        // Load older messages when user scrolls near top (200px threshold)
        if (container.scrollTop < 200 && hasMoreMessages && !loadingOlderMessages) {
            handleLoadMoreMessages();
        }
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        const lines = value.split('\n').length;
        if (lines <= 3) {
            setTextareaRows(3);
        } else if (lines === 4) {
            setTextareaRows(4);
        } else {
            setTextareaRows(5);
        }
    };

    const handleHeartMessage = async (messageId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/chat/messages/${messageId}/heart`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setMessages(prev => prev.map(msg => {
                    if (msg._id === messageId) {
                        return { ...msg, isHearted: data.data.isHearted, heartedBy: data.data.heartedBy };
                    }
                    return msg;
                }));
            }
        } catch (error) {
            console.error('Error hearting message:', error);
        }
    };

    const sendMessage = async (content?: string, type: string = 'text') => {
        const messageContent = content || newMessage.trim();
        if (!messageContent || !selectedConv || sending) return;

        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations/${selectedConv._id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: messageContent,
                    type: type
                })
            });

            const data = await res.json();
            if (data.success) {
                setNewMessage('');
                setTextareaRows(3);
                setTimeout(() => {
                    textareaRef.current?.focus();
                }, 100);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleStickerSelect = (stickerUrl: string) => {
        sendMessage(stickerUrl, 'sticker');
        setShowStickerPicker(false);
    };

    const handlePollSubmit = async (poll: { question: string; options: string[]; allowMultiple: boolean }) => {
        const pollData = {
            question: poll.question,
            options: poll.options.map(text => ({ text, votes: [] })),
            allowMultiple: poll.allowMultiple,
            totalVotes: 0,
            voters: []
        };
        await sendMessage(JSON.stringify(pollData), 'poll');
        setShowPollCreator(false);
    };

    const handleVote = async (messageId: string, optionIndices: number[]) => {
        try {
            const res = await fetch(`${API_URL}/api/chat/messages/${messageId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ optionIndices })
            });

            const data = await res.json();
            if (data.success && selectedConv) {
                fetchMessages(selectedConv._id);
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const uploadImageToServer = async (file: File): Promise<string | null> => {
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const res = await fetch(`${API_URL}/api/upload/image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    image: base64,
                    folder: 'chat-images'
                })
            });

            const data = await res.json();
            if (data.success && data.data?.url) {
                return data.data.url;
            }
            return null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const uploadFileToServer = async (file: File): Promise<{ url: string; name: string; size: number } | null> => {
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const res = await fetch(`${API_URL}/api/upload/file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    file: base64,
                    fileName: file.name,
                    folder: 'chat-files'
                })
            });

            const data = await res.json();
            if (data.success && data.data?.url) {
                return { url: data.data.url, name: file.name, size: file.size };
            }
            return null;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !selectedConv) return;

        if (files.length > 5) {
            alert('Chỉ được chọn tối đa 5 file');
            return;
        }

        for (const file of files) {
            if (file.size > 500 * 1024 * 1024) {
                alert(`File ${file.name} vượt quá 500MB`);
                return;
            }
        }

        setUploadingFile(true);
        try {
            const uploadPromises = files.map(file => uploadFileToServer(file));
            const results = await Promise.all(uploadPromises);

            const successResults = results.filter(r => r !== null) as { url: string; name: string; size: number }[];

            if (successResults.length === 0) {
                alert('Upload file thất bại');
                return;
            }

            const fileContent = JSON.stringify(successResults);
            await sendMessage(fileContent, 'file');

            if (successResults.length < files.length) {
                alert(`Đã upload ${successResults.length}/${files.length} file thành công`);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Có lỗi xảy ra khi upload file');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !selectedConv) return;

        if (files.length > 9) {
            alert('Chỉ được chọn tối đa 9 ảnh');
            return;
        }

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} vượt quá 5MB`);
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} không phải là ảnh`);
                return;
            }
        }

        setUploadingImage(true);
        try {
            const uploadPromises = files.map(file => uploadImageToServer(file));
            const imageUrls = await Promise.all(uploadPromises);

            const successUrls = imageUrls.filter(url => url !== null) as string[];

            if (successUrls.length === 0) {
                alert('Upload ảnh thất bại');
                return;
            }

            const imageContent = successUrls.join('\n');
            await sendMessage(imageContent, 'image');

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            if (successUrls.length < files.length) {
                alert(`Đã upload ${successUrls.length}/${files.length} ảnh thành công`);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Có lỗi xảy ra khi upload ảnh');
        } finally {
            setUploadingImage(false);
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }
        }
    };

    const getConversationName = (conv: Conversation) => {
        return conv.name || 'Nhóm';
    };

    const filteredChatConversations = conversations.filter(conv => {
        if (!chatSearch) return true;
        const name = getConversationName(conv).toLowerCase();
        return name.includes(chatSearch.toLowerCase());
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
        <div className="fixed inset-0 bg-[var(--cn-bg-main)] z-50 flex animate-in fade-in duration-300">
            <div className={`${showChatSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-72 lg:w-80 bg-[var(--cn-bg-card)] md:border-r border-[var(--cn-border)] flex-col absolute md:relative inset-0 z-10 md:z-auto transition-all duration-300`}>
                <div className="md:hidden fixed inset-0 bg-black/30 -z-10" onClick={() => setShowChatSidebar(false)} />
                <div className="border-b border-[var(--cn-border)]">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--cn-border)]">
                        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-lg font-semibold text-[var(--cn-text-main)]">Cộng đồng</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowAddFriendModal(true)}
                            title="Thêm bạn"
                        >
                            <UserPlus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--cn-text-sub)]" />
                            <Input
                                placeholder="Tìm kiếm"
                                value={chatSearch}
                                onChange={(e) => setChatSearch(e.target.value)}
                                className="pl-10 bg-[var(--cn-bg-hover)] border-0 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex border-b border-[var(--cn-border)]">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${filter === 'all' ? 'text-[var(--cn-primary)]' : 'text-[var(--cn-text-sub)]'}`}
                        >
                            Tất cả
                            {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--cn-primary)]" />}
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${filter === 'unread' ? 'text-[var(--cn-primary)]' : 'text-[var(--cn-text-sub)]'}`}
                        >
                            Chưa đọc
                            {filter === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--cn-primary)]" />}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredChatConversations.map(conv => (
                        <div
                            key={conv._id}
                            className={`p-3 border-b border-[var(--cn-border)] cursor-pointer hover:bg-[var(--cn-hover)] transition ${selectedConv?._id === conv._id ? 'bg-[var(--cn-hover-blue)]' : ''}`}
                            onClick={() => {
                                setSelectedConv(conv);
                                setShowChatSidebar(false);
                            }}
                        >
                            <div className="flex items-start gap-2.5">
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={conv.avatar} />
                                    <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                        <Users className="w-4 h-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-[var(--cn-text-main)] truncate">{getConversationName(conv)}</h3>
                                    <p className="text-xs text-[var(--cn-text-sub)] truncate">{conv.lastMessage?.content || 'Chưa có tin nhắn'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedConv ? (
                <div
                    className={`flex-1 flex flex-col ${isConversationAnimating ? 'opacity-0' : 'opacity-100'}`}
                    style={{ transition: 'opacity 0.2s ease-out' }}
                >
                    <div className="bg-[var(--cn-bg-card)] border-b border-[var(--cn-border)] p-3 md:p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowChatSidebar(true)}
                                    className="md:hidden h-8 w-8 flex-shrink-0"
                                    title="Danh sách nhóm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={selectedConv.avatar} />
                                    <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                        <Users className="w-5 h-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-[var(--cn-text-main)] text-sm md:text-base truncate">{getConversationName(selectedConv)}</h2>
                                    <p className="text-xs md:text-sm text-[var(--cn-text-sub)] truncate">{selectedConv.participants.length} thành viên</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto"
                    >
                        {loadingMessages ? (
                            <ChatMessageSkeleton />
                        ) : (
                            <div className="p-4 space-y-4">
                                {loadingOlderMessages && (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--cn-primary)]"></div>
                                    </div>
                                )}
                                {(() => {
                                    const getDateLabel = (dateStr: string): string => {
                                        const msgDate = new Date(dateStr);
                                        const today = new Date();
                                        const yesterday = new Date(today);
                                        yesterday.setDate(yesterday.getDate() - 1);

                                        const msgDateStr = msgDate.toDateString();
                                        const todayStr = today.toDateString();
                                        const yesterdayStr = yesterday.toDateString();

                                        if (msgDateStr === todayStr) return 'Hôm nay';
                                        if (msgDateStr === yesterdayStr) return 'Hôm qua';

                                        return msgDate.toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'numeric',
                                            year: 'numeric'
                                        });
                                    };

                                    const elements: React.ReactNode[] = [];
                                    let lastDateStr = '';

                                    messages.forEach((msg, index) => {
                                        const currentDateStr = new Date(msg.createdAt).toDateString();

                                        if (currentDateStr !== lastDateStr) {
                                            elements.push(
                                                <div key={`sep-${index}`} className="flex justify-center">
                                                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                                                        {getDateLabel(msg.createdAt)}
                                                    </div>
                                                </div>
                                            );
                                            lastDateStr = currentDateStr;
                                        }

                                        const isOwn = msg.senderId._id === user?._id;
                                        const isHeartedByCurrentUser = msg.heartedBy && msg.heartedBy.some((u: any) => u._id === user?._id);
                                        elements.push(
                                            <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    {!isOwn && (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={msg.senderId.avatar} />
                                                            <AvatarFallback className="bg-gray-200 text-xs dark:bg-gray-700">
                                                                {msg.senderId.fullName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div>
                                                        {!isOwn && <p className="text-xs text-[var(--cn-text-sub)] mb-1">{msg.senderId.fullName}</p>}
                                                        {msg.type === 'sticker' ? (
                                                            <div className="max-w-[150px]">
                                                                <img src={msg.content} alt="Sticker" className="w-full h-auto rounded-lg" />
                                                            </div>
                                                        ) : msg.type === 'poll' ? (
                                                            <PollDisplay
                                                                poll={JSON.parse(msg.content)}
                                                                currentUserId={user?._id || ''}
                                                                allParticipants={selectedConv?.participants.map(p => p.userId) || []}
                                                                onVote={(optionIndices) => handleVote(msg._id, optionIndices)}
                                                            />
                                                        ) : msg.type === 'image' ? (
                                                            (() => {
                                                                const imageUrls = msg.content.split('\n').filter(url => url.trim());
                                                                const imageCount = imageUrls.length;

                                                                if (imageCount === 1) {
                                                                    return (
                                                                        <div className="max-w-[300px]">
                                                                            <img
                                                                                src={imageUrls[0]}
                                                                                alt="Image"
                                                                                className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition"
                                                                                onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                                                                onClick={() => {
                                                                                    setPreviewImages(imageUrls);
                                                                                    setPreviewIndex(0);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div className={`grid gap-1 max-w-[400px] ${imageCount === 2 ? 'grid-cols-2' :
                                                                        imageCount === 3 ? 'grid-cols-3' :
                                                                            imageCount === 4 ? 'grid-cols-2' :
                                                                                'grid-cols-3'
                                                                        }`}>
                                                                        {imageUrls.map((url, idx) => (
                                                                            <img
                                                                                key={idx}
                                                                                src={url}
                                                                                alt={`Image ${idx + 1}`}
                                                                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition aspect-square"
                                                                                onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                                                                onClick={() => {
                                                                                    setPreviewImages(imageUrls);
                                                                                    setPreviewIndex(idx);
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                );
                                                            })()
                                                        ) : msg.type === 'file' ? (
                                                            <FileDisplay filesJson={msg.content} />
                                                        ) : (
                                                            <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-[var(--cn-primary)] text-white' : 'bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] border border-[var(--cn-border)]'}`}>
                                                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs text-[var(--cn-text-sub)]">
                                                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            <button
                                                                onClick={() => handleHeartMessage(msg._id)}
                                                                className={`flex items-center gap-1 text-xs ${isHeartedByCurrentUser ? 'text-red-500' : 'text-gray-400'} transition`}
                                                            >
                                                                <Heart
                                                                    className={`w-3.5 h-3.5 ${isHeartedByCurrentUser ? 'fill-current' : ''} ${!isHeartedByCurrentUser ? 'stroke-2' : ''}`}
                                                                    data-filled="true"
                                                                />
                                                                {msg.heartedBy && msg.heartedBy.length > 0 && (
                                                                    <span>{msg.heartedBy.length}</span>
                                                                )}
                                                            </button>
                                                            {isOwn && msg.isRead && (
                                                                <span className="text-xs text-[var(--cn-text-sub)]">Đã xem</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                    return elements;
                                })()}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="bg-[var(--cn-bg-card)] border-t border-[var(--cn-border)] p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-1 pb-2 border-b border-[var(--cn-border)]">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                    title={uploadingFile ? "Đang tải file..." : "Gửi file"}
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => imageInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                    title={uploadingImage ? "Đang tải ảnh..." : "Gửi ảnh"}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPollCreator(true)}
                                    className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                    title="Bình chọn"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowStickerPicker(!showStickerPicker)}
                                    className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                    title="Sticker"
                                >
                                    <Smile className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="relative">
                                {showStickerPicker && (
                                    <StickerPicker
                                        onSelect={handleStickerSelect}
                                        onClose={() => setShowStickerPicker(false)}
                                    />
                                )}
                                <Textarea
                                    ref={textareaRef}
                                    placeholder="Nhập tin nhắn..."
                                    value={newMessage}
                                    onChange={handleMessageChange}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    rows={textareaRows}
                                    className="flex-1 resize-none min-h-[72px] max-h-[120px] overflow-y-auto pr-12 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <Button
                                    size="icon"
                                    onClick={() => sendMessage()}
                                    disabled={sending || !newMessage.trim()}
                                    className="absolute bottom-2 right-2 h-8 w-8"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                    <div>
                        <Users className="w-16 h-16 mx-auto mb-4 text-[var(--cn-text-sub)]" />
                        <h2 className="text-xl font-semibold text-[var(--cn-text-main)] mb-2">Chọn một nhóm</h2>
                        <p className="text-[var(--cn-text-sub)]">Chọn một nhóm để bắt đầu trò chuyện</p>
                    </div>
                </div>
            )}

            {previewImages.length > 0 && (
                <ImagePreview
                    images={previewImages}
                    initialIndex={previewIndex}
                    onClose={() => setPreviewImages([])}
                />
            )}

            {showPollCreator && (
                <PollCreator
                    onSubmit={handlePollSubmit}
                    onClose={() => setShowPollCreator(false)}
                />
            )}

            {showAddFriendModal && (
                <FriendRequestModal
                    isOpen={showAddFriendModal}
                    onClose={() => setShowAddFriendModal(false)}
                />
            )}
        </div>
    );
}
