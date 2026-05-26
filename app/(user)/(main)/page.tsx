"use client"

import Analytics from "@/components/common/Analytics";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import PublicRatingSection from "@/components/home/PublicRatingSection";



export default function Home() {

    return (
        <div className="pt-5">
            <FeatureShowcase />
            <PublicRatingSection />
            <div className="container mx-auto px-3 pb-4 sm:px-4 lg:px-6">
                <Analytics />
            </div>
        </div>
    )
}