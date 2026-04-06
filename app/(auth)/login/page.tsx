import Image from "next/image"
import Link from "next/link"

export default function Login() {
    return (
        <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="w-[85%] md:w-[50%] lg:w-[35%] xl:w-[28%] border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md">

                <div className="p-6">
                    {/* Logo + Title */}
                    <div className="flex flex-col items-center justify-center">
                        <Image
                            src="/images/logo.png"
                            alt="Logo CNcode"
                            width={140}
                            height={100}
                            className="w-auto h-auto"
                        />
                        <h1 className="text-white font-semibold mt-3 text-xl">
                            Đăng nhập vào CNcode
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1 text-center">
                            Tiếp tục bằng tài khoản mạng xã hội
                        </p>
                    </div>

                    {/* Social buttons */}
                    <div className="mt-6 space-y-3">

                        {/* Google */}
                        <button
                            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-black py-4 text-sm font-medium hover:bg-gray-100 transition"
                        >
                            <Image
                                src="/icons/google.svg"
                                alt="Google Logo"
                                width={25}
                                height={25}
                            />
                            Tiếp tục với Google
                        </button>

                        {/* Facebook */}
                        <button
                            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] text-white py-4 text-sm font-medium hover:bg-[#166fe0] transition"
                        >
                            <Image
                                src="/icons/facebook.svg"
                                alt="Facebook Logo"
                                width={25}
                                height={25}
                            />
                            Tiếp tục với Facebook
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6 text-center text-xs text-zinc-500">
                        <span className="bg-black px-2 relative z-10">
                            Nhanh chóng & an toàn
                        </span>
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                    </div>

                    {/* Note */}
                    <p className="text-center text-xs text-zinc-500">
                        Bằng cách tiếp tục, bạn đang đồng ý với{" "}
                        <Link href="/dieukhoansudung" className="text-blue-400">
                            Điều khoản sử dụng
                        </Link> và{" "}
                        <Link href="/antoanbaomat" className="text-blue-400">
                            Chính sách bảo mật
                        </Link>.
                    </p>

                    {/* Back */}
                    <Link href="/" className="block mt-5">
                        <button className="w-full rounded-xl bg-white/80 text-black py-4 text-sm hover:bg-white transition">
                            Trở về trang chủ
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}