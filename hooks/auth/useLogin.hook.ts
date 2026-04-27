import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CredentialResponse } from '@react-oauth/google'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'
import { IGoogleLoginResponse } from '@/types/auth.type'

export const useLogin = () => {
  const router = useRouter()
  const { token, setAuth } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Ưu tiên token từ persist store, fallback localStorage
      const savedToken = token || localStorage.getItem('token')

      if (!savedToken) {
        setChecking(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })

        if (!response.ok) {
          // Token hết hạn hoặc không hợp lệ
          setChecking(false)
          return
        }

        const result = await response.json()

        // API /me trả về { data: User } hoặc { user: User } — parse an toàn
        const userData = result.data ?? result.user

        if (!userData) {
          setChecking(false)
          return
        }

        // Sync store với data mới nhất từ server (tránh dùng cached isOnboarded)
        setAuth(userData, savedToken)

        // Luôn dùng giá trị isOnboarded từ server, không từ localStorage cache
        if (userData.isOnboarded === false) {
          router.push('/onboarding')
        } else {
          router.push('/')
        }
      } catch {
        setChecking(false)
      }
    }

    checkAuth()
  }, []) // Chỉ chạy 1 lần khi mount, không depend vào token để tránh loop

  const handleGoogleSuccess = useCallback(async (response: CredentialResponse) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })

      const result: IGoogleLoginResponse = await res.json()

      if (result.success) {
        // Sync store với data từ server response
        setAuth(result.data.user, result.data.token)

        if (result.data.isNewUser) {
          toast.success('Chào mừng bạn đến với CNcode!', {
            description: 'Bạn đã nhận 100 xu để bắt đầu hành trình học tập',
            duration: 5000,
          })
        } else {
          toast.success('Đăng nhập thành công!', {
            description: `Chào mừng ${result.data.user.fullName} quay trở lại`,
            duration: 3000,
          })
        }

        // Dùng isOnboarded từ server response, không từ store/cache
        if (result.data.user.isOnboarded === false) {
          router.push('/onboarding')
        } else {
          router.push('/')
        }
      } else {
        toast.error('Đăng nhập thất bại', {
          description: result.message || 'Có lỗi xảy ra',
          duration: 3000,
        })
      }
    } catch {
      toast.error('Đăng nhập thất bại', {
        description: 'Có lỗi xảy ra, vui lòng thử lại sau',
        duration: 3000,
      })
    }
  }, [router, setAuth])

  const handleGoogleError = useCallback(() => {
    toast.error('Đăng nhập thất bại', {
      description: 'Không thể kết nối với Google, vui lòng thử lại',
      duration: 3000,
    })
  }, [])

  return { checking, handleGoogleSuccess, handleGoogleError }
}