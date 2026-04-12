"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser, selectUser, User } from "@/store/userSlice";
import { toast } from "sonner";
import Image from "next/image";

const PROVINCES = [
    "An Giang",
    "Bắc Giang",
    "Bắc Ninh",
    "Cao Bằng",
    "Cần Thơ",
    "Đà Nẵng",
    "Đắk Lắk",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Phòng",
    "Hưng Yên",
    "Khánh Hòa",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Nghệ An",
    "Ninh Bình",
    "Phú Thọ",
    "Quảng Ninh",
    "Quảng Ngãi",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Nguyên",
    "Thanh Hóa",
    "TP. Hồ Chí Minh",
    "Tuyên Quang",
    "Vĩnh Long"
];

const GRADES = [
    "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9",
    "Lớp 10", "Lớp 11", "Lớp 12",
    "Sinh viên", "Đã đi làm", "Khác",
];

const Field = ({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-300 font-medium">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
            {!required && (
                <span className="text-zinc-600 text-xs font-normal ml-1">(tuỳ chọn)</span>
            )}
        </label>
        {children}
    </div>
);

const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/10 text-white text-sm px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition";

export default function Onboarding() {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector(selectUser) as User | null;

    const [form, setForm] = useState({
        username: "",
        birthday: "",
        province: "",
        className: "",
        school: "",
        bio: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const [ready, setReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/auth/login");
            return;
        }

        if (user?.isProfileCompleted) {
            router.replace("/");
            return;
        }

        setReady(true);
    }, [user, router]);

    if (!ready) return null;

    const set = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};

        if (!form.username.trim() || form.username.trim().length < 3) {
            errs.username = "Username phải có ít nhất 3 ký tự";
        } else if (!/^[a-z0-9_.]+$/i.test(form.username.trim())) {
            errs.username = "Username chỉ gồm chữ, số, dấu _ và .";
        }

        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Đang lưu thông tin...");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/user/onboarding`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                if (data.message?.toLowerCase().includes("username")) {
                    setErrors({ username: data.message });
                }
                toast.error(data.message || "Lỗi khi lưu thông tin", { id: toastId });
                return;
            }

            const meRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedUser = await meRes.json();

            dispatch(setUser({ user: updatedUser, token }));

            toast.success(`Chào mừng đến với CNcode, ${updatedUser.username}! 🎉`, {
                id: toastId,
                duration: 4000,
            });

            setTimeout(() => router.push("/"), 1200);
        } catch {
            toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">

                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/images/logo.png"
                        alt="CNcode"
                        width={110}
                        height={80}
                        className="w-auto h-auto mb-4"
                    />
                    <h1 className="text-white text-2xl font-bold">Hoàn thiện hồ sơ</h1>
                    <p className="text-zinc-500 text-sm mt-1 text-center">
                        Thêm thông tin để bắt đầu hành trình học tập
                    </p>
                </div>

                {user?.avatar ? (
                    <div className="flex justify-center mb-6">
                        <Image
                            src={user.avatar}
                            alt={user?.name || "avatar"}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                        />
                    </div>
                ) : null}

                <div className="bg-white/2 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md">

                    <Field label="Username" required>
                        <input
                            className={`${inputCls} ${errors.username ? "border-red-500/60" : ""}`}
                            placeholder="vd: nguyen_van_a"
                            value={form.username}
                            onChange={(e) => set("username", e.target.value)}
                            autoComplete="off"
                        />
                        {errors.username && (
                            <p className="text-red-400 text-xs mt-0.5">{errors.username}</p>
                        )}
                    </Field>

                    <Field label="Ngày sinh">
                        <input
                            type="date"
                            className={inputCls}
                            max={new Date().toISOString().split("T")[0]}
                            value={form.birthday}
                            onChange={(e) => set("birthday", e.target.value)}
                            style={{ colorScheme: "dark" }}
                        />
                    </Field>

                    <Field label="Tỉnh / Thành phố">
                        <select
                            className={inputCls}
                            value={form.province}
                            onChange={(e) => set("province", e.target.value)}
                        >
                            <option value="" disabled className="bg-zinc-900">
                                Chọn tỉnh / thành phố
                            </option>
                            {PROVINCES.map((p) => (
                                <option key={p} value={p} className="bg-zinc-900">
                                    {p}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Lớp / Cấp học">
                        <select
                            className={inputCls}
                            value={form.className}
                            onChange={(e) => set("className", e.target.value)}
                        >
                            <option value="" disabled className="bg-zinc-900">
                                Chọn lớp / cấp học
                            </option>
                            {GRADES.map((g) => (
                                <option key={g} value={g} className="bg-zinc-900">
                                    {g}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Trường">
                        <input
                            className={inputCls}
                            placeholder="Tên trường của bạn"
                            value={form.school}
                            onChange={(e) => set("school", e.target.value)}
                        />
                    </Field>

                    <Field label="Giới thiệu bản thân">
                        <textarea
                            className={`${inputCls} resize-none`}
                            rows={3}
                            placeholder="Một vài điều về bạn..."
                            value={form.bio}
                            onChange={(e) => set("bio", e.target.value)}
                            maxLength={200}
                        />
                        <p className="text-zinc-600 text-xs text-right">
                            {form.bio.length}/200
                        </p>
                    </Field>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full rounded-xl bg-white text-black font-semibold py-3.5 text-sm hover:bg-zinc-100 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? "Đang lưu..." : "Xác nhận thông tin"}
                    </button>

                </div>

                <p className="text-center text-zinc-700 text-xs mt-4">
                    Chỉ có username là bắt buộc, các thông tin khác có thể bổ sung sau
                </p>
            </div>
        </div>
    );
}