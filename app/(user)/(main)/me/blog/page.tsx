import Link from 'next/link';
import { PenTool } from 'lucide-react';

export default function NoPostsPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md w-full text-center">
                {}
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <PenTool size={48} className="text-blue-500" />
                </div>

                {}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Bạn chưa có bài viết nào
                </h1>
                <p className="text-gray-500 mb-8">
                    Thế giới đang chờ đợi những chia sẻ thú vị từ bạn. Hãy viết bài đầu tiên của mình nào!
                </p>

                {}
                <Link
                    href="/"
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-100"
                >
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}
