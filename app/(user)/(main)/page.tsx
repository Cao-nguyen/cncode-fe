"use client"

import Analytics from "@/components/common/Analytics";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import PublicRatingSection from "@/components/home/PublicRatingSection";

export default function Home() {

    return (
        <>
            <h1 className="text-center font-bold text-main text-4xl p-[20px_20px]">Website hiện tại đang nâng cấp phần giao diện và chỉnh sửa một số lỗi để mang đến trải nghiệm tốt nhất cho người dùng. Mong Quý người dùng thông cảm</h1>
            <FeatureShowcase />
            <PublicRatingSection />
            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                <Analytics />
            </div>
        </>
    )
}