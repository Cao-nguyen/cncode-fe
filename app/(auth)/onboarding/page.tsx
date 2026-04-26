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
    classOptions,
    provinceOptions,
    handleChange,
    handleSubmit,
  } = useOnboarding()

  const isUsernameValid = formData.username.length >= 3 &&
    /^[a-zA-Z0-9_]+$/.test(formData.username) &&
    !errors.username &&
    formData.username.length > 0

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="CNcode"
            width={100}
            height={60}
            className="mx-auto w-auto h-auto"
            priority
          />
          <h1 className="text-2xl font-bold text-white mt-4">
            Hoàn thiện hồ sơ
          </h1>
          <p className="text-zinc-400 mt-2">
            Cùng xây dựng hồ sơ để bắt đầu hành trình học tập nhé!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle size={20} />
              <span className="flex-1 text-sm">{errors.general}</span>
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tên người dùng <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                @
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={`w-full pl-8 pr-12 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-blue-500 transition ${errors.username ? 'border-red-500' : isUsernameValid ? 'border-green-500' : 'border-zinc-700'
                  }`}
                placeholder="username"
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isCheckingUsername && (
                  <Loader2 size={18} className="animate-spin text-zinc-400" />
                )}
                {isUsernameValid && !isCheckingUsername && (
                  <CheckCircle size={18} className="text-green-500" />
                )}
              </div>
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
            {!errors.username && formData.username.length >= 3 && !isCheckingUsername && (
              <p className="text-green-500 text-sm mt-1">Tên người dùng hợp lệ</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Lớp <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.class}
              onChange={(e) => handleChange('class', e.target.value)}
              className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer ${errors.class ? 'border-red-500' : 'border-zinc-700'
                }`}
              disabled={loading}
            >
              <option value="">-- Chọn lớp --</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.class && (
              <p className="text-red-500 text-sm mt-1">{errors.class}</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer ${errors.province ? 'border-red-500' : 'border-zinc-700'
                }`}
              disabled={loading}
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {provinceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-red-500 text-sm mt-1">{errors.province}</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Trường học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => handleChange('school', e.target.value)}
              className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-blue-500 transition ${errors.school ? 'border-red-500' : 'border-zinc-700'
                }`}
              placeholder="Ví dụ: THPT Tân Quới"
              disabled={loading}
            />
            {errors.school && (
              <p className="text-red-500 text-sm mt-1">{errors.school}</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleChange('birthday', e.target.value)}
              className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-blue-500 transition ${errors.birthday ? 'border-red-500' : 'border-zinc-700'
                }`}
              disabled={loading}
            />
            {errors.birthday && (
              <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-blue-500 transition resize-none ${errors.bio ? 'border-red-500' : 'border-zinc-700'
                }`}
              rows={4}
              placeholder="Giới thiệu đôi chút về bạn..."
              maxLength={500}
              disabled={loading}
            />
            <div className="text-right text-xs text-zinc-500 mt-1">
              {formData.bio.length}/500
            </div>
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isCheckingUsername}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? 'Đang xử lý...' : 'Hoàn tất'}
          </button>
        </form>
      </div>
    </div>
  )
}