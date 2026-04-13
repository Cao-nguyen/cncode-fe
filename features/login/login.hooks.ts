import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, selectUser, selectIsLoaded } from "@/store/userSlice";
import { loginApi } from "./login.api";
import { CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";

export const useLogin = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const isLoaded = useAppSelector(selectIsLoaded);

    useEffect(() => {
        // Nếu đã có user từ localStorage (hydrate từ Redux)
        if (user && isLoaded) {
            if (!user.isProfileCompleted) {
                router.replace("/onboarding");
            } else {
                router.replace("/");
            }
            return;
        }

        // Nếu chưa có user nhưng có token trong localStorage
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) return;

            try {
                const userData = await loginApi.checkAuth(token);
                dispatch(setUser({ user: userData, token }));

                if (!userData.isProfileCompleted) {
                    router.replace("/onboarding");
                } else {
                    router.replace("/");
                }
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user_safe");
            }
        };

        checkAuth();
    }, [user, isLoaded, router, dispatch]);

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (!credentialResponse.credential) return;

            const result = await loginApi.googleLogin(credentialResponse.credential);
            const { token, user } = result;

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

    const handleGoogleError = () => {
        toast.error("Đăng nhập Google thất bại");
    };

    return { handleGoogleSuccess, handleGoogleError };
};