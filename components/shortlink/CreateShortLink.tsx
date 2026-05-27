
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Link21, Heart, Warning2, TickCircle, TickSquare, AddSquare as Square } from 'iconsax-react';
import { Loader2 } from 'lucide-react';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { useShortLinkStore } from '@/store/shortlink.store';
import { CopyButton } from '@/components/common/CopyButton';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import type { ShortLink } from '@/types/shortlink.type';

type AliasState = 'idle' | 'checking' | 'available' | 'taken';

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

export function CreateShortLink() {
    const [aliasState, setAliasState] = useState<AliasState>('idle');
    const [checkedAlias, setCheckedAlias] = useState('');
    const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);
    const [originalUrl, setOriginalUrl] = useState('');
    const [originalUrlError, setOriginalUrlError] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [customAlias, setCustomAlias] = useState('');
    const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
    const [isCheckingAlias, setIsCheckingAlias] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { createLink, isCreating } = useShortLinkStore();

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

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

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
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [customAlias, useCustom, checkAliasAvailability]);

    const validateOriginalUrl = (url: string) => {
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

    const handleOriginalUrlChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setOriginalUrl(value);
        validateOriginalUrl(value);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setExpiresInDays(value ? Number(value) : undefined);
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

        try {
            const link = await createLink({
                originalUrl: normalizedUrl,
                customAlias: useCustom && customAlias.trim() ? customAlias.trim() : undefined,
                expiresInDays: expiresInDays,
            });
            setCreatedLink(link);

            setOriginalUrl('');
            setCustomAlias('');
            setExpiresInDays(undefined);
            setUseCustom(false);
            setAliasState('idle');
            setCheckedAlias('');
            toast.success('Tạo link rút gọn thành công!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Tạo link thất bại');
        }
    };

    const isSubmitting = isCreating || isCheckingAlias;

    return (
        <div className="space-y-5">
            <div className="space-y-4">
                { }
                <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-xs font-semibold tracking-wide text-[var(--cn-text-sub)]">
                        Đường dẫn gốc
                    </label>
                    <CustomInput
                        value={originalUrl}
                        onChange={handleOriginalUrlChange}
                        type="text"
                        placeholder="https://example.com/duong-dan-rat-dai"
                        error={originalUrlError}
                        icon={<Link21 size={15} variant="Outline" />}
                    />
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
                    className="flex items-center gap-2 text-sm font-medium text-[var(--cn-text-sub)] hover:text-[var(--cn-primary)] transition-colors active:scale-95"
                >
                    {useCustom
                        ? <TickSquare size={18} variant="Bold" className="text-[var(--cn-primary)]" />
                        : <Square size={18} variant="Outline" className="text-[var(--cn-text-muted)]" />
                    }
                    Tùy chỉnh đường dẫn
                    <Heart size={13} variant="Bold" className="text-[var(--cn-primary)]" />
                </button>

                { }
                {useCustom && (
                    <div className="flex flex-col gap-1.5">
                        <label className="uppercase text-xs font-semibold tracking-wide text-[var(--cn-text-sub)]">
                            Alias tùy chỉnh
                        </label>
                        <div className="relative">
                            <div className="flex">
                                <div className="flex items-center px-4 py-2.5 rounded-l-[var(--cn-radius-sm)] border border-r-0 border-[var(--cn-border)] bg-[var(--cn-bg-section)] text-sm text-[var(--cn-text-muted)] whitespace-nowrap">
                                    cncode.io.vn/s/
                                </div>
                                <input
                                    type="text"
                                    value={customAlias}
                                    onChange={(e) => setCustomAlias(e.target.value)}
                                    placeholder="alias-cua-ban"
                                    className={`
                                        w-full px-4 py-2.5 bg-[var(--cn-bg-card)] text-sm text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] outline-none
                                        rounded-r-[var(--cn-radius-sm)] border border-l-0 border-[var(--cn-border)]
                                        focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20
                                        transition-all duration-200
                                        ${aliasState === 'taken' ? 'border-red-400 focus:border-red-400' : ''}
                                        ${aliasState === 'available' ? 'border-green-400 focus:border-green-400' : ''}
                                    `}
                                />
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {aliasState === 'checking' && (
                                    <Loader2 size={16} className="animate-spin text-[var(--cn-text-muted)]" />
                                )}
                                {aliasState === 'available' && (
                                    <TickCircle size={16} variant="Bold" className="text-green-500" />
                                )}
                                {aliasState === 'taken' && (
                                    <Warning2 size={16} variant="Bold" className="text-red-500" />
                                )}
                            </div>
                        </div>
                        {aliasState === 'taken' && (
                            <p className="flex items-center gap-1 text-xs text-red-500">
                                <Warning2 size={11} variant="Outline" />
                                Alias này đã được sử dụng
                            </p>
                        )}
                        {aliasState === 'available' && (
                            <p className="flex items-center gap-1 text-xs text-green-600">
                                <TickCircle size={11} variant="Bold" />
                                Alias có thể sử dụng
                            </p>
                        )}
                        {customAlias.trim().length > 0 && customAlias.trim().length < 3 && aliasState === 'idle' && (
                            <p className="flex items-center gap-1 text-xs text-[var(--cn-text-muted)]">
                                Cần ít nhất 3 ký tự
                            </p>
                        )}
                    </div>
                )}

                { }
                <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-xs font-semibold tracking-wide text-[var(--cn-text-sub)]">
                        Hết hạn sau{' '}
                        <span className="font-normal text-[var(--cn-text-muted)] normal-case">(ngày, để trống = vĩnh viễn)</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={expiresInDays || ''}
                        onChange={handleExpiryChange}
                        placeholder="Ví dụ: 30"
                        className="w-full px-4 py-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] focus:outline-none focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 transition-all"
                    />
                </div>

                { }
                <CustomButton
                    onClick={handleSubmit}
                    variant="primary"
                    size="medium"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="mt-2"
                >
                    <Link21 size={16} variant="Bold" />
                    Tạo link rút gọn
                </CustomButton>
            </div>

            { }
            {createdLink && (
                <div className="p-4 rounded-[var(--cn-radius-md)] border border-green-200 bg-green-50 space-y-3">
                    <div className="flex items-center gap-2">
                        <TickCircle size={15} variant="Bold" className="text-green-600 shrink-0" />
                        <span className="text-sm font-semibold text-green-700">
                            Link đã tạo thành công!
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--cn-radius-md)] bg-white border border-green-100">
                        <a
                            href={createdLink.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[var(--cn-primary)] hover:underline truncate"
                        >
                            {createdLink.shortUrl}
                        </a>
                        <CopyButton text={createdLink.shortUrl} />
                    </div>
                    <p className="text-xs text-[var(--cn-text-muted)] truncate">
                        Gốc: {createdLink.originalUrl}
                    </p>
                </div>
            )}
        </div>
    );
}
