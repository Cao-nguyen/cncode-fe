"use client";

import { useState } from "react";
import { Like, Heart, Message, Share } from "iconsax-react";
import { Save2, Wallet, SafeHome, Activity } from "iconsax-react";

type ReactionType =
    | null
    | "Thích"
    | "Yêu thích"
    | "Thương Thương"
    | "Haha"
    | "Wow"
    | "Buồn"
    | "Giận";

export default function Post() {
    const [liked, setLiked] = useState<ReactionType>(null);
    const [showReactions, setShowReactions] = useState(false);
    const [showFull, setShowFull] = useState(false);

    // Fake data
    const data = {
        fullName: "Nguyễn Văn A",
        avatar: "https://i.pravatar.cc/150?img=3",
        time: "2 giờ trước",
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: "https://picsum.photos/600/400",
        likes: 10,
        comments: 20,
        shares: 5,
    };

    const reactions = [
        { label: "Thích", icon: <Like size="24" variant="Bold" />, color: "#4267B2" },
        { label: "Yêu thích", icon: <Heart size="24" variant="Bold" />, color: "#f33a58" },
        { label: "Thương Thương", icon: <Save2 size="24" variant="Bold" />, color: "#f7b125" },
        { label: "Haha", icon: <Activity size="24" variant="Bold" />, color: "#f7b125" },
        { label: "Wow", icon: <Activity size="24" variant="Bold" />, color: "#f7b125" },
        { label: "Buồn", icon: <SafeHome size="24" variant="Bold" />, color: "#f7b125" },
        { label: "Giận", icon: <Wallet size="24" variant="Bold" />, color: "#f33a58" },
    ];

    return (
        <div className="max-w-xl w-full mx-auto my-4 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-300">
            {/* HEADER */}
            <div className="flex items-center p-4">
                <img
                    src={data.avatar}
                    alt="avatar"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                />
                <div className="ml-3 flex-1">
                    <h5 className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">{data.fullName}</h5>
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{data.time}</span>
                </div>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm sm:text-base">
                    ...
                </button>
            </div>

            {/* CONTENT */}
            <div className="px-4 pb-4">
                <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                    {showFull ? data.content : data.content.slice(0, 120) + "..."}
                    {data.content.length > 120 && (
                        <span
                            onClick={() => setShowFull(!showFull)}
                            className="text-blue-500 dark:text-blue-400 cursor-pointer ml-1"
                        >
                            {showFull ? "Thu gọn" : "Xem thêm"}
                        </span>
                    )}
                </p>
            </div>

            {/* IMAGE */}
            {data.image && (
                <div className="w-full max-h-[500px] overflow-hidden">
                    <img src={data.image} alt="" className="w-full object-cover" />
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-around items-center p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 relative text-xs sm:text-sm">
                {/* LIKE */}
                <div
                    className="flex items-center gap-1 relative cursor-pointer"
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                >
                    {liked ? reactions.find((r) => r.label === liked)?.icon : <Like size="24" variant="Bold" />}
                    <span className="select-none">{data.likes + (liked ? 1 : 0)}</span>

                    {/* Reactions Tooltip */}
                    {showReactions && (
                        <div className="absolute -top-24 left-0 flex bg-white dark:bg-gray-700 rounded-full shadow-lg p-2 gap-2 z-10">
                            {reactions.map((r) => (
                                <div
                                    key={r.label}
                                    className="flex flex-col items-center cursor-pointer transform transition-all duration-200 hover:scale-125"
                                    onClick={() => setLiked(r.label as ReactionType)}
                                >
                                    <div>{r.icon}</div>
                                    <span className="text-xs text-gray-700 dark:text-gray-200 mt-1">{r.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* COMMENT */}
                <div className="flex items-center gap-1 cursor-pointer hover:text-blue-500">
                    <Message size="24" variant="Bold" />
                    <span>{data.comments}</span>
                </div>

                {/* SHARE */}
                <div className="flex items-center gap-1 cursor-pointer hover:text-blue-500">
                    <Share size="24" variant="Bold" />
                    <span>{data.shares}</span>
                </div>
            </div>
        </div>
    );
}