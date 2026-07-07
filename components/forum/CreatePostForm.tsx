'use client';

import React, { useState, useRef } from 'react';
import { Image, Globe, Users, Lock, Settings, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { forumApi, IForumPost } from '@/lib/api/forum.api';
import { toast } from 'sonner';
import ForumImagePreview from './ForumImagePreview';

interface CreatePostFormProps {
    onPostCreated?: (newPost: IForumPost) => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
    const { user, token } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() && images.length === 0) {
            toast.error('Vui lòng nhập nội dung hoặc thêm ảnh');
            return;
        }

        if (!token) {
            toast.error('Bạn cần đăng nhập để đăng bài');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await forumApi.createPost(
                {
                    content,
                    images,
                    privacy,
                },
                token
            );

            toast.success('Đăng bài thành công');
            setContent('');
            setImages([]);
            setShowModal(false);
            onPostCreated?.(result.data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi đăng bài';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!token) {
            toast.error('Bạn cần đăng nhập để tải ảnh');
            return;
        }

        setIsUploading(true);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const reader = new FileReader();
                return new Promise<string>((resolve, reject) => {
                    reader.onload = () => {
                        const base64 = reader.result as string;

                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ image: base64, folder: 'forum' }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                if (data.success) {
                                    resolve(data.data.url);
                                } else {
                                    reject(new Error(data.message || 'Upload failed'));
                                }
                            })
                            .catch(reject);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            setImages((prev) => [...prev, ...uploadedUrls]);
            toast.success('Tải ảnh thành công');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải ảnh';
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }
        }
    };

    const privacyOptions = [
        { value: 'public', label: 'Công khai', icon: Globe },
        { value: 'friends', label: 'Bạn bè', icon: Users },
        { value: 'private', label: 'Chỉ mình tôi', icon: Lock },
    ];

    const togglePrivacy = () => {
        const currentIndex = privacyOptions.findIndex(opt => opt.value === privacy);
        const nextIndex = (currentIndex + 1) % privacyOptions.length;
        setPrivacy(privacyOptions[nextIndex].value as 'public' | 'friends' | 'private');
    };

    const currentPrivacyOption = privacyOptions.find(opt => opt.value === privacy);
    const CurrentPrivacyIcon = currentPrivacyOption?.icon;

    return (
        <>
            {/* Simple trigger input */}
            <div
                onClick={() => setShowModal(true)}
                className="bg-[var(--cn-bg-card)] rounded-2xl shadow-sm border border-[var(--cn-border)] p-3 sm:p-4 mb-4 cursor-pointer hover:bg-[var(--cn-bg-section)] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="text-sm sm:text-base font-bold bg-[var(--cn-primary)] text-white">
                            {user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-[var(--cn-bg-section)] rounded-full px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-500">
                        {user?.fullName}, hôm nay bạn nghĩ gì?
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-[var(--cn-border)]">
                            <h3 className="text-lg font-semibold">Tạo bài đăng</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-[var(--cn-bg-section)] rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start gap-3 mb-4">
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="text-sm font-bold bg-[var(--cn-primary)] text-white">
                                        {user?.fullName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">{user?.fullName}</div>
                                    <div className="text-xs text-gray-500">Đang nghĩ gì...</div>
                                </div>
                            </div>

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Bạn đang nghĩ gì?"
                                className="w-full min-h-[120px] bg-transparent border-none resize-none focus:outline-none text-sm placeholder:text-gray-400"
                                rows={5}
                            />

                            {/* Image previews */}
                            {images.length > 0 && (
                                <div className="mb-4">
                                    {images.length === 1 && (
                                        <div className="relative w-full h-[300px] rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(0); setShowImagePreview(true); }}>
                                            <img src={images[0]} alt="Upload 1" className="w-full h-full object-cover" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveImage(0);
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    )}
                                    {images.length === 2 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {images.map((img, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(index); setShowImagePreview(true); }}>
                                                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveImage(index);
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {images.length === 3 && (
                                        <div className="space-y-2">
                                            <div className="relative w-full h-[200px] rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(0); setShowImagePreview(true); }}>
                                                <img src={images[0]} alt="Upload 1" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(0);
                                                    }}
                                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {images.slice(1).map((img, index) => (
                                                    <div key={index + 1} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(index + 1); setShowImagePreview(true); }}>
                                                        <img src={img} alt={`Upload ${index + 2}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage(index + 1);
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {images.length === 4 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {images.map((img, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(index); setShowImagePreview(true); }}>
                                                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveImage(index);
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {images.length === 5 && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                {images.slice(0, 2).map((img, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(index); setShowImagePreview(true); }}>
                                                        <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage(index);
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {images.slice(2).map((img, index) => (
                                                    <div key={index + 2} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(index + 2); setShowImagePreview(true); }}>
                                                        <img src={img} alt={`Upload ${index + 3}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage(index + 2);
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {images.length >= 6 && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                {images.slice(0, 2).map((img, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(index); setShowImagePreview(true); }}>
                                                        <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage(index);
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {images.slice(2, 4).map((img, index) => (
                                                    <div key={index + 2} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(index + 2); setShowImagePreview(true); }}>
                                                        <img src={img} alt={`Upload ${index + 3}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage(index + 2);
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <div key={4} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(4); setShowImagePreview(true); }}>
                                                    <img src={images[4]} alt="Upload 5" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <span className="text-white font-semibold text-lg">+{images.length - 5}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveImage(4);
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Image preview modal */}
                            <ForumImagePreview
                                images={images}
                                initialIndex={previewIndex}
                                isOpen={showImagePreview}
                                onClose={() => setShowImagePreview(false)}
                            />

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 pt-3 border-t border-[var(--cn-border)]">
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--cn-bg-section)] transition-colors text-sm text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                                    ) : (
                                        <Image className="w-5 h-5 text-green-500" />
                                    )}
                                    <span>Ảnh</span>
                                </button>

                                {/* Privacy toggle */}
                                <button
                                    type="button"
                                    onClick={togglePrivacy}
                                    className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--cn-bg-section)] transition-colors text-sm text-gray-600 dark:text-gray-400"
                                >
                                    {CurrentPrivacyIcon && <CurrentPrivacyIcon className="w-5 h-5" />}
                                    <span>{currentPrivacyOption?.label}</span>
                                </button>
                            </div>

                            {/* Submit button */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full mt-3 px-6 py-3 bg-[var(--cn-primary)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang đăng...' : 'Đăng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
