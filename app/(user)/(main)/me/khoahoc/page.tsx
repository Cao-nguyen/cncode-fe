import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function NoCoursesPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md w-full text-center">
                {}
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                    <GraduationCap size={48} className="text-orange-500" />
                </div>

                {}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Bạn chưa có khóa học nào
                </h1>
                <p className="text-gray-500 mb-8">
                    Hành trình vạn dặm bắt đầu từ một bước chân. Hãy chọn cho mình một khóa học để bắt đầu ngay nhé!
                </p>

                {}
                <Link
                    href="/"
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-100"
                >
                    Khám phá khóa học ngay
                </Link>
            </div>
        </div>
    );
}
