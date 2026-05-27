
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Link2, Heart, AlertCircle, CheckCircle, Loader2, Calendar, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { useShortLinkStore } from '@/store/shortlink.store';

type AliasState = 'idle' | 'checking' | 'available' | 'taken';

interface CreateShortLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (link: { shortUrl: string; originalUrl: string }) => void;
}

function normalizeUrl(url: string): string | null {
    if (!url.trim()) return null;
    const withProtocol = /^https?:\/\//.test(url) ? url : `https://${url}`;
    try {
        new URL(withProtocol);
        return withProtocol;
    } catch {
        return null;
    }
}

export function CreateShortLinkModal({ isOpen, onClose, onSuccess }: CreateShortLinkModalProps) {
    const [aliasState, setAliasState] = useState<AliasState>('idle');
    const [checkedAlias, setCheckedAlias] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [originalUrlError, setOriginalUrlError] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [customAlias, setCustomAlias] = useState('');
    const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
    const [isCheckingAlias, setIsCheckingAlias] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { createLink } = useShortLinkStore();

    const checkAliasAvailability = useCallback(async (alias: string) => {
        if (!alias || alias.length < 3) {
            setAliasState('idle');
            setCheckedAlias('');
            setIsCheckingAlias(false);
            return;
        }

        setIsCheckingAlias(true);
        setAliasState('checking');

        try {
            const available = await shortlinkApi.checkAlias(alias);
            setAliasState(available ? 'available' : 'taken');
            setCheckedAlias(alias);
        } catch {
            setAliasState('idle');
            toast.error('Không thể kiểm tra alias');
        } finally {
            setIsCheckingAlias(false);
        }
    }, []);

    useEffect(() => {
        if (!useCustom) return;

        const alias = customAlias.trim();

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (alias.length === 0) {
            setAliasState('idle');
            setCheckedAlias('');
            return;
        }

        if (alias.length < 3) {
            setAliasState('idle');
            return;
        }

        setAliasState('checking');

        debounceRef.current = setTimeout(() => {
            checkAliasAvailability(alias);
        }, 600);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [customAlias, useCustom, checkAliasAvailability]);

    const validateOriginalUrl = (url: string): boolean => {
        if (!url.trim()) {
            setOriginalUrlError('Vui lòng nhập URL');
            return false;
        }
        const normalized = normalizeUrl(url);
        if (!normalized) {
            setOriginalUrlError('URL không hợp lệ');
            return false;
        }
        setOriginalUrlError('');
        return true;
    };

    const handleOriginalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOriginalUrl(value);
        validateOriginalUrl(value);
    };

    const handleSubmit = async () => {
        if (!originalUrl.trim()) {
            setOriginalUrlError('Vui lòng nhập URL');
            toast.error('Vui lòng nhập URL');
            return;
        }

        const normalizedUrl = normalizeUrl(originalUrl);
        if (!normalizedUrl) {
            setOriginalUrlError('URL không hợp lệ');
            toast.error('URL không hợp lệ');
            return;
        }

        if (useCustom && customAlias.trim()) {
            if (isCheckingAlias || aliasState === 'checking') {
                toast.warning('Đang kiểm tra alias, vui lòng chờ...');
                return;
            }
            if (customAlias !== checkedAlias || aliasState !== 'available') {
                toast.error('Alias này không khả dụng');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const link = await createLink({
                originalUrl: normalizedUrl,
                customAlias: useCustom && customAlias.trim() ? customAlias.trim() : undefined,
                expiresInDays: expiresInDays,
            });

            toast.success('Tạo link rút gọn thành công!');
            onSuccess?.({
                shortUrl: link.shortUrl,
                originalUrl: link.originalUrl,
            });

            setOriginalUrl('');
            setCustomAlias('');
            setExpiresInDays(undefined);
            setUseCustom(false);
            setAliasState('idle');
            setCheckedAlias('');
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Tạo link thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl w-full max-w-lg shadow-2xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                { }
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Tạo link rút gọn</h2>
                            <p className="text-xs text-gray-400">Tạo đường dẫn ngắn gọn để chia sẻ</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                { }
                <div className="p-5 space-y-5">
                    { }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Đường dẫn gốc <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Globe className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={originalUrl}
                                onChange={handleOriginalUrlChange}
                                placeholder="https://example.com/duong-dan-rat-dai"
                                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${originalUrlError ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                                    } bg-gray-50 focus:ring-2 focus:ring-blue-400/20 outline-none text-sm transition-all text-gray-700 placeholder:text-gray-400`}
                            />
                        </div>
                        {originalUrlError && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={11} />
                                {originalUrlError}
                            </p>
                        )}
                    </div>

                    { }
                    <button
                        type="button"
                        onClick={() => {
                            setUseCustom(!useCustom);
                            if (useCustom) {
                                setCustomAlias('');
                                setAliasState('idle');
                                setCheckedAlias('');
                            }
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors"
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${useCustom ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                            }`}>
                            {useCustom && <div className="w-2 h-2 rounded-sm bg-white" />}
                        </div>
                        Tùy chỉnh đường dẫn
                        <Heart size={12} className="text-blue-400" />
                    </button>

                    { }
                    {useCustom && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Alias tùy chỉnh
                            </label>
                            <div className="relative">
                                <div className="flex">
                                    <div className="flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-sm text-gray-500 whitespace-nowrap">
                                        cncode.io.vn/s/
                                    </div>
                                    <input
                                        type="text"
                                        value={customAlias}
                                        onChange={(e) => setCustomAlias(e.target.value)}
                                        placeholder="alias-cua-ban"
                                        className={`
                                            w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-700 
                                            placeholder:text-gray-400 outline-none
                                            rounded-r-lg border border-l-0 border-gray-200
                                            focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                                            transition-all duration-200
                                            ${aliasState === 'taken' ? 'border-red-400 focus:border-red-400' : ''}
                                            ${aliasState === 'available' ? 'border-green-400 focus:border-green-400' : ''}
                                        `}
                                    />
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {aliasState === 'checking' && (
                                        <Loader2 size={16} className="animate-spin text-gray-400" />
                                    )}
                                    {aliasState === 'available' && (
                                        <CheckCircle size={16} className="text-green-500" />
                                    )}
                                    {aliasState === 'taken' && (
                                        <AlertCircle size={16} className="text-red-500" />
                                    )}
                                </div>
                            </div>
                            {aliasState === 'taken' && (
                                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                    <AlertCircle size={11} />
                                    Alias này đã được sử dụng
                                </p>
                            )}
                            {aliasState === 'available' && (
                                <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                    <CheckCircle size={11} />
                                    Alias có thể sử dụng
                                </p>
                            )}
                            {customAlias.trim().length > 0 && customAlias.trim().length < 3 && aliasState === 'idle' && (
                                <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                    Cần ít nhất 3 ký tự
                                </p>
                            )}
                        </div>
                    )}

                    { }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Calendar size={14} className="inline mr-1 text-gray-400" />
                            Hết hạn sau (ngày)
                            <span className="text-gray-400 font-normal ml-1">(để trống = vĩnh viễn)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={1}
                                max={365}
                                value={expiresInDays || ''}
                                onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="Ví dụ: 30"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Sparkles size={10} />
                            Để trống nếu muốn link tồn tại vĩnh viễn
                        </p>
                    </div>
                </div>

                { }
                <div className="flex gap-3 p-5 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !!originalUrlError || !originalUrl.trim()}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Link2 size={16} />
                        {isSubmitting ? 'Đang tạo...' : 'Tạo link rút gọn'}
                    </button>
                </div>
            </div>
        </div>
    );
}
