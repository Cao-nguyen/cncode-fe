// components/custom/ExerciseEditor.tsx
"use client";

import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    useTransition,
    forwardRef,
    useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { uploadApi } from "@/lib/upload";
import {
    Undo2,
    Redo2,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Quote,
    Code,
    Image as ImageIcon,
    Table,
    X,
    Check,
    RotateCcw,
    RotateCw,
    Maximize2,
    Plus,
    Minus,
    Superscript,
    Subscript,
    Trash2,
    Loader2,
    Sigma,
    FileText,
} from "lucide-react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

type HeadingLevel = "p" | "h1" | "h2" | "h3";
type ModalMode = "image" | "code" | "math" | "file" | null;
type ImgAlign = "left" | "center" | "right";

interface ActiveStates {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    justifyLeft: boolean;
    justifyCenter: boolean;
    justifyRight: boolean;
    justifyFull: boolean;
    superscript: boolean;
    subscript: boolean;
}

interface EditorStatus {
    words: number;
    chars: number;
    saved: boolean;
}

interface ExerciseEditorProps {
    initialValue?: string;
    onImageUpload?: (base64Image: string) => Promise<string>;
    uploading?: boolean;
    height?: string;
}

export interface ExerciseEditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
}

interface MathfieldElement extends HTMLElement {
    value: string;
    readOnly: boolean;
    mathVirtualKeyboardPolicy?: string;
}

declare global {
    interface Window {
        katex?: {
            render: (
                latex: string,
                element: HTMLElement,
                options?: { throwOnError?: boolean; displayMode?: boolean }
            ) => void;
        };
    }
}

const HIGHLIGHT_COLORS = [
    "#fef08a",
    "#bbf7d0",
    "#bfdbfe",
    "#fecaca",
    "#fed7aa",
    "#e9d5ff",
    "#fbcfe8",
    "transparent",
];

const CODE_LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "bash", label: "Bash" },
    { value: "sql", label: "SQL" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "plain", label: "Plain text" },
];

const SHORTCUTS: Record<string, string> = {
    Undo: "Ctrl+Z",
    Redo: "Ctrl+Y",
    "Đậm": "Ctrl+B",
    Nghiêng: "Ctrl+I",
    "Gạch chân": "Ctrl+U",
    "Gạch ngang": "Ctrl+Shift+X",
    "Tô sáng": "Ctrl+Shift+H",
    "Mũ trên (x²)": "Ctrl+.",
    "Mũ dưới (x₂)": "Ctrl+,",
    "Căn trái": "Ctrl+Shift+L",
    "Căn giữa": "Ctrl+Shift+E",
    "Căn phải": "Ctrl+Shift+R",
    "Căn đều": "Ctrl+Shift+J",
    "Trích dẫn": "Ctrl+Shift+Q",
    "Code block": "Ctrl+Shift+K",
    "Chèn ảnh": "Ctrl+Shift+I",
    "Chèn bảng": "Ctrl+Shift+T",
};

const TOKEN_COLORS: Record<string, string> = {
    keyword: "#c792ea",
    string: "#c3e88d",
    comment: "#546e7a",
    number: "#f78c6c",
    function: "#82aaff",
    type: "#ffcb6b",
    tag: "#f07178",
    attr: "#ffcb6b",
    plain: "#d4d4d4",
};

