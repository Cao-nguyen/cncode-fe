import { useState } from "react"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { login } from "../store/authSlice"
import { verifyOtpAPI } from "@/server/auth-api"
import { useRouter } from "next/navigation"

export function OtpService(email: string) {
    const router = useRouter()
    const dispatch = useDispatch()

    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error("OTP phải đủ 6 số")
            return
        }

        try {
            setLoading(true)

            const res = await verifyOtpAPI(email, otp)

            const { accessToken, user } = res.data

            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("user", JSON.stringify(user))

            dispatch(login(user))
            toast.success("Xác thực thành công")
            router.push("/")

        } catch {
            toast.error("OTP không đúng")
        } finally {
            setLoading(false)
        }
    }

    return {
        otp,
        setOtp,
        loading,
        handleVerify
    }
}