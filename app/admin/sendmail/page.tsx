
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Mail, Send, Users, Search,
    AlertCircle, Loader2,
    Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

    const fetchUsers = useCallback(async () => {
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

    const handleClearAll = () => {
        setSelectedUsers(new Set());
        setSelectAll(false);
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
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-2xl">
                        <Mail className="w-8 h-8 text-[var(--cn-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--cn-text-main)]">Gửi Email hàng loạt</h1>
                        <p className="text-sm text-[var(--cn-text-sub)]">Thông báo đến {totalUsers.toLocaleString()} người dùng hệ thống</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {}
                    <div className="space-y-4">
                        <div className="bg-[var(--cn-bg-card)] rounded-2xl border border-[var(--cn-border)] p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-[var(--cn-text-main)] flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    Người nhận
                                    {selectedUsers.size > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                            Đã chọn {selectedUsers.size}
                                        </span>
                                    )}
                                </h2>
                                {selectedUsers.size > 0 && (
                                    <button onClick={handleClearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                                        <Trash2 size={14} /> Xóa lựa chọn
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <div className="flex-1">
                                    <CustomInput
                                        placeholder="Tìm tên hoặc email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        icon={<Search className="w-4 h-4" />}
                                    />
                                </div>
                                <div className="sm:w-44">
                                    <CustomSelect
                                        options={USER_ROLES}
                                        value={roleFilter}
                                        onChange={setRoleFilter}
                                    />
                                </div>
                            </div>

                            <div className="border border-[var(--cn-border)] rounded-xl overflow-hidden bg-white">
                                <div className="bg-slate-50 px-4 py-2.5 border-b border-[var(--cn-border)] flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Chọn tất cả trên trang này
                                    </span>
                                </div>
                                <div className="max-h-[450px] overflow-y-auto custom-scroll">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p className="text-sm text-slate-400">Đang tải danh sách...</p>
                                        </div>
                                    ) : users.length === 0 ? (
                                        <div className="text-center py-20 text-slate-400 italic">Không có người dùng nào</div>
                                    ) : (
                                        users.map((user) => (
                                            <div
                                                key={user._id}
                                                className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--cn-border)] hover:bg-slate-50 transition-colors cursor-pointer ${selectedUsers.has(user._id) ? 'bg-blue-50/50' : ''}`}
                                                onClick={() => handleToggleUser(user._id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(user._id)}
                                                    onChange={(e) => { e.stopPropagation(); handleToggleUser(user._id); }}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                                />
                                                <Avatar className="w-9 h-9 border border-white shadow-sm">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                                                        {user.fullName?.charAt(0) || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{user.fullName || 'Người dùng'}</p>
                                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-tighter">
                                                    {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'GV' : 'HS'}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4">
                                    <p className="text-xs text-slate-400">Trang {page} / {totalPages}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={16} /></button>
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {}
                    <div className="space-y-4">
                        <div className="bg-[var(--cn-bg-card)] rounded-2xl border border-[var(--cn-border)] p-6 shadow-sm">
                            <h2 className="font-bold text-[var(--cn-text-main)] flex items-center gap-2 mb-6 text-lg">
                                <Send className="w-5 h-5 text-blue-500" />
                                Soạn thảo nội dung
                            </h2>

                            <div className="space-y-5">
                                <CustomInput
                                    label="Tiêu đề Email"
                                    placeholder="Nhập tiêu đề hấp dẫn..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    error={subjectError}
                                    required
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        Nội dung Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                                        <CustomEditor ref={editorRef} />
                                    </div>
                                    {contentError && <p className="text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {contentError}</p>}
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        <b>Lưu ý:</b> Hệ thống sẽ gửi email đến <b>{selectedUsers.size}</b> hộp thư. Hành động này không thể thu hồi. Vui lòng kiểm tra kỹ nội dung và danh sách người nhận.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <CustomButton
                                        onClick={handleSendMail}
                                        loading={sending}
                                        disabled={selectedUsers.size === 0 || !subject.trim()}
                                        className="w-full py-6 rounded-2xl shadow-lg shadow-blue-200"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Gửi ngay bây giờ
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
