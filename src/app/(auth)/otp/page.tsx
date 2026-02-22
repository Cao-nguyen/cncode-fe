"use client"

import { Metadata } from "next"
import Image from "next/image"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import ButtonAuth from "@/components/ui/button-auth"

export default function Forgot() {
    return (
        <div className="w-full h-screen bg-black flex justify-center items-center">
            <div className="w-[80%] md:w-[50%] lg:w-[35%] xl:w-[30%] border border-[#e5e7eb]/20 rounded-xl">
                <div className="p-[15px_20px]">
                    <div className="flex flex-col items-center justify-center">
                        <Image src="/logo.png" alt="Logo CNcode" width={140} height={100} />
                        <h1 className="text-white font-bold mt-[10px] text-[20px]">Xác thực OTP</h1>
                    </div>
                    <InputOTP
                        id="digits-only"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        className="w-full"
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
                    <ButtonAuth className="mt-[10px] bg-[#3b82f6] text-white">Xác thực</ButtonAuth>
                </div>
            </div>
        </div>
    )
}