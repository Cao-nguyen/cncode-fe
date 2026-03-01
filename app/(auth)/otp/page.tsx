"use client"

import Image from "next/image"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import ButtonAuth from "@/components/ui/button-auth"
import { OtpService } from "@/hooks/otp-service"
import { Spinner } from "@/components/ui/spinner"

type PageProps = {
    searchParams: {
        email?: string
    }
}

export default function OtpPage({ searchParams }: PageProps) {
    const email = searchParams.email ?? ""

    const { otp, setOtp, loading, handleVerify } = OtpService(email)

    return (
        <div className="w-full h-screen bg-black flex justify-center items-center">
            <div className="w-[80%] md:w-[50%] lg:w-[35%] xl:w-[30%] border border-[#e5e7eb]/20 rounded-xl">
                <div className="p-[15px_20px]">
                    <div className="flex flex-col items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Logo CNcode"
                            width={140}
                            height={100}
                            priority
                        />
                        <h1 className="text-white font-bold mt-[10px] text-[20px]">
                            Xác thực OTP
                        </h1>
                    </div>

                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        className="w-full"
                        value={otp}
                        onChange={setOtp}
                    >
                        <InputOTPGroup className="text-white/90 mt-[20px] w-full flex justify-between gap-2">
                            {[...Array(6)].map((_, i) => (
                                <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className="flex-1 h-[40px]"
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>

                    <ButtonAuth
                        onClick={handleVerify}
                        disabled={loading}
                        className="mt-[10px] bg-[#3b82f6] text-white"
                    >
                        {loading ? (
                            <span className="flex justify-center items-center gap-3">
                                <Spinner /> Đang xử lý
                            </span>
                        ) : (
                            "Xác thực"
                        )}
                    </ButtonAuth>
                </div>
            </div>
        </div>
    )
}