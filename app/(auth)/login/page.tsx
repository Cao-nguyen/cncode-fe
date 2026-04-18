'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GoogleLogin } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'
import { useLogin } from '@/hooks/auth/useLogin.hook'

export default function LoginPage() {
  const { checking, handleGoogleSuccess, handleGoogleError } = useLogin()

  if (checking) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="w-[85%] md:w-[50%] lg:w-[35%] xl:w-[28%]">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Logo CNcode"
              width={140}
              height={100}
              className="w-auto h-auto"
              priority
            />
            <h1 className="text-white font-semibold mt-3 text-xl">
              Đăng nhập vào CNcode
            </h1>
            <p className="text-sm text-zinc-400 mt-1 text-center">
              Tiếp tục bằng tài khoản mạng xã hội
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                width="300"
                text="continue_with"
                locale="vi"
              />
            </div>
          </div>

          <div className="relative my-6 text-center text-xs text-zinc-500">
            <span className="bg-black px-2 relative z-10">
              Nhanh chóng & an toàn
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500">
            Bằng cách tiếp tục, bạn đang đồng ý với{' '}
            <Link href="/dieukhoansudung" className="text-blue-400">
              Điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link href="/antoanbaomat" className="text-blue-400">
              Chính sách bảo mật
            </Link>.
          </p>

          <Link href="/" className="block mt-5">
            <button className="w-full rounded-xl bg-white/80 text-black py-4 text-sm hover:bg-white transition">
              Trở về trang chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}