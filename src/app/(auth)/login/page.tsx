import ButtonAuth from "@/components/ui/button-auth";
import ButtonSocial from "@/components/ui/button-social";
import InputAuth from "@/components/ui/input-auth";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Đăng nhập'
}


export default function Login() {
    return (
        <div className="w-full h-screen bg-black flex justify-center items-center">
            <div className="w-[80%] md:w-[50%] lg:w-[35%] xl:w-[30%] border border-[#e5e7eb]/20 rounded-xl">
                <div className="p-[15px_20px]">
                    <div className="flex flex-col items-center justify-center">
                        <Image src="/logo.png" alt="Logo CNcode" width={140} height={100} />
                        <h1 className="text-white font-bold mt-[10px] text-[20px]">Đăng nhập vào CNcode</h1>
                    </div>
                    <div className="mt-[20px]">
                        <InputAuth
                            label="Tên đăng nhập"
                            placeholder="username123"
                        />
                        <div className="relative">
                            <InputAuth
                                label="Mật khẩu"
                                type="password"
                                placeholder="••••••"
                            />
                            <Link className="right-0 top-0 text-[#308aff] text-[12px] absolute" href="/forgot">Quên mật khẩu?</Link>
                        </div>
                        <ButtonAuth className="bg-[#3b82f6] text-white">Đăng nhập</ButtonAuth>

                        <div className="relative my-5 text-center text-xs text-zinc-500">
                            <span className="bg-black px-2 relative z-10">Hoặc tiếp tục với</span>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-800"></div>
                            </div>
                        </div>

                        <ButtonSocial />

                        <div className="my-[10px] flex items-center justify-center gap-1">
                            <p className="text-[14px] text-white">Bạn chưa có tài khoản?</p>
                            <Link href="/register" className="text-[#3b82f6] text-[14px]">Đăng ký ngay</Link>
                        </div>

                        <Link href=" /">
                            <ButtonAuth className="bg-white/70 text-black">Trở về trang chủ</ButtonAuth>
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    )
}