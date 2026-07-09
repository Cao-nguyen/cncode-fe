"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
    Search,
    Send,
    ChevronLeft,
    Clock,
    AlertCircle,
    RotateCw
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { simpleChatApi, SimpleUser, SimpleMessage, SimpleConversation } from '@/lib/api/chat-simple.api';
import { useSocket } from '@/providers/socket.provider';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

type MessageStatus = 'sending' | 'sent' | 'error';

interface OptimisticMessage extends SimpleMessage {
    tempId?: string;
    status?: MessageStatus;
}

export default function ChatPage() {
    const router = useRouter();
    const { socket } = useSocket();
    const { user, token } = useAuthStore();
    const [conversations, setConversations] = useState<SimpleConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<SimpleConversation | null>(null);
    const [messages, setMessages] = useState<OptimisticMessage[]>([]);
    const [text, setText] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<"list" | "chat">("list");
    const [loading, setLoading] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!token || !user) {
            router.push('/login');
        }
    }, [user, token, router]);

    // Use auth store user directly as SimpleUser type
    // (user is SimpleUser compatible, just needs username to be defined)
    const authUser = useMemo(() => {
        if (!user) return null;
        return {
            _id: user._id,
            username: user.username,
            avatar: user.avatar || '',
        };
    }, [user]);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await simpleChatApi.getConversations();
                console.log('[CHAT] Initial conversations loaded:', data.map((c) => ({
                    id: c._id,
                    unreadCount: c.unreadCount
                })));
                setConversations(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching conversations:', error);
                setLoading(false);
            }
        };

        if (authUser) {
            fetchConversations();
        }
    }, [authUser]);

    // Fetch messages when conversation is selected
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversation) return;

            try {
                const data = await simpleChatApi.getMessages(selectedConversation._id);
                setMessages(data);
                setView("chat");

                // Mark as read
                await simpleChatApi.markAsRead(selectedConversation._id);

                // Update local conversation unreadCount to 0
                setConversations(prev =>
                    prev.map(conv =>
                        conv._id === selectedConversation._id
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    )
                );
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [selectedConversation]);

    // Socket listeners - SINGLE SOURCE OF TRUTH for read count
    useEffect(() => {
        if (!socket || !authUser) return;

        console.log('[CHAT] Setting up socket listeners');

        interface NewMessagePayload {
            conversationId: string;
            message: SimpleMessage;
            unreadCount: number;
            isOwnMessage: boolean;
        }

        interface ConversationReadPayload {
            conversationId: string;
            unreadCount: number;
        }

        const handleNewMessage = (payload: NewMessagePayload) => {
            console.log('[CHAT] Socket: new_message received:', payload);

            const message = payload.message;
            const unreadCount = payload.unreadCount;
            const conversationId = payload.conversationId;

            // Update conversations list with server's unread count
            setConversations(prev => {
                const existingConv = prev.find(c => c._id === conversationId);

                if (existingConv) {
                    return prev.map(conv => {
                        if (conv._id === conversationId) {
                            const shouldShowUnread = payload.isOwnMessage ? 0 : unreadCount;

                            console.log('[CHAT] Socket: updating conversation', {
                                conversationId: conv._id,
                                oldUnreadCount: conv.unreadCount,
                                newUnreadCount: shouldShowUnread,
                                serverUnreadCount: unreadCount,
                                isOwnMessage: payload.isOwnMessage,
                                source: 'new_message'
                            });

                            return {
                                ...conv,
                                lastMessage: message,
                                unreadCount: shouldShowUnread,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return conv;
                    });
                } else {
                    simpleChatApi.getConversations().then(data => {
                        const newConv = data.find((c: SimpleConversation) => c._id === conversationId);
                        if (newConv) {
                            console.log('[CHAT] Socket: adding new conversation', {
                                conversationId: newConv._id,
                                unreadCount: newConv.unreadCount,
                                source: 'new_message'
                            });
                            setConversations(prevConvs => [newConv, ...prevConvs]);
                        }
                    });
                    return prev;
                }
            });

            // If this is the selected conversation, add message to messages list
            if (selectedConversation?._id === conversationId) {
                setMessages(prev => {
                    const withoutOptimistic = prev.filter(m => {
                        const tempId = (m as OptimisticMessage).tempId;
                        return !tempId;
                    });
                    return [...withoutOptimistic, message];
                });

                if (message.sender._id !== authUser._id) {
                    simpleChatApi.markAsRead(conversationId);
                }
            }
        };

        const handleConversationRead = (payload: ConversationReadPayload) => {
            console.log('[CHAT] Socket: conversation_read received:', payload);

            const { conversationId, unreadCount } = payload;

            setConversations(prev =>
                prev.map(conv => {
                    if (conv._id === conversationId) {
                        console.log('[CHAT] Socket: updating conversation from conversation_read', {
                            conversationId: conv._id,
                            oldUnreadCount: conv.unreadCount,
                            newUnreadCount: unreadCount,
                            source: 'conversation_read'
                        });
                        return { ...conv, unreadCount };
                    }
                    return conv;
                })
            );
        };

        socket.on('new_message', handleNewMessage);
        socket.on('conversation_read', handleConversationRead);

        return () => {
            console.log('[CHAT] Cleaning up socket listeners');
            socket.off('new_message', handleNewMessage);
            socket.off('conversation_read', handleConversationRead);
        };
    }, [socket, authUser, selectedConversation]);

    // OPTIMISTIC UI: Send message
    const handleSend = async () => {
        if (!text.trim() || !selectedConversation || !authUser) return;

        const messageText = text.trim();
        const tempId = `temp_${Date.now()}_${Math.random()}`;

        // Optimistic update
        const optimisticMessage: OptimisticMessage = {
            _id: tempId,
            tempId,
            sender: authUser,
            content: messageText,
            createdAt: new Date().toISOString(),
            status: 'sending',
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setText('');
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        // Update conversation list optimistically
        setConversations(prev =>
            prev.map(conv =>
                conv._id === selectedConversation._id
                    ? {
                        ...conv,
                        lastMessage: optimisticMessage as SimpleMessage,
                        updatedAt: new Date().toISOString()
                    }
                    : conv
            )
        );

        try {
            const sentMessage = await simpleChatApi.sendMessage(selectedConversation._id, messageText);

            // Replace optimistic with real message
            setMessages(prev =>
                prev.map(msg =>
                    (msg as OptimisticMessage).tempId === tempId
                        ? { ...sentMessage, status: 'sent' as MessageStatus }
                        : msg
                )
            );

            setConversations(prev =>
                prev.map(conv =>
                    conv._id === selectedConversation._id
                        ? {
                            ...conv,
                            lastMessage: sentMessage,
                            updatedAt: sentMessage.createdAt
                        }
                        : conv
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev =>
                prev.map(msg =>
                    (msg as OptimisticMessage).tempId === tempId
                        ? { ...msg, status: 'error' as MessageStatus }
                        : msg
                )
            );
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
        }
    };

    // Retry failed message
    const handleRetryMessage = async (msg: OptimisticMessage) => {
        if (!selectedConversation || msg.status !== 'error') return;

        setMessages(prev =>
            prev.map(m =>
                m._id === msg._id ? { ...m, status: 'sending' as MessageStatus } : m
            )
        );

        try {
            const sentMessage = await simpleChatApi.sendMessage(selectedConversation._id, msg.content);
            setMessages(prev =>
                prev.map(m =>
                    m._id === msg._id ? { ...sentMessage, status: 'sent' as MessageStatus } : m
                )
            );
            setConversations(prev =>
                prev.map(conv =>
                    conv._id === selectedConversation._id
                        ? { ...conv, lastMessage: sentMessage, updatedAt: sentMessage.createdAt }
                        : conv
                )
            );
        } catch (error) {
            console.error('Error retrying message:', error);
            setMessages(prev =>
                prev.map(m =>
                    m._id === msg._id ? { ...m, status: 'error' as MessageStatus } : m
                )
            );
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 96) + "px";
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUser = conv.participants.find(p => p._id !== authUser?._id);
        return otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getOtherUser = (conv: SimpleConversation) => {
        return conv.participants.find(p => p._id !== authUser?._id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100dvh-130px)] md:h-[calc(100dvh-90px)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100dvh-130px)] md:h-[calc(100dvh-90px)] bg-background">
            <div
                className={cn(
                    "flex flex-col border-r",
                    view === "chat" ? "hidden md:flex md:w-80" : "w-full md:w-80"
                )}
            >
                <div className="p-[9.6px] border-b">
                    <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                        <Search size={20} />
                        <input
                            className="bg-transparent outline-none text-sm w-full"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            Chưa có cuộc trò chuyện nào
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const otherUser = getOtherUser(conv);
                            if (!otherUser) return null;

                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-muted transition",
                                        selectedConversation?._id === conv._id && "bg-muted"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={otherUser.avatar} />
                                        <AvatarFallback>
                                            {otherUser.username?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{otherUser.username || 'Unknown'}</p>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.lastMessage.sender._id === authUser?._id ? 'Bạn: ' : ''}
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </ScrollArea>
            </div>

            {selectedConversation && (
                <div
                    className={cn(
                        "flex-1 flex flex-col",
                        view === "list" ? "hidden md:flex" : "w-full md:flex-1"
                    )}
                >
                    <div className="h-14 border-b flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <button className="md:hidden" onClick={() => setView("list")}>
                                <ChevronLeft size={20} />
                            </button>

                            <Avatar>
                                <AvatarImage src={getOtherUser(selectedConversation)?.avatar} />
                                <AvatarFallback>
                                    {getOtherUser(selectedConversation)?.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="text-sm font-medium">{getOtherUser(selectedConversation)?.username || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4 space-y-5">
                        {messages.map((msg) => {
                            const optimisticMsg = msg as OptimisticMessage;
                            const isAuthUser = msg.sender._id === authUser?._id;
                            return (
                                <div key={msg._id} className={cn("flex", isAuthUser ? "justify-end" : "justify-start")}>
                                    <div className="flex gap-2 max-w-[65%]">
                                        {!isAuthUser && (
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={msg.sender.avatar} />
                                                <AvatarFallback>{msg.sender.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div className={cn("flex flex-col", isAuthUser && "items-end text-right")}>
                                            <p className="text-xs font-medium mb-1">{isAuthUser ? 'Bạn' : msg.sender.username}</p>

                                            <div className={cn(
                                                "px-3 py-2 rounded-xl text-sm break-words",
                                                isAuthUser ? "bg-blue-500 text-white" : "bg-muted"
                                            )}>
                                                {msg.content}
                                            </div>

                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                                {isAuthUser && optimisticMsg.status && (
                                                    <>
                                                        {optimisticMsg.status === 'sending' && (
                                                            <Clock className="h-3 w-3 opacity-70" />
                                                        )}
                                                        {optimisticMsg.status === 'error' && (
                                                            <button
                                                                onClick={() => handleRetryMessage(optimisticMsg)}
                                                                className="flex items-center gap-1 text-xs hover:underline"
                                                            >
                                                                <AlertCircle className="h-3 w-3" />
                                                                <RotateCw className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {isAuthUser && (
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={msg.sender.avatar} />
                                                <AvatarFallback>{msg.sender.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </ScrollArea>

                    <div className="border-t p-3 space-y-2">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={text}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Tin nhắn..."
                                className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none max-h-24 bg-background"
                            />

                            <button
                                onClick={handleSend}
                                disabled={!text.trim()}
                                className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}