import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import InputAuth from "@/components/ui/input-auth"
import ButtonAuth from "@/components/ui/button-auth"
import ButtonSocial from "@/components/ui/button-social"

export const metadata: Metadata = {
    title: "Quên mật khẩu"
}

export default function Forgot() {
    return (
        <div className="w-full h-screen bg-black flex justify-center items-center">
            <div className="w-[80%] md:w-[50%] lg:w-[35%] xl:w-[30%] border border-[#e5e7eb]/20 rounded-xl">
                <div className="p-[15px_20px]">
                    <div className="flex flex-col items-center justify-center">
                        <Image src="/logo.png" alt="Logo CNcode" width={140} height={100} />
                        <h1 className="text-white font-bold mt-[10px] text-[20px]">Tạo mật khẩu mới</h1>
                    </div>
                    <div className="mt-[20px]">
                        <InputAuth
                            type="email"
                            label="Email"
                            placeholder="lyvana@gmail.com"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <InputAuth
                                label="Mật khẩu"
                                type="password"
                                placeholder="••••••"
                            />
                            <InputAuth
                                label="Xác nhận mật khẩu"
                                type="password"
                                placeholder="••••••"
                            />
                        </div>
                        <ButtonAuth className="bg-[#3b82f6] text-white">Tạo mật khẩu mới</ButtonAuth>

                        <div className="mt-[10px]">
                            <Link href=" /login">
                                <ButtonAuth className="bg-white/70 text-black">Trở về đăng nhập</ButtonAuth>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}