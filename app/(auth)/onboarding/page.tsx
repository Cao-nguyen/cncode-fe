// /app/(auth)/onboarding/page.tsx
'use client'

import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { useOnboarding } from '@/hooks/auth/useOnboarding.hook'
import { CustomInput } from '@/components/custom/CustomInput'
import { CustomSelect } from '@/components/custom/CustomSelect'
import { CustomButton } from '@/components/custom/CustomButton'

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

  const isUsernameValid = isUsernameAvailable && !isCheckingUsername

  // Chuyển đổi options sang format cho CustomSelect
  const classSelectOptions = classOptions.map(opt => ({ value: opt, label: opt }))
  const provinceSelectOptions = provinceOptions.map(opt => ({ value: opt, label: opt }))

  return (
    <div className="min-h-screen bg-[var(--cn-bg-main)] py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[320px] sm:max-w-[500px] lg:max-w-[600px] mx-auto">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <Image
            src="/images/logo.png"
            alt="CNcode"
            width={80}
            height={48}
            className="mx-auto w-auto h-auto sm:w-[100px] lg:w-[120px]"
            priority
          />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--cn-text-main)] mt-4 sm:mt-5 lg:mt-6">
            Hoàn thiện hồ sơ
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-[var(--cn-text-muted)] mt-1.5 sm:mt-2">
            Cùng xây dựng hồ sơ để bắt đầu hành trình học tập nhé!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-[var(--cn-radius-sm)] flex items-center gap-2 sm:gap-3 text-[var(--cn-error)]">
              <AlertCircle size={16} className="flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">{errors.general}</span>
            </div>
          )}

          {/* Username */}
          <CustomInput
            label="Tên người dùng"
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

          {/* Class */}
          <CustomSelect
            label="Lớp"
            options={classSelectOptions}
            value={formData.class}
            onChange={(value) => handleChange('class', value)}
            error={errors.class}
            placeholder="-- Chọn lớp --"
            required
            disabled={loading}
          />

          {/* Province */}
          <CustomSelect
            label="Tỉnh/Thành phố"
            options={provinceSelectOptions}
            value={formData.province}
            onChange={(value) => handleChange('province', value)}
            error={errors.province}
            placeholder="-- Chọn tỉnh/thành phố --"
            required
            disabled={loading}
          />

          {/* School */}
          <CustomInput
            label="Trường học"
            placeholder="Ví dụ: THPT Tân Quới"
            value={formData.school}
            onChange={(e) => handleChange('school', e.target.value)}
            error={errors.school}
            required
            disabled={loading}
          />

          {/* Birthday */}
          <CustomInput
            label="Ngày sinh"
            type="date"
            value={formData.birthday}
            onChange={(e) => handleChange('birthday', e.target.value)}
            error={errors.birthday}
            required
            disabled={loading}
          />

          {/* Bio */}
          <CustomInput
            label="Bio"
            placeholder="Giới thiệu đôi chút về bạn..."
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            error={errors.bio}
            textarea
            rows={4}
            maxLength={500}
            disabled={loading}
          />

          {/* Submit Button */}
          <CustomButton
            type="submit"
            variant="primary"
            size="large"
            loading={loading || isCheckingUsername}
            disabled={loading || isCheckingUsername}
            fullWidth
            className="mt-4 sm:mt-5 lg:mt-6"
          >
            {loading ? 'Đang xử lý...' : 'Hoàn tất'}
          </CustomButton>

        </form>
      </div>
    </div>
  )
}