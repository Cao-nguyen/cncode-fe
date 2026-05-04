// /app/login/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GoogleLogin } from '@react-oauth/google'
import { Shield } from 'lucide-react'
import { useLogin } from '@/hooks/auth/useLogin.hook'

export default function LoginPage() {
  const { checking, handleGoogleSuccess, handleGoogleError } = useLogin()

  if (checking) {
    return (
      <div className="w-full min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] flex flex-col items-center">

        {/* Logo */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <Image
            src="/images/logo.png"
            alt="CNcode"
            width={80}
            height={48}
            className="w-auto h-auto sm:w-[100px] lg:w-[120px]"
            priority
          />
        </div>

        {/* Header Text */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--cn-text-main)] mb-1.5 sm:mb-2 lg:mb-2.5">
            Chào mừng trở lại
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-[var(--cn-text-muted)]">
            Đăng nhập để tiếp tục hành trình học tập
          </p>
        </div>

        {/* Google Login Box */}
        <div className="w-full border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] sm:rounded-[var(--cn-radius-md)] bg-[var(--cn-bg-card)] p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 shadow-[var(--cn-shadow-sm)]">
          <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-[var(--cn-text-muted)] uppercase tracking-wider text-center mb-3 sm:mb-4 lg:mb-5">
            Tiếp tục bằng tài khoản
          </p>
          <div className="flex justify-center">
            <div className="scale-100 sm:scale-105 lg:scale-110 origin-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                shape="pill"
                width="240"
                text="continue_with"
              />
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--cn-success)]/10 border border-[var(--cn-success)]/20 py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 rounded-[var(--cn-radius-sm)] sm:rounded-[var(--cn-radius-md)] mb-6 sm:mb-7 lg:mb-8">
          <Shield size={11} className="text-[var(--cn-success)] sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
          <span className="text-[10px] sm:text-xs lg:text-sm text-[var(--cn-success)] font-medium">
            Xác thực bảo mật qua Google OAuth 2.0
          </span>
        </div>

        {/* Terms and Conditions */}
        <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--cn-text-muted)] text-center leading-relaxed mb-5 sm:mb-6 lg:mb-7 px-2 sm:px-0">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <Link
            href="/dieukhoansudung"
            className="text-[var(--cn-primary)] font-medium hover:underline transition-colors"
          >
            Điều khoản sử dụng
          </Link>{' '}
          và{' '}
          <Link
            href="/antoanbaomat"
            className="text-[var(--cn-primary)] font-medium hover:underline transition-colors"
          >
            Chính sách bảo mật
          </Link>.
        </p>

        {/* Back to Home Button */}
        <Link href="/" className="w-full">
          <button className="w-full border border-[var(--cn-primary)] text-[var(--cn-primary)] text-xs sm:text-sm lg:text-base font-semibold py-2.5 sm:py-3 lg:py-3.5 rounded-[var(--cn-radius-sm)] sm:rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-hover-blue)] transition-all duration-200">
            Trở về trang chủ
          </button>
        </Link>

      </div>
    </div>
  )
}