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

    // Auto-check alias with debounce
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
                    <label className="uppercase text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400">
                        Đường dẫn gốc
                    </label>
                    <div className="relative">
                        <Link21
                            size={15}
                            variant="Outline"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <input
                            {...register('originalUrl')}
                            type="text"
                            inputMode="url"
                            autoCapitalize="none"
                            autoCorrect="off"
                            placeholder="https://example.com/duong-dan-rat-dai"
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-main focus:ring-2 focus:ring-main/20 outline-none transition-all text-sm"
                        />
                    </div>
                    {errors.originalUrl && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <Warning2 size={12} variant="Bold" />
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
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-main transition-colors active:scale-95"
                >
                    {useCustom
                        ? <TickSquare size={18} variant="Bold" className="text-main" />
                        : <Square size={18} variant="Outline" className="text-gray-400 dark:text-gray-500" />
                    }
                    Tùy chỉnh đường dẫn
                    <Heart size={13} variant="Bold" className="text-main" />
                </button>

                {/* Custom alias */}
                {useCustom && (
                    <div className="flex flex-col gap-1.5">
                        <label className="uppercase text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400">
                            Alias tùy chỉnh
                        </label>
                        <div
                            className={`flex rounded-xl border overflow-hidden transition-colors ${aliasState === 'taken'
                                ? 'border-red-400 dark:border-red-600'
                                : aliasState === 'available'
                                    ? 'border-green-400 dark:border-green-600'
                                    : 'border-gray-200 dark:border-gray-700 focus-within:border-main'
                                }`}
                        >
                            <span className="flex items-center px-2.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 border-r border-inherit whitespace-nowrap shrink-0">
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
                                    className="w-full px-3 py-3 pr-8 outline-none bg-white dark:bg-gray-900 text-sm"
                                />
                                {/* Inline status indicator */}
                                {aliasState === 'checking' && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
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
                                <Warning2 size={11} variant="Bold" />
                                Alias này đã được sử dụng
                            </p>
                        )}
                        {aliasState === 'available' && (
                            <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <TickCircle size={11} variant="Bold" />
                                Alias có thể sử dụng
                            </p>
                        )}
                        {customAlias.trim().length > 0 && customAlias.trim().length < 3 && aliasState === 'idle' && (
                            <p className="flex items-center gap-1 text-xs text-gray-400">
                                Cần ít nhất 3 ký tự
                            </p>
                        )}
                    </div>
                )}

                {/* Expiry */}
                <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400">
                        Hết hạn sau{' '}
                        <span className="font-normal text-gray-400 normal-case">(ngày, để trống = vĩnh viễn)</span>
                    </label>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        {...register('expiresInDays')}
                        placeholder="Ví dụ: 30"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-main focus:ring-2 focus:ring-main/20 outline-none transition-all text-sm"
                    />
                    {errors.expiresInDays && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <Warning2 size={12} variant="Bold" />
                            {errors.expiresInDays.message}
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isCreating || (useCustom && aliasState === 'checking')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-main text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 space-y-3">
                    <div className="flex items-center gap-2">
                        <TickCircle size={15} className="text-green-600 shrink-0" variant="Bold" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            Link đã tạo thành công!
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-green-100 dark:border-green-800">
                        <a
                            href={createdLink.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-main hover:underline truncate"
                        >
                            {createdLink.shortUrl}
                        </a>
                        <CopyButton text={createdLink.shortUrl} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Gốc: {createdLink.originalUrl}
                    </p>
                </div>
            )}
        </div>
    );
}