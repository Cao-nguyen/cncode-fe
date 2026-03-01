import { toast } from "sonner";

export function RegisterValidate(
    name: string,
    email: string,
    username: string,
    password: string,
    confirmPassword: string
) {
    if (!name) {
        toast.error("Vui lòng nhập họ và tên");
        return false;
    }

    if (name.length < 2) {
        toast.error("Họ và tên quá ngắn");
        return false;
    }

    if (name.length > 40) {
        toast.error("Họ và tên quá dài");
        return false;
    }

    if (!email) {
        toast.error("Vui lòng nhập email");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error("Email không hợp lệ");
        return false;
    }

    if (!username) {
        toast.error("Vui lòng nhập tên đăng nhập");
        return false;
    }

    if (username.length < 4) {
        toast.error("Tên đăng nhập phải ≥ 4 ký tự");
        return false;
    }

    if (!password) {
        toast.error("Vui lòng nhập mật khẩu");
        return false;
    }

    if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return false;
    }

    if (!/[A-Z]/.test(password)) {
        toast.error("Mật khẩu phải chứa ít nhất 1 chữ in hoa");
        return false;
    }

    if (!/[0-9]/.test(password)) {
        toast.error("Mật khẩu phải chứa ít nhất 1 chữ số");
        return false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(password)) {
        toast.error("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
        return false;
    }

    if (!confirmPassword) {
        toast.error("Vui lòng xác nhận mật khẩu");
        return false;
    }

    if (password !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return false;
    }

    return true;
}