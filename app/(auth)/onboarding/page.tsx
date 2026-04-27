'use client'

import Image from '@/node_modules/next/image'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useOnboarding } from '@/hooks/auth/useOnboarding.hook'

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

  // isUsernameValid giờ dựa vào server đã confirm, không tự suy đoán
  const isUsernameValid = isUsernameAvailable && !isCheckingUsername

  const inputBase =
    'w-full px-4 py-3 bg-white border text-gray-900 text-sm focus:outline-none focus:border-main transition placeholder:text-gray-300'
  const inputRadius = { borderRadius: '8px' }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-10">
          <Image
            src="/images/logo.png"
            alt="CNcode"
            width={100}
            height={60}
            className="mx-auto w-auto h-auto"
            priority
          />
          <h1 className="text-2xl font-bold text-main mt-4">
            Hoàn thiện hồ sơ
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Cùng xây dựng hồ sơ để bắt đầu hành trình học tập nhé!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {errors.general && (
            <div
              className="p-4 bg-red-50 border border-red-200 flex items-center gap-3 text-red-500"
              style={inputRadius}
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="text-sm">{errors.general}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên người dùng <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm select-none">
                @
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={`${inputBase} pl-8 pr-11 ${errors.username
                  ? 'border-red-400'
                  : isUsernameValid
                    ? 'border-green-400'
                    : 'border-gray-200'
                  }`}
                style={inputRadius}
                placeholder="username"
                disabled={loading}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {isCheckingUsername && (
                  <Loader2 size={16} className="animate-spin text-gray-300" />
                )}
                {isUsernameValid && (
                  <CheckCircle size={16} className="text-green-500" />
                )}
              </div>
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
            {isUsernameValid && (
              <p className="text-green-500 text-xs mt-1">Tên người dùng hợp lệ</p>
            )}
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Lớp <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.class}
              onChange={(e) => handleChange('class', e.target.value)}
              className={`${inputBase} appearance-none cursor-pointer ${errors.class ? 'border-red-400' : 'border-gray-200'
                }`}
              style={inputRadius}
              disabled={loading}
            >
              <option value="">-- Chọn lớp --</option>
              {classOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.class && (
              <p className="text-red-500 text-xs mt-1">{errors.class}</p>
            )}
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              className={`${inputBase} appearance-none cursor-pointer ${errors.province ? 'border-red-400' : 'border-gray-200'
                }`}
              style={inputRadius}
              disabled={loading}
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {provinceOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.province && (
              <p className="text-red-500 text-xs mt-1">{errors.province}</p>
            )}
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Trường học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => handleChange('school', e.target.value)}
              className={`${inputBase} ${errors.school ? 'border-red-400' : 'border-gray-200'}`}
              style={inputRadius}
              placeholder="Ví dụ: THPT Tân Quới"
              disabled={loading}
            />
            {errors.school && (
              <p className="text-red-500 text-xs mt-1">{errors.school}</p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleChange('birthday', e.target.value)}
              className={`${inputBase} ${errors.birthday ? 'border-red-400' : 'border-gray-200'}`}
              style={inputRadius}
              disabled={loading}
            />
            {errors.birthday && (
              <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className={`${inputBase} resize-none ${errors.bio ? 'border-red-400' : 'border-gray-200'}`}
              style={inputRadius}
              rows={4}
              placeholder="Giới thiệu đôi chút về bạn..."
              maxLength={500}
              disabled={loading}
            />
            <div className="text-right text-xs text-gray-300 mt-1">
              {formData.bio.length}/500
            </div>
            {errors.bio && (
              <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || isCheckingUsername}
            className="w-full py-3 bg-main text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{ borderRadius: '8px' }}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Đang xử lý...' : 'Hoàn tất'}
          </button>

        </form>
      </div>
    </div>
  )
}