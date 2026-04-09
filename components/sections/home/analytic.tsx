"use client";

import { User, UserTick, Chart } from "iconsax-react";

interface AnalyticsProps {
    today: number;
    guest: number;
    online: number;
    total: number;
}

// config data
const ITEMS = [
    { label: "Tổng", key: "total", icon: Chart },
    { label: "Hôm nay", key: "today", icon: Chart },
    { label: "Khách online", key: "guest", icon: User },
    { label: "User online", key: "online", icon: UserTick }
] as const;

export default function Analytics({ today, guest, online, total }: AnalyticsProps) {

    // format số
    const format = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

    const map = { today, guest, online, total };

    return (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">

            {ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                    <div key={item.key} className="p-5 rounded-2xl bg-white dark:bg-[#171717] border border-[#e6e6e6] dark:border-[#222] flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition">

                        {/* text */}
                        <div>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <h4 className="text-lg md:text-xl font-bold">{format(map[item.key])}</h4>
                        </div>

                        {/* icon */}
                        <Icon size={24} className="text-black dark:text-white" variant="Bold" />

                    </div>
                );
            })}

        </div>
    );
}