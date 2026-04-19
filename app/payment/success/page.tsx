'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/lib/api/payment.api';
import { useAuthStore } from '@/store/auth.store';

type PageStatus = 'loading' | 'success' | 'pending' | 'failed';

interface PaymentData {
  productName: string;
  downloadUrl: string | null;
}

const MAX_RETRIES = 8;
const RETRY_INTERVAL_MS = 2000;

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const orderCode = searchParams.get('orderCode');

  const [status, setStatus] = useState<PageStatus>('loading');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chờ Zustand hydrate xong trước khi check token
  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!orderCode) {
      router.replace('/payment/cancel');
      return;
    }

    if (!token) {
      router.replace(`/login?redirect=/payment/success?orderCode=${orderCode}`);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const result = await paymentApi.checkPaymentStatus(orderCode, token);

        if (cancelled) return;

        if (!result.success) {
          setStatus('failed');
          return;
        }

        setPaymentData({
          productName: result.data.productName,
          downloadUrl: result.data.downloadUrl,
        });

        if (result.data.status === 'success') {
          setStatus('success');
        } else if (retryCount >= MAX_RETRIES) {
          setStatus('pending');
        } else {
          retryTimerRef.current = setTimeout(() => {
            if (!cancelled) setRetryCount((c) => c + 1);
          }, RETRY_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setStatus('failed');
      }
    };

    run();

    return () => {
      cancelled = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [hydrated, orderCode, token, retryCount, router]);

  const handleRetry = () => {
    setStatus('loading');
    setRetryCount(0);
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-500 dark:text-gray-400">
          Đang xác nhận thanh toán{retryCount > 0 ? ` (${retryCount}/${MAX_RETRIES})` : ''}...
        </p>
      </div>
    );
  }

  if (status === 'success' && paymentData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center dark:bg-black">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Thanh toán thành công!
          </h1>
          <p className="mb-6 text-gray-500 dark:text-gray-400">{paymentData.productName}</p>
          <div className="space-y-3">
            {paymentData.downloadUrl && (
              <Button className="w-full gap-2" asChild>
                <a href={paymentData.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download size={18} /> Tải xuống ngay
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/cuahangso">Quay lại cửa hàng</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center dark:bg-black">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
          <Clock className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Đang xử lý</h1>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Hệ thống đang xác nhận thanh toán. Vui lòng kiểm tra lại sau vài phút.
          </p>
          <div className="space-y-3">
            <Button className="w-full" onClick={handleRetry}>
              Kiểm tra lại
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/cuahangso">Quay lại cửa hàng</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
        <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Có lỗi xảy ra</h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ nếu đã bị trừ tiền.
        </p>
        <Button className="w-full" asChild>
          <Link href="/cuahangso">Quay lại cửa hàng</Link>
        </Button>
      </div>
    </div>
  );
}