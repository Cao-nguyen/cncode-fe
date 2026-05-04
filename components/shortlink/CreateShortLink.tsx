// components/shortlink/CreateShortLink.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Link21, Heart, Warning2, TickCircle, TickSquare, AddSquare as Square } from 'iconsax-react';
import { Loader2 } from 'lucide-react';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { useShortLinkStore } from '@/store/shortlink.store';
import { CopyButton } from '@/components/common/CopyButton';
import type { ShortLink } from '@/types/shortlink.type';

type AliasState = 'idle' | 'checking' | 'available' | 'taken';

function normalizeUrl(url: string): string | null {
    if (!url.trim()) return null;
    const withProtocol = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    try {
        new URL(withProtocol);
        return withProtocol;
    } catch {
        return null;
    }
}

const schema = z.object({
    originalUrl: z
        .string()
        .min(1, 'Vui lòng nhập URL')
        .refine((v) => !!normalizeUrl(v), { message: 'URL không hợp lệ' }),
    useCustom: z.boolean().default(false),
    customAlias: z.string().optional(),
    expiresInDays: z.preprocess(
        (v) => (v === '' || v === undefined ? undefined : Number(v)),
        z.number().int().min(1, 'Tối thiểu 1 ngày').optional()
    ),
});

type FormData = z.infer<typeof schema>;

export function CreateShortLink() {
    const [aliasState, setAliasState] = useState<AliasState>('idle');
    const [checkedAlias, setCheckedAlias] = useState('');
    const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { createLink, isCreating } = useShortLinkStore();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { originalUrl: '', useCustom: false, customAlias: '', expiresInDays: undefined },
    });

    const useCustom = watch('useCustom');
    const customAlias = watch('customAlias') ?? '';

    useEffect(() => {
        if (!useCustom) return;

        const alias = customAlias.trim();

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

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const available = await shortlinkApi.checkAlias(alias);
                setAliasState(available ? 'available' : 'taken');
                setCheckedAlias(alias);
            } catch {
                setAliasState('idle');
                toast.error('Không thể kiểm tra alias');
            }
        }, 600);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [customAlias, useCustom]);

    const onSubmit = async (data: FormData) => {
        const alias = data.customAlias?.trim();

        if (data.useCustom && alias) {
            if (aliasState === 'checking') {
                toast.warning('Đang kiểm tra alias, vui lòng chờ...');
                return;
            }
            if (alias !== checkedAlias || aliasState !== 'available') {
                toast.error('Alias này không khả dụng');
                return;
            }
        }

        const normalizedUrl = normalizeUrl(data.originalUrl);
        if (!normalizedUrl) {
            toast.error('URL không hợp lệ');
            return;
        }

        try {
            const link = await createLink({
                originalUrl: normalizedUrl,
                customAlias: data.useCustom && alias ? alias : undefined,
                expiresInDays: data.expiresInDays,
            });
            setCreatedLink(link);
            reset();
            setAliasState('idle');
            setCheckedAlias('');
            toast.success('Tạo link rút gọn thành công!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Tạo link thất bại');
        }
    };

    return (
        <div className="space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* URL gốc */}
                <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-xs font-semibold tracking-wide text-[var(--cn-text-sub)]">
                        Đường dẫn gốc
                    </label>
                    <div className="relative">
                        <Link21
                            size={15}
                            variant="Outline"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cn-text-muted)] pointer-events-none"
                        />
                        <input
                            {...register('originalUrl')}
                            type="text"
                            inputMode="url"
                            autoCapitalize="none"
                            autoCorrect="off"
                            placeholder="https://example.com/duong-dan-rat-dai"
                            className="w-full pl-9 pr-4 py-3 rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)] focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 outline-none transition-all text-sm text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)]"
                        />
                    </div>
                    {errors.originalUrl && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <Warning2 size={12} variant="Outline" />
                            {errors.originalUrl.message}
                        </p>
                    )}
                </div>

                {/* Toggle tùy chỉnh */}
                <button
                    type="button"
                    onClick={() => {
                        setValue('useCustom', !useCustom);
                        if (useCustom) {
                            setValue('customAlias', '');
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

                {/* Custom alias */}
                {useCustom && (
                    <div className="flex flex-col gap-1.5">
                        <label className="uppercase text-xs font-semibold tracking-wide text-[var(--cn-text-sub)]">
                            Alias tùy chỉnh
                        </label>
                        <div
                            className={`flex rounded-[var(--cn-radius-md)] border overflow-hidden transition-colors ${aliasState === 'taken'
                                ? 'border-red-400'
                                : aliasState === 'available'
                                    ? 'border-green-400'
                                    : 'border-[var(--cn-border)] focus-within:border-[var(--cn-primary)]'
                                }`}
                        >
                            <span className="flex items-center px-2.5 text-xs text-[var(--cn-text-muted)] bg-[var(--cn-bg-section)] border-r border-inherit whitespace-nowrap shrink-0">
                                cncode.io.vn/s/
                            </span>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    value={customAlias}
                                    onChange={(e) => setValue('customAlias', e.target.value)}
                                    placeholder="alias-cua-ban"
                                    className="w-full px-3 py-3 pr-8 outline-none bg-[var(--cn-bg-card)] text-sm text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)]"
                                />
                                {aliasState === 'checking' && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--cn-text-muted)]"
                                    />
                                )}
                                {aliasState === 'available' && (
                                    <TickCircle
                                        size={15}
                                        variant="Bold"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500"
                                    />
                                )}
                                {aliasState === 'taken' && (
                                    <Warning2
                                        size={15}
                                        variant="Bold"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500"
                                    />
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

                {/* Expiry */}
                <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-xs font-semibold tracking-wide text-[var(--cn-text-sub)]">
                        Hết hạn sau{' '}
                        <span className="font-normal text-[var(--cn-text-muted)] normal-case">(ngày, để trống = vĩnh viễn)</span>
                    </label>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        {...register('expiresInDays')}
                        placeholder="Ví dụ: 30"
                        className="w-full px-4 py-3 rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)] focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 outline-none transition-all text-sm text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)]"
                    />
                    {errors.expiresInDays && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <Warning2 size={12} variant="Outline" />
                            {errors.expiresInDays.message}
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isCreating || (useCustom && aliasState === 'checking')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--cn-radius-md)] bg-[var(--cn-primary)] text-white font-semibold transition-all hover:bg-[var(--cn-primary-hover)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isCreating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Đang tạo...
                        </>
                    ) : (
                        <>
                            <Link21 size={16} variant="Bold" />
                            Tạo link rút gọn
                        </>
                    )}
                </button>
            </form>

            {/* Result */}
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