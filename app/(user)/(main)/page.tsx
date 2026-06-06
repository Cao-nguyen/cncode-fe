"use client"

import { useState, useEffect } from "react";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import FeatureShowcase from "@/components/home/FeatureShowcase";
import WhyCNcode from "@/components/home/WhyCNcode";
import TrainingTopics from "@/components/home/TrainingTopics";
import LatestPosts from "@/components/home/LatestPosts";
import PublicRatingSection from "@/components/home/PublicRatingSection";
import Analytics from "@/components/common/Analytics";
import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import { adminChatApi } from "@/lib/api/adminchat.api";

export default function Home() {
    const { socket, isConnected } = useSocket();
    const { token, user } = useAuthStore();
    const [unreadAdminMessages, setUnreadAdminMessages] = useState(0);

    // Fetch initial unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!token || !user?._id) return;
            try {
                const res = await adminChatApi.getMyConversation(token);
                if (res.success && res.data?.[0]) {
                    const unreadCount = res.data[0].unreadCount || 0;
                    setUnreadAdminMessages(unreadCount);
                }
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };
        fetchUnreadCount();

        // Poll for unread count every 3 seconds as fallback
        const interval = setInterval(fetchUnreadCount, 3000);
        return () => clearInterval(interval);
    }, [token, user?._id]);

    // Listen for new admin messages
    useEffect(() => {
        if (!socket || !isConnected || !user?._id) return;

        const handleNewMessage = (msg: { senderId?: { _id?: string } | string;[key: string]: unknown }) => {
            // Only update if the message is from admin (senderId is different from current user)
            const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
            if (senderId && senderId !== user._id) {
                setUnreadAdminMessages(prev => prev + 1);
            }
        };

        const handleMessagesRead = () => {
            setUnreadAdminMessages(0);
        };

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, isConnected, user?._id]);

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
                className="flex fixed bottom-20 lg:bottom-10 right-3 lg:right-5 z-50 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 items-center justify-center"
            >
                <MessageCircleMore className="w-6 h-6" />
                {unreadAdminMessages > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-lg">
                        {unreadAdminMessages > 99 ? '99+' : unreadAdminMessages}
                    </span>
                )}
            </Link>
        </div>
    )
}