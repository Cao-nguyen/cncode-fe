'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, UserPlus, Users, Check, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth.store';
import { searchUsers } from '@/lib/api/user.api';
import {
    sendFriendRequest,
    getSentRequests,
    getReceivedRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    type FriendRequest
} from '@/lib/api/friendrequest.api';
import { toast } from 'sonner';

interface User {
    _id: string;
    fullName: string;
    username?: string;
    avatar?: string;
    email: string;
}

interface FriendRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FriendRequestModal({ isOpen, onClose }: FriendRequestModalProps) {
    const { user, token, _hasHydrated } = useAuthStore();
    const [activeTab, setActiveTab] = useState('search');

    // Search tab states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);
    const [sendingRequest, setSendingRequest] = useState<string | null>(null);

    // Requests tab states
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchedUsers([]);
            return;
        }

        const timer = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load requests when switching to requests tab
    useEffect(() => {
        if (activeTab === 'requests' && isOpen) {
            loadFriendRequests();
        }
    }, [activeTab, isOpen]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const results = await searchUsers(searchQuery);
            setSearchedUsers(results);
        } catch (error: unknown) {
            console.error('Search error:', error);
            toast.error('Lỗi khi tìm kiếm người dùng');
        } finally {
            setSearching(false);
        }
    };

    const loadFriendRequests = async () => {
        setLoadingRequests(true);
        try {
            const [sent, received] = await Promise.all([
                getSentRequests(token || undefined),
                getReceivedRequests(token || undefined)
            ]);
            setSentRequests(sent);
            setReceivedRequests(received);
        } catch (error) {
            const err = error as Error;
            console.error('Load requests error:', err.message);
            toast.error(err.message || 'Lỗi khi tải danh sách lời mời');
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleSendRequest = async (receiverId: string) => {
        if (!user) return;

        setSendingRequest(receiverId);
        try {
            await sendFriendRequest(receiverId, undefined, token || undefined);
            toast.success('Đã gửi lời mời kết bạn');
            setSearchedUsers(prev => prev.filter(u => u._id !== receiverId));

            // Refresh requests list if on requests tab
            if (activeTab === 'requests') {
                loadFriendRequests();
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || 'Lỗi khi gửi lời mời kết bạn');
        } finally {
            setSendingRequest(null);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        setProcessingRequest(requestId);
        try {
            await acceptFriendRequest(requestId, token || undefined);
            toast.success('Đã chấp nhận lời mời kết bạn');
            loadFriendRequests();
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || 'Lỗi khi chấp nhận lời mời');
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        setProcessingRequest(requestId);
        try {
            await rejectFriendRequest(requestId, token || undefined);
            toast.success('Đã từ chối lời mời kết bạn');
            loadFriendRequests();
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || 'Lỗi khi từ chối lời mời');
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        setProcessingRequest(requestId);
        try {
            await cancelFriendRequest(requestId, token || undefined);
            toast.success('Đã hủy lời mời kết bạn');
            loadFriendRequests();
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || 'Lỗi khi hủy lời mời');
        } finally {
            setProcessingRequest(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 max-w-md w-full shadow-xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--cn-text-main)]">Kết bạn</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Tìm kiếm
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Lời mời
                            {receivedRequests.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {receivedRequests.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="flex-1 flex flex-col mt-4 space-y-4">
                        <div>
                            <Label htmlFor="userSearch">Tìm kiếm theo username</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--cn-text-sub)]" />
                                <Input
                                    id="userSearch"
                                    placeholder="Nhập username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {searching ? (
                                <div className="text-center py-8 text-[var(--cn-text-sub)]">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    Đang tìm kiếm...
                                </div>
                            ) : searchedUsers.length === 0 ? (
                                <div className="text-center py-8 text-[var(--cn-text-sub)]">
                                    {searchQuery ? 'Không tìm thấy người dùng' : 'Nhập username để tìm kiếm'}
                                </div>
                            ) : (
                                searchedUsers.map((searchUser) => (
                                    <div
                                        key={searchUser._id}
                                        className="flex items-center justify-between p-3 bg-[var(--cn-bg-hover)] rounded-lg hover:bg-[var(--cn-bg-hover-blue)] transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="w-10 h-10 flex-shrink-0">
                                                <AvatarImage src={searchUser.avatar} />
                                                <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                                    {searchUser.fullName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-medium text-[var(--cn-text-main)] truncate">
                                                    {searchUser.fullName}
                                                </p>
                                                <p className="text-sm text-[var(--cn-text-sub)] truncate">
                                                    @{searchUser.username || searchUser.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSendRequest(searchUser._id)}
                                            disabled={sendingRequest === searchUser._id || searchUser._id === user?._id}
                                            className="bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] flex-shrink-0"
                                        >
                                            {searchUser._id === user?._id ? (
                                                'Bạn'
                                            ) : sendingRequest === searchUser._id ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-3 h-3 mr-1" />
                                                    Kết bạn
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="requests" className="flex-1 flex flex-col mt-4">
                        {loadingRequests ? (
                            <div className="flex-1 flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-4">
                                {/* Received Requests */}
                                {receivedRequests.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-[var(--cn-text-main)] mb-2">
                                            Lời mời nhận được ({receivedRequests.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {receivedRequests.map((request) => (
                                                <div
                                                    key={request._id}
                                                    className="flex items-center justify-between p-3 bg-[var(--cn-bg-hover)] rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <Avatar className="w-10 h-10 flex-shrink-0">
                                                            <AvatarImage src={request.sender.avatar} />
                                                            <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                                                {request.sender.fullName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-[var(--cn-text-main)] truncate">
                                                                {request.sender.fullName}
                                                            </p>
                                                            <p className="text-xs text-[var(--cn-text-sub)] truncate">
                                                                @{request.sender.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAcceptRequest(request._id)}
                                                            disabled={processingRequest === request._id}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleRejectRequest(request._id)}
                                                            disabled={processingRequest === request._id}
                                                        >
                                                            <XCircle className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sent Requests */}
                                {sentRequests.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-[var(--cn-text-main)] mb-2">
                                            Lời mời đã gửi ({sentRequests.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {sentRequests.map((request) => (
                                                <div
                                                    key={request._id}
                                                    className="flex items-center justify-between p-3 bg-[var(--cn-bg-hover)] rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <Avatar className="w-10 h-10 flex-shrink-0">
                                                            <AvatarImage src={request.receiver.avatar} />
                                                            <AvatarFallback className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                                                {request.receiver.fullName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-[var(--cn-text-main)] truncate">
                                                                {request.receiver.fullName}
                                                            </p>
                                                            <p className="text-xs text-[var(--cn-text-sub)] truncate">
                                                                @{request.receiver.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCancelRequest(request._id)}
                                                        disabled={processingRequest === request._id}
                                                        className="flex-shrink-0"
                                                    >
                                                        Hủy
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {receivedRequests.length === 0 && sentRequests.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center py-8 text-center">
                                        <div>
                                            <Users className="w-12 h-12 mx-auto mb-2 text-[var(--cn-text-sub)] opacity-30" />
                                            <p className="text-[var(--cn-text-sub)]">Chưa có lời mời kết bạn</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}