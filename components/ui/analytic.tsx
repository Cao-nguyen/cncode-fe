"use client"

import { useTheme } from "next-themes"
import { User, UserTick, Chart } from "iconsax-react"

interface AnalyticsProps {
    today: number
    guest: number
    online: number
    total: number
}

export default function Analytics({
    today,
    guest,
    online,
    total
}: AnalyticsProps) {

    // const { theme } = useTheme()
    // const colorAnalytic = theme === "dark" ? "#fff" : "#111"

    const format = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n)

    return (
        <div className="
            mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4
        ">
            {/* Total */}
            <div className="
                p-5 rounded-2xl
                bg-white dark:bg-[#171717]
                border border-[#e6e6e6] dark:border-[#222]
                flex items-center justify-between
                hover:shadow-md hover:-translate-y-1
                transition
            ">
                <div>
                    <p className="text-sm text-gray-500">Tổng</p>
                    <h4 className="text-lg md:text-xl font-bold">
                        {format(total)}
                    </h4>
                </div>
                <Chart size={24} className="text-black dark:text-white" variant="Bold" />
            </div>

            {/* Today */}
            <div className="
                p-5 rounded-2xl
                bg-white dark:bg-[#171717]
                border border-[#e6e6e6] dark:border-[#222]
                flex items-center justify-between
                hover:shadow-md hover:-translate-y-1
                transition
            ">
                <div>
                    <p className="text-sm text-gray-500">Hôm nay</p>
                    <h4 className="text-lg md:text-xl font-bold">
                        {format(today)}
                    </h4>
                </div>
                <Chart size={24} className="text-black dark:text-white" variant="Bold" />
            </div>

            {/* Guest */}
            <div className="
                p-5 rounded-2xl
                bg-white dark:bg-[#171717]
                border border-[#e6e6e6] dark:border-[#222]
                flex items-center justify-between
                hover:shadow-md hover:-translate-y-1
                transition
            ">
                <div>
                    <p className="text-sm text-gray-500">Khách online</p>
                    <h4 className="text-lg md:text-xl font-bold">
                        {format(guest)}
                    </h4>
                </div>
                <User size={24} className="text-black dark:text-white" variant="Bold" />
            </div>

            {/* User */}
            <div className="
                p-5 rounded-2xl
                bg-white dark:bg-[#171717]
                border border-[#e6e6e6] dark:border-[#222]
                flex items-center justify-between
                hover:shadow-md hover:-translate-y-1
                transition
            ">
                <div>
                    <p className="text-sm text-gray-500">User online</p>
                    <h4 className="text-lg md:text-xl font-bold">
                        {format(online)}
                    </h4>
                </div>
                <UserTick size={24} className="text-black dark:text-white" variant="Bold" />
            </div>

        </div>
    )
}