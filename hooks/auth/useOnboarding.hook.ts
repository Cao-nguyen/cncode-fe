import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { IOnboardingData, IOnboardingResponse } from '@/types/auth.type';

const PROVINCES: string[] = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh',
  'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng',
  'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh',
  'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const CLASSES: string[] = [
  ...Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`),
  'Sinh viên',
  'Khác'
];

interface ErrorsType {
  username?: string;
  class?: string;
  province?: string;
  school?: string;
  birthday?: string;
  bio?: string;
  general?: string;
}

export const useOnboarding = () => {
  const router = useRouter();
  const { token, setUser, setIsOnboarded, forceLogout, _hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [formData, setFormData] = useState<IOnboardingData>({
    username: '',
    class: '',
    province: '',
    school: '',
    birthday: '',
    bio: ''
  });
  const [errors, setErrors] = useState<ErrorsType>({});
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedUsernameRef = useRef<string>('');

  const handleChange = useCallback((field: keyof IOnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'username') {
      setIsUsernameAvailable(false);
      lastCheckedUsernameRef.current = '';
    }

    if (errors[field as keyof ErrorsType]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) return;

    setIsUsernameAvailable(false);
    setIsCheckingUsername(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`
      );

      if (response.status === 401) {
        forceLogout();
        router.push('/login');
        return;
      }

      const result = await response.json();

      if (!result.available) {
        setErrors(prev => ({ ...prev, username: result.message || 'Tên người dùng đã tồn tại' }));
        setIsUsernameAvailable(false);
      } else {
        setErrors(prev => ({ ...prev, username: undefined }));
        setIsUsernameAvailable(true);
      }
    } catch (error) {
      console.error('Check username failed:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  }, [forceLogout, router]);

  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    const username = formData.username;

    const isFormatValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    const notCheckedYet = lastCheckedUsernameRef.current !== username;
    const hasNoFormatError = !errors.username;

    if (isFormatValid && notCheckedYet && hasNoFormatError) {
      checkTimeoutRef.current = setTimeout(() => {
        lastCheckedUsernameRef.current = username;
        checkUsername(username);
      }, 800);
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [formData.username, errors.username, checkUsername]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ErrorsType = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên người dùng chỉ bao gồm chữ cái, số và dấu gạch dưới';
    }

    if (!formData.class) {
      newErrors.class = 'Vui lòng chọn lớp';
    }
    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    }
    if (!formData.school.trim()) {
      newErrors.school = 'Vui lòng nhập trường học';
    }
    if (!formData.birthday) {
      newErrors.birthday = 'Vui lòng chọn ngày sinh';
    } else {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 10 || age > 60) {
        newErrors.birthday = 'Tuổi phải từ 10 đến 60';
      }
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isCheckingUsername) {
      toast.warning('Đang kiểm tra tên người dùng', {
        description: 'Vui lòng đợi trong giây lát',
      });
      return;
    }

    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          class: formData.class,
          province: formData.province,
          school: formData.school,
          birthday: formData.birthday,
          bio: formData.bio
        })
      });

      if (response.status === 401) {
        forceLogout();
        router.push('/login');
        return;
      }

      const result: IOnboardingResponse = await response.json();

      if (result.success) {
        setUser(result.data);
        setIsOnboarded(true);

        toast.success('Hoàn tất hồ sơ thành công!', {
          description: `Chào mừng ${result.data.fullName} đến với CNcode`,
          duration: 3000,
        });

        router.push('/');
      } else {
        if (result.message && result.message.toLowerCase().includes('username')) {
          setErrors(prev => ({ ...prev, username: result.message }));
          setIsUsernameAvailable(false);
          toast.error('Lỗi', { description: result.message });
        } else {
          setErrors(prev => ({ ...prev, general: result.message || 'Có lỗi xảy ra' }));
          toast.error('Có lỗi xảy ra', {
            description: result.message || 'Vui lòng thử lại sau',
          });
        }
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
      setErrors(prev => ({ ...prev, general: 'Không thể kết nối đến server' }));
      toast.error('Lỗi kết nối', {
        description: 'Không thể kết nối đến server, vui lòng thử lại sau',
      });
    } finally {
      setLoading(false);
    }
  }, [formData, token, validateForm, router, setUser, setIsOnboarded, isCheckingUsername, forceLogout]);

  return {
    formData,
    errors,
    loading,
    isCheckingUsername,
    isUsernameAvailable,
    classOptions: CLASSES,
    provinceOptions: PROVINCES,
    handleChange,
    handleSubmit,
  };
};