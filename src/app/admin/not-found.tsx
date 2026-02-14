import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="flex flex-col items-center gap-4">
                <AlertCircle className="size-16 text-red-500" />
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-2">404</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Không tìm thấy trang</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Trang bạn tìm kiếm không tồn tại hoặc đã bị xoá
                    </p>
                </div>
            </div>
            <Link
                href="/admin/dashboard"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
                Quay lại Trang tổng quan
            </Link>
        </div>
    );
}
