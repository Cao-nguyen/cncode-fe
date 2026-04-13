import { useState, useEffect, useCallback } from "react";
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
    const [checking, setChecking] = useState(true);

    const redirectBasedOnProfile = useCallback((userData: { isProfileCompleted: boolean }) => {
        if (!userData.isProfileCompleted) {
            router.replace("/onboarding");
        } else {
            router.replace("/");
        }
    }, [router]);

    useEffect(() => {
        if (user && isLoaded) {
            redirectBasedOnProfile(user);
            return;
        }

        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setChecking(false);
                return;
            }

            try {
                const userData = await loginApi.checkAuth(token);
                dispatch(setUser({ user: userData, token }));
                redirectBasedOnProfile(userData);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user_safe");
                setChecking(false);
            }
        };

        checkAuth();
    }, [user, isLoaded, router, dispatch, redirectBasedOnProfile]);

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

    return { checking, handleGoogleSuccess, handleGoogleError };
};