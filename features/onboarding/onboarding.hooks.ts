import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, selectUser } from "@/store/userSlice";
import { onboardingApi } from "./onboarding.api";
import { validateForm, validateUsername } from "./onboarding.validation";
import { OnboardingFormData, ValidationErrors, OnboardingField } from "./onboarding.types";
import { CLASS_OPTIONS, PROVINCE_OPTIONS } from "./onboarding.constants";
import { toast } from "sonner";

const INITIAL_FORM_DATA: OnboardingFormData = {
    username: "",
    class: "",
    province: "",
    school: "",
    birthday: "",
    bio: "",
};

export const useOnboarding = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);

    const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(true);

    useEffect(() => {
        if (!user) {
            router.replace("/login");
            return;
        }

        if (user.isProfileCompleted) {
            router.replace("/");
        }
    }, [user, router]);

    const checkUsernameAvailability = useCallback(async (username: string): Promise<void> => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsCheckingUsername(true);
        try {
            const result = await onboardingApi.checkUsername(username, token);
            setIsUsernameAvailable(result.available);
            if (!result.available) {
                setErrors(prev => ({ ...prev, username: "Tên người dùng đã tồn tại" }));
            } else {
                setErrors(prev => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { username: removedUsername, ...rest } = prev;
                    return rest;
                });
            }
        } catch {
            setIsUsernameAvailable(true);
        } finally {
            setIsCheckingUsername(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.username && validateUsername(formData.username) === null) {
                await checkUsernameAvailability(formData.username);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.username, checkUsernameAvailability]);

    const handleChange = useCallback((field: OnboardingField, value: string): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [field]: removedField, ...rest } = prev;
                return rest;
            });
        }
    }, [errors]);

    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        if (!isUsernameAvailable) {
            toast.error("Tên người dùng đã tồn tại");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập lại");
                router.push("/login");
                return;
            }

            const submitData = new FormData();
            submitData.append("username", formData.username);
            submitData.append("class", formData.class);
            submitData.append("province", formData.province);
            submitData.append("school", formData.school);
            submitData.append("birthday", formData.birthday);
            submitData.append("bio", formData.bio);

            const result = await onboardingApi.updateProfile(submitData, token);

            if (result.success && result.user) {
                dispatch(setUser({ user: result.user, token }));
                toast.success("Hoàn tất thiết lập hồ sơ! 🎉");
                router.push("/");
            } else {
                toast.error(result.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    }, [formData, isUsernameAvailable, dispatch, router]);

    return {
        formData,
        errors,
        loading,
        isCheckingUsername,
        isUsernameAvailable,
        classOptions: CLASS_OPTIONS,
        provinceOptions: PROVINCE_OPTIONS,
        handleChange,
        handleSubmit,
    };
};