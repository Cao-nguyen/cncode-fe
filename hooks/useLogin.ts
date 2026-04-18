// hooks/useLogin.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, selectUser, selectIsLoaded, clearUser } from '@/store/userSlice';
import { authApi } from '@/lib/api';
import { CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';

interface UseLoginReturn {
    checking: boolean;      // Đang kiểm tra đăng nhập
    loading: boolean;       // Đang xử lý đăng nhập
    handleGoogleSuccess: (credentialResponse: CredentialResponse) => Promise<void>;
    handleGoogleError: () => void;
    logout: () => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const isLoaded = useAppSelector(selectIsLoaded);
    
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // Dùng ref để tránh gọi nhiều lần
    const hasCheckedRef = useRef(false);

    // Hàm lưu thông tin xác thực
    const saveAuthData = useCallback((token: string, userData: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user_safe', JSON.stringify({
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            plan: userData.plan,
            avatar: userData.avatar,
            isProfileCompleted: userData.isProfileCompleted
        }));
    }, []);

    // Hàm xóa thông tin xác thực
    const clearAuthData = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_safe');
        localStorage.removeItem('referral_code');
    }, []);

    // Hàm chuyển hướng dựa trên trạng thái profile
    const redirectBasedOnProfile = useCallback((userData: { isProfileCompleted: boolean }) => {
        if (!userData.isProfileCompleted) {
            router.replace('/onboarding');
        } else {
            router.replace('/');
        }
    }, [router]);

    // Kiểm tra đăng nhập khi component mount
    useEffect(() => {
        // Nếu đã check rồi thì không check lại
        if (hasCheckedRef.current) return;
        
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            
            // Không có token -> chưa đăng nhập
            if (!token) {
                setChecking(false);
                hasCheckedRef.current = true;
                return;
            }

            // Nếu đã có user trong Redux và đã load xong
            if (user && isLoaded) {
                redirectBasedOnProfile(user);
                setChecking(false);
                hasCheckedRef.current = true;
                return;
            }

            try {
                // Kiểm tra token với server
                const userData = await authApi.checkAuth(token);
                dispatch(setUser({ user: userData, token }));
                saveAuthData(token, userData);
                redirectBasedOnProfile(userData);
            } catch (error) {
                console.error('Auto login failed:', error);
                // Token không hợp lệ, xóa dữ liệu
                clearAuthData();
                dispatch(clearUser());
            } finally {
                setChecking(false);
                hasCheckedRef.current = true;
            }
        };

        checkAuth();
    }, [user, isLoaded, dispatch, redirectBasedOnProfile, saveAuthData, clearAuthData]);

    // Xử lý đăng nhập Google thành công
    const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
        const idToken = credentialResponse.credential;
        
        if (!idToken) {
            toast.error('Không nhận được token từ Google');
            return;
        }

        setLoading(true);

        try {
            // Gọi API đăng nhập
            const { token, user: userData } = await authApi.googleLogin(idToken);

            // Lưu thông tin
            saveAuthData(token, userData);
            
            // Cập nhật Redux
            dispatch(setUser({ user: userData, token }));

            // Hiển thị thông báo và chuyển hướng
            if (!userData.isProfileCompleted) {
                toast.info('Vui lòng hoàn tất thông tin hồ sơ');
                router.push('/onboarding');
            } else {
                toast.success(`Chào mừng trở lại, ${userData.name}! 👋`);
                router.push('/');
            }
        } catch (error: any) {
            console.error('Google login failed:', error);
            
            // Xử lý lỗi chi tiết
            const status = error.response?.status;
            const message = error.response?.data?.message;
            
            if (status === 409) {
                toast.error('Email đã được đăng ký với phương thức khác');
            } else if (status === 403) {
                toast.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ');
            } else if (status === 404) {
                toast.error('Không tìm thấy API đăng nhập. Vui lòng kiểm tra lại đường dẫn');
            } else {
                toast.error(message || 'Đăng nhập thất bại. Vui lòng thử lại');
            }
            
            // Xóa dữ liệu nếu có lỗi
            clearAuthData();
            dispatch(clearUser());
        } finally {
            setLoading(false);
        }
    }, [dispatch, router, saveAuthData, clearAuthData]);

    // Xử lý lỗi Google Login
    const handleGoogleError = useCallback(() => {
        console.error('Google login error');
        toast.error('Đăng nhập Google thất bại. Vui lòng kiểm tra kết nối mạng và thử lại');
        setLoading(false);
    }, []);

    // Đăng xuất
    const logout = useCallback(async () => {
        setLoading(true);
        
        try {
            // Gọi API logout
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Xóa dữ liệu local
            clearAuthData();
            
            // Xóa Redux store
            dispatch(clearUser());
            
            // Hiển thị thông báo
            toast.success('Đã đăng xuất thành công');
            
            // Chuyển hướng về trang đăng nhập
            router.push('/login');
            
            setLoading(false);
        }
    }, [dispatch, router, clearAuthData]);

    return {
        checking,
        loading,
        handleGoogleSuccess,
        handleGoogleError,
        logout,
    };
};