"use client"

import Image from "next/image"
import Link from "next/link"
import InputAuth from "@/components/ui/input-auth"
import ButtonAuth from "@/components/ui/button-auth"
import ButtonSocial from "@/components/ui/button-social"
import { RegisterService } from "@/src/services/register-service"
import { Spinner } from "@/components/ui/spinner"

export default function Register() {
    const {
        name,
        setName,
        email,
        setEmail,
        username,
        setUsername,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        setLoading,
        handleLogin
    } = RegisterService()

    return (
        <div className="w-full h-screen bg-black flex justify-center items-center">
            <div className="w-[80%] md:w-[50%] lg:w-[35%] xl:w-[30%] border border-[#e5e7eb]/20 rounded-xl">
                <div className="p-[15px_20px]">
                    <div className="flex flex-col items-center justify-center">
                        <Image src="/logo.png" alt="Logo CNcode" width={140} height={100} />
                        <h1 className="text-white font-bold mt-[10px] text-[20px]">Đăng ký tài khoản CNcode</h1>
                    </div>
                    <div className="mt-[20px]">
                        <InputAuth
                            label="Họ và tên"
                            placeholder="Lý Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <InputAuth
                            type="email"
                            label="Email"
                            placeholder="lyvana@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <InputAuth
                            label="Tên đăng nhập"
                            placeholder="lyvana"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <InputAuth
                                label="Mật khẩu"
                                type="password"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <InputAuth
                                label="Xác nhận mật khẩu"
                                type="password"
                                placeholder="••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {!loading
                            ? <ButtonAuth onClick={() => handleLogin()} className="bg-[#3b82f6] text-white">Đăng ký</ButtonAuth>
                            : <ButtonAuth className="bg-[#3c66aa] text-white flex items-center justify-center gap-3"><Spinner /> Đang xử lý</ButtonAuth>
                        }

                        <div className="relative my-5 text-center text-xs text-zinc-500">
                            <span className="bg-black px-2 relative z-10">Hoặc tiếp tục với</span>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-800"></div>
                            </div>
                        </div>

                        <ButtonSocial />

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