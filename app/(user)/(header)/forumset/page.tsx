'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { userApi, type IUser } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomButton } from '@/components/custom/CustomButton';
import { uploadApi } from '@/lib/upload';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface StoreUser {
    _id: string;
    fullName: string;
    email: string;
    username?: string;
    role: 'user' | 'teacher' | 'admin';
    coins: number;
    streak: number;
    avatar?: string;
    lastActiveAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    class?: string;
    province?: string;
    school?: string;
    birthday?: string;
    bio?: string;
    requestedRole?: 'teacher' | null;
}

const toISOString = (value: Date | undefined): string =>
    value instanceof Date ? value.toISOString() : new Date().toISOString();

const storeUserToIUser = (u: StoreUser): IUser => ({
    _id: u._id,
    fullName: u.fullName,
    email: u.email,
    username: u.username,
    role: u.role,
    coins: u.coins,
    streak: u.streak,
    avatar: u.avatar,
    class: u.class,
    province: u.province,
    school: u.school,
    birthday: u.birthday,
    bio: u.bio,
    requestedRole: u.requestedRole ?? null,
    isOnboarded: true,
    lastActiveAt: toISOString(u.lastActiveAt),
    createdAt: toISOString(u.createdAt),
    updatedAt: toISOString(u.updatedAt),
});

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export default function ForumsetPage() {
    const { token, user: rawStoreUser, setUser } = useAuthStore();
    const storeUser = rawStoreUser as unknown as StoreUser | null;

    const [user, setUserState] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const hasFetched = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');

    const fetchUserProfile = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await userApi.getProfile(token);
            if (response.success && response.data) {
                setUserState(response.data);
                setFullName(response.data.fullName || '');
                setBio(response.data.bio || '');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token && !hasFetched.current) {
            hasFetched.current = true;
            fetchUserProfile();
        }
    }, [token, fetchUserProfile]);

    useEffect(() => {
        if (!storeUser || !user) return;
        const converted = storeUserToIUser(storeUser);
        if (converted.fullName !== user.fullName || converted.bio !== user.bio) {
            setUserState(converted);
            setFullName(converted.fullName || '');
            setBio(converted.bio || '');
        }
    }, [storeUser, user]);

    const handleAvatarUpload = async (file: File) => {
        if (!token) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        try {
            const base64 = await fileToBase64(file);
            const fullBase64 = `data:${file.type};base64,${base64}`;

            const result = await uploadApi.uploadImage(fullBase64, 'avatars');

            if (result.success && result.messageId) {
                const updateResult = await userApi.updateProfile({ avatar: result.messageId }, token);

                if (updateResult.success && updateResult.data) {
                    setUserState(updateResult.data);
                    if (rawStoreUser) {
                        setUser({
                            ...rawStoreUser,
                            avatar: result.messageId,
                        });
                    }
                    toast.success('Cập nhật avatar thành công');
                } else {
                    toast.error(updateResult.message || 'Không thể cập nhật avatar');
                }
            } else {
                toast.error(result.message || 'Upload avatar thất bại');
            }
        } catch (error) {
            console.error('Upload avatar error:', error);
            toast.error('Có lỗi xảy ra khi upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setSaving(true);
            const response = await userApi.updateProfile({
                fullName,
                bio,
            }, token);
            if (response.success && response.data) {
                setUserState(response.data);
                setFullName(response.data.fullName || '');
                setBio(response.data.bio || '');
                if (rawStoreUser) {
                    setUser({
                        ...rawStoreUser,
                        fullName: response.data.fullName,
                    });
                }
                toast.success('Cập nhật thông tin thành công');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const currentUser: IUser | null = user ?? (storeUser ? storeUserToIUser(storeUser) : null);

    if (!currentUser) return null;

    return (
        <div className="flex items-start lg:items-center justify-center min-h-full p-6">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cài đặt hồ sơ</h1>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--cn-bg-card)] ring-4 ring-[var(--cn-border)] flex items-center justify-center">
                                {currentUser.avatar ? (
                                    <img
                                        src={getImageUrl(currentUser.avatar)}
                                        alt={currentUser.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="bg-[var(--cn-primary)] text-white text-2xl w-full h-full flex items-center justify-center">
                                        {currentUser.fullName?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--cn-primary)] text-white flex items-center justify-center hover:bg-[var(--cn-primary-hover)] transition-colors shadow-lg disabled:opacity-50"
                            >
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAvatarUpload(file);
                                }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Nhấn để thay đổi avatar</p>
                    </div>

                    {/* Name */}
                    <div>
                        <CustomInput
                            label="Họ và tên"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <CustomTextarea
                            label="Giới thiệu bản thân"
                            value={bio}
                            onChange={(value: string) => setBio(value)}
                            placeholder="Chia sẻ một chút về bản thân..."
                            rows={4}
                            maxLength={500}
                        />
                    </div>

                    {/* Save Button */}
                    <CustomButton
                        type="submit"
                        variant="primary"
                        loading={saving}
                        disabled={saving}
                        fullWidth
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </CustomButton>
                </form>
            </div>
        </div>
    );
}
