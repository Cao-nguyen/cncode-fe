"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

/* ================= TYPES ================= */

type FormState = {
    province: string
    school: string
    grade: string
    dob: string
}

/* ================= MAIN ================= */

export default function InforLogin() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const tab = searchParams.get("tab") || "otp"

    const [otp, setOtp] = useState<string>("")

    const [form, setForm] = useState<FormState>({
        province: "",
        school: "",
        grade: "",
        dob: ""
    })

    /* ================= HANDLERS ================= */

    const handleVerify = () => {
        if (otp.length < 6) return
        router.push("/infor-login?tab=infor")
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    /* ================= UI ================= */

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="w-[90%] max-w-md border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-6">

                {/* ================= OTP ================= */}
                {tab === "otp" && (
                    <>
                        <h1 className="text-white text-xl font-semibold text-center">
                            Nhập mã OTP
                        </h1>

                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            placeholder="••••••"
                            className="mt-6 w-full text-center tracking-[10px] text-white text-lg bg-transparent border border-zinc-700 rounded-xl py-3 outline-none focus:border-blue-500"
                        />

                        <button
                            onClick={handleVerify}
                            className="mt-5 w-full rounded-xl bg-blue-500 text-white py-3 hover:bg-blue-600 transition"
                        >
                            Xác nhận
                        </button>
                    </>
                )}

                {/* ================= INFOR ================= */}
                {tab === "infor" && (
                    <>
                        <h1 className="text-white text-xl font-semibold text-center">
                            Thông tin cá nhân
                        </h1>

                        <div className="mt-6 space-y-4">

                            {/* Province */}
                            <input
                                name="province"
                                placeholder="Nhập tỉnh / thành phố"
                                value={form.province}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white outline-none focus:border-blue-500"
                            />

                            {/* School */}
                            <input
                                name="school"
                                placeholder="Nhập tên trường"
                                value={form.school}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white outline-none focus:border-blue-500"
                            />

                            {/* Grade */}
                            <input
                                name="grade"
                                placeholder="Nhập lớp (VD: 10, 11, 12, Đại học...)"
                                value={form.grade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white outline-none focus:border-blue-500"
                            />

                            {/* DOB */}
                            <DOBInput
                                value={form.dob}
                                onChange={(val) =>
                                    setForm(prev => ({
                                        ...prev,
                                        dob: val
                                    }))
                                }
                            />
                        </div>

                        <button className="mt-6 w-full rounded-xl bg-blue-500 text-white py-3 hover:bg-blue-600 transition">
                            Hoàn tất
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

/* ================= DOB INPUT ================= */

function DOBInput({
    value,
    onChange
}: {
    value: string
    onChange: (val: string) => void
}) {
    const [y, m, d] = value.split("-")

    return (
        <div className="flex gap-2">
            {/* Day */}
            <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="Ngày"
                value={d || ""}
                onChange={(e) => {
                    const day = e.target.value.replace(/\D/g, "")
                    onChange(`${y || ""}-${m || ""}-${day}`)
                }}
                className="w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white text-center outline-none focus:border-blue-500"
            />

            {/* Month */}
            <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="Tháng"
                value={m || ""}
                onChange={(e) => {
                    const month = e.target.value.replace(/\D/g, "")
                    onChange(`${y || ""}-${month}-${d || ""}`)
                }}
                className="w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white text-center outline-none focus:border-blue-500"
            />

            {/* Year */}
            <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Năm"
                value={y || ""}
                onChange={(e) => {
                    const year = e.target.value.replace(/\D/g, "")
                    onChange(`${year}-${m || ""}-${d || ""}`)
                }}
                className="w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white text-center outline-none focus:border-blue-500"
            />
        </div>
    )
}