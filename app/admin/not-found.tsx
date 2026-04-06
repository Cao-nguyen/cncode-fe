import Link from "next/link";

export default function NotFoundAdmin() {
    return (
        <div className="h-screen flex flex-col items-center justify-center px-4 text-center">

            <h1
                className="
                text-[120px] sm:text-[150px] md:text-[180px] lg:text-[200px]
                font-bold
                bg-linear-to-r
                from-blue-500
                via-cyan-400
                to-blue-600
                bg-clip-text
                text-transparent"
            >
                404
            </h1>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold -translate-y-4 md:-translate-y-7.5">
                Trang này không tồn tại!
            </h1>

            <Link
                className="
                mt-3
                px-3 py-2
                sm:px-4 sm:py-2.5
                rounded-[10px]
                font-bold
                text-sm sm:text-base
                bg-[#d1d1d1]
                dark:bg-[#424141]
                bg-opacity-[0.5]
                transition-all duration-100
                hover:scale-105"
                href="/admin/dashboard"
            >
                Về trang tổng quan
            </Link>

        </div>
    );
}