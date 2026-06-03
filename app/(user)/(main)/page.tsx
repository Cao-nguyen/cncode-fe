"use client"

import Analytics from "@/components/common/Analytics";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import PublicRatingSection from "@/components/home/PublicRatingSection";

export default function Home() {

    return (
        <div className="pt-5">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 mb-6">
                <HeroSlideshow />
            </div>
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 mb-6">
                <FeatureShowcase />
            </div>
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 mb-6">
                <PublicRatingSection />
            </div>
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 pb-4">
                <Analytics />
            </div>
        </div>
    )
}
