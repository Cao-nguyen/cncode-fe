import { useState } from "react";
import { RegisterValidate } from "../validations/register-validate";
import { toast } from "sonner";
import { registerAPI } from "@/server/auth-api";
import { useRouter } from "next/navigation";

export function RegisterService() {
    const router = useRouter();

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setLoading(true);

        const check = RegisterValidate(name, email, username, password, confirmPassword)

        if (check !== true) {
            setLoading(false)
            return
        }

        try {
            await registerAPI(name, username, email, password)

            toast.success("OTP đã được gửi về email. Hãy kiểm tra cả thư rác của bạn!")
            router.push(`/otp?email=${encodeURIComponent(email)}`);
        } catch {
            toast.error("Đăng ký thất bại");
        } finally {
            setLoading(false)
        }
    }

    return {
        name, setName,
        email, setEmail,
        username, setUsername,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        loading, setLoading,
        handleRegister
    }
}