function escapeHTML(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sp(cls: string, txt: string): string {
    return `<span style="color:${TOKEN_COLORS[cls] ?? TOKEN_COLORS["plain"]}">${escapeHTML(txt)}</span>`;
}

function tokenize(code: string, lang: string): string {
    if (lang === "plain") return escapeHTML(code);

    const rules: Array<[string, RegExp]> = [];
    rules.push(["comment", /\/\/[^\n]*/]);
    rules.push(["comment", /\/\*[\s\S]*?\*\//]);
    rules.push(["comment", /#[^\n]*/]);
    rules.push(["string", /`[\s\S]*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/]);
    rules.push(["number", /\b\d+\.?\d*\b/]);

    if (["javascript", "typescript"].includes(lang)) {
        rules.push([
            "keyword",
            /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|new|this|typeof|void|null|undefined|true|false|try|catch|throw|switch|case|break|continue|of|in|extends)\b/,
        ]);
        rules.push(["function", /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/]);
        if (lang === "typescript")
            rules.push([
                "type",
                /\b(string|number|boolean|any|void|never|unknown|Record|Partial|Required|Readonly)\b/,
            ]);
    } else if (lang === "python") {
        rules.push([
            "keyword",
            /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|raise|with|as|pass|break|continue|lambda|yield)\b/,
        ]);
        rules.push(["function", /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/]);
    } else if (lang === "sql") {
        rules.push([
            "keyword",
            /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ON|AS|AND|OR|NOT|IN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|DISTINCT|COUNT|SUM|AVG|MAX|MIN)\b/i,
        ]);
    } else if (lang === "css") {
        rules.push(["keyword", /@[\w-]+/]);
        rules.push(["attr", /[\w-]+(?=\s*:)/]);
        rules.push(["number", /\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg)?/]);
    }

    let result = "",
        remaining = code;
    while (remaining.length > 0) {
        let bestMatch: RegExpMatchArray | null = null;
        let bestRule: string | null = null;
        let bestIndex = Infinity;
        for (const [type, re] of rules) {
            const m = remaining.match(re);
            if (m && m.index !== undefined && m.index < bestIndex) {
                bestMatch = m;
                bestRule = type;
                bestIndex = m.index;
            }
        }
        if (bestMatch && bestRule !== null && bestIndex !== Infinity) {
            if (bestIndex > 0) result += escapeHTML(remaining.slice(0, bestIndex));
            result += sp(bestRule, bestMatch[0]);
            remaining = remaining.slice(bestIndex + bestMatch[0].length);
        } else {
            result += escapeHTML(remaining);
            break;
        }
    }
    return result;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>"']*)?/g;

function autoLinkText(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        const combined: Array<{
            index: number;
            length: number;
            url: string;
            isEmail: boolean;
            text: string;
        }> = [];

        EMAIL_REGEX.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = EMAIL_REGEX.exec(text)) !== null) {
            combined.push({
                index: m.index,
                length: m[0].length,
                url: `mailto:${m[0]}`,
                isEmail: true,
                text: m[0],
            });
        }

        URL_REGEX.lastIndex = 0;
        while ((m = URL_REGEX.exec(text)) !== null) {
            const overlap = combined.some(
                (e) => m!.index >= e.index && m!.index < e.index + e.length
            );
            if (!overlap) {
                const matchText = m[0];
                const href = matchText.match(/^https?:\/\//) ? matchText : `https://${matchText}`;
                combined.push({
                    index: m.index,
                    length: m[0].length,
                    url: href,
                    isEmail: false,
                    text: matchText,
                });
            }
        }

        if (combined.length === 0) return;
        combined.sort((a, b) => a.index - b.index);
        const frag = document.createDocumentFragment();
        let last = 0;
        for (const item of combined) {
            if (item.index > last) frag.appendChild(document.createTextNode(text.slice(last, item.index)));
            const a = document.createElement("a");
            a.href = item.url;
            a.textContent = item.text;
            a.style.color = "#2563eb";
            a.style.textDecoration = "underline";
            a.style.textDecorationColor = "#2563eb";
            a.style.background = "rgba(37, 99, 235, 0.08)";
            a.style.padding = "1px 3px";
            a.style.borderRadius = "3px";
            if (!item.isEmail) {
                a.target = "_blank";
                a.rel = "noopener noreferrer";
            }
            frag.appendChild(a);
            last = item.index + item.length;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "A") {
        Array.from(node.childNodes).forEach(autoLinkText);
    }
}

function stripAndNormalizePaste(html: string): string {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    function cleanNode(el: Element) {
        el.removeAttribute("style");
        el.removeAttribute("class");
        el.removeAttribute("font");
        el.removeAttribute("color");
        el.removeAttribute("size");
        el.removeAttribute("face");
        for (const child of Array.from(el.children)) {
            cleanNode(child);
        }
    }
    cleanNode(tmp);
    const unwrapTags = ["font", "span"];
    for (const tag of unwrapTags) {
        tmp.querySelectorAll(tag).forEach((el) => {
            const parent = el.parentNode;
            if (!parent) return;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
        });
    }
    return tmp.innerHTML;
}

const ToolbarButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}> = ({ icon, label, active = false, onClick }) => {
    const shortcut = SHORTCUTS[label];
    const title = shortcut ? `${label} (${shortcut})` : label;
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`ex-tb-btn${active ? " ex-tb-btn-active" : ""}`}
            aria-pressed={active}
            aria-label={label}
        >
            {icon}
        </button>
    );
};

const Sep = () => <div className="ex-tb-sep" />;

const HighlightPicker: React.FC<{
    active: boolean;
    onSelect: (color: string) => void;
}> = ({ active, onSelect }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
            <button
                type="button"
                title={`Tô sáng (${SHORTCUTS["Tô sáng"]})`}
                onClick={() => setOpen((o) => !o)}
                className={`ex-tb-btn${active ? " ex-tb-btn-active" : ""}`}
                aria-label="Tô sáng"
            >
                <Highlighter size={15} />
            </button>
            {open && (
                <div className="ex-highlight-picker">
                    {HIGHLIGHT_COLORS.map((c) => (
                        <button
                            key={c}
                            title={c === "transparent" ? "Xóa tô sáng" : c}
                            onClick={() => {
                                onSelect(c);
                                setOpen(false);
                            }}
                            className="ex-highlight-swatch"
                            style={{
                                background:
                                    c === "transparent"
                                        ? "linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(45deg, #ddd 25%, white 25%, white 75%, #ddd 75%)"
                                        : c,
                                backgroundSize: c === "transparent" ? "6px 6px" : undefined,
                                backgroundPosition: c === "transparent" ? "0 0, 3px 3px" : undefined,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const mountedRoots = new Map<string, ReturnType<typeof createRoot>>();

const ExerciseEditor = forwardRef<ExerciseEditorRef, ExerciseEditorProps>(
    ({ initialValue = "", onImageUpload, uploading = false, height = "200px" }, ref) => {
        const editorRef = useRef<HTMLDivElement>(null);
        const savedRangeRef = useRef<Range | null>(null);
        const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
        const [, startTransition] = useTransition();

        const [active, setActive] = useState<ActiveStates>({
            bold: false,
            italic: false,
            underline: false,
            strikeThrough: false,
            justifyLeft: false,
            justifyCenter: false,
            justifyRight: false,
            justifyFull: false,
            superscript: false,
            subscript: false,
        });
        const [status, setStatus] = useState<EditorStatus>({
            words: 0,
            chars: 0,
            saved: true,
        });
        const [heading, setHeading] = useState<HeadingLevel>("p");
        const [fontColor, setFontColor] = useState<string>("#111827");
        const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
        const [modal, setModal] = useState<ModalMode>(null);
        const imageCounter = useRef(0);
        const tableCounter = useRef(0);
        const hasInitialized = useRef(false);

        const updateStatus = useCallback(() => {
            const text = editorRef.current?.innerText ?? "";
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const chars = text.replace(/\n/g, "").length;
            startTransition(() => setStatus((s) => ({ ...s, words, chars })));
        }, []);

        const scheduleAutosave = useCallback(() => {
            setStatus((s) => ({ ...s, saved: false }));
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => setStatus((s) => ({ ...s, saved: true })), 1200);
            updateStatus();
        }, [updateStatus]);

        const detectHeadingAtCursor = useCallback(() => {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            let node: Node | null = sel.getRangeAt(0).startContainer;
            while (node && node !== editorRef.current) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = (node as Element).tagName.toLowerCase();
                    if (["h1", "h2", "h3", "p"].includes(tag)) {
                        setHeading(tag as HeadingLevel);
                        return;
                    }
                }
                node = node.parentNode;
            }
            setHeading("p");
        }, []);

        const updateActiveStates = useCallback(() => {
            startTransition(() => {
                setActive({
                    bold: document.queryCommandState("bold"),
                    italic: document.queryCommandState("italic"),
                    underline: document.queryCommandState("underline"),
                    strikeThrough: document.queryCommandState("strikeThrough"),
                    justifyLeft: document.queryCommandState("justifyLeft"),
                    justifyCenter: document.queryCommandState("justifyCenter"),
                    justifyRight: document.queryCommandState("justifyRight"),
                    justifyFull: document.queryCommandState("justifyFull"),
                    superscript: document.queryCommandState("superscript"),
                    subscript: document.queryCommandState("subscript"),
                });
            });
            detectHeadingAtCursor();
        }, [detectHeadingAtCursor]);

        const exec = useCallback(
            (cmd: string, val?: string) => {
                editorRef.current?.focus();
                document.execCommand(cmd, false, val);
                updateActiveStates();
                scheduleAutosave();
            },
            [updateActiveStates, scheduleAutosave]
        );

        const saveRange = () => {
            const sel = window.getSelection();
            if (sel?.rangeCount) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        };

        const restoreRange = () => {
            if (savedRangeRef.current) {
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(savedRangeRef.current);
            }
        };

        const applyHeading = (tag: HeadingLevel) => {
            setHeading(tag);
            editorRef.current?.focus();
            document.execCommand("formatBlock", false, tag);
            scheduleAutosave();
        };

        const applyColor = (color: string) => {
            setFontColor(color);
            exec("foreColor", color);
        };

        const applyHighlight = (color: string) => {
            editorRef.current?.focus();
            if (color === "transparent") {
                document.execCommand("hiliteColor", false, "transparent");
                setActiveHighlight(null);
            } else {
                document.execCommand("hiliteColor", false, color);
                setActiveHighlight(color);
            }
            scheduleAutosave();
        };

        const insertImage = useCallback(
            (src: string, alt: string) => {
                if (!src) return;
                editorRef.current?.focus();
                restoreRange();
                const html = `<img src="${src}" alt="${alt}" style="max-width:100%; border-radius:6px; margin:0.5em 0;" contenteditable="false" />&nbsp;`;
                document.execCommand("insertHTML", false, html);
                scheduleAutosave();
            },
            [scheduleAutosave]
        );

        const insertCode = (code: string, lang: string) => {
            if (!code) return;
            editorRef.current?.focus();
            restoreRange();
            const highlighted = tokenize(code, lang);
            const html = `<pre class="ex-code-block" style="background:#1e1e2e; border-radius:8px; padding:12px; margin:0.5em 0; overflow-x:auto;"><code style="font-family:'JetBrains Mono',monospace; font-size:12px; color:#d4d4d4;">${highlighted}</code></pre><p><br></p>`;
            document.execCommand("insertHTML", false, html);
            scheduleAutosave();
        };

        const insertTable = () => {
            editorRef.current?.focus();
            restoreRange();
            const html = `<table style="border-collapse:collapse; width:100%; margin:0.5em 0; border:1px solid #d1d5db;">
                <thead><tr><th style="border:1px solid #d1d5db; padding:6px; background:#f1f5f9;">Header 1</th><th style="border:1px solid #d1d5db; padding:6px; background:#f1f5f9;">Header 2</th></tr></thead>
                <tbody><tr><td style="border:1px solid #d1d5db; padding:6px;">Cell 1</td><td style="border:1px solid #d1d5db; padding:6px;">Cell 2</td></tr></tbody>
            </table><p><br></p>`;
            document.execCommand("insertHTML", false, html);
            scheduleAutosave();
        };

        const insertMath = (latex: string) => {
            if (!latex) return;
            editorRef.current?.focus();
            restoreRange();
            const html = `<span class="ex-math-inline" data-latex="${latex.replace(/"/g, "&quot;")}" style="display:inline-block; font-family:monospace; background:#f3f4f6; padding:2px 6px; border-radius:4px;">${latex}</span>&nbsp;`;
            document.execCommand("insertHTML", false, html);
            scheduleAutosave();
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Tab") {
                e.preventDefault();
                exec("indent");
                return;
            }
            if (e.key === " " || e.key === "Enter") {
                setTimeout(() => {
                    const sel = window.getSelection();
                    if (!sel?.rangeCount || !editorRef.current) return;
                    const range = sel.getRangeAt(0);
                    const anchorNode = range.startContainer;
                    if (anchorNode.nodeType === Node.TEXT_NODE && anchorNode.parentNode?.nodeName !== "A") {
                        autoLinkText(anchorNode);
                    }
                }, 10);
            }
        };

        const handlePaste = useCallback(
            (e: React.ClipboardEvent<HTMLDivElement>) => {
                e.preventDefault();
                const clipData = e.clipboardData;
                const plainText = clipData.getData("text/plain");
                const htmlData = clipData.getData("text/html");
                if (htmlData) {
                    const cleaned = stripAndNormalizePaste(htmlData);
                    document.execCommand("insertHTML", false, cleaned);
                } else if (plainText) {
                    const escaped = plainText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
                    document.execCommand("insertHTML", false, escaped);
                }
                scheduleAutosave();
            },
            [scheduleAutosave]
        );

        useImperativeHandle(
            ref,
            () => ({
                getContent: () => editorRef.current?.innerHTML || "",
                setContent: (content: string) => {
                    if (editorRef.current) {
                        editorRef.current.innerHTML = content;
                        updateStatus();
                    }
                },
            }),
            [updateStatus]
        );

        useEffect(() => {
            if (editorRef.current && !hasInitialized.current) {
                hasInitialized.current = true;
                editorRef.current.innerHTML = initialValue || "<p><br></p>";
                updateStatus();
            }
        }, [initialValue, updateStatus]);

        const renderModals = () => {
            if (typeof document === 'undefined' || !modal) return null;
            const modalsMap = {
                code: (
                    <div className="ex-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                        <div className="ex-modal-box">
                            <div className="ex-modal-header">
                                <span className="ex-modal-title">Chèn code block</span>
                                <button onClick={() => setModal(null)} className="ex-modal-close-btn"><X size={20} /></button>
                            </div>
                            <select id="ex-code-lang" className="ex-modal-select" defaultValue="javascript">
                                {CODE_LANGUAGES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                            </select>
                            <textarea id="ex-code-content" className="ex-modal-textarea" rows={6} placeholder="// Dán code vào đây..." />
                            <div className="ex-modal-actions">
                                <button onClick={() => setModal(null)} className="ex-btn-cancel">Hủy</button>
                                <button onClick={() => {
                                    const lang = (document.getElementById("ex-code-lang") as HTMLSelectElement).value;
                                    const code = (document.getElementById("ex-code-content") as HTMLTextAreaElement).value;
                                    if (code) insertCode(code, lang);
                                    setModal(null);
                                }} className="ex-btn-ok">Chèn</button>
                            </div>
                        </div>
                    </div>
                ),
                math: (
                    <div className="ex-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                        <div className="ex-modal-box" style={{ width: 480 }}>
                            <div className="ex-modal-header">
                                <span className="ex-modal-title">Chèn công thức toán</span>
                                <button onClick={() => setModal(null)} className="ex-modal-close-btn"><X size={20} /></button>
                            </div>
                            <input type="text" id="ex-math-latex" className="ex-modal-input" placeholder="Nhập LaTeX, ví dụ: E = mc^2" />
                            <div className="ex-modal-actions">
                                <button onClick={() => setModal(null)} className="ex-btn-cancel">Hủy</button>
                                <button onClick={() => {
                                    const latex = (document.getElementById("ex-math-latex") as HTMLInputElement).value;
                                    if (latex) insertMath(latex);
                                    setModal(null);
                                }} className="ex-btn-ok">Chèn</button>
                            </div>
                        </div>
                    </div>
                ),
                image: (
                    <div className="ex-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                        <div className="ex-modal-box" style={{ width: 420 }}>
                            <div className="ex-modal-header">
                                <span className="ex-modal-title">Chèn ảnh</span>
                                <button onClick={() => setModal(null)} className="ex-modal-close-btn"><X size={20} /></button>
                            </div>
                            <input type="text" id="ex-image-url" className="ex-modal-input" placeholder="https://example.com/image.jpg" />
                            <input type="text" id="ex-image-alt" className="ex-modal-input" placeholder="Mô tả ảnh (alt text)" />
                            <div className="ex-modal-actions">
                                <button onClick={() => setModal(null)} className="ex-btn-cancel">Hủy</button>
                                <button onClick={() => {
                                    const url = (document.getElementById("ex-image-url") as HTMLInputElement).value;
                                    const alt = (document.getElementById("ex-image-alt") as HTMLInputElement).value;
                                    if (url) insertImage(url, alt);
                                    setModal(null);
                                }} className="ex-btn-ok">Chèn</button>
                            </div>
                        </div>
                    </div>
                ),
                file: null,
            };
            return createPortal(modalsMap[modal], document.body);
        };

        return (
            <>
                <style>{exerciseEditorStyles}</style>
                <div className="ex-ed-shell" style={{ height }}>
                    <div className="ex-ed-header">
                        <div className="ex-ed-toolbar">
                            <ToolbarButton icon={<Undo2 size={14} />} label="Undo" onClick={() => exec("undo")} />
                            <ToolbarButton icon={<Redo2 size={14} />} label="Redo" onClick={() => exec("redo")} />
                            <Sep />
                            <ToolbarButton icon={<Bold size={14} />} label="Đậm" active={active.bold} onClick={() => exec("bold")} />
                            <ToolbarButton icon={<Italic size={14} />} label="Nghiêng" active={active.italic} onClick={() => exec("italic")} />
                            <ToolbarButton icon={<Underline size={14} />} label="Gạch chân" active={active.underline} onClick={() => exec("underline")} />
                            <ToolbarButton icon={<Strikethrough size={14} />} label="Gạch ngang" active={active.strikeThrough} onClick={() => exec("strikeThrough")} />
                            <HighlightPicker active={!!activeHighlight} onSelect={applyHighlight} />
                            <Sep />
                            <ToolbarButton icon={<Superscript size={14} />} label="Mũ trên" active={active.superscript} onClick={() => { exec("superscript"); updateActiveStates(); }} />
                            <ToolbarButton icon={<Subscript size={14} />} label="Mũ dưới" active={active.subscript} onClick={() => { exec("subscript"); updateActiveStates(); }} />
                            <Sep />
                            <ToolbarButton icon={<AlignLeft size={14} />} label="Căn trái" active={active.justifyLeft} onClick={() => exec("justifyLeft")} />
                            <ToolbarButton icon={<AlignCenter size={14} />} label="Căn giữa" active={active.justifyCenter} onClick={() => exec("justifyCenter")} />
                            <ToolbarButton icon={<AlignRight size={14} />} label="Căn phải" active={active.justifyRight} onClick={() => exec("justifyRight")} />
                            <ToolbarButton icon={<Quote size={14} />} label="Trích dẫn" onClick={() => exec("formatBlock", "blockquote")} />
                            <ToolbarButton icon={<Code size={14} />} label="Code block" onClick={() => { saveRange(); setModal("code"); }} />
                            <ToolbarButton icon={<Sigma size={14} />} label="Công thức toán" onClick={() => { saveRange(); setModal("math"); }} />
                            <Sep />
                            <select value={heading} onChange={(e) => applyHeading(e.target.value as HeadingLevel)} className="ex-ed-select" style={{ width: 100 }}>
                                <option value="p">Đoạn văn</option>
                                <option value="h1">Tiêu đề 1</option>
                                <option value="h2">Tiêu đề 2</option>
                                <option value="h3">Tiêu đề 3</option>
                            </select>
                            <input type="color" value={fontColor} onChange={(e) => applyColor(e.target.value)} className="ex-color-picker" />
                            <ToolbarButton icon={<ImageIcon size={14} />} label="Chèn ảnh" onClick={() => { saveRange(); setModal("image"); }} />
                            <ToolbarButton icon={<Table size={14} />} label="Chèn bảng" onClick={insertTable} />
                        </div>
                    </div>
                    <div className="ex-ed-body">
                        <div className="ex-ed-content-wrap">
                            <div
                                ref={editorRef}
                                className="ex-editor"
                                contentEditable
                                suppressContentEditableWarning
                                spellCheck
                                onInput={() => { updateActiveStates(); scheduleAutosave(); }}
                                onKeyUp={updateActiveStates}
                                onMouseUp={updateActiveStates}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                            />
                        </div>
                    </div>
                    <div className="ex-ed-statusbar">
                        <span className={`ex-status-pill${status.saved ? " ex-status-pill-green" : ""}`}>
                            {status.saved ? "● Đã lưu" : "● Đang soạn"}
                        </span>
                        <span className="ex-status-pill">{status.words} từ</span>
                        <span className="ex-status-pill">{status.chars} ký tự</span>
                    </div>
                </div>
                {renderModals()}
            </>
        );
    }
);

ExerciseEditor.displayName = "ExerciseEditor";

export default ExerciseEditor;

const exerciseEditorStyles = `
  .ex-ed-shell { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; overflow: hidden; }
  .ex-ed-header { border-bottom: 1px solid #e5e7eb; background: #fafafa; flex-shrink: 0; }
  .ex-ed-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 6px 8px; }
  .ex-tb-btn { background: transparent; border: none; border-radius: 5px; padding: 5px 7px; cursor: pointer; color: #4b5563; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; }
  .ex-tb-btn:hover { background: #e5e7eb; color: #111827; }
  .ex-tb-btn-active { background: #e0e7ff; color: #4f46e5; }
  .ex-tb-sep { width: 1px; height: 20px; background: #e5e7eb; margin: 0 2px; }
  .ex-ed-select { padding: 4px 6px; border: 1px solid #d1d5db; border-radius: 5px; font-size: 12px; background: #fff; cursor: pointer; }
  .ex-color-picker { width: 28px; height: 28px; border: 1px solid #d1d5db; border-radius: 5px; cursor: pointer; padding: 2px; background: #fff; }
  .ex-ed-body { flex: 1; overflow-y: auto; }
  .ex-ed-content-wrap { min-height: 100%; }
  .ex-editor { outline: none; padding: 12px 16px; font-family: 'Inter', -apple-system, sans-serif; font-size: 14px; line-height: 1.6; color: #111827; min-height: 150px; }
  .ex-editor p { margin: 0 0 0.5em 0; }
  .ex-editor h1 { font-size: 1.5em; font-weight: 600; margin: 0.5em 0; }
  .ex-editor h2 { font-size: 1.3em; font-weight: 600; margin: 0.5em 0; }
  .ex-editor h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; }
  .ex-editor blockquote { border-left: 3px solid #6366f1; padding-left: 12px; margin: 0.5em 0; color: #6b7280; font-style: italic; }
  .ex-editor code { font-family: 'JetBrains Mono', monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-size: 0.85em; }
  .ex-editor pre { background: #1e1e2e; border-radius: 8px; padding: 12px; overflow-x: auto; margin: 0.5em 0; }
  .ex-editor pre code { background: none; padding: 0; color: #d4d4d4; }
  .ex-editor a { color: #2563eb; text-decoration: underline; }
  .ex-editor img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
  .ex-editor table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  .ex-editor th, .ex-editor td { border: 1px solid #d1d5db; padding: 6px 8px; }
  .ex-editor th { background: #f1f5f9; font-weight: 600; }
  .ex-ed-statusbar { display: flex; gap: 8px; padding: 4px 12px; border-top: 1px solid #e5e7eb; background: #fafafa; font-size: 10px; color: #9ca3af; }
  .ex-status-pill { background: #f3f4f6; padding: 2px 8px; border-radius: 12px; }
  .ex-status-pill-green { background: #dcfce7; color: #15803d; }
  .ex-highlight-picker { position: absolute; top: 32px; left: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 100; }
  .ex-highlight-swatch { width: 16px; height: 16px; border-radius: 3px; border: 1px solid #ddd; cursor: pointer; }
  .ex-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999; }
  .ex-modal-box { background: #fff; border-radius: 12px; padding: 20px; width: 420px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 12px; }
  .ex-modal-header { display: flex; justify-content: space-between; align-items: center; }
  .ex-modal-title { font-size: 15px; font-weight: 600; color: #111827; }
  .ex-modal-close-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; }
  .ex-modal-close-btn:hover { background: #f3f4f6; }
  .ex-modal-input, .ex-modal-select, .ex-modal-textarea { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; outline: none; }
  .ex-modal-input:focus, .ex-modal-select:focus, .ex-modal-textarea:focus { border-color: #6366f1; }
  .ex-modal-textarea { font-family: 'JetBrains Mono', monospace; resize: vertical; }
  .ex-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
  .ex-btn-cancel { padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 6px; background: #f3f4f6; color: #6b7280; cursor: pointer; font-size: 12px; }
  .ex-btn-cancel:hover { background: #e5e7eb; }
  .ex-btn-ok { padding: 6px 14px; border: none; border-radius: 6px; background: #6366f1; color: #fff; cursor: pointer; font-size: 12px; }
  .ex-btn-ok:hover { background: #4f46e5; }
`;

export { ExerciseEditor };