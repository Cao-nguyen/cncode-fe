
import { Suspense } from 'react';
import Link from '@/node_modules/next/link';
import { CheckCircle } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ orderCode?: string }>;
}

async function PaymentSuccessContent({ searchParams }: PageProps) {
  const { orderCode } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Thanh toán thành công!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Mã đơn hàng: {orderCode}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}