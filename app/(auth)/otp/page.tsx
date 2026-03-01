"use client"

export const dynamic = "force-dynamic"

import Image from "next/image"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import ButtonAuth from "@/components/ui/button-auth"
import { OtpService } from "@/hooks/otp-service"
import { useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

export default function Otp() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const { otp, setOtp, loading, handleVerify } = OtpService(email || "");

    return (
        <div className="w-full h-screen bg-black flex justify-center items-center">
            <div className="w-[80%] md:w-[50%] lg:w-[35%] xl:w-[30%] border border-[#e5e7eb]/20 rounded-xl">
                <div className="p-[15px_20px]">
                    <div className="flex flex-col items-center justify-center">
                        <Image style={{ width: "auto", height: "auto" }} src="/logo.png" alt="Logo CNcode" width={140} height={100} />
                        <h1 className="text-white font-bold mt-[10px] text-[20px]">Xác thực OTP</h1>
                    </div>
                    <InputOTP
                        id="digits-only"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        className="w-full"
                        value={otp}
                        onChange={(value) => setOtp(value)}
                    >
                        <InputOTPGroup className="text-white/90 mt-[20px] w-full flex justify-between">
                            <InputOTPSlot index={0} className="flex-1 h-[40px]" />
                            <InputOTPSlot index={1} className="flex-1 h-[40px]" />
                            <InputOTPSlot index={2} className="flex-1 h-[40px]" />
                            <InputOTPSlot index={3} className="flex-1 h-[40px]" />
                            <InputOTPSlot index={4} className="flex-1 h-[40px]" />
                            <InputOTPSlot index={5} className="flex-1 h-[40px]" />
                        </InputOTPGroup>
                    </InputOTP>
                    <ButtonAuth
                        onClick={handleVerify}
                        disabled={loading}
                        className="mt-[10px] bg-[#3b82f6] text-white">
                        {loading ? <p className="flex justify-center items-center gap-3"><Spinner /> Đăng xử lý</p> : "Xác thực"}
                    </ButtonAuth>
                </div>
            </div>
        </div>
    )
}