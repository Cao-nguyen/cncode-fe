'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GoogleLogin } from '@react-oauth/google'
import { Shield, Terminal, ChevronRight } from 'lucide-react'
import { useLogin } from '@/hooks/auth/useLogin.hook'

export default function LoginPage() {
  const { checking, handleGoogleSuccess, handleGoogleError } = useLogin()
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const fullText = 'auth login --provider=google'

  useEffect(() => {
    let index = 0
    let isDeleting = false

    const type = () => {
      if (!isDeleting && index < fullText.length) {
        // Typing forward
        setTypedText(fullText.slice(0, index + 1))
        index++
        setTimeout(type, 80)
      } else if (!isDeleting && index >= fullText.length) {
        // Finished typing, wait then start deleting
        isDeleting = true
        setTimeout(type, 1000)
      } else if (isDeleting && index > 0) {
        // Deleting backward
        setTypedText(fullText.slice(0, index - 1))
        index--
        setTimeout(type, 40)
      } else if (isDeleting && index <= 0) {
        // Finished deleting, start typing again
        isDeleting = false
        setTimeout(type, 80)
      }
    }

    type()

    return () => {
      // Cleanup handled by the recursive setTimeout pattern
    }
  }, [])

  if (checking) {
    return (
      <div className="w-full min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="flex items-center gap-2 font-mono text-sm text-[#64748B]">
          <span className="text-[#3BA4E8]">$</span>
          <span>đang xác thực</span>
          <span className="w-2 h-4 bg-[#3BA4E8] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F9FB] relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 overflow-x-hidden">

      {/* Ambient grid background */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#EBEFF3 1px, transparent 1px), linear-gradient(90deg, #EBEFF3 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 100%)',
        }}
      />
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[#3BA4E8]/[0.07] blur-[110px] pointer-events-none" />

      <div className="w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] flex flex-col items-center relative">

        {/* Logo */}
        <div className="mb-6 sm:mb-7 lg:mb-8 flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="CNcode"
            width={72}
            height={40}
            className="w-auto h-9 sm:h-10 lg:h-11"
          />
        </div>

        {/* Terminal prompt line */}
        <div className="w-full flex items-center gap-2 font-mono text-[11px] sm:text-xs text-[#64748B] mb-3 sm:mb-4 px-1 overflow-hidden whitespace-nowrap">
          <Terminal size={12} className="text-[#3BA4E8] shrink-0" />
          <span className="text-[#3BA4E8] shrink-0">cncode ~</span>
          <span className="text-[#64748B]">{typedText}</span>
          <span className={`w-[6px] h-[13px] bg-[#3BA4E8] ml-0.5 shrink-0 ${isTyping ? 'animate-pulse' : ''}`} />
        </div>

        {/* IDE window card */}
        <div className="w-full rounded-xl border border-[#E2E8F0] bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* Titlebar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F1F4F8] border-b border-[#E2E8F0]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]/70" />
            </div>
            <span className="ml-2 font-mono text-[11px] text-[#64748B]">login.tsx</span>
          </div>

          {/* Card body */}
          <div className="px-5 sm:px-6 lg:px-7 py-6 sm:py-7 lg:py-8">

            {/* Title */}
            <div className="mb-6 sm:mb-7">
              <p className="font-mono text-[11px] sm:text-xs text-[#3BA4E8] mb-1.5">
                // chào mừng trở lại
              </p>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1E293B] mb-1.5 leading-snug">
                Đăng nhập để tiếp tục
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Tiếp tục hành trình học tập của bạn
              </p>
            </div>

            {/* Google Login */}
            <div className="w-full border border-[#E2E8F0] rounded-lg bg-[#F9FAFB] p-4 sm:p-5 mb-4 sm:mb-5 overflow-hidden">
              <p className="font-mono text-[10px] sm:text-[11px] font-medium text-[#64748B] uppercase tracking-wider text-center mb-3 sm:mb-4">
                Đăng nhập với Google
              </p>
              <div className="w-full flex justify-center overflow-hidden">
                <div className="w-full max-w-[240px] flex justify-center [&>div]:!w-full [&_iframe]:!w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    shape="pill"
                    width="240"
                    text="signin_with"
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <p className="text-[10px] sm:text-xs text-[#64748B] text-center leading-relaxed">
              Bằng cách tiếp tục, bạn đồng ý với{' '}
              <Link
                href="/dieukhoansudung"
                className="text-[#3BA4E8] font-medium hover:underline transition-colors"
              >
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link
                href="/antoanbaomat"
                className="text-[#3BA4E8] font-medium hover:underline transition-colors"
              >
                Chính sách bảo mật
              </Link>.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <Link href="/" className="w-full mt-5 sm:mt-6">
          <button className="w-full group flex items-center justify-center gap-1.5 border border-[#E2E8F0] bg-white text-[#1E293B] text-xs sm:text-sm font-mono py-2.5 sm:py-3 rounded-lg hover:border-[#3BA4E8]/40 hover:bg-[#3BA4E8]/[0.05] transition-all duration-200">
            <ChevronRight size={14} className="text-[#3BA4E8] rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            <span>trở về trang chủ</span>
          </button>
        </Link>

      </div>
    </div>
  )
}