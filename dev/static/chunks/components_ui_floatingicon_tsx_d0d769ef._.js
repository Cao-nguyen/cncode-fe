(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/floatingicon.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FloatingButtons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$ColorsSquare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ColorsSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/ColorsSquare.js [app-client] (ecmascript) <export default as ColorsSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$SmsTracking$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SmsTracking$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/SmsTracking.js [app-client] (ecmascript) <export default as SmsTracking>");
"use client";
;
;
;
function FloatingButtons() {
    const data = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$SmsTracking$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SmsTracking$3e$__["SmsTracking"],
            label: "Chat với Admin",
            href: "/chatwithadmin"
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$ColorsSquare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ColorsSquare$3e$__["ColorsSquare"],
            label: "Gia sư AI",
            href: "/giasuai"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 right-1 flex flex-col items-end gap-3 z-50",
        children: data.map((item, index)=>{
            const Icon = item.icon;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "group relative flex items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute right-14 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/components/ui/floatingicon.tsx",
                                lineNumber: 22,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ui/floatingicon.tsx",
                            lineNumber: 21,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ui/floatingicon.tsx",
                        lineNumber: 20,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: item.href,
                        className: "w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:scale-105 transition",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                            variant: "Bulk",
                            size: 23
                        }, void 0, false, {
                            fileName: "[project]/components/ui/floatingicon.tsx",
                            lineNumber: 26,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ui/floatingicon.tsx",
                        lineNumber: 25,
                        columnNumber: 25
                    }, this)
                ]
            }, index, true, {
                fileName: "[project]/components/ui/floatingicon.tsx",
                lineNumber: 19,
                columnNumber: 21
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/components/ui/floatingicon.tsx",
        lineNumber: 14,
        columnNumber: 9
    }, this);
}
_c = FloatingButtons;
var _c;
__turbopack_context__.k.register(_c, "FloatingButtons");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_ui_floatingicon_tsx_d0d769ef._.js.map