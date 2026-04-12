"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, selectUser } from "@/store/userSlice";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";

export default function Login() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);

    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setChecking(false);
                return;
            }

            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                dispatch(setUser({ user: res.data, token }));

                if (!res.data.isProfileCompleted) {
                    router.replace("/onboarding");
                } else {
                    router.replace("/");
                }
            } catch {
                localStorage.removeItem("token");
                setChecking(false);
            }
        };

        if (!user) {
            checkAuth();
        } else {
            if (!user.isProfileCompleted) {
                router.replace("/onboarding");
            } else {
                router.replace("/");
            }
        }
    }, [user, router, dispatch]);

    if (checking) return null;

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (!credentialResponse.credential) return;

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/user/google`,
                { token: credentialResponse.credential }
            );

            const { token, user } = res.data;

            localStorage.setItem("token", token);
            dispatch(setUser({ user, token }));

            if (!user.isProfileCompleted) {
                router.push("/onboarding");
            } else {
                toast.success(`Chào mừng trở lại, ${user.name}! 👋`);
                router.push("/");
            }
        } catch (err) {
            toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="w-[85%] md:w-[50%] lg:w-[35%] xl:w-[28%] backdrop-blur-md">
                <div className="p-6">

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

                    <div className="mt-6 space-y-3">
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={() => toast.error("Đăng nhập Google thất bại")}
                                theme="filled_black"
                                shape="pill"
                                width="300"
                            />
                        </div>
                    </div>

                    <div className="relative my-6 text-center text-xs text-zinc-500">
                        <span className="bg-black px-2 relative z-10">
                            Nhanh chóng & an toàn
                        </span>
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800" />
                        </div>
                    </div>

                    <p className="text-center text-xs text-zinc-500">
                        Bằng cách tiếp tục, bạn đang đồng ý với{" "}
                        <Link href="/dieukhoansudung" className="text-blue-400">
                            Điều khoản sử dụng
                        </Link>{" "}
                        và{" "}
                        <Link href="/antoanbaomat" className="text-blue-400">
                            Chính sách bảo mật
                        </Link>.
                    </p>

                    <Link href="/" className="block mt-5">
                        <button className="w-full rounded-xl bg-white/80 text-black py-4 text-sm hover:bg-white transition">
                            Trở về trang chủ
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    );
}