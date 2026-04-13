"use client";

import Image from "next/image";
import { useOnboarding } from "@/features/onboarding/onboarding.hooks";
import { Loader2 } from "lucide-react";

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
    } = useOnboarding();

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
                    {/* Username */}
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
                                onChange={(e) => handleChange("username", e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                                placeholder="username"
                            />
                        </div>
                        {isCheckingUsername && (
                            <p className="text-zinc-400 text-sm mt-1">Đang kiểm tra...</p>
                        )}
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Lớp - Dropdown */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Lớp <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.class}
                            onChange={(e) => handleChange("class", e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
                        >
                            <option value="" className="text-zinc-400">
                                -- Chọn lớp --
                            </option>
                            {classOptions.map((option) => (
                                <option key={option} value={option} className="text-white">
                                    {option}
                                </option>
                            ))}
                        </select>
                        {errors.class && (
                            <p className="text-red-500 text-sm mt-1">{errors.class}</p>
                        )}
                    </div>

                    {/* Tỉnh - Dropdown */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.province}
                            onChange={(e) => handleChange("province", e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
                        >
                            <option value="" className="text-zinc-400">
                                -- Chọn tỉnh/thành phố --
                            </option>
                            {provinceOptions.map((option) => (
                                <option key={option} value={option} className="text-white">
                                    {option}
                                </option>
                            ))}
                        </select>
                        {errors.province && (
                            <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                        )}
                    </div>

                    {/* Trường học */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Trường học <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.school}
                            onChange={(e) => handleChange("school", e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                            placeholder="Ví dụ: THPT Tân Quới"
                        />
                        {errors.school && (
                            <p className="text-red-500 text-sm mt-1">{errors.school}</p>
                        )}
                    </div>

                    {/* Sinh nhật */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => handleChange("birthday", e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                        />
                        {errors.birthday && (
                            <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => handleChange("bio", e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition resize-none"
                            rows={4}
                            placeholder="Giới thiệu đôi chút về bạn..."
                            maxLength={500}
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
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={20} className="animate-spin" />}
                        {loading ? "Đang xử lý..." : "Hoàn tất"}
                    </button>
                </form>
            </div>
        </div>
    );
}