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
      const savedToken = token || localStorage.getItem('token')

      if (!savedToken) {
        setChecking(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          credentials: 'include',
        })

        if (!response.ok) {
          setChecking(false)
          return
        }

        const result = await response.json()
        const userData = result.data ?? result.user

        if (!userData) {
          setChecking(false)
          return
        }

        setAuth(userData, savedToken)

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
  }, [])

  const handleGoogleSuccess = useCallback(async (response: CredentialResponse) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential }),
      })

      const result: IGoogleLoginResponse = await res.json()

      if (result.success) {
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
    } catch (error) {
      console.error('Google login error:', error)
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