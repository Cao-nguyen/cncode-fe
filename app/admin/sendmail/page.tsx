'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Send, Search,
    AlertCircle, Loader2,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/skeleton';

interface User {
    _id: string;
    email: string;
    fullName: string;
    avatar?: string;
    role: string;
    isVerified: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
};

const USER_ROLES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'user', label: 'Học sinh' },
    { value: 'teacher', label: 'Giáo viên' },
    { value: 'admin', label: 'Quản trị viên' },
];

export default function AdminSendMailPage() {
    const editorRef = useRef<CustomEditorRef>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const [subject, setSubject] = useState('');
    const [subjectError, setSubjectError] = useState('');
    const [contentError, setContentError] = useState('');
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldownTimer.current) clearInterval(cooldownTimer.current);
        if (Date.now() < cooldownUntil) {
            cooldownTimer.current = setInterval(() => {
                const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
                if (remaining <= 0) {
                    setCooldownRemaining(0);
                    setCooldownUntil(0);
                    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
                } else {
                    setCooldownRemaining(remaining);
                }
            }, 1000);
        } else {
            setCooldownRemaining(0);
        }
        return () => { if (cooldownTimer.current) clearInterval(cooldownTimer.current); };
    }, [cooldownUntil]);

    const fetchUsers = useCallback(async (ignoreCooldown = false) => {
        const now = Date.now();
        if (!ignoreCooldown && now < cooldownUntil) {
            toast.error(`Vui lòng đợi ${Math.ceil((cooldownUntil - now) / 1000)}s trước khi tải lại`);
            return;
        }
        setLoading(true);
        try {
            const token = getToken();
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter !== 'all') params.append('role', roleFilter);

            const url = `${API_URL}/api/admin/sendmail/users?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('Retry-After') || '3600', 10);
                const cooldown = Math.min(retryAfter * 1000, 3600000);
                setCooldownUntil(Date.now() + cooldown);
                const errorMessage = `Quá nhiều yêu cầu, vui lòng thử lại sau ${Math.ceil(cooldown / 1000)}s`;
                throw new Error(errorMessage);
            }

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {

                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.success) {
                setUsers(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotalUsers(data.total || 0);
            } else {
                toast.error(data.message || 'Không thể tải danh sách người dùng');
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách người dùng';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, roleFilter]);

    // Auto-refetch on page / searchTerm / roleFilter change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearchTerm(search);
            setPage(1);
        }, 500);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [search]);

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map(u => u._id)));
        }
        setSelectAll(!selectAll);
    };

    const handleToggleUser = (userId: string) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) newSet.delete(userId);
            else newSet.add(userId);
            return newSet;
        });
    };

    const handleSendMail = async () => {
        let hasError = false;
        if (!subject.trim()) {
            setSubjectError('Vui lòng nhập tiêu đề');
            hasError = true;
        } else {
            setSubjectError('');
        }

        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            setContentError('Vui lòng nhập nội dung email');
            hasError = true;
        } else {
            setContentError('');
        }

        if (selectedUsers.size === 0) {
            toast.error('Vui lòng chọn ít nhất một người nhận');
            return;
        }
        if (hasError) return;

        setSending(true);
        try {
            const token = getToken();

            const response = await fetch(`${API_URL}/api/admin/sendmail/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userIds: Array.from(selectedUsers),
                    subject: subject.trim(),
                    content: content
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || `Gửi mail thành công`);
                setSubject('');
                editorRef.current?.setContent('');
                setSelectedUsers(new Set());
                setSelectAll(false);
            } else {
                toast.error(data.message || 'Gửi mail thất bại');
            }
        } catch (error) {
            console.error('Error sending mail:', error);
            toast.error('Có lỗi xảy ra khi gửi mail. Vui lòng kiểm tra lại URL Server.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-150px)] flex flex-col overflow-hidden bg-gray-50/50">
            {/* Full-height split layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 overflow-hidden px-4 sm:px-6">
                {/* Left: User List */}
                <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
                    {/* Search bar — overflow-visible for dropdown */}
                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 p-4 border-b border-gray-100 overflow-visible">
                        <div className="flex-1">
                            <CustomInput
                                placeholder="Tìm tên hoặc email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="sm:w-36 overflow-visible">
                            <CustomSelect
                                options={USER_ROLES}
                                value={roleFilter}
                                onChange={setRoleFilter}
                            />
                        </div>
                        {cooldownRemaining > 0 && (
                            <button
                                onClick={() => fetchUsers(true)}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {cooldownRemaining}s
                            </button>
                        )}
                    </div>

                    {/* Select all bar */}
                    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Chọn tất cả trang này
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">
                            {users.length} / {totalUsers}
                        </span>
                    </div>

                    {/* Scrollable user list */}
                    <div className="flex-1 overflow-y-auto custom-scroll">
                        {loading ? (
                            <div className="p-4">
                                <ListSkeleton items={8} />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
                                Không có người dùng nào
                            </div>
                        ) : (
                            users.map((user) => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer ${selectedUsers.has(user._id) ? 'bg-blue-50/60 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                                    onClick={() => handleToggleUser(user._id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.has(user._id)}
                                        onChange={(e) => { e.stopPropagation(); handleToggleUser(user._id); }}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                                    />
                                    <Avatar className="w-9 h-9 border border-white shadow-sm flex-shrink-0">
                                        <AvatarImage src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`) : undefined} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                                            {user.fullName?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{user.fullName || 'Người dùng'}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-tighter flex-shrink-0">
                                        {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'GV' : 'HS'}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-xs text-gray-500">Trang {page} / {totalPages}</p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Compose */}
                <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
                    {/* Compose header */}
                    <div className="flex-shrink-0 flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-500" />
                            <h2 className="font-bold text-gray-800 text-lg">Soạn thảo nội dung</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedUsers.size > 0 && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap">
                                    Gửi đến {selectedUsers.size} người
                                </span>
                            )}
                            <CustomButton
                                onClick={handleSendMail}
                                loading={sending}
                                disabled={selectedUsers.size === 0 || !subject.trim()}
                                className="rounded-lg shadow-md shadow-blue-200"
                            >
                                <Send className="w-4 h-4 mr-1.5" />
                                Gửi ngay
                            </CustomButton>
                        </div>
                    </div>

                    {/* Scrollable compose area */}
                    <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4">
                        <CustomInput
                            label="Tiêu đề Email"
                            placeholder="Nhập tiêu đề hấp dẫn..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            error={subjectError}
                            required
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Nội dung Email <span className="text-red-500">*</span>
                            </label>
                            <div className="overflow-hidden min-h-[200px]">
                                <CustomEditor ref={editorRef} />
                            </div>
                            {contentError && (
                                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} /> {contentError}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}