"use client"

import HeroSlideshow from "@/components/home/HeroSlideshow";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import WhyCNcode from "@/components/home/WhyCNcode";
import TrainingTopics from "@/components/home/TrainingTopics";
import LatestPosts from "@/components/home/LatestPosts";
import PublicRatingSection from "@/components/home/PublicRatingSection";
import Analytics from "@/components/common/Analytics";
import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

export default function Home() {

    return (
        <div className="pt-5 relative">
            {/* Hero Slideshow */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <HeroSlideshow />
            </div>

            {/* Feature Showcase */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <FeatureShowcase />
            </div>

            {/* Why CNcode */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <WhyCNcode />
            </div>

            {/* Training Topics */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <TrainingTopics />
            </div>

            {/* Latest Posts */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <LatestPosts />
            </div>

            {/* Reviews/Ratings */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <PublicRatingSection />
            </div>

            {/* Analytics */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                <Analytics />
            </div>

            {/* Floating chat icon */}
            <Link
                href="/chatwithadmin"
                className="fixed bottom-20 lg:bottom-10 right-3 lg:right-5 z-50 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
            >
                <MessageCircleMore className="w-6 h-6" />
            </Link>
        </div>
    )
}