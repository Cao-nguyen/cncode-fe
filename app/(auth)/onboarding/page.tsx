'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Terminal, ChevronRight, User, GraduationCap, MapPin, Building, Calendar, FileText } from 'lucide-react'
import { useOnboarding } from '@/hooks/auth/useOnboarding.hook'
import { CustomInput } from '@/components/custom/CustomInput'
import { CustomSelect } from '@/components/custom/CustomSelect'
import { CustomButton } from '@/components/custom/CustomButton'
import Link from 'next/link'

export default function OnboardingPage() {
  const {
    formData,
    errors,
    loading,
    isCheckingUsername,
    isUsernameAvailable,
    classOptions,
    provinceOptions,
    handleChange,
    handleSubmit,
  } = useOnboarding()

  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const fullText = 'user setup --profile'

  useEffect(() => {
    let index = 0
    let isDeleting = false

    const type = () => {
      if (!isDeleting && index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1))
        index++
        setTimeout(type, 80)
      } else if (!isDeleting && index >= fullText.length) {
        isDeleting = true
        setTimeout(type, 1000)
      } else if (isDeleting && index > 0) {
        setTypedText(fullText.slice(0, index - 1))
        index--
        setTimeout(type, 40)
      } else if (isDeleting && index <= 0) {
        isDeleting = false
        setTimeout(type, 80)
      }
    }

    type()

    return () => {
      // Cleanup handled by the recursive setTimeout pattern
    }
  }, [])

  const isUsernameValid = isUsernameAvailable && !isCheckingUsername
  const classSelectOptions = classOptions.map(opt => ({ value: opt, label: opt }))
  const provinceSelectOptions = provinceOptions.map(opt => ({ value: opt, label: opt }))

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

      <div className="w-full max-w-[90%] sm:max-w-[85%] lg:max-w-[600px] flex flex-col items-center relative">

        {/* Logo */}
        <div className="mb-6 sm:mb-7 lg:mb-8 flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="CNcode"
            width={120}
            height={64}
            className="w-auto h-12 sm:h-14 lg:h-16"
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
            <span className="ml-2 font-mono text-[11px] text-[#64748B]">onboarding.tsx</span>
          </div>

          {/* Card body */}
          <div className="px-5 sm:px-6 lg:px-7 py-6 sm:py-7 lg:py-8">

            {/* Title */}
            <div className="mb-6 sm:mb-7">
              <p className="font-mono text-[11px] sm:text-xs text-[#3BA4E8] mb-1.5">
                // hoàn thiện hồ sơ
              </p>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1E293B] mb-1.5 leading-snug">
                Hoàn thiện hồ sơ
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Cùng xây dựng hồ sơ để bắt đầu hành trình học tập nhé!
              </p>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 sm:gap-3 text-red-600">
                <AlertCircle size={16} className="flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm">{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

              {/* Username */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-[#3BA4E8]" />
                  <label className="text-xs sm:text-sm font-medium text-[#1E293B]">
                    Tên người dùng
                  </label>
                </div>
                <CustomInput
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  error={errors.username}
                  success={isUsernameValid}
                  prefix="@"
                  isLoading={isCheckingUsername}
                  required
                  disabled={loading}
                />
              </div>

              {/* Class */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={14} className="text-[#3BA4E8]" />
                  <label className="text-xs sm:text-sm font-medium text-[#1E293B]">
                    Lớp
                  </label>
                </div>
                <CustomSelect
                  options={classSelectOptions}
                  value={formData.class}
                  onChange={(value) => handleChange('class', value)}
                  error={errors.class}
                  placeholder="-- Chọn lớp --"
                  required
                  disabled={loading}
                />
              </div>

              {/* Province */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-[#3BA4E8]" />
                  <label className="text-xs sm:text-sm font-medium text-[#1E293B]">
                    Tỉnh/Thành phố
                  </label>
                </div>
                <CustomSelect
                  options={provinceSelectOptions}
                  value={formData.province}
                  onChange={(value) => handleChange('province', value)}
                  error={errors.province}
                  placeholder="-- Chọn tỉnh/thành phố --"
                  required
                  disabled={loading}
                />
              </div>

              {/* School */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Building size={14} className="text-[#3BA4E8]" />
                  <label className="text-xs sm:text-sm font-medium text-[#1E293B]">
                    Trường học
                  </label>
                </div>
                <CustomInput
                  placeholder="Ví dụ: THPT Tân Quới"
                  value={formData.school}
                  onChange={(e) => handleChange('school', e.target.value)}
                  error={errors.school}
                  required
                  disabled={loading}
                />
              </div>

              {/* Birthday */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-[#3BA4E8]" />
                  <label className="text-xs sm:text-sm font-medium text-[#1E293B]">
                    Ngày sinh
                  </label>
                </div>
                <CustomInput
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                  error={errors.birthday}
                  required
                  disabled={loading}
                />
              </div>

              {/* Bio */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-[#3BA4E8]" />
                  <label className="text-xs sm:text-sm font-medium text-[#1E293B]">
                    Bio
                  </label>
                </div>
                <CustomInput
                  placeholder="Giới thiệu đôi chút về bạn..."
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  error={errors.bio}
                  textarea
                  rows={4}
                  maxLength={500}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <CustomButton
                type="submit"
                variant="primary"
                size="large"
                loading={loading || isCheckingUsername}
                disabled={loading || isCheckingUsername}
                fullWidth
                className="mt-4 sm:mt-5"
              >
                {loading ? 'Đang xử lý...' : 'Hoàn tất'}
              </CustomButton>

            </form>
          </div>
        </div>

        {/* Back Button */}
        <Link href="/login" className="w-full mt-5 sm:mt-6">
          <button className="w-full group flex items-center justify-center gap-1.5 border border-[#E2E8F0] bg-white text-[#1E293B] text-xs sm:text-sm font-mono py-2.5 sm:py-3 rounded-lg hover:border-[#3BA4E8]/40 hover:bg-[#3BA4E8]/[0.05] transition-all duration-200">
            <ChevronRight size={14} className="text-[#3BA4E8] rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            <span>quay lại đăng nhập</span>
          </button>
        </Link>

      </div>
    </div>
  )
}