import { useState } from "react";
import { RegisterValidate } from "../validation/register-validate";
import { toast } from "sonner";

export function RegisterService() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true);
        const check = RegisterValidate(name, email, username, password, confirmPassword)
        if (check === true) {
            toast.success("Thành công!")
        } else {
            setLoading(false)
            return;
        }
    }

    return {
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
    }
}