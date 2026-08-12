'use client';

import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { luyentapApi, getLuyentapApiErrorMessage } from '@/lib/api/luyentap.api';
import { storeExamPassword } from '@/lib/luyentap/exercise-availability.utils';

interface LuyentapExamPasswordModalProps {
    open: boolean;
    onClose: () => void;
    slug: string;
    onVerified: () => void;
}

export default function LuyentapExamPasswordModal({
    open,
    onClose,
    slug,
    onVerified,
}: LuyentapExamPasswordModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!open) return null;

    const handleSubmit = async () => {
        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await luyentapApi.verifyExercisePassword(slug, password.trim());
            storeExamPassword(slug, password.trim());
            onVerified();
        } catch (err) {
            setError(getLuyentapApiErrorMessage(err, 'Mật khẩu không đúng'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-5 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--cn-text-muted)] hover:bg-[var(--cn-bg-section)]"
                    aria-label="Đóng"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                    <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--cn-text-main)]">Nhập mật khẩu phòng thi</h2>
                <p className="mt-1 text-sm text-[var(--cn-text-sub)]">
                    Giáo viên đã đặt mật khẩu cho đề này
                </p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
                    placeholder="Mật khẩu"
                    className="mt-4 w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-section)] px-3 py-2.5 text-sm outline-none focus:border-[var(--cn-primary)]"
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <CustomButton className="mt-4 w-full" onClick={() => void handleSubmit()} loading={loading}>
                    Xác nhận
                </CustomButton>
            </div>
        </div>
    );
}
