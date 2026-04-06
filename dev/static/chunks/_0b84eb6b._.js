(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/(auth)/infor-login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InforLogin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function InforLogin() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const tab = searchParams.get("tab") || "otp";
    const [otp, setOtp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        province: "",
        school: "",
        grade: "",
        dob: ""
    });
    /* ================= HANDLERS ================= */ const handleVerify = ()=>{
        if (otp.length < 6) return;
        router.push("/infor-login?tab=infor");
    };
    const handleChange = (e)=>{
        const { name, value } = e.target;
        setForm((prev)=>({
                ...prev,
                [name]: value
            }));
    };
    /* ================= UI ================= */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-screen bg-black flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-[90%] max-w-md border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-6",
            children: [
                tab === "otp" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-white text-xl font-semibold text-center",
                            children: "Nhập mã OTP"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/infor-login/page.tsx",
                            lineNumber: 53,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            value: otp,
                            onChange: (e)=>setOtp(e.target.value),
                            maxLength: 6,
                            placeholder: "••••••",
                            className: "mt-6 w-full text-center tracking-[10px] text-white text-lg bg-transparent border border-zinc-700 rounded-xl py-3 outline-none focus:border-blue-500"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/infor-login/page.tsx",
                            lineNumber: 57,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleVerify,
                            className: "mt-5 w-full rounded-xl bg-blue-500 text-white py-3 hover:bg-blue-600 transition",
                            children: "Xác nhận"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/infor-login/page.tsx",
                            lineNumber: 65,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true),
                tab === "infor" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-white text-xl font-semibold text-center",
                            children: "Thông tin cá nhân"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/infor-login/page.tsx",
                            lineNumber: 77,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "province",
                                    placeholder: "Nhập tỉnh / thành phố",
                                    value: form.province,
                                    onChange: handleChange,
                                    className: "w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white outline-none focus:border-blue-500"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/infor-login/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "school",
                                    placeholder: "Nhập tên trường",
                                    value: form.school,
                                    onChange: handleChange,
                                    className: "w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white outline-none focus:border-blue-500"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/infor-login/page.tsx",
                                    lineNumber: 93,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    name: "grade",
                                    placeholder: "Nhập lớp (VD: 10, 11, 12, Đại học...)",
                                    value: form.grade,
                                    onChange: handleChange,
                                    className: "w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white outline-none focus:border-blue-500"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/infor-login/page.tsx",
                                    lineNumber: 102,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DOBInput, {
                                    value: form.dob,
                                    onChange: (val)=>setForm((prev)=>({
                                                ...prev,
                                                dob: val
                                            }))
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/infor-login/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/infor-login/page.tsx",
                            lineNumber: 81,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "mt-6 w-full rounded-xl bg-blue-500 text-white py-3 hover:bg-blue-600 transition",
                            children: "Hoàn tất"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/infor-login/page.tsx",
                            lineNumber: 122,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(auth)/infor-login/page.tsx",
            lineNumber: 48,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(auth)/infor-login/page.tsx",
        lineNumber: 47,
        columnNumber: 9
    }, this);
}
_s(InforLogin, "BO1z0UWLs8fql8r+FHcqg6jmZ6g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = InforLogin;
/* ================= DOB INPUT ================= */ function DOBInput({ value, onChange }) {
    const [y, m, d] = value.split("-");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                inputMode: "numeric",
                maxLength: 2,
                placeholder: "Ngày",
                value: d || "",
                onChange: (e)=>{
                    const day = e.target.value.replace(/\D/g, "");
                    onChange(`${y || ""}-${m || ""}-${day}`);
                },
                className: "w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white text-center outline-none focus:border-blue-500"
            }, void 0, false, {
                fileName: "[project]/app/(auth)/infor-login/page.tsx",
                lineNumber: 146,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                inputMode: "numeric",
                maxLength: 2,
                placeholder: "Tháng",
                value: m || "",
                onChange: (e)=>{
                    const month = e.target.value.replace(/\D/g, "");
                    onChange(`${y || ""}-${month}-${d || ""}`);
                },
                className: "w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white text-center outline-none focus:border-blue-500"
            }, void 0, false, {
                fileName: "[project]/app/(auth)/infor-login/page.tsx",
                lineNumber: 160,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                inputMode: "numeric",
                maxLength: 4,
                placeholder: "Năm",
                value: y || "",
                onChange: (e)=>{
                    const year = e.target.value.replace(/\D/g, "");
                    onChange(`${year}-${m || ""}-${d || ""}`);
                },
                className: "w-full px-4 py-3 rounded-xl bg-transparent border border-zinc-700 text-white text-center outline-none focus:border-blue-500"
            }, void 0, false, {
                fileName: "[project]/app/(auth)/infor-login/page.tsx",
                lineNumber: 174,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(auth)/infor-login/page.tsx",
        lineNumber: 144,
        columnNumber: 9
    }, this);
}
_c1 = DOBInput;
var _c, _c1;
__turbopack_context__.k.register(_c, "InforLogin");
__turbopack_context__.k.register(_c1, "DOBInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_0b84eb6b._.js.map