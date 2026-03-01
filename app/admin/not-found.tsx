import Link from "next/link";

export default function NotFoundUser() {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <h1
                className="text-[200px] 
                font-bold
                bg-gradient-to-r
                from-blue-500
                via-cyan-400
                to-blue-600
                bg-clip-text
                text-transparent"
            >404</h1>
            <h1 className="text-3xl font-bold translate-y-[-30px]">Trang này không tồn tại!</h1>

            <Link
                className="px-[10px] py-[7px] rounded-[10px] font-bold bg-[#d1d1d1] dark:bg-[#424141] bg-opacity-[0.5] transition-all duration-[100]"
                href="/admin/dashboard">
                Về trang tổng quan
            </Link>
        </div>
    );
}
