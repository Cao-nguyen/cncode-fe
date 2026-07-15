'use client';

export default function MarqueeBanner() {
    const text = "Sản phẩm phục vụ mục đích hỗ trợ học tập công nghệ trong thời đại số và tham gia Cuộc thi Sáng tạo thanh thiếu niên nhi đồng năm 2026";

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2">
            <div className="container mx-auto px-4">
                <p className="text-sm lg:text-base font-medium text-center">
                    {text}
                </p>
            </div>
        </div>
    );
}
