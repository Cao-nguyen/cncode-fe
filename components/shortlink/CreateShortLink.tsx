
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Link21, Heart, Warning2, TickCircle, TickSquare, AddSquare as Square, ArrowDown2, InfoCircle, Clock } from 'iconsax-react';
import { Loader2, ChevronDown, Eye, EyeOff } from 'lucide-react';
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
    const [customAlias, setCustomAlias] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [expiryHour, setExpiryHour] = useState<number | undefined>(undefined);
    const [expiryMinute, setExpiryMinute] = useState<number | undefined>(undefined);
    const [expiryMode, setExpiryMode] = useState<'none' | 'custom'>('none');
    const [isCheckingAlias, setIsCheckingAlias] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [clickLimitMode, setClickLimitMode] = useState<'none' | 'custom'>('none');
    const [clickLimit, setClickLimit] = useState<number | undefined>(undefined);
    const [requirePassword, setRequirePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [geoRestrictVietnam, setGeoRestrictVietnam] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        if (!customAlias.trim()) return;

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
    }, [customAlias, checkAliasAvailability]);

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

        if (customAlias.trim()) {
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
            // Calculate expiresAt from expiryDate (days), expiryHour (hours) and expiryMinute (minutes)
            let expiresAt: string | undefined = undefined;
            if (expiryMode === 'custom') {
                const days = expiryDate ? parseInt(expiryDate) : 0;
                const hours = expiryHour !== undefined ? expiryHour : 0;
                const minutes = expiryMinute !== undefined ? expiryMinute : 0;

                if (days > 0 || hours > 0 || minutes > 0) {
                    const expiryDateObj = new Date();
                    expiryDateObj.setDate(expiryDateObj.getDate() + days);
                    expiryDateObj.setHours(expiryDateObj.getHours() + hours);
                    expiryDateObj.setMinutes(expiryDateObj.getMinutes() + minutes);
                    expiresAt = expiryDateObj.toISOString();
                }
            }

            const link = await createLink({
                originalUrl: normalizedUrl,
                customAlias: customAlias.trim() ? customAlias.trim() : undefined,
                expiresAt,
                clickLimit: clickLimitMode === 'custom' && clickLimit ? clickLimit : undefined,
                password: requirePassword && password.trim() ? password.trim() : undefined,
                geoRestrictVietnam: geoRestrictVietnam ? true : undefined,
            });
            setCreatedLink(link);

            setOriginalUrl('');
            setCustomAlias('');
            setExpiryDate('');
            setExpiryHour(undefined);
            setExpiryMinute(undefined);
            setAliasState('idle');
            setCheckedAlias('');
            setClickLimit(undefined);
            setClickLimitMode('none');
            setPassword('');
            setRequirePassword(false);
            setGeoRestrictVietnam(false);
            toast.success('Tạo link rút gọn thành công!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Tạo link thất bại');
        }
    };

    const isSubmitting = isCreating || isCheckingAlias;

    return (
        <div className="space-y-5">
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tạo link rút gọn
            </h2>

            <div className="space-y-4">
                {/* Original URL Input */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

                {/* Advanced Options Toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1 text-sm font-medium text-[var(--cn-primary)] hover:underline transition-colors"
                >
                    Tùy chọn nâng cao
                    <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
                    />
                </button>

                {showAdvanced && (
                    <div className="space-y-6">
                        {/* 1. Mã tùy chỉnh */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                1. Mã tùy chỉnh <span className="font-normal text-gray-500 dark:text-gray-400">(không bắt buộc)</span>
                            </label>
                            <div className="relative">
                                <div className="flex">
                                    <div className="flex items-center px-3 sm:px-4 py-2 rounded-l-[var(--cn-radius-sm)] border border-r-0 border-[var(--cn-border)] bg-[var(--cn-bg-section)] text-[12px] lg:text-[14px] text-[var(--cn-text-muted)] whitespace-nowrap">
                                        cncode.io.vn/s/
                                    </div>
                                    <input
                                        type="text"
                                        value={customAlias}
                                        onChange={(e) => setCustomAlias(e.target.value)}
                                        placeholder="tuy-chinh"
                                        className={`
                                            w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] text-[12px] lg:text-[14px] text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] outline-none
                                            rounded-r-[var(--cn-radius-sm)] border border-l-0 border-[var(--cn-border)]
                                            focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20
                                            transition-all duration-200
                                            ${aliasState === 'taken' ? 'border-[var(--cn-error)] focus:border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20' : ''}
                                            ${aliasState === 'available' ? 'border-[var(--cn-success)] focus:border-[var(--cn-success)] focus:ring-[var(--cn-success)]/20' : ''}
                                        `}
                                    />
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {aliasState === 'checking' && (
                                        <Loader2 size={16} className="animate-spin text-[var(--cn-text-muted)]" />
                                    )}
                                    {aliasState === 'available' && (
                                        <TickCircle size={16} variant="Bold" className="text-[var(--cn-success)]" />
                                    )}
                                    {aliasState === 'taken' && (
                                        <Warning2 size={16} variant="Bold" className="text-[var(--cn-error)]" />
                                    )}
                                </div>
                            </div>
                            {aliasState === 'taken' && (
                                <p className="flex items-center gap-1 text-xs text-red-500">
                                    <Warning2 size={11} variant="Outline" />
                                    Mã này đã được sử dụng
                                </p>
                            )}
                            {aliasState === 'available' && (
                                <p className="flex items-center gap-1 text-xs text-green-600">
                                    <TickCircle size={11} variant="Bold" />
                                    Mã khả dụng
                                </p>
                            )}
                            {customAlias.trim().length > 0 && customAlias.trim().length < 3 && aliasState === 'idle' && (
                                <p className="flex items-center gap-1 text-xs text-gray-500">
                                    Cần ít nhất 3 ký tự
                                </p>
                            )}
                        </div>

                        {/* 2. Thời gian hết hạn */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                2. Thời gian hết hạn
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="expiry"
                                        checked={expiryMode === 'none'}
                                        onChange={() => setExpiryMode('none')}
                                        className="w-4 h-4 text-[var(--cn-primary)] border-gray-300 focus:ring-[var(--cn-primary)]"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Không hết hạn</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="expiry"
                                        checked={expiryMode === 'custom'}
                                        onChange={() => setExpiryMode('custom')}
                                        className="w-4 h-4 text-[var(--cn-primary)] border-gray-300 focus:ring-[var(--cn-primary)]"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Chọn ngày giờ</span>
                                </label>
                            </div>
                            {expiryMode === 'custom' && (
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Ngày</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            placeholder="5"
                                            className="w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] text-[12px] lg:text-[14px] text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] focus:outline-none focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Giờ</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={23}
                                            value={expiryHour !== undefined ? expiryHour : ''}
                                            onChange={(e) => setExpiryHour(e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="2"
                                            className="w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] text-[12px] lg:text-[14px] text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] focus:outline-none focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Phút</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={expiryMinute !== undefined ? expiryMinute : ''}
                                            onChange={(e) => setExpiryMinute(e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="5"
                                            className="w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] text-[12px] lg:text-[14px] text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] focus:outline-none focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Giới hạn lượt truy cập */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                3. Giới hạn lượt truy cập
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="clickLimit"
                                        checked={clickLimitMode === 'none'}
                                        onChange={() => setClickLimitMode('none')}
                                        className="w-4 h-4 text-[var(--cn-primary)] border-gray-300 focus:ring-[var(--cn-primary)]"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Không giới hạn</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="clickLimit"
                                        checked={clickLimitMode === 'custom'}
                                        onChange={() => setClickLimitMode('custom')}
                                        className="w-4 h-4 text-[var(--cn-primary)] border-gray-300 focus:ring-[var(--cn-primary)]"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Giới hạn</span>
                                </label>
                            </div>
                            {clickLimitMode === 'custom' && (
                                <div className="mt-2">
                                    <div className="flex">
                                        <input
                                            type="number"
                                            min={1}
                                            value={clickLimit !== undefined ? clickLimit : ''}
                                            onChange={(e) => setClickLimit(e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="100"
                                            className="w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] text-[12px] lg:text-[14px] text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] outline-none
                                            rounded-l-[var(--cn-radius-sm)] border border-r-0 border-[var(--cn-border)]
                                            focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20
                                            transition-all duration-200"
                                        />
                                        <div className="flex items-center px-3 sm:px-4 py-2 rounded-r-[var(--cn-radius-sm)] border border-l-0 border-[var(--cn-border)] bg-[var(--cn-bg-section)] text-[12px] lg:text-[14px] text-[var(--cn-text-muted)] whitespace-nowrap">
                                            lượt
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Bảo mật */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                4. Bảo mật
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={requirePassword}
                                        onChange={(e) => setRequirePassword(e.target.checked)}
                                        className="w-4 h-4 text-[var(--cn-primary)] border-gray-300 focus:ring-[var(--cn-primary)] rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Yêu cầu mật khẩu</span>
                                    <div className="relative inline-block">
                                        <InfoCircle size={14} variant="Outline" className="text-[var(--cn-text-muted)] cursor-help" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                            Người dùng cần nhập mật khẩu để truy cập link
                                        </div>
                                    </div>
                                </label>
                                {requirePassword && (
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu"
                                            className="w-full pr-10 px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] text-[12px] lg:text-[14px] text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] focus:outline-none focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                )}
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={geoRestrictVietnam}
                                        onChange={(e) => setGeoRestrictVietnam(e.target.checked)}
                                        className="w-4 h-4 text-[var(--cn-primary)] border-gray-300 focus:ring-[var(--cn-primary)] rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Chỉ cho phép truy cập từ Việt Nam</span>
                                    <div className="relative inline-block">
                                        <InfoCircle size={14} variant="Outline" className="text-[var(--cn-text-muted)] cursor-help" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                            Link chỉ hoạt động khi truy cập từ IP Việt Nam
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
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

            {/* Success Message */}
            {createdLink && (
                <div className="p-4 rounded-lg border border-green-200 bg-green-50 space-y-3">
                    <div className="flex items-center gap-2">
                        <TickCircle size={15} variant="Bold" className="text-green-600 shrink-0" />
                        <span className="text-sm font-semibold text-green-700">
                            Link đã tạo thành công!
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-green-100">
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
