'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
        <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Thanh toán bị huỷ
        </h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Bạn đã huỷ thanh toán. Đơn hàng sẽ tự động hết hạn sau 15 phút.
        </p>
        <div className="space-y-3">
          <Button className="w-full" asChild>
            <Link href="/cuahangso">Quay lại cửa hàng</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}