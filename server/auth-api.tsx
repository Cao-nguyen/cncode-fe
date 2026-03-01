import { userApi } from "./user-api";

// Đăng ký
export const registerAPI = (
    name: string,
    username: string,
    email: string,
    password: string
) => {
    const data = { name, username, email, password }
    return userApi.post("/auth/register", data)
}

// Xác thực OTP
export const verifyOtpAPI = (
    email: string,
    otp: string
) => {
    return userApi.post("/otp/verify", { email, otp })
};