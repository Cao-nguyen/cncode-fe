import Link from "next/link";

export default function NotFound() {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold">404</h1>
            <p>Trang không tồn tại</p>

            <Link href="/" className="mt-4 underline">
                Về trang chủ
            </Link>
        </div>
    );
}
