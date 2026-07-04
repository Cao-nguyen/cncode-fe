export default function HuongNghiepPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-[var(--cn-text-main)] mb-6 text-center">Hướng nghiệp</h1>

            {/* Timeline Section */}
            <div className="mb-8">
                {/* Mobile/Tablet: Vertical */}
                <div className="md:hidden relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    
                    <div className="relative pl-10 pb-6">
                        <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">1</div>
                        <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                            <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Làm bài trắc nghiệm</h2>
                            <p className="text-sm text-[var(--cn-text-muted)]">Trả lời các câu hỏi để hiểu tính cách của bạn</p>
                        </div>
                    </div>

                    <div className="relative pl-10 pb-6">
                        <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">2</div>
                        <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                            <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Kiểm tra kết quả</h2>
                            <p className="text-sm text-[var(--cn-text-muted)]">Xem phân tích chi tiết về tính cách</p>
                        </div>
                    </div>

                    <div className="relative pl-10">
                        <div className="absolute left-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">3</div>
                        <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                            <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Khám phá nghề nghiệp</h2>
                            <p className="text-sm text-[var(--cn-text-muted)]">Xem nghề phù hợp và lời khuyên</p>
                        </div>
                    </div>
                </div>

                {/* Desktop: Horizontal */}
                <div className="hidden md:block">
                    <div className="relative flex items-center justify-between gap-4">
                        <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                        
                        <div className="flex-1 text-center relative z-10">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">1</div>
                            <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                                <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Làm bài trắc nghiệm</h2>
                                <p className="text-sm text-[var(--cn-text-muted)]">Trả lời các câu hỏi</p>
                            </div>
                        </div>

                        <div className="flex-1 text-center relative z-10">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">2</div>
                            <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                                <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Kiểm tra kết quả</h2>
                                <p className="text-sm text-[var(--cn-text-muted)]">Xem phân tích</p>
                            </div>
                        </div>

                        <div className="flex-1 text-center relative z-10">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">3</div>
                            <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                                <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Khám phá nghề nghiệp</h2>
                                <p className="text-sm text-[var(--cn-text-muted)]">Xem nghề phù hợp</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                    Bắt đầu ngay
                </button>
            </div>
        </div>
    );
}
