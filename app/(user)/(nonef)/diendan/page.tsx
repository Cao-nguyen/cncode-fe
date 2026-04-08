"use client"

import { useState } from "react";
import Feed from "@/components/sections/feed";
import Post from "@/components/sections/post";
import ChatPage from "@/components/sections/chat";

export default function Diendan() {
    const [currentTab, setCurrentTab] = useState<string>(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return params.get("tab") || "khampha";
        }
        return "khampha";
    });

    const handleTabClick = (tab: string) => {
        setCurrentTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.pushState({}, "", url.toString());
    };

    return (
        <div className="pt-0 lg:pt-15">
            <header className="flex h-7.5 bg-white dark:bg-black border-b border-gray-300 dark:border-gray-700 justify-center">
                <div className="flex space-x-2">
                    {[
                        { key: "khampha", label: "Khám phá" },
                        { key: "thongtin", label: "Thông tin" },
                        { key: "diendan", label: "Diễn đàn" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            className={`px-3 py-1 text-sm font-medium
                ${currentTab === tab.key
                                    ? "border-b-2 border-blue-500 text-blue-500"
                                    : "text-gray-700 dark:text-gray-300"}
                transition-colors duration-200`}
                            onClick={() => handleTabClick(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Nội dung tab */}
            <div>
                {currentTab === "khampha" && <Feed />}
                {currentTab === "thongtin" && <Post />}
                {currentTab === "diendan" && <ChatPage />}
            </div>
        </div>
    );
}