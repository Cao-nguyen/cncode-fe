(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/slideshow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Slideshow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$ArrowLeft2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft2$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/ArrowLeft2.js [app-client] (ecmascript) <export default as ArrowLeft2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$ArrowRight2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight2$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/ArrowRight2.js [app-client] (ecmascript) <export default as ArrowRight2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function Slideshow() {
    _s();
    const slides = [
        {
            img: "/images/images1.jpg",
            link: "/course"
        },
        {
            img: "/images/image2.jpg",
            link: "/forum"
        },
        {
            img: "/images/images3.jpg",
            link: "/community"
        }
    ];
    const [index, setIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [paused, setPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const resumeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const next = ()=>setIndex((i)=>(i + 1) % slides.length);
    const prev = ()=>setIndex((i)=>i === 0 ? slides.length - 1 : i - 1);
    const handleManual = (fn)=>{
        fn();
        setPaused(true);
        if (resumeRef.current) clearTimeout(resumeRef.current);
        resumeRef.current = setTimeout(()=>{
            setPaused(false);
        }, 5000);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Slideshow.useEffect": ()=>{
            if (paused) return;
            const timer = setInterval({
                "Slideshow.useEffect.timer": ()=>{
                    setIndex({
                        "Slideshow.useEffect.timer": (i)=>(i + 1) % slides.length
                    }["Slideshow.useEffect.timer"]);
                }
            }["Slideshow.useEffect.timer"], 3000);
            return ({
                "Slideshow.useEffect": ()=>clearInterval(timer)
            })["Slideshow.useEffect"];
        }
    }["Slideshow.useEffect"], [
        paused,
        slides.length
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative h-45 sm:h-60 md:h-80 lg:h-105",
            children: [
                slides.map((slide, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: slide.link,
                            className: "block relative w-full h-full cursor-pointer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: slide.img,
                                alt: "slide",
                                fill: true,
                                className: "object-cover transition-transform duration-500 hover:scale-[1.02]",
                                priority: i === 0
                            }, void 0, false, {
                                fileName: "[project]/components/ui/slideshow.tsx",
                                lineNumber: 60,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ui/slideshow.tsx",
                            lineNumber: 56,
                            columnNumber: 25
                        }, this)
                    }, i, false, {
                        fileName: "[project]/components/ui/slideshow.tsx",
                        lineNumber: 51,
                        columnNumber: 21
                    }, this)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>handleManual(prev),
                    className: "absolute z-20 left-2 md:left-4 top-1/2 -translate-y-1/2    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center    rounded-full bg-white/80 shadow hover:bg-white",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$ArrowLeft2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft2$3e$__["ArrowLeft2"], {
                        size: "18",
                        color: "#111",
                        variant: "Outline"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/slideshow.tsx",
                        lineNumber: 78,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/slideshow.tsx",
                    lineNumber: 72,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>handleManual(next),
                    className: "absolute z-20 right-2 md:right-4 top-1/2 -translate-y-1/2    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center    rounded-full bg-white/80 shadow hover:bg-white",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$ArrowRight2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight2$3e$__["ArrowRight2"], {
                        size: "18",
                        color: "#111",
                        variant: "Outline"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/slideshow.tsx",
                        lineNumber: 88,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/slideshow.tsx",
                    lineNumber: 82,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute z-20 bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2",
                    children: slides.map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>handleManual(()=>setIndex(i)),
                            className: `w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition ${i === index ? "bg-white" : "bg-white/50"}`
                        }, i, false, {
                            fileName: "[project]/components/ui/slideshow.tsx",
                            lineNumber: 94,
                            columnNumber: 25
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/ui/slideshow.tsx",
                    lineNumber: 92,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/slideshow.tsx",
            lineNumber: 48,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/slideshow.tsx",
        lineNumber: 45,
        columnNumber: 9
    }, this);
}
_s(Slideshow, "eI9upoJ4kiAkd+kU0NTya5K0ndU=");
_c = Slideshow;
var _c;
__turbopack_context__.k.register(_c, "Slideshow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Slot$3e$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript) <export * as Slot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
            secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
            destructive: "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
            outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
            ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
            link: "text-primary underline-offset-4 [a&]:hover:underline"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge({ className, variant = "default", asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Slot$3e$__["Slot"].Root : "span";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "badge",
        "data-variant": variant,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/badge.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/cardcourses.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardCourses
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$SecurityUser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SecurityUser$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/SecurityUser.js [app-client] (ecmascript) <export default as SecurityUser>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function CardCourses({ title, description, image, duration, students, price, oldPrice, discount, isFree = false, link }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "   w-full    rounded-2xl    border border-[#e6e6e6] dark:border-[#222222]    bg-white dark:bg-[#171717]    text-black dark:text-white    overflow-hidden    shadow-sm hover:shadow-md    hover:-translate-y-1    transition-all duration-300   ",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: link,
                className: "block relative w-full h-60 md:h-40 lg:h-55",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: image,
                        alt: title,
                        fill: true,
                        className: "object-cover"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/cardcourses.tsx",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this),
                    discount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-2 left-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                            className: "bg-red-500 text-white",
                            children: [
                                "-",
                                discount,
                                "%"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/cardcourses.tsx",
                            lineNumber: 55,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ui/cardcourses.tsx",
                        lineNumber: 54,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-2 right-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                            className: isFree ? "bg-green-500 text-white" : "bg-purple-600 text-white",
                            children: isFree ? "Free" : "Pro"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/cardcourses.tsx",
                            lineNumber: 63,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ui/cardcourses.tsx",
                        lineNumber: 62,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/cardcourses.tsx",
                lineNumber: 49,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm md:text-base font-semibold line-clamp-2",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/ui/cardcourses.tsx",
                        lineNumber: 72,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-3",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/ui/cardcourses.tsx",
                        lineNumber: 76,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-2 flex justify-between text-xs text-gray-500 dark:text-gray-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        size: 25,
                                        className: "text-black dark:text-white",
                                        variant: "Bold"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/cardcourses.tsx",
                                        lineNumber: 83,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[14px]",
                                        children: duration
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/cardcourses.tsx",
                                        lineNumber: 84,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/cardcourses.tsx",
                                lineNumber: 82,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$SecurityUser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SecurityUser$3e$__["SecurityUser"], {
                                        size: 25,
                                        className: "text-black dark:text-white",
                                        variant: "Bold"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/cardcourses.tsx",
                                        lineNumber: 88,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[14px]",
                                        children: students
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/cardcourses.tsx",
                                        lineNumber: 89,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/cardcourses.tsx",
                                lineNumber: 87,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/cardcourses.tsx",
                        lineNumber: 80,
                        columnNumber: 17
                    }, this),
                    !isFree && price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-500 font-semibold",
                                children: price
                            }, void 0, false, {
                                fileName: "[project]/components/ui/cardcourses.tsx",
                                lineNumber: 96,
                                columnNumber: 25
                            }, this),
                            oldPrice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-400 line-through",
                                children: oldPrice
                            }, void 0, false, {
                                fileName: "[project]/components/ui/cardcourses.tsx",
                                lineNumber: 100,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/cardcourses.tsx",
                        lineNumber: 95,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/cardcourses.tsx",
                lineNumber: 70,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/cardcourses.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
_c = CardCourses;
var _c;
__turbopack_context__.k.register(_c, "CardCourses");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/roadmap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Roadmap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
"use client";
;
;
function Roadmap({ data }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-10",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-4",
            "data-aos": "fade-up",
            children: data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: item.link,
                    "data-aos": "zoom-in",
                    "data-aos-delay": index * 100,
                    className: "   group   p-4 rounded-2xl    border border-[#e6e6e6] dark:border-[#222222]    bg-white dark:bg-[#171717]   hover:shadow-md hover:-translate-y-1   transition-all duration-300   flex flex-col justify-between   ",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-semibold text-base mb-3",
                                    children: item.title
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/roadmap.tsx",
                                    lineNumber: 40,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2",
                                    children: item.steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2 h-2 bg-black dark:bg-white rounded-full"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/roadmap.tsx",
                                                    lineNumber: 48,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-gray-600 dark:text-gray-400",
                                                    children: step
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/roadmap.tsx",
                                                    lineNumber: 49,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/components/ui/roadmap.tsx",
                                            lineNumber: 47,
                                            columnNumber: 37
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/roadmap.tsx",
                                    lineNumber: 45,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/roadmap.tsx",
                            lineNumber: 38,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "   text-sm font-medium    text-black dark:text-white   group-hover:underline   ",
                                    children: "Xem lộ trình"
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/roadmap.tsx",
                                    lineNumber: 60,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "   text-lg    transition-transform    group-hover:translate-x-1   ",
                                    children: "→"
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/roadmap.tsx",
                                    lineNumber: 68,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/roadmap.tsx",
                            lineNumber: 58,
                            columnNumber: 25
                        }, this)
                    ]
                }, index, true, {
                    fileName: "[project]/components/ui/roadmap.tsx",
                    lineNumber: 22,
                    columnNumber: 21
                }, this))
        }, void 0, false, {
            fileName: "[project]/components/ui/roadmap.tsx",
            lineNumber: 16,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/roadmap.tsx",
        lineNumber: 13,
        columnNumber: 9
    }, this);
}
_c = Roadmap;
var _c;
__turbopack_context__.k.register(_c, "Roadmap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/stats.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Stats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function Stats({ data }) {
    _s();
    const [count, setCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(data.map({
        "Stats.useState": ()=>0
    }["Stats.useState"]));
    const [start, setStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Stats.useEffect": ()=>{
            const observer = new IntersectionObserver({
                "Stats.useEffect": ([entry])=>{
                    if (entry.isIntersecting) {
                        setStart(true);
                        observer.disconnect();
                    }
                }
            }["Stats.useEffect"], {
                threshold: 0.3
            });
            if (ref.current) observer.observe(ref.current);
            return ({
                "Stats.useEffect": ()=>observer.disconnect()
            })["Stats.useEffect"];
        }
    }["Stats.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Stats.useEffect": ()=>{
            if (!start) return;
            const interval = setInterval({
                "Stats.useEffect.interval": ()=>{
                    setCount({
                        "Stats.useEffect.interval": (prev)=>prev.map({
                                "Stats.useEffect.interval": (num, i)=>num < data[i].value ? num + Math.ceil(data[i].value / 50) : data[i].value
                            }["Stats.useEffect.interval"])
                    }["Stats.useEffect.interval"]);
                }
            }["Stats.useEffect.interval"], 30);
            return ({
                "Stats.useEffect": ()=>clearInterval(interval)
            })["Stats.useEffect"];
        }
    }["Stats.useEffect"], [
        start,
        data
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: "mt-10",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-2 md:grid-cols-4 gap-4",
            children: data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    "data-aos": "zoom-in",
                    "data-aos-delay": index * 100,
                    className: "   group   p-4 rounded-2xl    border border-[#e6e6e6] dark:border-[#222222]    bg-white dark:bg-[#171717]   flex items-center gap-3   hover:shadow-lg hover:-translate-y-1   transition-all duration-300   ",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "   w-10 h-10 flex items-center justify-center   rounded-xl   bg-black text-white    dark:bg-white dark:text-black   group-hover:scale-110   transition   ",
                            children: item.icon
                        }, void 0, false, {
                            fileName: "[project]/components/ui/stats.tsx",
                            lineNumber: 71,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-base md:text-lg font-bold text-black dark:text-white",
                                    children: [
                                        count[index].toLocaleString(),
                                        "+"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ui/stats.tsx",
                                    lineNumber: 84,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-gray-500 dark:text-gray-400",
                                    children: item.label
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/stats.tsx",
                                    lineNumber: 87,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/stats.tsx",
                            lineNumber: 83,
                            columnNumber: 25
                        }, this)
                    ]
                }, index, true, {
                    fileName: "[project]/components/ui/stats.tsx",
                    lineNumber: 55,
                    columnNumber: 21
                }, this))
        }, void 0, false, {
            fileName: "[project]/components/ui/stats.tsx",
            lineNumber: 52,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/stats.tsx",
        lineNumber: 50,
        columnNumber: 9
    }, this);
}
_s(Stats, "bqp9yrMt+SD43BhbYnB0rdWzftU=");
_c = Stats;
var _c;
__turbopack_context__.k.register(_c, "Stats");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/blog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BlogCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
function BlogCard({ title, description, image, time, author, avatar, category, link = "/blog" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: link,
        className: "   group block rounded-2xl overflow-hidden   border border-[#e6e6e6] dark:border-[#222222]   bg-white dark:bg-[#171717]   hover:shadow-md hover:-translate-y-1   transition-all duration-300   ",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-full h-48 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: image,
                        alt: title,
                        fill: true,
                        className: "object-cover group-hover:scale-105 transition duration-300"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/blog.tsx",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-2 left-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                            className: "bg-black text-white dark:bg-white dark:text-black",
                            children: category
                        }, void 0, false, {
                            fileName: "[project]/components/ui/blog.tsx",
                            lineNumber: 59,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ui/blog.tsx",
                        lineNumber: 58,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/blog.tsx",
                lineNumber: 49,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold text-base line-clamp-2",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/ui/blog.tsx",
                        lineNumber: 69,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600 dark:text-gray-400 line-clamp-3",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/ui/blog.tsx",
                        lineNumber: 74,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                size: 25,
                                className: "text-black dark:text-white",
                                variant: "Bold"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/blog.tsx",
                                lineNumber: 80,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: time
                            }, void 0, false, {
                                fileName: "[project]/components/ui/blog.tsx",
                                lineNumber: 81,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/blog.tsx",
                        lineNumber: 79,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "my-2 h-px bg-[#e6e6e6] dark:bg-[#222222]"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/blog.tsx",
                        lineNumber: 85,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                className: "w-8 h-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                        src: avatar,
                                        alt: author
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/blog.tsx",
                                        lineNumber: 91,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                        children: author?.charAt(0)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/blog.tsx",
                                        lineNumber: 92,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/blog.tsx",
                                lineNumber: 90,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-black dark:text-white",
                                children: author
                            }, void 0, false, {
                                fileName: "[project]/components/ui/blog.tsx",
                                lineNumber: 97,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/blog.tsx",
                        lineNumber: 88,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/blog.tsx",
                lineNumber: 66,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/blog.tsx",
        lineNumber: 37,
        columnNumber: 9
    }, this);
}
_c = BlogCard;
var _c;
__turbopack_context__.k.register(_c, "BlogCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/analytic.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Analytics
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$User$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/User.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$UserTick$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserTick$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/UserTick.js [app-client] (ecmascript) <export default as UserTick>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chart$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Chart.js [app-client] (ecmascript) <export default as Chart>");
"use client";
;
;
function Analytics({ today, guest, online, total }) {
    // const { theme } = useTheme()
    // const colorAnalytic = theme === "dark" ? "#fff" : "#111"
    const format = (n)=>new Intl.NumberFormat("vi-VN").format(n);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "   mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4   ",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "   p-5 rounded-2xl   bg-white dark:bg-[#171717]   border border-[#e6e6e6] dark:border-[#222]   flex items-center justify-between   hover:shadow-md hover:-translate-y-1   transition   ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500",
                                children: "Tổng"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 40,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-lg md:text-xl font-bold",
                                children: format(total)
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 41,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 39,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chart$3e$__["Chart"], {
                        size: 24,
                        className: "text-black dark:text-white",
                        variant: "Bold"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 45,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/analytic.tsx",
                lineNumber: 31,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "   p-5 rounded-2xl   bg-white dark:bg-[#171717]   border border-[#e6e6e6] dark:border-[#222]   flex items-center justify-between   hover:shadow-md hover:-translate-y-1   transition   ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500",
                                children: "Hôm nay"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 58,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-lg md:text-xl font-bold",
                                children: format(today)
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 59,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 57,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chart$3e$__["Chart"], {
                        size: 24,
                        className: "text-black dark:text-white",
                        variant: "Bold"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 63,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/analytic.tsx",
                lineNumber: 49,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "   p-5 rounded-2xl   bg-white dark:bg-[#171717]   border border-[#e6e6e6] dark:border-[#222]   flex items-center justify-between   hover:shadow-md hover:-translate-y-1   transition   ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500",
                                children: "Khách online"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 76,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-lg md:text-xl font-bold",
                                children: format(guest)
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 77,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 75,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$User$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                        size: 24,
                        className: "text-black dark:text-white",
                        variant: "Bold"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 81,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/analytic.tsx",
                lineNumber: 67,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "   p-5 rounded-2xl   bg-white dark:bg-[#171717]   border border-[#e6e6e6] dark:border-[#222]   flex items-center justify-between   hover:shadow-md hover:-translate-y-1   transition   ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500",
                                children: "User online"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 94,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-lg md:text-xl font-bold",
                                children: format(online)
                            }, void 0, false, {
                                fileName: "[project]/components/ui/analytic.tsx",
                                lineNumber: 95,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 93,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$UserTick$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserTick$3e$__["UserTick"], {
                        size: 24,
                        className: "text-black dark:text-white",
                        variant: "Bold"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/analytic.tsx",
                        lineNumber: 99,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/analytic.tsx",
                lineNumber: 85,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/analytic.tsx",
        lineNumber: 27,
        columnNumber: 9
    }, this);
}
_c = Analytics;
var _c;
__turbopack_context__.k.register(_c, "Analytics");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/whychoose.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WhyChoose
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Teacher$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Teacher$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Teacher.js [app-client] (ecmascript) <export default as Teacher>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Personalcard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Personalcard$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Personalcard.js [app-client] (ecmascript) <export default as Personalcard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$People$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__People$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/People.js [app-client] (ecmascript) <export default as People>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Book.js [app-client] (ecmascript) <export default as Book>");
"use client";
;
;
;
function WhyChoose() {
    const data = [
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__["Book"], {
                size: 26,
                className: "text-dark dark:text-white",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/components/ui/whychoose.tsx",
                lineNumber: 15,
                columnNumber: 19
            }, this),
            title: "Phương pháp giảng dạy hiện đại",
            desc: "Chương trình học được thiết kế phù hợp với chương trình và năng lực của người học"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$People$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__People$3e$__["People"], {
                size: 26,
                className: "text-dark dark:text-white",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/components/ui/whychoose.tsx",
                lineNumber: 20,
                columnNumber: 19
            }, this),
            title: "Video bài giảng tương tác",
            desc: "Học online nhưng giống như đang học trên lớp với tính năng tương tác ngay trong lúc học"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Teacher$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Teacher$3e$__["Teacher"], {
                size: 26,
                className: "text-dark dark:text-white",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/components/ui/whychoose.tsx",
                lineNumber: 25,
                columnNumber: 19
            }, this),
            title: "Giá cả của khoá học phù hợp",
            desc: "Giá cả phù hợp với nhiều đối tượng và có nhiều ưu đãi hàng tháng"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Personalcard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Personalcard$3e$__["Personalcard"], {
                size: 26,
                className: "text-dark dark:text-white",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/components/ui/whychoose.tsx",
                lineNumber: 30,
                columnNumber: 19
            }, this),
            title: "Cộng đồng hỗ trợ",
            desc: "CNcode không chỉ đang dạy bạn học mà đang kết nối bạn với những người cùng học để chia sẻ và trao đổi với nhau"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-0",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "   grid grid-cols-1 lg:grid-cols-2 gap-8 items-center   ",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full h-65 md:h-87.5 lg:h-105 rounded-2xl overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: "/images/whychoose.png",
                        alt: "why choose",
                        fill: true
                    }, void 0, false, {
                        fileName: "[project]/components/ui/whychoose.tsx",
                        lineNumber: 45,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/whychoose.tsx",
                    lineNumber: 44,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-5",
                    children: data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "   flex items-start gap-4   p-4 rounded-xl   border border-[#e6e6e6] dark:border-[#222]   bg-white dark:bg-[#171717]   hover:shadow-md hover:-translate-y-1   transition   ",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "   min-w-10.5 h-10.5   flex items-center justify-center   rounded-xl   bg-gray-100 dark:bg-[#222]   ",
                                    children: item.icon
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/whychoose.tsx",
                                    lineNumber: 69,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-sm md:text-base",
                                            children: item.title
                                        }, void 0, false, {
                                            fileName: "[project]/components/ui/whychoose.tsx",
                                            lineNumber: 80,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-500 dark:text-gray-400",
                                            children: item.desc
                                        }, void 0, false, {
                                            fileName: "[project]/components/ui/whychoose.tsx",
                                            lineNumber: 83,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ui/whychoose.tsx",
                                    lineNumber: 79,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, index, true, {
                            fileName: "[project]/components/ui/whychoose.tsx",
                            lineNumber: 56,
                            columnNumber: 25
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/ui/whychoose.tsx",
                    lineNumber: 53,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/whychoose.tsx",
            lineNumber: 39,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/whychoose.tsx",
        lineNumber: 37,
        columnNumber: 9
    }, this);
}
_c = WhyChoose;
var _c;
__turbopack_context__.k.register(_c, "WhyChoose");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/testimoninal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Testimonial
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Star1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star1$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Star1.js [app-client] (ecmascript) <export default as Star1>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/avatar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const initialComments = [
    {
        name: "User #1023",
        content: "Khoá học rất hay, dễ hiểu và thực tế 🔥",
        rating: 5,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #1023",
        content: "Khoá học rất hay, dễ hiểu và thực tế 🔥",
        rating: 5,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    }
];
function Testimonial() {
    _s();
    const [comments, setComments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialComments);
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [rating, setRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(5);
    const [index, setIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const normalizedIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Testimonial.useMemo[normalizedIndex]": ()=>{
            if (comments.length === 0) return 0;
            return Math.min(Math.max(index, 0), comments.length - 1);
        }
    }["Testimonial.useMemo[normalizedIndex]"], [
        comments.length,
        index
    ]);
    const activeComment = comments[normalizedIndex] ?? null;
    const hasComments = comments.length > 0;
    const handleSubmit = ()=>{
        const trimmedContent = content.trim();
        if (!trimmedContent) return;
        const newComment = {
            name: `User #${Math.floor(1000 + Math.random() * 9000)}`,
            content: trimmedContent,
            rating,
            avatar: "/images/avatar.png"
        };
        setComments((prev)=>[
                newComment,
                ...prev
            ]);
        setContent("");
        setRating(5);
        setIndex(0);
    };
    const handlePrev = ()=>{
        if (!hasComments) return;
        setIndex((prev)=>prev <= 0 ? comments.length - 1 : prev - 1);
    };
    const handleNext = ()=>{
        if (!hasComments) return;
        setIndex((prev)=>(prev + 1) % comments.length);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "   p-6 rounded-3xl   border border-[#e6e6e6] dark:border-[#222]   bg-white dark:bg-[#171717]   flex flex-col gap-5   ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400",
                                children: "Đánh giá"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/testimoninal.tsx",
                                lineNumber: 867,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-semibold",
                                children: "Hãy cho chúng tôi biết cảm nhận của bạn"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/testimoninal.tsx",
                                lineNumber: 870,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/testimoninal.tsx",
                        lineNumber: 866,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            1,
                            2,
                            3,
                            4,
                            5
                        ].map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": `Chọn ${value} sao`,
                                onClick: ()=>setRating(value),
                                className: "transition-transform duration-200 hover:-translate-y-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Star1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star1$3e$__["Star1"], {
                                    size: 28,
                                    variant: "Bold",
                                    className: `transition-all ${value <= rating ? "text-yellow-400 scale-110" : "text-gray-300 dark:text-gray-500"}`
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                    lineNumber: 884,
                                    columnNumber: 29
                                }, this)
                            }, value, false, {
                                fileName: "[project]/components/ui/testimoninal.tsx",
                                lineNumber: 877,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/ui/testimoninal.tsx",
                        lineNumber: 875,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: content,
                        onChange: (e)=>setContent(e.target.value),
                        placeholder: "Nhập cảm nhận của bạn...",
                        rows: 5,
                        maxLength: 320,
                        className: "   w-full p-4 rounded-2xl   border border-[#e6e6e6] dark:border-[#222]   bg-white dark:bg-[#111]   text-sm text-gray-800 dark:text-gray-100   outline-none resize-none   focus:border-black dark:focus:border-white   "
                    }, void 0, false, {
                        fileName: "[project]/components/ui/testimoninal.tsx",
                        lineNumber: 896,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleSubmit,
                        className: "   inline-flex items-center justify-center   px-5 py-3 rounded-2xl   bg-black text-white dark:bg-white dark:text-black   font-medium transition hover:opacity-90   ",
                        children: "Gửi đánh giá"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/testimoninal.tsx",
                        lineNumber: 912,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/testimoninal.tsx",
                lineNumber: 858,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "   relative min-h-[320px]   rounded-3xl   border border-[#e6e6e6] dark:border-[#222]   bg-white dark:bg-[#171717]   p-6   flex flex-col justify-between   ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: [
                                            "Đã có ",
                                            comments.length,
                                            " đánh giá"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ui/testimoninal.tsx",
                                        lineNumber: 938,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold",
                                        children: "Cảm nhận học viên"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/testimoninal.tsx",
                                        lineNumber: 941,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/testimoninal.tsx",
                                lineNumber: 937,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handlePrev,
                                        disabled: !hasComments,
                                        "aria-label": "Xem đánh giá trước",
                                        className: "w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:cursor-not-allowed disabled:opacity-40",
                                        children: "←"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/testimoninal.tsx",
                                        lineNumber: 947,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleNext,
                                        disabled: !hasComments,
                                        "aria-label": "Xem đánh giá tiếp theo",
                                        className: "w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:cursor-not-allowed disabled:opacity-40",
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/testimoninal.tsx",
                                        lineNumber: 956,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/testimoninal.tsx",
                                lineNumber: 946,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/testimoninal.tsx",
                        lineNumber: 936,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 rounded-[28px] bg-[#f8f8f8] dark:bg-[#111] p-6 shadow-sm",
                        children: activeComment ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4 mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "w-12 h-12",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                                    src: activeComment.avatar ?? "/images/avatar.png",
                                                    alt: activeComment.name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                                    lineNumber: 973,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                    children: activeComment.name.charAt(0)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                                    lineNumber: 977,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ui/testimoninal.tsx",
                                            lineNumber: 972,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-semibold",
                                                    children: activeComment.name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                                    lineNumber: 983,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1 mt-1",
                                                    children: Array.from({
                                                        length: activeComment.rating
                                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Star1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star1$3e$__["Star1"], {
                                                            size: 16,
                                                            variant: "Bold",
                                                            className: "text-yellow-400"
                                                        }, i, false, {
                                                            fileName: "[project]/components/ui/testimoninal.tsx",
                                                            lineNumber: 987,
                                                            columnNumber: 49
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                                    lineNumber: 984,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ui/testimoninal.tsx",
                                            lineNumber: 982,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                    lineNumber: 971,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm leading-6 text-gray-600 dark:text-gray-400 break-words",
                                    children: activeComment.content
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                    lineNumber: 999,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 dark:text-gray-400",
                            children: "Chưa có đánh giá nào. Hãy để lại cảm nhận của bạn!"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/testimoninal.tsx",
                            lineNumber: 1004,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ui/testimoninal.tsx",
                        lineNumber: 968,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 flex justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 overflow-x-auto px-1 py-1",
                            children: comments.map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setIndex(i),
                                    className: `h-2.5 w-2.5 rounded-full transition ${i === normalizedIndex ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}`,
                                    "aria-label": `Chọn đánh giá ${i + 1}`
                                }, i, false, {
                                    fileName: "[project]/components/ui/testimoninal.tsx",
                                    lineNumber: 1013,
                                    columnNumber: 29
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/ui/testimoninal.tsx",
                            lineNumber: 1011,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ui/testimoninal.tsx",
                        lineNumber: 1010,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/testimoninal.tsx",
                lineNumber: 926,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/testimoninal.tsx",
        lineNumber: 857,
        columnNumber: 9
    }, this);
}
_s(Testimonial, "O/jZ8Qz2FHzdWDlXAV+rnjJw+vE=");
_c = Testimonial;
var _c;
__turbopack_context__.k.register(_c, "Testimonial");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/floatingicon.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FloatingButtons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$SmsTracking$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SmsTracking$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/SmsTracking.js [app-client] (ecmascript) <export default as SmsTracking>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$MessageQuestion$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageQuestion$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/MessageQuestion.js [app-client] (ecmascript) <export default as MessageQuestion>");
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
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$MessageQuestion$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageQuestion$3e$__["MessageQuestion"],
            label: "Gia sư AI",
            href: "/giasuai"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-18 right-2 lg:bottom-4 lg:right-1 flex flex-col items-end gap-3 z-50",
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
"[project]/app/(user)/(main)/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$slideshow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/slideshow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$cardcourses$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/cardcourses.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$roadmap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/roadmap.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$stats$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/stats.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$User$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/User.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Book.js [app-client] (ecmascript) <export default as Book>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$TaskSquare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TaskSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/TaskSquare.js [app-client] (ecmascript) <export default as TaskSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/iconsax-react/dist/esm/Award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$blog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/blog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$analytic$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/analytic.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$whychoose$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/whychoose.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$testimoninal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/testimoninal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$floatingicon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/floatingicon.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function Home() {
    const roadmapData = [
        {
            title: "Web Dev",
            steps: [
                "HTML/CSS",
                "JavaScript",
                "React/Next"
            ],
            link: "/roadmap/web"
        },
        {
            title: "AI Engineer",
            steps: [
                "Python",
                "Machine Learning",
                "Deep Learning"
            ],
            link: "/roadmap/ai"
        },
        {
            title: "Game Dev",
            steps: [
                "C#/C++",
                "Unity",
                "Publish Game"
            ],
            link: "/roadmap/game"
        }
    ];
    const banner = [
        {
            linkImg: "/images/banner_giasuai.png",
            alt: "Gia sư AI",
            link: "/giasuai"
        },
        {
            linkImg: "/images/banner_cnbooks.png",
            alt: "CNbooks",
            link: "/ebook"
        },
        {
            linkImg: "/images/banner_cnjobs.png",
            alt: "CNjobs",
            link: "/timviec"
        }
    ];
    const statsData = [
        {
            label: "Người học",
            value: 12000,
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$User$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                size: 20,
                className: "text-white dark:text-black",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/app/(user)/(main)/page.tsx",
                lineNumber: 46,
                columnNumber: 19
            }, this)
        },
        {
            label: "Khoá học",
            value: 120,
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__["Book"], {
                size: 20,
                className: "text-white dark:text-black",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/app/(user)/(main)/page.tsx",
                lineNumber: 51,
                columnNumber: 19
            }, this)
        },
        {
            label: "Bài tập",
            value: 3500,
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$TaskSquare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TaskSquare$3e$__["TaskSquare"], {
                size: 20,
                className: "text-white dark:text-black",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/app/(user)/(main)/page.tsx",
                lineNumber: 56,
                columnNumber: 19
            }, this)
        },
        {
            label: "Thành tựu",
            value: 980,
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iconsax$2d$react$2f$dist$2f$esm$2f$Award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                size: 20,
                className: "text-white dark:text-black",
                variant: "Bold"
            }, void 0, false, {
                fileName: "[project]/app/(user)/(main)/page.tsx",
                lineNumber: 61,
                columnNumber: 19
            }, this)
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$floatingicon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/(user)/(main)/page.tsx",
                lineNumber: 67,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$slideshow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/(user)/(main)/page.tsx",
                lineNumber: 68,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "m-5 xl:m-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Tính năng nổi bật"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 74,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: "Khám phá những tính năng nổi bật của chúng tôi"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 78,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 82,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 73,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                children: banner.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: item.link,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            width: 450,
                                            height: 100,
                                            src: item.linkImg,
                                            alt: item.alt,
                                            className: "rounded-2xl w-full"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 88,
                                            columnNumber: 33
                                        }, this)
                                    }, index, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 87,
                                        columnNumber: 29
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 85,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 72,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Khoá học nổi bật"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 103,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: "Khám phá các khoá học chất lượng cao dành cho bạn"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 107,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 111,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 102,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
                                "data-aos": "fade-up",
                                "data-aos-delay": "100",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$cardcourses$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Khóa học Fullstack từ A-Z",
                                            description: "Học từ cơ bản đến nâng cao, build dự án thực tế.",
                                            image: "/images/images1.jpg",
                                            duration: "12h",
                                            students: "1.2K",
                                            price: "299.000đ",
                                            oldPrice: "499.000đ",
                                            discount: 40,
                                            isFree: false,
                                            link: "/course"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 120,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 119,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$cardcourses$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Khóa học Fullstack từ A-Z",
                                            description: "Học từ cơ bản đến nâng cao, build dự án thực tế.",
                                            image: "/images/images1.jpg",
                                            duration: "12h",
                                            students: "1.2K",
                                            price: "299.000đ",
                                            oldPrice: "499.000đ",
                                            discount: 40,
                                            isFree: false,
                                            link: "/course"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 134,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 133,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$cardcourses$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Khóa học Fullstack từ A-Z",
                                            description: "Học từ cơ bản đến nâng cao, build dự án thực tế.",
                                            image: "/images/images1.jpg",
                                            duration: "12h",
                                            students: "1.2K",
                                            price: "299.000đ",
                                            oldPrice: "499.000đ",
                                            discount: 40,
                                            isFree: false,
                                            link: "/course"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 148,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 147,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$cardcourses$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Khóa học Fullstack từ A-Z",
                                            description: "Học từ cơ bản đến nâng cao, build dự án thực tế. Học từ cơ bản đến nâng cao, build dự án thực tế. Học từ cơ bản đến nâng cao, build dự án thực tế.",
                                            image: "/images/images1.jpg",
                                            duration: "12h",
                                            students: "1.2K",
                                            price: "299.000đ",
                                            oldPrice: "499.000đ",
                                            discount: 40,
                                            isFree: false,
                                            link: "/course"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 162,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 161,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 114,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 101,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Lộ trình cơ bản"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 181,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: "Khám phá hành trình học tập chúng tôi đã nghiên cứu sáng tạo ra"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 185,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 189,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 180,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$roadmap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    data: roadmapData
                                }, void 0, false, {
                                    fileName: "[project]/app/(user)/(main)/page.tsx",
                                    lineNumber: 193,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 192,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 179,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Tại sao nên lựa chọn CNcode"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 200,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 204,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 199,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$whychoose$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/app/(user)/(main)/page.tsx",
                                    lineNumber: 208,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 207,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 198,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Thành tựu của chúng tôi"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 215,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: "Hãy xem những giá trị của chúng tôi tạo ra"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 219,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 223,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 214,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$stats$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    data: statsData
                                }, void 0, false, {
                                    fileName: "[project]/app/(user)/(main)/page.tsx",
                                    lineNumber: 227,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 226,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 213,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Bài viết nổi bật"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 234,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: "Hãy xem mọi người đang bàn luận về những vấn đề nào"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 238,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 242,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 233,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
                                "data-aos": "fade-up",
                                "data-aos-delay": "100",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$blog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Cách học lập trình hiệu quả cho người mới bắt đầu",
                                            description: "Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế...",
                                            image: "/images/image2.jpg",
                                            time: "5 phút đọc",
                                            author: "Nguyễn Văn A",
                                            avatar: "/images/avatar.jpg",
                                            category: "Frontend",
                                            link: "/blog/1"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 251,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$blog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Cách học lập trình hiệu quả cho người mới bắt đầu",
                                            description: "Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế...",
                                            image: "/images/image2.jpg",
                                            time: "5 phút đọc",
                                            author: "Nguyễn Văn A",
                                            avatar: "/images/avatar.jpg",
                                            category: "Frontend",
                                            link: "/blog/1"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 263,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 262,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$blog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Cách học lập trình hiệu quả cho người mới bắt đầu",
                                            description: "Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế...",
                                            image: "/images/image2.jpg",
                                            time: "5 phút đọc",
                                            author: "Nguyễn Văn A",
                                            avatar: "/images/avatar.jpg",
                                            category: "Frontend",
                                            link: "/blog/1"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 275,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 274,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-aos": "zoom-in",
                                        "data-aos-delay": "100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$blog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "Cách học lập trình hiệu quả cho người mới bắt đầu",
                                            description: "Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế...",
                                            image: "/images/image2.jpg",
                                            time: "5 phút đọc",
                                            author: "Nguyễn Văn A",
                                            avatar: "/images/avatar.jpg",
                                            category: "Frontend",
                                            link: "/blog/1"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(user)/(main)/page.tsx",
                                            lineNumber: 287,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 286,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 245,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 232,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Thống kê truy cập"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 304,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 308,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 303,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$analytic$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    today: 1200,
                                    guest: 320,
                                    online: 180,
                                    total: 420000
                                }, void 0, false, {
                                    fileName: "[project]/app/(user)/(main)/page.tsx",
                                    lineNumber: 312,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 311,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 302,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-5",
                                "data-aos": "fade-up",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white",
                                        children: "Người dùng nói gì về CNcode"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 324,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(user)/(main)/page.tsx",
                                        lineNumber: 328,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 323,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$testimoninal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/app/(user)/(main)/page.tsx",
                                    lineNumber: 332,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(user)/(main)/page.tsx",
                                lineNumber: 331,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(user)/(main)/page.tsx",
                        lineNumber: 322,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(user)/(main)/page.tsx",
                lineNumber: 69,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(user)/(main)/page.tsx",
        lineNumber: 66,
        columnNumber: 9
    }, this);
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_50a852f1._.js.map