'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Link21, Heart, Warning2, TickCircle, ArrowRight2, TickSquare, AddSquare as Square } from 'iconsax-react';
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
    const [lastCheckedAlias, setLastCheckedAlias] = useState('');
    const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);

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

    const handleAliasChange = (value: string) => {
        setValue('customAlias', value);
        if (aliasState !== 'idle') {
            setAliasState('idle');
            setLastCheckedAlias('');
        }
    };

    const handleCheckAlias = async () => {
        const alias = customAlias.trim();
        if (alias.length < 3) {
            toast.warning('Alias phải có ít nhất 3 ký tự');
            return;
        }
        setAliasState('checking');
        setLastCheckedAlias(alias);
        try {
            const available = await shortlinkApi.checkAlias(alias);
            setAliasState(available ? 'available' : 'taken');
        } catch {
            setAliasState('idle');
            toast.error('Không thể kiểm tra alias');
        }
    };

    const onSubmit = async (data: FormData) => {
        const alias = data.customAlias?.trim();

        if (data.useCustom && alias) {
            if (alias !== lastCheckedAlias) {
                toast.warning('Vui lòng kiểm tra alias trước khi tạo');
                return;
            }
            if (aliasState !== 'available') {
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
            setLastCheckedAlias('');
            toast.success('Tạo link rút gọn thành công!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Tạo link thất bại');
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* URL gốc */}
                <div className="flex flex-col gap-2">
                    <label className="uppercase text-sm font-medium text-gray-700 dark:text-gray-300">
                        Đường dẫn gốc
                    </label>
                    <div className="relative">
                        <Link21
                            size={16}
                            variant="Outline"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            {...register('originalUrl')}
                            type="text"
                            placeholder="https://example.com/duong-dan-rat-dai"
                            className="w-full pl-9 pr-4 py-2.5 rounded-[8px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-main focus:ring-2 focus:ring-main/20 outline-none transition-all text-sm"
                        />
                    </div>
                    {errors.originalUrl && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <Warning2 size={12} variant="Bold" />
                            {errors.originalUrl.message}
                        </p>
                    )}
                </div>

                {/* Tùy chỉnh button */}
                <button
                    type="button"
                    onClick={() => {
                        setValue('useCustom', !useCustom);
                        if (useCustom) {
                            setAliasState('idle');
                            setLastCheckedAlias('');
                        }
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-main transition-colors"
                >
                    {useCustom
                        ? <TickSquare size={18} variant="Bold" className="text-main" />
                        : <Square size={18} variant="Outline" className="text-gray-400 dark:text-gray-500" />
                    }
                    Tùy chỉnh đường dẫn
                    <Heart size={14} variant="Bold" className="text-main" />
                </button>

                {/* Custom alias */}
                {useCustom && (
                    <div className="flex flex-col gap-2">
                        <label className="uppercase text-sm font-medium text-gray-700 dark:text-gray-300">
                            Miền tùy chỉnh
                        </label>
                        <div className="flex gap-2">
                            <div
                                className={`flex-1 flex rounded-[8px] border overflow-hidden transition-colors ${aliasState === 'taken'
                                    ? 'border-red-400 dark:border-red-600'
                                    : aliasState === 'available'
                                        ? 'border-green-400 dark:border-green-600'
                                        : 'border-gray-200 dark:border-gray-700 focus-within:border-main'
                                    }`}
                            >
                                <span className="flex items-center px-3 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 border-r border-inherit whitespace-nowrap">
                                    cncode.io.vn/s/
                                </span>
                                <input
                                    type="text"
                                    value={customAlias}
                                    onChange={(e) => handleAliasChange(e.target.value)}
                                    placeholder="alias-cua-ban"
                                    className="flex-1 px-3 py-2.5 outline-none bg-white dark:bg-gray-900 text-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleCheckAlias}
                                disabled={aliasState === 'checking'}
                                className="px-4 py-2 rounded-[8px] border border-main text-main text-sm font-medium hover:bg-main/5 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {aliasState === 'checking' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    'Kiểm tra'
                                )}
                            </button>
                        </div>
                        {aliasState === 'taken' && (
                            <p className="flex items-center gap-1 text-xs text-red-500">
                                <Warning2 size={12} variant="Bold" />
                                Miền đã được sử dụng
                            </p>
                        )}
                        {aliasState === 'available' && (
                            <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <TickCircle size={12} variant="Bold" />
                                Miền có thể sử dụng
                            </p>
                        )}
                    </div>
                )}

                {/* Expiry */}
                <div className="flex flex-col gap-2">
                    <label className="uppercase text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hết hạn sau{' '}
                        <span className="font-normal text-gray-400">(ngày, để trống = vĩnh viễn)</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        {...register('expiresInDays')}
                        placeholder="Ví dụ: 30"
                        className="w-full px-4 py-2.5 rounded-[8px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-main focus:ring-2 focus:ring-main/20 outline-none transition-all text-sm"
                    />
                    {errors.expiresInDays && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <Warning2 size={12} variant="Bold" />
                            {errors.expiresInDays.message}
                        </p>
                    )}
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-main text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="p-4 rounded-[8px] border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 space-y-3">
                    <div className="flex items-center gap-2">
                        <TickCircle size={16} className="text-green-600" variant="Bold" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            Link đã tạo thành công!
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3 rounded-[8px] bg-white dark:bg-gray-900 border border-green-100 dark:border-green-800">
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