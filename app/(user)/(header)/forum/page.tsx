'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Send, MoreVertical, Smile, Image as ImageIcon, Phone, Video, Users, Info, ArrowLeft, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
    _id: string;
    fullName: string;
    avatar?: string;
}

interface Message {
    _id: string;
    senderId: User;
    content: string;
    type: 'text' | 'image' | 'sticker';
    createdAt: string;
}

interface Conversation {
    _id: string;
    name: string;
    avatar?: string;
    lastMessage?: string;
    lastTime?: string;
    unreadCount?: number;
    online?: boolean;
}

// Data giả
const mockConversations: Conversation[] = [
    {
        _id: '1',
        name: 'Nhóm Học Lập Trình',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group1',
        lastMessage: 'Bài tập hôm nay khó quá 😢',
        lastTime: '10:30',
        unreadCount: 3,
        online: true
    },
    {
        _id: '2',
        name: 'Team Project',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group2',
        lastMessage: 'Đã xong phần API rồi nha',
        lastTime: '09:15',
        online: false
    },
    {
        _id: '3',
        name: 'Giao Lưu Coder',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group3',
        lastMessage: 'Ai có khóa học React không?',
        lastTime: 'Hôm qua',
        unreadCount: 12,
        online: true
    },
    {
        _id: '4',
        name: 'Nhóm Tìm Việc',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group4',
        lastMessage: 'Công ty này tuyển junior nè',
        lastTime: 'Hôm qua',
        online: false
    },
    {
        _id: '5',
        name: 'Dev Vietnam',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group5',
        lastMessage: 'Chào mọi người!',
        lastTime: '2 ngày',
        online: true
    },
    {
        _id: '6',
        name: 'Frontend Masters',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group6',
        lastMessage: 'CSS Grid hay Flexbox?',
        lastTime: '3 ngày',
        unreadCount: 5,
        online: false
    },
];

const mockMessages: Record<string, Message[]> = {
    '1': [
        {
            _id: 'm1',
            senderId: { _id: 'u1', fullName: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
            content: 'Chào mọi người!',
            type: 'text',
            createdAt: '10:00'
        },
        {
            _id: 'm2',
            senderId: { _id: 'u2', fullName: 'Trần Thị B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' },
            content: 'Chào bạn! Hôm nay học gì?',
            type: 'text',
            createdAt: '10:05'
        },
        {
            _id: 'm3',
            senderId: { _id: 'u1', fullName: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
            content: 'Học React hooks nè',
            type: 'text',
            createdAt: '10:10'
        },
        {
            _id: 'm4',
            senderId: { _id: 'u3', fullName: 'Lê Văn C', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3' },
            content: 'Bài tập hôm nay khó quá 😢',
            type: 'text',
            createdAt: '10:30'
        },
    ],
    '2': [
        {
            _id: 'm5',
            senderId: { _id: 'u4', fullName: 'Phạm Văn D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4' },
            content: 'Mọi người đã làm xong chưa?',
            type: 'text',
            createdAt: '09:00'
        },
        {
            _id: 'm6',
            senderId: { _id: 'u5', fullName: 'Hoàng Thị E', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5' },
            content: 'Đã xong phần API rồi nha',
            type: 'text',
            createdAt: '09:15'
        },
    ],
    '3': [
        {
            _id: 'm7',
            senderId: { _id: 'u6', fullName: 'Đỗ Văn F', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6' },
            content: 'Ai có khóa học React không?',
            type: 'text',
            createdAt: 'Hôm qua'
        },
    ],
};

const currentUser: User = {
    _id: 'me',
    fullName: 'Bạn',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'
};

export default function ForumPage() {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedConv) {
            setMessages(mockMessages[selectedConv._id] || []);
            // Remove unread count when conversation is selected
            setConversations(prev => prev.map(conv => 
                conv._id === selectedConv._id 
                    ? { ...conv, unreadCount: undefined }
                    : conv
            ));
            // Scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [selectedConv]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConv) return;

        const newMsg: Message = {
            _id: `m${Date.now()}`,
            senderId: currentUser,
            content: newMessage,
            type: 'text',
            createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');

        // Update last message in conversation list
        setConversations(prev => prev.map(conv => 
            conv._id === selectedConv._id 
                ? { ...conv, lastMessage: newMessage, lastTime: newMsg.createdAt }
                : conv
        ));

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex bg-gray-100 h-[calc(100vh-100px)] md:h-[calc(100vh-65px)]">
            {/* Sidebar - Danh sách chat */}
            <div className={`${showSidebar ? 'w-full md:w-80' : 'w-0'} ${!selectedConv ? 'flex' : 'hidden'} md:flex border-r bg-white flex-col transition-all duration-300 pl-0 md:pl-[10px]`}>
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="bg-gray-200 hover:bg-gray-300">
                            <UserPlus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => setSelectedConv(conv)}
                            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedConv?._id === conv._id ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="relative">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={conv.avatar} />
                                    <AvatarFallback>{conv.name[0]}</AvatarFallback>
                                </Avatar>
                                {conv.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold truncate">{conv.name}</h3>
                                    <span className="text-xs text-gray-500">{conv.lastTime}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                    {conv.unreadCount && conv.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedConv ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 border-b bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="md:hidden"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedConv.avatar} />
                                    <AvatarFallback>{selectedConv.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-semibold">{selectedConv.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedConv.online ? 'Đang hoạt động' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Info className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div 
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-4 bg-gray-50"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`flex mb-4 ${msg.senderId._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.senderId._id !== currentUser._id && (
                                        <Avatar className="h-8 w-8 mr-2 mt-1">
                                            <AvatarImage src={msg.senderId.avatar} />
                                            <AvatarFallback>{msg.senderId.fullName[0]}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-[70%] ${msg.senderId._id === currentUser._id ? 'order-1' : ''}`}>
                                        {msg.senderId._id !== currentUser._id && (
                                            <p className="text-xs text-gray-500 mb-1">{msg.senderId.fullName}</p>
                                        )}
                                        <div
                                            className={`p-3 rounded-lg ${
                                                msg.senderId._id === currentUser._id
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            <p className="break-words">{msg.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{msg.createdAt}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Smile className="h-5 w-5 text-gray-500" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <ImageIcon className="h-5 w-5 text-gray-500" />
                                </Button>
                                <Input
                                    placeholder="Nhập tin nhắn..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1"
                                />
                                <Button 
                                    onClick={handleSendMessage}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-12 w-12 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">Chào mừng đến với Forum</h2>
                            <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}