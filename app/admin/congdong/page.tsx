'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { MessageCircle, Users, Trash2, Search, TrendingUp, MessageSquare, Plus, X, Upload, Edit, ArrowLeft, MoreVertical, Send, UserPlus, Pin, Check, BellOff, LogOut, CheckCircle, Lock, Smile, Paperclip, Image as ImageIcon, BarChart3, Clock, Sticker as StickerIcon, Bell } from 'lucide-react';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmModal } from '@/components/custom/DeleteConfirmModal';
import { StickerPicker } from '@/components/custom/StickerPicker';
import { ImagePreview } from '@/components/custom/ImagePreview';
import { PollCreator } from '@/components/custom/PollCreator';
import { PollDisplay } from '@/components/custom/PollDisplay';
import { ReminderCreator } from '@/components/custom/ReminderCreator';
import { ReminderDisplay } from '@/components/custom/ReminderDisplay';
import { io, Socket } from 'socket.io-client';

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
    createdAt: string;
    reminder?: {
        title: string;
        scheduledTime: string;
        isTriggered: boolean;
        triggeredAt?: string;
    };
}

interface Stats {
    totalConversations: number;
    totalMessages: number;
    activeConversations: number;
    groupConversations: number;
    privateConversations: number;
}

export default function AdminCommunityPage() {
    const { token, user } = useAuthStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalConversations: 0,
        totalMessages: 0,
        activeConversations: 0,
        groupConversations: 0,
        privateConversations: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Create/Edit group modal
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Conversation | null>(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Chat overlay
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [chatSearch, setChatSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [textareaRows, setTextareaRows] = useState(3);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [showReminderCreator, setShowReminderCreator] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const selectedConvRef = useRef<Conversation | null>(null);

    // Keep ref in sync with state
    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    useEffect(() => {
        fetchStats();
        fetchConversations();
        fetchAllUsers();

        // Setup socket
        if (token) {
            socketRef.current = io(API_URL, {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            const handleNewMessage = ({ conversationId, message }: { conversationId: string; message: Message }) => {
                console.log('New message received:', { conversationId, message, currentConv: selectedConvRef.current?._id });
                // Use ref to get current value
                if (selectedConvRef.current?._id === conversationId) {
                    setMessages(prev => {
                        // Check if message already exists to avoid duplicates
                        const exists = prev.some(m => m._id === message._id);
                        if (exists) {
                            console.log('Message already exists, skipping');
                            return prev;
                        }
                        return [...prev, message];
                    });
                }
                fetchConversations();
            };

            socketRef.current.on('new_message', handleNewMessage);

            socketRef.current.on('new_conversation', () => {
                fetchConversations();
                fetchStats();
            });

            socketRef.current.on('poll_updated', ({ conversationId, message }: { conversationId: string; message: Message }) => {
                console.log('Poll updated:', { conversationId, message, currentConv: selectedConvRef.current?._id });
                if (selectedConvRef.current?._id === conversationId) {
                    setMessages(prev => prev.map(m => m._id === message._id ? message : m));
                }
            });
        }

        return () => {
            socketRef.current?.disconnect();
        };
    }, [page, token]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv._id);
            socketRef.current?.emit('join_conversation', selectedConv._id);
        }
    }, [selectedConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chat/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chat/admin/conversations?page=${page}&limit=20&type=group`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/user/admin/users?limit=1000`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            console.log('Fetch users response:', data);
            if (data.success) {
                setAllUsers(data.data);
            } else {
                console.error('Failed to fetch users:', data.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
                // Scroll to bottom after loading messages
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                }, 100);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToServer = async (file: File): Promise<string | null> => {
        try {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Upload to server
            const res = await fetch(`${API_URL}/api/upload/image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    image: base64,
                    folder: 'chat-avatars'
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

    const handleSaveGroup = async () => {
        if (!groupName.trim() || saving) return;

        setSaving(true);
        setUploading(true);
        try {
            let avatarUrl = editingGroup?.avatar || '';

            // Upload avatar to server if file is selected
            if (avatarFile) {
                const uploadedUrl = await uploadImageToServer(avatarFile);
                if (uploadedUrl) {
                    avatarUrl = uploadedUrl;
                } else {
                    alert('Upload ảnh thất bại');
                    setSaving(false);
                    setUploading(false);
                    return;
                }
            }

            // Get all user IDs to add to group
            const participantIds = allUsers.map(u => u._id);

            if (editingGroup) {
                // Update existing group
                const res = await fetch(`${API_URL}/api/chat/admin/conversations/${editingGroup._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: groupName.trim(),
                        description: groupDescription.trim(),
                        avatar: avatarUrl || undefined
                    })
                });

                const data = await res.json();
                if (data.success) {
                    closeModal();
                    fetchConversations();
                }
            } else {
                // Create new group
                const res = await fetch(`${API_URL}/api/chat/conversations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        type: 'group',
                        name: groupName.trim(),
                        description: groupDescription.trim(),
                        avatar: avatarUrl || undefined,
                        participantIds
                    })
                });

                const data = await res.json();
                if (data.success) {
                    closeModal();
                    await fetchConversations();
                    fetchStats();
                    // Auto-open the newly created conversation
                    setSelectedConv(data.data);
                }
            }
        } catch (error) {
            console.error('Error saving group:', error);
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const openEditModal = (conv: Conversation) => {
        setEditingGroup(conv);
        setGroupName(conv.name || '');
        setGroupDescription(conv.description || '');
        setAvatarPreview(conv.avatar || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingGroup(null);
        setGroupName('');
        setGroupDescription('');
        setAvatarFile(null);
        setAvatarPreview('');
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        // Auto-resize: count lines
        const lines = value.split('\n').length;
        if (lines <= 3) {
            setTextareaRows(3);
        } else if (lines === 4) {
            setTextareaRows(4);
        } else {
            setTextareaRows(5);
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
                // Focus back to textarea after sending
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

    const handleReminderSubmit = async (reminder: { title: string; scheduledTime: Date }) => {
        if (!selectedConv || sending) return;

        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations/${selectedConv._id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: reminder.title,
                    type: 'reminder',
                    reminder: {
                        title: reminder.title,
                        scheduledTime: reminder.scheduledTime.toISOString()
                    }
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowReminderCreator(false);
            }
        } catch (error) {
            console.error('Error creating reminder:', error);
        } finally {
            setSending(false);
        }
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

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !selectedConv) return;

        // Validate max 9 images
        if (files.length > 9) {
            alert('Chỉ được chọn tối đa 9 ảnh');
            return;
        }

        // Validate each file
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
            // Upload all images
            const uploadPromises = files.map(file => uploadImageToServer(file));
            const imageUrls = await Promise.all(uploadPromises);

            // Filter out failed uploads
            const successUrls = imageUrls.filter(url => url !== null) as string[];

            if (successUrls.length === 0) {
                alert('Upload ảnh thất bại');
                return;
            }

            // Send images as a single message with multiple URLs joined by newline
            const imageContent = successUrls.join('\n');
            await sendMessage(imageContent, 'image');

            // Scroll to bottom after sending images
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

    const handleDelete = async () => {
        if (!deleteId || deleting) return;

        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/api/chat/admin/conversations/${deleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (data.success) {
                setConversations(prev => prev.filter(c => c._id !== deleteId));
                fetchStats();
                setDeleteId(null);
            } else {
                alert(data.message || 'Xóa thất bại');
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Có lỗi xảy ra khi xóa');
        } finally {
            setDeleting(false);
        }
    };

    const getConversationName = (conv: Conversation) => {
        return conv.name || 'Nhóm';
    };

    const filteredConversations = conversations.filter(conv => {
        if (!search) return true;
        const name = (conv.name || '').toLowerCase();
        return name.includes(search.toLowerCase());
    });

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
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý nhóm chat</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các nhóm chat cộng đồng</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="gap-2 bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Tạo nhóm chat
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <DashboardCard title="Tổng cuộc trò chuyện" value={stats.totalConversations} icon={<MessageCircle size={18} />} iconBgColor="#EFF6FF" iconColor="#3B82F6" />
                <DashboardCard title="Tổng tin nhắn" value={stats.totalMessages} icon={<MessageSquare size={18} />} iconBgColor="#F0FDF4" iconColor="#22C55E" />
                <DashboardCard title="Hoạt động 24h" value={stats.activeConversations} icon={<TrendingUp size={18} />} iconBgColor="#F5F3FF" iconColor="#8B5CF6" />
                <DashboardCard title="Nhóm chat" value={stats.groupConversations} icon={<Users size={18} />} iconBgColor="#FFF7ED" iconColor="#F97316" />
                <DashboardCard title="Chat 1-1" value={stats.privateConversations} icon={<MessageCircle size={18} />} iconBgColor="#FDF2F8" iconColor="#EC4899" />
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--cn-text-sub)]" />
                    <Input
                        placeholder="Tìm kiếm nhóm chat..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Groups Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-main/20 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-main/5 border-b border-main/20">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Nhóm chat</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Mô tả</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Thành viên</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Tin nhắn cuối</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Người tạo</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-main">Cập nhật</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-main">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-main/10">
                            {filteredConversations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        Chưa có nhóm chat nào
                                    </td>
                                </tr>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <tr key={conv._id} className="cursor-pointer hover:bg-main/5 transition" onClick={() => setSelectedConv(conv)}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={conv.avatar} />
                                                    <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                                        <Users className="w-5 h-5" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{conv.name || 'Nhóm'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                                {conv.description || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{conv.participants.length}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                                {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={conv.createdBy.avatar} />
                                                    <AvatarFallback className="text-xs">{conv.createdBy.fullName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{conv.createdBy.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500">
                                                {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(conv);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteId(conv._id);
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                    <div className="flex justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Trước
                        </Button>
                        <span className="flex items-center px-4 text-sm text-[var(--cn-text-sub)]">
                            Trang {page} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Sau
                        </Button>
                    </div>
                )}
            </div>

            {/* Create/Edit Group Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[var(--cn-text-main)]">
                                {editingGroup ? 'Chỉnh sửa nhóm chat' : 'Tạo nhóm chat mới'}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={closeModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="groupName">Tên nhóm *</Label>
                                <Input
                                    id="groupName"
                                    placeholder="Nhập tên nhóm..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="groupDescription">Mô tả</Label>
                                <Textarea
                                    id="groupDescription"
                                    placeholder="Mô tả về nhóm..."
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Avatar nhóm</Label>
                                <div className="mt-2 flex items-center gap-4">
                                    {avatarPreview && (
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={avatarPreview} />
                                            <AvatarFallback>
                                                <Users className="w-8 h-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="avatarUpload"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('avatarUpload')?.click()}
                                            className="w-full gap-2"
                                            disabled={uploading}
                                        >
                                            <Upload className="w-4 h-4" />
                                            {avatarFile ? 'Đổi ảnh' : 'Tải ảnh lên'}
                                        </Button>
                                        <p className="text-xs text-[var(--cn-text-sub)] mt-1">
                                            Tối đa 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!editingGroup && (
                                <div className="bg-[var(--cn-primary-light)] p-3 rounded-lg">
                                    <p className="text-sm text-[var(--cn-text-main)]">
                                        <strong>Lưu ý:</strong> Tất cả {allUsers.length} người dùng trên nền tảng sẽ được tự động thêm vào nhóm này.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="outline" onClick={closeModal}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSaveGroup}
                                disabled={saving || !groupName.trim()}
                                className="bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)]"
                            >
                                {saving ? 'Đang lưu...' : (editingGroup ? 'Cập nhật' : 'Tạo nhóm')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa nhóm chat"
                message="Bạn có chắc chắn muốn xóa nhóm chat này không?"
                warning="Tất cả tin nhắn trong nhóm cũng sẽ bị xóa vĩnh viễn."
                isDeleting={deleting}
            />

            {/* Chat Overlay */}
            {selectedConv && (
                <div className="fixed inset-0 bg-[var(--cn-bg-main)] z-50 flex">
                    <div className="w-full md:w-72 lg:w-80 bg-[var(--cn-bg-card)] md:border-r border-[var(--cn-border)] flex-col flex">
                        <div className="border-b border-[var(--cn-border)]">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--cn-border)]">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedConv(null)}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <h1 className="text-lg font-semibold text-[var(--cn-text-main)]">Cộng đồng</h1>
                                <Button variant="ghost" size="icon">
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
                                    onClick={() => setSelectedConv(conv)}
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

                    <div className="flex-1 flex flex-col">
                        <div className="bg-[var(--cn-bg-card)] border-b border-[var(--cn-border)] p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={selectedConv.avatar} />
                                        <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                            <Users className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold text-[var(--cn-text-main)]">{getConversationName(selectedConv)}</h2>
                                        <p className="text-sm text-[var(--cn-text-sub)]">{selectedConv.participants.length} thành viên</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                const isOwn = msg.senderId._id === user?._id;
                                return (
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
                                                ) : msg.type === 'reminder' ? (
                                                    <ReminderDisplay
                                                        title={msg.content}
                                                        scheduledTime={msg.reminder?.scheduledTime || ''}
                                                        isTriggered={msg.reminder?.isTriggered || false}
                                                        triggeredAt={msg.reminder?.triggeredAt}
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
                                                ) : (
                                                    <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-[var(--cn-primary)] text-white' : 'bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] border border-[var(--cn-border)]'}`}>
                                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                                    </div>
                                                )}
                                                <p className="text-xs text-[var(--cn-text-sub)] mt-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="bg-[var(--cn-bg-card)] border-t border-[var(--cn-border)] p-4">
                            <div className="space-y-3">
                                {/* Toolbar */}
                                <div className="flex items-center gap-1 pb-2 border-b border-[var(--cn-border)]">
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
                                        className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                        title="Gửi file"
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
                                        onClick={() => {
                                            console.log('Poll button clicked, showPollCreator:', showPollCreator);
                                            setShowPollCreator(true);
                                        }}
                                        className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                        title="Bình chọn"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowReminderCreator(true)}
                                        className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                        title="Nhắc hẹn"
                                    >
                                        <Bell className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowStickerPicker(!showStickerPicker)}
                                        className="h-8 w-8 text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)] hover:bg-[var(--cn-bg-hover)]"
                                        title="Sticker"
                                    >
                                        <StickerIcon className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Message Input */}
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
                                        className="flex-1 resize-none min-h-[72px] max-h-[120px] overflow-y-auto pr-12 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                        disabled={sending}
                                    />
                                    <Button
                                        onClick={() => sendMessage()}
                                        disabled={sending || !newMessage.trim()}
                                        size="icon"
                                        className="absolute right-2 bottom-2 h-8 w-8 flex-shrink-0 bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] text-white"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Preview Modal */}
                    {previewImages.length > 0 && (
                        <ImagePreview
                            images={previewImages}
                            initialIndex={previewIndex}
                            onClose={() => setPreviewImages([])}
                        />
                    )}

                    {/* Poll Creator Modal */}
                    {showPollCreator && (
                        <PollCreator
                            onClose={() => setShowPollCreator(false)}
                            onSubmit={handlePollSubmit}
                        />
                    )}

                    {/* Reminder Creator Modal */}
                    {showReminderCreator && (
                        <ReminderCreator
                            onClose={() => setShowReminderCreator(false)}
                            onSubmit={handleReminderSubmit}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
