'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { confirmPayOSPayment } from '@/lib/api/khoahoc.api';

type PageStatus = 'confirming' | 'success' | 'failed' | 'timeout';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const course = searchParams.get('course');

  const [status, setStatus] = useState<PageStatus>(() =>
    orderCode ? 'confirming' : 'failed'
  );
  const [error, setError] = useState(() =>
    orderCode ? '' : 'Thiếu mã đơn hàng'
  );

  const doConfirm = useCallback(async () => {
    if (!orderCode) return;
    setStatus('confirming');
    setError('');
    try {
      await confirmPayOSPayment(orderCode);
      setStatus('success');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string; code?: string };
      const msg = e?.response?.data?.message || e?.message || '';
      if (msg.includes('timeout') || msg === 'Failed to confirm payment' || e.code === 'ECONNABORTED') {
        setStatus('timeout');
        setError('PayOS chưa phản hồi. Webhook sẽ cập nhật sau vài giây.');
      } else {
        setStatus('failed');
        setError(msg || 'Xác nhận thanh toán thất bại');
      }
    }
  }, [orderCode]);

  useEffect(() => {
    if (!orderCode) return;

    let cancelled = false;

    confirmPayOSPayment(orderCode)
      .then(() => {
        if (!cancelled) setStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } }; message?: string; code?: string };
        const msg = e?.response?.data?.message || e?.message || '';
        if (msg.includes('timeout') || msg === 'Failed to confirm payment' || e.code === 'ECONNABORTED') {
          setStatus('timeout');
          setError('PayOS chưa phản hồi. Webhook sẽ cập nhật sau vài giây.');
        } else {
          setStatus('failed');
          setError(msg || 'Xác nhận thanh toán thất bại');
        }
      });

    return () => { cancelled = true; };
  }, [orderCode]);

  const courseHref = course ? `/khoahoc/${course}` : '/me/khoahoc';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="text-center max-w-md">
        {status === 'confirming' && (
          <>
            <Loader2 size={64} className="mx-auto text-blue-500 mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đang xác nhận thanh toán...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vui lòng đợi trong giây lát
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Mã đơn hàng: {orderCode}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={courseHref}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Vào khoá học
              </Link>
              <Link
                href="/me/khoahoc"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                Khoá học của tôi
              </Link>
            </div>
          </>
        )}

        {status === 'timeout' && (
          <>
            <Loader2 size={64} className="mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đang chờ xác nhận...
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Thanh toán của bạn đã được ghi nhận. Vui lòng nhấn &ldquo;Thử lại&rdquo; hoặc vào &ldquo;Khoá học của tôi&rdquo; sau vài giây.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={doConfirm} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </Button>
              <Link
                href="/me/khoahoc"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                Khoá học của tôi
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Xác nhận thanh toán thất bại
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Nếu bạn đã thanh toán, khoá học sẽ được kích hoạt sau vài phút. Vui lòng thử lại sau.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={doConfirm} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </Button>
              <Link
                href="/me/khoahoc"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                Khoá học của tôi
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}