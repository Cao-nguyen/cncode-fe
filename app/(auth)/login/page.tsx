'use client'

import Image from '@/node_modules/next/image'
import Link from '@/node_modules/next/link'
import { GoogleLogin } from '@react-oauth/google'
import { Loader2, Shield } from 'lucide-react'
import { useLogin } from '@/hooks/auth/useLogin.hook'

export default function LoginPage() {
  const { checking, handleGoogleSuccess, handleGoogleError } = useLogin()

  if (checking) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-main" />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[360px] flex flex-col items-center">

        <Image
          src="/images/logo.png"
          alt="CNcode"
          width={110}
          height={66}
          className="w-auto h-auto mb-8"
          priority
        />

        <div className="text-center mb-8 w-full">
          <h1 className="text-[1.7rem] font-bold text-main leading-tight mb-1.5">
            Chào mừng trở lại
          </h1>
          <p className="text-sm text-gray-400">
            Đăng nhập để tiếp tục hành trình học tập của bạn
          </p>
        </div>

        <div className="w-full border border-gray-200 bg-gray-50/60 p-6 mb-3" style={{ borderRadius: '8px' }}>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">
            Tiếp tục bằng tài khoản
          </p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="pill"
              width="280"
              text="continue_with"
            />
          </div>
        </div>

        <div
          className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-100 py-2.5 px-4 mb-8"
          style={{ borderRadius: '7px' }}
        >
          <Shield size={13} className="text-green-500 flex-shrink-0" />
          <span className="text-xs text-green-600 font-medium">
            Xác thực bảo mật qua Google OAuth 2.0
          </span>
        </div>

        <div className="border-t border-gray-100 w-full mb-6" />

        <p className="text-center text-[11.5px] text-gray-400 leading-relaxed mb-5">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <Link href="/dieukhoansudung" className="text-main font-medium hover:underline underline-offset-2">
            Điều khoản sử dụng
          </Link>{' '}
          và{' '}
          <Link href="/antoanbaomat" className="text-main font-medium hover:underline underline-offset-2">
            Chính sách bảo mật
          </Link>.
        </p>

        <Link href="/" className="w-full">
          <button
            className="w-full border border-main text-main text-sm font-semibold py-3 hover:bg-main/5 transition-colors"
            style={{ borderRadius: '8px' }}
          >
            Trở về trang chủ
          </button>
        </Link>

      </div>
    </div>
  )
}