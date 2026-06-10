// components/custom/CustomEditor.tsx
'use client';

import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    useTransition,
    forwardRef,
    useImperativeHandle
} from "react";
import { uploadApi } from '@/lib/upload';
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
    FileText
} from "lucide-react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface CustomEditorProps {
    initialValue?: string;
    onImageUpload?: (base64Image: string) => Promise<string>;
    uploading?: boolean;
    compact?: boolean;
}

export interface CustomEditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
}

// Type definitions for mathlive
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

// ─── Constants ────────────────────────────────────────────────────────────────

const HIGHLIGHT_COLORS = [
    "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca",
    "#fed7aa", "#e9d5ff", "#fbcfe8", "transparent",
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
    "Undo": "Ctrl+Z",
    "Redo": "Ctrl+Y",
    "Đậm": "Ctrl+B",
    "Nghiêng": "Ctrl+I",
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

// ─── Syntax Highlight ─────────────────────────────────────────────────────────

const TOKEN_COLORS: Record<string, string> = {
    keyword: "#c792ea", string: "#c3e88d", comment: "#546e7a",
    number: "#f78c6c", function: "#82aaff", type: "#ffcb6b",
    tag: "#f07178", attr: "#ffcb6b", plain: "#d4d4d4",
};

function tokenize(code: string, lang: string): string {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sp = (cls: string, txt: string) =>
        `<span style="color:${TOKEN_COLORS[cls] ?? TOKEN_COLORS["plain"]}">${esc(txt)}</span>`;
    if (lang === "plain") return esc(code);

    const rules: Array<[string, RegExp]> = [];
    rules.push(["comment", /\/\/[^\n]*/]);
    rules.push(["comment", /\/\*[\s\S]*?\*\//]);
    rules.push(["comment", /#[^\n]*/]);
    rules.push(["string", /`[\s\S]*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/]);
    rules.push(["number", /\b\d+\.?\d*\b/]);

    if (["javascript", "typescript"].includes(lang)) {
        rules.push(["keyword", /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|new|this|typeof|void|null|undefined|true|false|try|catch|throw|switch|case|break|continue|of|in|extends)\b/]);
        rules.push(["function", /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/]);
        if (lang === "typescript") rules.push(["type", /\b(string|number|boolean|any|void|never|unknown|Record|Partial|Required|Readonly)\b/]);
    } else if (lang === "python") {
        rules.push(["keyword", /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|raise|with|as|pass|break|continue|lambda|yield)\b/]);
        rules.push(["function", /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/]);
    } else if (lang === "sql") {
        rules.push(["keyword", /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ON|AS|AND|OR|NOT|IN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|DISTINCT|COUNT|SUM|AVG|MAX|MIN)\b/i]);
    } else if (lang === "css") {
        rules.push(["keyword", /@[\w-]+/]);
        rules.push(["attr", /[\w-]+(?=\s*:)/]);
        rules.push(["number", /\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg)?/]);
    }

    let result = "", remaining = code;
    while (remaining.length > 0) {
        let bestMatch: RegExpMatchArray | null = null;
        let bestRule: string | null = null;
        let bestIndex = Infinity;
        for (const [type, re] of rules) {
            const m = remaining.match(re);
            if (m && m.index !== undefined && m.index < bestIndex) {
                bestMatch = m; bestRule = type; bestIndex = m.index;
            }
        }
        if (bestMatch && bestRule !== null && bestIndex !== Infinity) {
            if (bestIndex > 0) result += esc(remaining.slice(0, bestIndex));
            result += sp(bestRule, bestMatch[0]);
            remaining = remaining.slice(bestIndex + bestMatch[0].length);
        } else { result += esc(remaining); break; }
    }
    return result;
}

// ─── File Card HTML Generator ─────────────────────────────────────────────────

function generateFileCardHTML(filename: string, messageId: string, fileSize: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';

    // SVG icons và màu sắc theo loại file
    const configs: Record<string, { svg: string; color: string; canPreview: boolean }> = {
        pdf: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#e11d48" d="M19,2L14,2L14,9L20,9L20,4C20,2.89 19.1,2 19,2M13,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V10L13,2M9,19H7V13H9C10.1,13 11,13.9 11,15V17C11,18.1 10.1,19 9,19M15,19H13V13H17V15H15V16H17V18H15V19M9,15V17H7V15H9M13,3.5L18.5,9H13V3.5Z"/></svg>',
            color: '#e11d48',
            canPreview: true
        },
        doc: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#2b579a" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.2,19H13.8L12.8,14.4L11.7,19H10.3L8.7,12.1H10.1L11.3,17.5L12.3,12.8H13.3L14.3,17.5L15.5,12.1H16.9L15.2,19M13,9V3.5L18.5,9H13Z"/></svg>',
            color: '#2b579a',
            canPreview: false
        },
        docx: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#2b579a" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.2,19H13.8L12.8,14.4L11.7,19H10.3L8.7,12.1H10.1L11.3,17.5L12.3,12.8H13.3L14.3,17.5L15.5,12.1H16.9L15.2,19M13,9V3.5L18.5,9H13Z"/></svg>',
            color: '#2b579a',
            canPreview: false
        },
        xls: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#107c10" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,19H14.4L12.4,14.6L10.4,19H9L11.7,13.1L9,7.2H10.4L12.4,11.6L14.4,7.2H15.8L13.1,13.1L15.8,19M13,9V3.5L18.5,9H13Z"/></svg>',
            color: '#107c10',
            canPreview: false
        },
        xlsx: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#107c10" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,19H14.4L12.4,14.6L10.4,19H9L11.7,13.1L9,7.2H10.4L12.4,11.6L14.4,7.2H15.8L13.1,13.1L15.8,19M13,9V3.5L18.5,9H13Z"/></svg>',
            color: '#107c10',
            canPreview: false
        },
        ppt: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#d24726" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M16,13H13V12H16V13M16,15H13V14H16V15M16,17H13V16H16V17M11,13H8V12H11V13M11,15H8V14H11V15M11,17H8V16H11V17M13,9V3.5L18.5,9H13Z"/></svg>',
            color: '#d24726',
            canPreview: false
        },
        pptx: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#d24726" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M16,13H13V12H16V13M16,15H13V14H16V15M16,17H13V16H16V17M11,13H8V12H11V13M11,15H8V14H11V15M11,17H8V16H11V17M13,9V3.5L18.5,9H13Z"/></svg>',
            color: '#d24726',
            canPreview: false
        },
        zip: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#f59e0b" d="M14,17H12V15H10V17H8V15H10V13H8V11H10V13H12V11H10V9H12V7H14V9H12V11H14V13H12V15H14V17M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
            color: '#f59e0b',
            canPreview: false
        },
        rar: {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#f59e0b" d="M14,17H12V15H10V17H8V15H10V13H8V11H10V13H12V11H10V9H12V7H14V9H12V11H14V13H12V15H14V17M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
            color: '#f59e0b',
            canPreview: false
        },
        '7z': {
            svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#f59e0b" d="M14,17H12V15H10V17H8V15H10V13H8V11H10V13H12V11H10V9H12V7H14V9H12V11H14V13H12V15H14V17M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
            color: '#f59e0b',
            canPreview: false
        },
    };

    const config = configs[ext] ?? {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#64748b" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
        color: '#64748b',
        canPreview: false
    };

    return `
        <div class="file-card" contenteditable="false" data-message-id="${messageId}" style="background:#ffffff;width:100%;max-width:550px;padding:12px 16px;border-radius:12px;display:flex;align-items:center;border:1px solid #edf2f7;transition:all 0.2s ease;margin:12px 0;font-family:Inter,system-ui,sans-serif;" onmouseover="this.style.borderColor='#cbd5e0';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)';this.style.transform='translateY(-1px)';" onmouseout="this.style.borderColor='#edf2f7';this.style.boxShadow='none';this.style.transform='translateY(0)';">
            <div style="width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-right:16px;flex-shrink:0;position:relative;background:${config.color}12;">
                ${config.svg}
            </div>
            <div style="flex-grow:1;min-width:0;">
                <div style="font-size:14.5px;font-weight:600;color:#2d3748;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;" title="${filename}">${filename}</div>
                <div style="font-size:12px;color:#718096;display:flex;gap:10px;">
                    <span>${fileSize}</span>
                    <span>•</span>
                    <span>Vừa xong</span>
                </div>
            </div>
            <button onclick="(()=>{const a=document.createElement('a');a.href='http://localhost:5000/api/upload/proxy/file/${messageId}';a.download='${filename}';a.click();})()" style="width:36px;height:36px;border-radius:8px;border:none;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.2s;margin-left:12px;" onmouseover="this.style.background='#e2e8f0';this.style.color='#1e293b';" onmouseout="this.style.background='#f8fafc';this.style.color='#64748b';" title="Tải xuống">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </button>
        </div>
    `;
}

// ─── FIX 1: Auto-link và highlight email/link ────────────────────────────────

// Regex cho email và URL (bao gồm cả có và không có https)
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
// Cải thiện URL_REGEX để bắt được domain như cncode.io.vn
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>"']*)?/g;

function autoLinkText(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";

        // Kết hợp cả URL và email, tìm tất cả matches
        const combined: Array<{ index: number; length: number; url: string; isEmail: boolean; text: string }> = [];

        // Tìm emails - highlight với màu xanh dương
        EMAIL_REGEX.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = EMAIL_REGEX.exec(text)) !== null) {
            combined.push({
                index: m.index,
                length: m[0].length,
                url: `mailto:${m[0]}`,
                isEmail: true,
                text: m[0]
            });
        }

        // Tìm URLs - skip nếu vị trí đã bị email chiếm
        URL_REGEX.lastIndex = 0;
        while ((m = URL_REGEX.exec(text)) !== null) {
            const overlap = combined.some(e => m!.index >= e.index && m!.index < e.index + e.length);
            if (!overlap) {
                const matchText = m[0];
                // Xác định href: thêm https:// nếu chưa có protocol
                const href = matchText.match(/^https?:\/\//) ? matchText : `https://${matchText}`;
                combined.push({
                    index: m.index,
                    length: m[0].length,
                    url: href,
                    isEmail: false,
                    text: matchText
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

// ─── FIX 3: Strip paste formatting → plain text với font/size chuẩn ──────────

function stripAndNormalizePaste(html: string): string {
    // Tạo DOM tạm để parse
    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    // Xóa hết style inline, giữ lại cấu trúc block
    function cleanNode(el: Element) {
        // Giữ một số thuộc tính semantic nhưng xóa style
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

    // Unwrap các tag font/span không semantic
    const unwrapTags = ["font", "span"];
    for (const tag of unwrapTags) {
        tmp.querySelectorAll(tag).forEach(el => {
            const parent = el.parentNode;
            if (!parent) return;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
        });
    }

    return tmp.innerHTML;
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

const ToolbarButton: React.FC<{
    icon: React.ReactNode; label: string; active?: boolean; onClick: () => void;
}> = ({ icon, label, active = false, onClick }) => {
    const shortcut = SHORTCUTS[label];
    const title = shortcut ? `${label} (${shortcut})` : label;
    return (
        <button type="button" title={title} onClick={onClick}
            className={`tb-btn${active ? " tb-btn-active" : ""}`} aria-pressed={active} aria-label={label}>
            {icon}
        </button>
    );
};

const Sep = () => <div className="tb-sep" />;

// ─── Highlight Color Picker ───────────────────────────────────────────────────

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
            <button type="button" title={`Tô sáng (${SHORTCUTS["Tô sáng"]})`}
                onClick={() => setOpen(o => !o)}
                className={`tb-btn${active ? " tb-btn-active" : ""}`}
                aria-label="Tô sáng">
                <Highlighter size={15} />
            </button>
            {open && (
                <div className="highlight-picker">
                    {HIGHLIGHT_COLORS.map(c => (
                        <button key={c} title={c === "transparent" ? "Xóa tô sáng" : c}
                            onClick={() => { onSelect(c); setOpen(false); }}
                            className="highlight-swatch"
                            style={{
                                background: c === "transparent"
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

// ─── Code Modal ───────────────────────────────────────────────────────────────

const CodeModal: React.FC<{ onClose: () => void; onInsert: (code: string, lang: string) => void }> = ({ onClose, onInsert }) => {
    const [code, setCode] = useState("");
    const [lang, setLang] = useState("javascript");
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-header">
                    <span className="modal-title">Chèn code block</span>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                <select value={lang} onChange={e => setLang(e.target.value)} className="modal-select">
                    {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <textarea value={code} onChange={e => setCode(e.target.value)}
                    placeholder="// Dán code vào đây..." className="modal-textarea" rows={9} spellCheck={false} autoFocus />
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">Hủy</button>
                    <button onClick={() => { onInsert(code, lang); onClose(); }} className="btn-ok">Chèn</button>
                </div>
            </div>
        </div>
    );
};

// ─── Math Modal ───────────────────────────────────────────────────────────────

const MathModal: React.FC<{ onClose: () => void; onInsert: (latex: string) => void }> = ({ onClose, onInsert }) => {
    const mathFieldRef = useRef<HTMLDivElement>(null);
    const [mathField, setMathField] = useState<MathfieldElement | null>(null);

    useEffect(() => {
        if (mathFieldRef.current && !mathField) {
            import('mathlive').then((MathLive) => {
                // Configure mathlive fonts path - để null để tự động load từ package
                const MathfieldElementClass = MathLive.MathfieldElement as unknown as {
                    new(): MathfieldElement;
                    fontsDirectory: string | null;
                };

                // Không set fontsDirectory, để mathlive tự động tìm fonts
                const mf = new MathfieldElementClass();
                mf.style.fontSize = '20px';
                mf.style.padding = '12px';
                mf.style.border = '1px solid #d1d5db';
                mf.style.borderRadius = '6px';
                mf.style.minHeight = '60px';
                mf.style.background = '#ffffff';

                // Cấu hình virtual keyboard - ẩn nút toggle keyboard
                mf.mathVirtualKeyboardPolicy = 'manual';

                // Ẩn các nút toggle keyboard trong mathfield
                const style = document.createElement('style');
                style.textContent = `
                    math-field::part(virtual-keyboard-toggle) {
                        display: none !important;
                    }
                `;
                document.head.appendChild(style);
                mf.addEventListener('focus', () => {
                    if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { show(): void } }).mathVirtualKeyboard) {
                        (window as Window & { mathVirtualKeyboard: { show(): void } }).mathVirtualKeyboard.show();
                    }
                });

                mathFieldRef.current?.appendChild(mf);
                setMathField(mf);

                // Show keyboard ngay khi mở modal
                setTimeout(() => {
                    mf.focus();
                    if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { show(): void } }).mathVirtualKeyboard) {
                        (window as Window & { mathVirtualKeyboard: { show(): void } }).mathVirtualKeyboard.show();
                    }
                }, 100);
            }).catch(err => {
                console.error('Failed to load mathlive:', err);
            });
        }

        return () => {
            if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { hide(): void } }).mathVirtualKeyboard) {
                (window as Window & { mathVirtualKeyboard: { hide(): void } }).mathVirtualKeyboard.hide();
            }
        };
    }, [mathField]);

    const handleInsert = () => {
        if (mathField) {
            const latex = mathField.value;
            if (latex && latex.trim()) {
                onInsert(latex.trim());
                onClose();
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ width: 480 }}>
                <div className="modal-header">
                    <span className="modal-title">Chèn công thức toán</span>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontFamily: "Inter, system-ui, sans-serif" }}>
                    Sử dụng bàn phím ảo để nhập công thức toán học
                </div>
                <div ref={mathFieldRef} style={{ marginBottom: 12 }} />
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">Hủy</button>
                    <button onClick={handleInsert} className="btn-ok">Chèn</button>
                </div>
            </div>
        </div>
    );
};

// ─── Upload Image Modal ───────────────────────────────────────────────────────

interface UploadImageModalProps {
    onClose: () => void;
    onConfirm: (src: string, alt: string) => void;
    onImageUpload?: (base64Image: string) => Promise<string>;
    uploading?: boolean;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({ onClose, onConfirm, onImageUpload, uploading = false }) => {
    const [tab, setTab] = useState<"url" | "upload">("upload");
    const [url, setUrl] = useState("");
    const [alt, setAlt] = useState("");
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState("");
    const [dragging, setDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const objectUrl = URL.createObjectURL(file);
        setBlobUrl(objectUrl);
        setFileName(file.name);
        setAlt(file.name.replace(/\.[^.]+$/, ""));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleConfirm = async () => {
        if (tab === "url") {
            if (!url) return;
            onConfirm(url, alt);
            onClose();
            return;
        }

        if (!blobUrl) return;

        setIsUploading(true);

        try {
            const response = await fetch(blobUrl);
            const blob = await response.blob();

            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const result = await uploadApi.uploadImage(base64, 'editor');

            if (!result?.success || !result.url) {
                toast.error(result?.message || "Upload thất bại");
                return;
            }

            onConfirm(result.url, alt);
            toast.success("Upload ảnh thành công");
            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ width: 420 }}>
                <div className="modal-header">
                    <span className="modal-title">Chèn ảnh</span>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>

                <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid #e5e7eb", marginBottom: 12 }}>
                    {(["upload", "url"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{
                                flex: 1, padding: "7px 0", border: "none", background: "none",
                                fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 12,
                                color: tab === t ? "#6366f1" : "#6b7280", cursor: "pointer",
                                borderBottom: tab === t ? "2px solid #6366f1" : "2px solid transparent",
                                fontWeight: tab === t ? 600 : 400, transition: "all 0.15s",
                            }}>
                            {t === "upload" ? "Tải lên từ máy" : "URL ảnh"}
                        </button>
                    ))}
                </div>

                {tab === "upload" ? (
                    <>
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: `1.5px dashed ${dragging ? "#6366f1" : "#d1d5db"}`,
                                borderRadius: 8, padding: "28px 16px", textAlign: "center",
                                cursor: "pointer", background: dragging ? "#f5f5ff" : "#fafafa",
                                transition: "all 0.15s", marginBottom: 10,
                            }}>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                            {blobUrl ? (
                                <div>
                                    <img src={blobUrl} alt="preview"
                                        style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, marginBottom: 6, objectFit: "contain" }} />
                                    <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "system-ui,sans-serif" }}>{fileName}</div>
                                </div>
                            ) : (
                                <div style={{ fontFamily: "system-ui,sans-serif" }}>
                                    <ImageIcon size={28} style={{ margin: "0 auto", display: "block", color: "#9ca3af" }} />
                                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Kéo thả ảnh vào đây</div>
                                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>hoặc click để chọn file</div>
                                </div>
                            )}
                        </div>
                        <input value={alt} onChange={e => setAlt(e.target.value)}
                            placeholder="Mô tả ảnh (alt text)" className="modal-input" style={{ marginBottom: 0 }} />
                    </>
                ) : (
                    <>
                        <input autoFocus value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg" className="modal-input" />
                        <input value={alt} onChange={e => setAlt(e.target.value)}
                            placeholder="Mô tả ảnh (alt text)" className="modal-input" style={{ marginBottom: 0 }} />
                        {url && (
                            <img src={url} alt="preview" onError={e => (e.currentTarget.style.display = "none")}
                                style={{ maxHeight: 100, maxWidth: "100%", borderRadius: 6, marginTop: 8, objectFit: "contain", display: "block" }} />
                        )}
                    </>
                )}

                <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button onClick={onClose} className="btn-cancel" disabled={isUploading}>Hủy</button>
                    <button onClick={handleConfirm} className="btn-ok" disabled={(tab === "upload" ? !blobUrl : !url) || isUploading}>
                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {isUploading ? "Đang upload..." : "Chèn ảnh"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Upload File Modal ────────────────────────────────────────────────────────

interface UploadFileModalProps {
    onClose: () => void;
    onConfirm: (messageId: string, filename: string) => void;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ onClose, onConfirm }) => {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selectedFile: File) => {
        setFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
    };

    const handleConfirm = async () => {
        if (!file) return;

        setIsUploading(true);

        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            const result = await uploadApi.uploadFile(base64, 'editor');

            if (!result?.success) {
                toast.error(result?.message || "Upload thất bại");
                return;
            }

            if (!result.messageId) {
                toast.error("Không nhận được messageId từ server");
                return;
            }

            onConfirm(result.messageId, file.name);
            toast.success("Upload file thành công");
            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ width: 420 }}>
                <div className="modal-header">
                    <span className="modal-title">Chèn file</span>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>

                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `1.5px dashed ${dragging ? "#6366f1" : "#d1d5db"}`,
                        borderRadius: 8, padding: "28px 16px", textAlign: "center",
                        cursor: "pointer", background: dragging ? "#f5f5ff" : "#fafafa",
                        transition: "all 0.15s", marginBottom: 10,
                    }}>
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    {file ? (
                        <div>
                            <FileText size={32} style={{ margin: "0 auto", display: "block", color: "#6366f1" }} />
                            <div style={{ fontSize: 13, color: "#111827", marginTop: 8, fontFamily: "system-ui,sans-serif", fontWeight: 500 }}>{file.name}</div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, fontFamily: "system-ui,sans-serif" }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontFamily: "system-ui,sans-serif" }}>
                            <FileText size={28} style={{ margin: "0 auto", display: "block", color: "#9ca3af" }} />
                            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Kéo thả file vào đây</div>
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>hoặc click để chọn file</div>
                        </div>
                    )}
                </div>

                <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button onClick={onClose} className="btn-cancel" disabled={isUploading}>Hủy</button>
                    <button onClick={handleConfirm} className="btn-ok" disabled={!file || isUploading}>
                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {isUploading ? "Đang upload..." : "Chèn file"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Image Widget ─────────────────────────────────────────────────────────────

const ImageWidget: React.FC<{
    src: string;
    alt: string;
    onDelete: () => void;
    onUpdate?: (id: string, data: { width?: number; rotation?: number; align?: string; x?: number; y?: number }) => void;
    widgetId?: string;
}> = ({ src, alt, onDelete, onUpdate, widgetId }) => {
    const getInitialWidth = () => {
        if (widgetId) {
            const el = document.querySelector(`[data-img-id="${widgetId}"]`);
            const savedWidth = el?.getAttribute('data-img-width');
            return savedWidth ? parseInt(savedWidth) : 280;
        }
        return 280;
    };

    const getInitialRotation = () => {
        if (widgetId) {
            const el = document.querySelector(`[data-img-id="${widgetId}"]`);
            const savedRotation = el?.getAttribute('data-img-rotation');
            return savedRotation ? parseInt(savedRotation) : 0;
        }
        return 0;
    };

    const getInitialAlign = () => {
        if (widgetId) {
            const el = document.querySelector(`[data-img-id="${widgetId}"]`);
            const savedAlign = el?.getAttribute('data-img-align');
            return (savedAlign as ImgAlign) || "left";
        }
        return "left";
    };

    const getInitialPos = () => {
        if (widgetId) {
            const el = document.querySelector(`[data-img-id="${widgetId}"]`);
            const savedX = el?.getAttribute('data-img-x');
            const savedY = el?.getAttribute('data-img-y');
            return {
                x: savedX ? parseInt(savedX) : 0,
                y: savedY ? parseInt(savedY) : 0
            };
        }
        return { x: 0, y: 0 };
    };

    const [width, setWidth] = useState(getInitialWidth());
    const [rotation, setRotation] = useState(getInitialRotation());
    const [align, setAlign] = useState<ImgAlign>(getInitialAlign());
    const [selected, setSelected] = useState(false);
    const [pos, setPos] = useState(getInitialPos());
    const [dragging, setDragging] = useState(false);
    const wrapRef = useRef<HTMLSpanElement>(null);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
    const resizeStartRef = useRef({ mx: 0, w: 0 });

    const saveChanges = useCallback((updates: { width?: number; rotation?: number; align?: ImgAlign; x?: number; y?: number }) => {
        if (widgetId) {
            const el = document.querySelector(`[data-img-id="${widgetId}"]`);
            if (el) {
                if (updates.width !== undefined) el.setAttribute('data-img-width', updates.width.toString());
                if (updates.rotation !== undefined) el.setAttribute('data-img-rotation', updates.rotation.toString());
                if (updates.align !== undefined) el.setAttribute('data-img-align', updates.align);
                if (updates.x !== undefined) el.setAttribute('data-img-x', updates.x.toString());
                if (updates.y !== undefined) el.setAttribute('data-img-y', updates.y.toString());
            }
        }
        onUpdate?.(widgetId || '', updates);
    }, [widgetId, onUpdate]);

    useEffect(() => {
        const onOut = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSelected(false);
        };
        document.addEventListener("mousedown", onOut);
        return () => document.removeEventListener("mousedown", onOut);
    }, []);

    const onDragStart = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).dataset["handle"]) return;
        e.preventDefault();
        setDragging(true);
        dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
        const onMove = (me: MouseEvent) => {
            const newPos = {
                x: dragStart.current.px + me.clientX - dragStart.current.mx,
                y: dragStart.current.py + me.clientY - dragStart.current.my,
            };
            setPos(newPos);
            saveChanges({ x: newPos.x, y: newPos.y });
        };
        const onUp = () => { setDragging(false); document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    const onResizeStart = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        resizeStartRef.current = { mx: e.clientX, w: width };
        const onMove = (me: MouseEvent) => {
            const newWidth = Math.max(60, resizeStartRef.current.w + me.clientX - resizeStartRef.current.mx);
            setWidth(newWidth);
            saveChanges({ width: newWidth });
        };
        const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    const handleSetAlign = (newAlign: ImgAlign) => {
        setAlign(newAlign);
        saveChanges({ align: newAlign });
    };

    const handleRotate = (delta: number) => {
        const newRotation = rotation + delta;
        setRotation(newRotation);
        saveChanges({ rotation: newRotation });
    };

    const handleReset = () => {
        setWidth(280);
        setRotation(0);
        setAlign("left");
        setPos({ x: 0, y: 0 });
        saveChanges({ width: 280, rotation: 0, align: "left", x: 0, y: 0 });
    };

    const alignStyle: React.CSSProperties = align === "center"
        ? { display: "block", margin: "0.5em auto" }
        : align === "right"
            ? { display: "block", marginLeft: "auto", marginTop: "0.5em", marginBottom: "0.5em" }
            : { display: "block", marginTop: "0.5em", marginBottom: "0.5em" };

    return (
        <span ref={wrapRef} contentEditable={false}
            className={`img-widget-outer${selected ? " img-selected" : ""}`}
            style={{
                ...alignStyle,
                width: "fit-content",
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                cursor: dragging ? "grabbing" : selected ? "grab" : "pointer",
                userSelect: "none",
                position: "relative",
            }}
            onClick={() => setSelected(true)}
            onMouseDown={selected ? onDragStart : undefined}
        >
            <img src={src} alt={alt} style={{
                width, maxWidth: "100%", display: "block", borderRadius: 7,
                transform: `rotate(${rotation}deg)`, transition: "transform 0.2s",
                border: selected ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
            }} draggable={false} />
            {selected && (
                <>
                    <span className="img-toolbar">
                        <button data-handle="1"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleSetAlign("left"); }}
                            className={`img-tb-btn${align === "left" ? " img-tb-btn-active" : ""}`} title="Căn trái">
                            <AlignLeft size={11} />
                        </button>
                        <button data-handle="1"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleSetAlign("center"); }}
                            className={`img-tb-btn${align === "center" ? " img-tb-btn-active" : ""}`} title="Căn giữa">
                            <AlignCenter size={11} />
                        </button>
                        <button data-handle="1"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleSetAlign("right"); }}
                            className={`img-tb-btn${align === "right" ? " img-tb-btn-active" : ""}`} title="Căn phải">
                            <AlignRight size={11} />
                        </button>
                        <span className="img-tb-divider" />
                        <button data-handle="1"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleRotate(-90); }}
                            className="img-tb-btn" title="Xoay trái">
                            <RotateCcw size={11} />
                        </button>
                        <button data-handle="1"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleRotate(90); }}
                            className="img-tb-btn" title="Xoay phải">
                            <RotateCw size={11} />
                        </button>
                        <button data-handle="1"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleReset(); }}
                            className="img-tb-btn" title="Đặt lại">
                            <Maximize2 size={11} />
                        </button>
                        <span className="img-tb-divider" />
                        <button data-handle="1"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                            className="img-tb-btn img-tb-btn-danger" title="Xóa ảnh">
                            <Trash2 size={11} />
                        </button>
                    </span>
                    <span data-handle="1" onMouseDown={onResizeStart} className="img-resize-handle" title="Kéo để resize" />
                </>
            )}
        </span>
    );
};

// ─── Table Widget ─────────────────────────────────────────────────────────────

const TableWidget: React.FC<{ initialRows: number; initialCols: number; onDelete?: () => void }> = ({ initialRows, initialCols, onDelete }) => {
    const [data, setData] = useState<string[][]>(() =>
        Array.from({ length: initialRows + 1 }, (_, r) =>
            Array.from({ length: initialCols }, (_, c) => r === 0 ? `Header ${c + 1}` : "")
        )
    );
    const [colWidths, setColWidths] = useState<number[]>(() => Array(initialCols).fill(110));
    const [selected, setSelected] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const resizingCol = useRef<number | null>(null);
    const resizeStartX = useRef(0);
    const resizeStartW = useRef(0);

    useEffect(() => {
        const onOut = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSelected(false);
        };
        document.addEventListener("mousedown", onOut);
        return () => document.removeEventListener("mousedown", onOut);
    }, []);

    const addRow = () => setData(d => [...d, Array(d[0].length).fill("")]);
    const addCol = () => {
        setData(d => d.map((row, i) => [...row, i === 0 ? `Header ${row.length + 1}` : ""]));
        setColWidths(w => [...w, 110]);
    };
    const removeRow = (ri: number) => { if (data.length > 2) setData(d => d.filter((_, i) => i !== ri)); };
    const removeCol = (ci: number) => {
        if (data[0].length > 1) {
            setData(d => d.map(row => row.filter((_, i) => i !== ci)));
            setColWidths(w => w.filter((_, i) => i !== ci));
        }
    };
    const updateCell = (ri: number, ci: number, val: string) =>
        setData(d => d.map((row, r) => row.map((cell, c) => (r === ri && c === ci ? val : cell))));

    const startColResize = (e: React.MouseEvent, ci: number) => {
        e.preventDefault(); e.stopPropagation();
        resizingCol.current = ci; resizeStartX.current = e.clientX; resizeStartW.current = colWidths[ci];
        const onMove = (me: MouseEvent) => {
            if (resizingCol.current === null) return;
            const colIdx = resizingCol.current;
            setColWidths(w => w.map((width, i) => i === colIdx ? Math.max(50, resizeStartW.current + me.clientX - resizeStartX.current) : width));
        };
        const onUp = () => { resizingCol.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    return (
        <div ref={wrapRef} contentEditable={false} className={`table-widget${selected ? " table-selected" : ""}`} onClick={() => setSelected(true)}>
            <div style={{ overflowX: "auto" }}>
                <table className="tw-table">
                    <thead>
                        <tr>
                            {data[0].map((cell, ci) => (
                                <th key={ci} style={{ width: colWidths[ci], minWidth: colWidths[ci] }} className="tw-th">
                                    <input className="tw-cell-input tw-header-input" value={cell} onChange={e => updateCell(0, ci, e.target.value)} />
                                    {selected && (
                                        <button className="tw-remove-col" onClick={e => { e.stopPropagation(); removeCol(ci); }} title="Xóa cột">
                                            <Minus size={8} />
                                        </button>
                                    )}
                                    <div className="tw-col-resize" onMouseDown={e => startColResize(e, ci)} />
                                </th>
                            ))}
                            {selected && (
                                <th className="tw-th tw-add-col" onClick={addCol} title="Thêm cột">
                                    <Plus size={13} style={{ color: "#6366f1" }} />
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(1).map((row, ri) => (
                            <tr key={ri}>
                                {row.map((cell, ci) => (
                                    <td key={ci} className="tw-td" style={{ width: colWidths[ci], minWidth: colWidths[ci] }}>
                                        <input className="tw-cell-input" value={cell} onChange={e => updateCell(ri + 1, ci, e.target.value)} />
                                    </td>
                                ))}
                                {selected && (
                                    <td className="tw-td" style={{ textAlign: "center" }}>
                                        <button className="tw-remove-row" onClick={e => { e.stopPropagation(); removeRow(ri + 1); }} title="Xóa hàng">
                                            <Minus size={8} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selected && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="tw-add-row" onClick={addRow}>
                        <Plus size={12} /> Thêm hàng
                    </button>
                    {onDelete && (
                        <button
                            className="tw-delete-table"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Xóa bảng"
                        >
                            <Trash2 size={12} /> Xóa bảng
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Mounted Widget Roots tracker ─────────────────────────────────────────────

const mountedRoots = new Map<string, ReturnType<typeof createRoot>>();

// ─── Main Editor ──────────────────────────────────────────────────────────────

const CustomEditor = forwardRef<CustomEditorRef, CustomEditorProps>(({ initialValue = '', onImageUpload, uploading = false, compact = false }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [, startTransition] = useTransition();

    const [active, setActive] = useState<ActiveStates>({
        bold: false, italic: false, underline: false, strikeThrough: false,
        justifyLeft: false, justifyCenter: false, justifyRight: false, justifyFull: false,
        superscript: false, subscript: false,
    });
    const [status, setStatus] = useState<EditorStatus>({ words: 0, chars: 0, saved: true });
    // FIX 6: heading state sẽ được update theo vị trí con trỏ thực tế
    const [heading, setHeading] = useState<HeadingLevel>("p");
    const [fontColor, setFontColor] = useState<string>("#111827");
    const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalMode>(null);

    const imageCounter = useRef(0);
    const tableCounter = useRef(0);
    const hasInitialized = useRef(false);
    const [imageWidgets, setImageWidgets] = useState<Map<string, { src: string; alt: string }>>(new Map());
    const [tableWidgets, setTableWidgets] = useState<Map<string, { rows: number; cols: number }>>(new Map());

    const updateStatus = useCallback(() => {
        const text = editorRef.current?.innerText ?? "";
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.replace(/\n/g, "").length;
        startTransition(() => setStatus(s => ({ ...s, words, chars })));
    }, []);

    const scheduleAutosave = useCallback(() => {
        setStatus(s => ({ ...s, saved: false }));
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setStatus(s => ({ ...s, saved: true })), 1200);
        updateStatus();
    }, [updateStatus]);

    // FIX 6: Detect block format tại vị trí con trỏ hiện tại
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
        // FIX 6: luôn sync heading khi update states
        detectHeadingAtCursor();
    }, [detectHeadingAtCursor]);

    const exec = useCallback((cmd: string, val?: string) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
        updateActiveStates();
        scheduleAutosave();
    }, [updateActiveStates, scheduleAutosave]);

    const deleteImage = useCallback((id: string) => {
        setImageWidgets(m => {
            const next = new Map(m);
            next.delete(id);
            return next;
        });
        const el = editorRef.current?.querySelector(`[data-img-id="${id}"]`);
        if (el) {
            const root = mountedRoots.get(id);
            if (root) { try { root.unmount(); } catch { } mountedRoots.delete(id); }
            el.parentNode?.removeChild(el);
        }
        scheduleAutosave();
    }, [scheduleAutosave]);

    const deleteTable = useCallback((id: string) => {
        setTableWidgets(m => {
            const next = new Map(m);
            next.delete(id);
            return next;
        });
        const el = editorRef.current?.querySelector(`[data-table-id="${id}"]`);
        if (el) {
            const root = mountedRoots.get(id);
            if (root) { try { root.unmount(); } catch { } mountedRoots.delete(id); }
            el.parentNode?.removeChild(el);
        }
        scheduleAutosave();
    }, [scheduleAutosave]);

    const mountImageWidgets = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const placeholders = editor.querySelectorAll('[data-img-id]');
        placeholders.forEach((el) => {
            const id = el.getAttribute('data-img-id');
            if (!id) return;
            if (mountedRoots.has(id)) return;
            const src = el.getAttribute('data-img-src');
            const alt = el.getAttribute('data-img-alt') || '';
            if (src) {
                const root = createRoot(el);
                mountedRoots.set(id, root);
                root.render(<ImageWidget
                    src={src}
                    alt={alt}
                    widgetId={id}
                    onDelete={() => deleteImage(id)}
                />);
            }
        });
    }, [deleteImage]);

    const mountTableWidgets = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const placeholders = editor.querySelectorAll('[data-table-id]');
        placeholders.forEach((el) => {
            const id = el.getAttribute('data-table-id');
            if (!id) return;
            if (mountedRoots.has(id)) return;
            const rows = parseInt(el.getAttribute('data-table-rows') || '3');
            const cols = parseInt(el.getAttribute('data-table-cols') || '3');
            const root = createRoot(el);
            mountedRoots.set(id, root);
            root.render(<TableWidget
                initialRows={rows}
                initialCols={cols}
                onDelete={() => deleteTable(id)}
            />);
        });
    }, [deleteTable]);

    // Set initial content only once on mount - use ref to prevent re-initialization
    useEffect(() => {
        if (editorRef.current && !hasInitialized.current) {
            hasInitialized.current = true;
            editorRef.current.innerHTML = initialValue || '<p><br></p>';
            updateStatus();
            setTimeout(() => {
                mountImageWidgets();
                mountTableWidgets();
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run once on mount, ignore initialValue changes

    useEffect(() => {
        if (!editorRef.current) return;
        const observer = new MutationObserver(() => {
            mountImageWidgets();
            mountTableWidgets();
        });
        observer.observe(editorRef.current, { childList: true, subtree: true });
        mountImageWidgets();
        mountTableWidgets();
        return () => observer.disconnect();
    }, [mountImageWidgets, mountTableWidgets]);

    useImperativeHandle(ref, () => ({
        getContent: () => editorRef.current?.innerHTML || '',
        setContent: (content: string) => {
            if (editorRef.current) {
                editorRef.current.innerHTML = content;
                const rootsToClear = Array.from(mountedRoots.entries());
                setTimeout(() => {
                    rootsToClear.forEach(([id, root]) => {
                        try { root.unmount(); } catch { }
                        mountedRoots.delete(id);
                    });
                    mountImageWidgets();
                    mountTableWidgets();
                    updateStatus();
                }, 0);
            }
        }
    }), [mountImageWidgets, mountTableWidgets, updateStatus]);

    useEffect(() => {
        if (editorRef.current) {
            if (!initialValue) {
                editorRef.current.innerHTML = "<p><br></p>";
            }
            updateStatus();
        }
        return () => {
            const rootsToClear = Array.from(mountedRoots.entries());
            setTimeout(() => {
                rootsToClear.forEach(([id, root]) => {
                    try { root.unmount(); } catch { }
                    mountedRoots.delete(id);
                });
                mountedRoots.clear();
            }, 0);
        };
    }, []);

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

    const applyColor = (color: string) => { setFontColor(color); exec("foreColor", color); };

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

    const insertImage = useCallback((src: string, alt: string) => {
        if (!src) return;
        editorRef.current?.focus();
        restoreRange();
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const range = sel.getRangeAt(0);
        const id = `img-${++imageCounter.current}`;
        setImageWidgets(m => new Map(m).set(id, { src, alt }));
        const placeholder = document.createElement("span");
        placeholder.setAttribute("data-img-id", id);
        placeholder.setAttribute("data-img-src", src);
        placeholder.setAttribute("data-img-alt", alt);
        placeholder.setAttribute("data-img-width", "280");
        placeholder.setAttribute("data-img-rotation", "0");
        placeholder.setAttribute("data-img-align", "left");
        placeholder.setAttribute("data-img-x", "0");
        placeholder.setAttribute("data-img-y", "0");
        placeholder.className = "img-placeholder";
        placeholder.contentEditable = "false";
        range.insertNode(placeholder);
        scheduleAutosave();
        setTimeout(() => {
            const el = editorRef.current?.querySelector(`[data-img-id="${id}"]`);
            if (el && !mountedRoots.has(id)) {
                const root = createRoot(el);
                mountedRoots.set(id, root);
                root.render(<ImageWidget
                    src={src}
                    alt={alt}
                    widgetId={id}
                    onDelete={() => deleteImage(id)}
                />);
            }
        }, 0);
    }, [scheduleAutosave, restoreRange, deleteImage]);

    const insertCode = (code: string, lang: string) => {
        if (!code) return;
        editorRef.current?.focus();
        restoreRange();
        const highlighted = tokenize(code, lang);
        const html = `<pre class="ed-code-block" data-lang="${lang}"><div class="ed-code-lang-badge">${lang}</div><code>${highlighted}</code></pre><p><br></p>`;
        document.execCommand("insertHTML", false, html);
        scheduleAutosave();
    };

    const insertTable = () => {
        editorRef.current?.focus();
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const range = sel.getRangeAt(0);
        const id = `table-${++tableCounter.current}`;
        setTableWidgets(m => new Map(m).set(id, { rows: 3, cols: 3 }));
        const placeholder = document.createElement("div");
        placeholder.setAttribute("data-table-id", id);
        placeholder.setAttribute("data-table-rows", "3");
        placeholder.setAttribute("data-table-cols", "3");
        placeholder.className = "table-placeholder";
        placeholder.contentEditable = "false";
        range.insertNode(placeholder);
        placeholder.insertAdjacentHTML("afterend", "<p><br></p>");
        scheduleAutosave();
        setTimeout(() => {
            const el = editorRef.current?.querySelector(`[data-table-id="${id}"]`);
            if (el && !mountedRoots.has(id)) {
                const root = createRoot(el);
                mountedRoots.set(id, root);
                root.render(<TableWidget
                    initialRows={3}
                    initialCols={3}
                    onDelete={() => deleteTable(id)}
                />);
            }
        }, 0);
    };

    const insertMath = (latex: string) => {
        if (!latex) return;
        editorRef.current?.focus();
        restoreRange();

        // FIX 11: Sử dụng math-live để render công thức - bỏ bg và border
        const mathId = `math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const html = `<span class="math-inline" data-math-id="${mathId}" data-latex="${latex.replace(/"/g, '"')}" contenteditable="false"></span>&nbsp;`;
        document.execCommand("insertHTML", false, html);

        // Render công thức bằng math-live
        setTimeout(() => {
            const mathEl = editorRef.current?.querySelector(`[data-math-id="${mathId}"]`);
            if (mathEl && typeof window !== 'undefined') {
                import('mathlive').then((MathLive) => {
                    const mf = new MathLive.MathfieldElement();
                    mf.value = latex;
                    mf.readOnly = true;
                    mf.style.display = 'inline-block';
                    mf.style.fontSize = '15px';
                    mf.style.background = 'transparent';
                    mf.style.padding = '0';
                    mf.style.border = 'none';
                    mathEl.innerHTML = '';
                    mathEl.appendChild(mf);
                }).catch(err => {
                    console.error('Failed to load mathlive:', err);
                    // Fallback: hiển thị LaTeX text
                    mathEl.textContent = latex;
                    mathEl.setAttribute('style', 'font-family:monospace;color:#111827;');
                });
            }
        }, 0);

        scheduleAutosave();
    };

    // ─── FIX 2: Helper đặt cursor ngay sau node ───────────────────────────────
    const placeCursorAfter = (node: Node) => {
        const sel = window.getSelection();
        if (!sel) return;
        const range = document.createRange();
        try {
            // Tìm node text hoặc element tiếp theo sau node này
            if (node.nextSibling) {
                if (node.nextSibling.nodeType === Node.TEXT_NODE) {
                    range.setStart(node.nextSibling, 0);
                } else {
                    range.setStartAfter(node);
                }
            } else if (node.parentNode) {
                // Nếu không có sibling, đặt sau parent
                const parent = node.parentNode;
                const idx = Array.from(parent.childNodes).indexOf(node as ChildNode);
                range.setStart(parent, idx + 1);
            } else {
                range.setStartAfter(node);
            }
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } catch {
            // fallback
        }
    };

    // ─── FIX 7 & 8: Quote Enter/Backspace logic ───────────────────────────────
    const handleQuoteEnter = (e: React.KeyboardEvent<HTMLDivElement>): boolean => {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return false;

        // Tìm blockquote cha
        let bq: Element | null = null;
        let cur: Node | null = sel.getRangeAt(0).startContainer;
        while (cur && cur !== editorRef.current) {
            if ((cur as Element).tagName === "BLOCKQUOTE") { bq = cur as Element; break; }
            cur = cur.parentNode;
        }
        if (!bq) return false;

        const range = sel.getRangeAt(0);
        const atEnd = range.collapsed && range.endOffset === (range.endContainer.textContent?.length ?? 0);

        if (atEnd) {
            // Kiểm tra nội dung blockquote hiện tại có trống không
            const bqText = bq.textContent?.trim() ?? "";
            if (bqText === "") {
                // FIX 8: blockquote rỗng + Enter → thoát quote, thêm p trống
                e.preventDefault();
                const p = document.createElement("p");
                p.innerHTML = "<br>";
                bq.parentNode?.insertBefore(p, bq.nextSibling);
                bq.parentNode?.removeChild(bq);
                const newRange = document.createRange();
                newRange.setStart(p, 0);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                scheduleAutosave();
                return true;
            }

            // FIX 7: Enter cuối blockquote → kiểm tra dòng cuối có rỗng không
            // Lấy nội dung phần sau cursor trong blockquote
            const clonedRange = range.cloneRange();
            clonedRange.selectNodeContents(bq);
            clonedRange.setStart(range.endContainer, range.endOffset);
            const afterText = clonedRange.toString();

            if (afterText.trim() === "") {
                // Double enter: thoát khỏi blockquote
                e.preventDefault();
                // Xóa dòng trống cuối trong blockquote nếu có
                const lastChild = bq.lastChild;
                if (lastChild && lastChild.textContent?.trim() === "" && bq.childNodes.length > 1) {
                    bq.removeChild(lastChild);
                }
                const p = document.createElement("p");
                p.innerHTML = "<br>";
                bq.parentNode?.insertBefore(p, bq.nextSibling);
                const newRange = document.createRange();
                newRange.setStart(p, 0);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                scheduleAutosave();
                return true;
            }
        }
        return false;
    };

    const handleQuoteBackspace = (e: React.KeyboardEvent<HTMLDivElement>): boolean => {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return false;
        const range = sel.getRangeAt(0);
        if (!range.collapsed) return false;

        let cur: Node | null = range.startContainer;
        let bq: Element | null = null;
        while (cur && cur !== editorRef.current) {
            if ((cur as Element).tagName === "BLOCKQUOTE") { bq = cur as Element; break; }
            cur = cur.parentNode;
        }
        if (!bq) return false;

        const bqText = bq.textContent?.trim() ?? "";
        const atStart = range.startOffset === 0;
        const containerText = range.startContainer.textContent?.trim() ?? "";

        // FIX 8: Backspace khi blockquote rỗng hoặc con trỏ ở đầu dòng đầu tiên rỗng
        if ((bqText === "" || (atStart && containerText === "")) && bqText.length <= 1) {
            e.preventDefault();
            const p = document.createElement("p");
            p.innerHTML = "<br>";
            bq.parentNode?.insertBefore(p, bq);
            bq.parentNode?.removeChild(bq);
            const newRange = document.createRange();
            newRange.setStart(p, 0);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            scheduleAutosave();
            return true;
        }
        return false;
    };

    // ─── FIX 10: Shift+Enter trong code block → xuống dòng trống ─────────────
    const handleCodeShiftEnter = (e: React.KeyboardEvent<HTMLDivElement>): boolean => {
        if (!e.shiftKey) return false;
        const sel = window.getSelection();
        if (!sel?.rangeCount) return false;
        let cur: Node | null = sel.getRangeAt(0).startContainer;
        let inCode = false;
        while (cur && cur !== editorRef.current) {
            if ((cur as Element).tagName === "PRE" && (cur as Element).classList.contains("ed-code-block")) {
                inCode = true; break;
            }
            cur = cur.parentNode;
        }
        if (!inCode) return false;

        // Thoát khỏi code block, thêm paragraph sau
        e.preventDefault();
        const pre = cur as Element;
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        pre.parentNode?.insertBefore(p, pre.nextSibling);
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        scheduleAutosave();
        return true;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // FIX 10: Shift+Enter trong code block
        if (e.key === "Enter" && handleCodeShiftEnter(e)) return;

        // FIX 7 & 8: Quote handling
        if (e.key === "Enter" && !e.shiftKey && handleQuoteEnter(e)) return;
        if (e.key === "Backspace" && handleQuoteBackspace(e)) return;

        // FIX: Xóa công thức và ảnh khi bấm Backspace/Delete
        if (e.key === "Backspace" || e.key === "Delete") {
            const sel = window.getSelection();
            if (sel?.rangeCount) {
                const range = sel.getRangeAt(0);
                let node: Node | null = range.startContainer;

                // Tìm math-inline element
                while (node && node !== editorRef.current) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        if (el.classList.contains('math-inline')) {
                            e.preventDefault();
                            el.parentNode?.removeChild(el);
                            scheduleAutosave();
                            return;
                        }
                        // Tìm img-placeholder element
                        if (el.classList.contains('img-placeholder') || el.hasAttribute('data-img-id')) {
                            e.preventDefault();
                            const imgId = el.getAttribute('data-img-id');
                            if (imgId) deleteImage(imgId);
                            scheduleAutosave();
                            return;
                        }
                    }
                    node = node.parentNode;
                }

                // Kiểm tra nếu cursor ngay trước/sau math/image element
                if (range.collapsed) {
                    const container = range.startContainer;
                    if (container.nodeType === Node.ELEMENT_NODE) {
                        const offset = range.startOffset;
                        if (e.key === "Backspace" && offset > 0) {
                            const prevNode = container.childNodes[offset - 1];
                            if (prevNode && (prevNode as Element).classList?.contains('math-inline')) {
                                e.preventDefault();
                                prevNode.parentNode?.removeChild(prevNode);
                                scheduleAutosave();
                                return;
                            }
                            // Xóa ảnh khi Backspace
                            if (prevNode && ((prevNode as Element).classList?.contains('img-placeholder') || (prevNode as Element).hasAttribute?.('data-img-id'))) {
                                e.preventDefault();
                                const imgId = (prevNode as Element).getAttribute('data-img-id');
                                if (imgId) deleteImage(imgId);
                                scheduleAutosave();
                                return;
                            }
                        } else if (e.key === "Delete" && offset < container.childNodes.length) {
                            const nextNode = container.childNodes[offset];
                            if (nextNode && (nextNode as Element).classList?.contains('math-inline')) {
                                e.preventDefault();
                                nextNode.parentNode?.removeChild(nextNode);
                                scheduleAutosave();
                                return;
                            }
                            // Xóa ảnh khi Delete
                            if (nextNode && ((nextNode as Element).classList?.contains('img-placeholder') || (nextNode as Element).hasAttribute?.('data-img-id'))) {
                                e.preventDefault();
                                const imgId = (nextNode as Element).getAttribute('data-img-id');
                                if (imgId) deleteImage(imgId);
                                scheduleAutosave();
                                return;
                            }
                        }
                    }
                }
            }
        }

        if (e.key === "Tab") {
            e.preventDefault();
            exec("indent");
            return;
        }

        // FIX 2: Autolink sau Space/Enter — cursor đúng vị trí sau link
        if (e.key === " " || e.key === "Enter") {
            setTimeout(() => {
                const selAfter = window.getSelection();
                if (!selAfter?.rangeCount || !editorRef.current) return;

                const rangeAfter = selAfter.getRangeAt(0);
                const anchorNode = rangeAfter.startContainer;
                const anchorOffset = rangeAfter.startOffset;

                // Tìm text node chứa URL (ngay trước cursor)
                let targetNode: Node | null = null;
                if (anchorNode.nodeType === Node.TEXT_NODE) {
                    targetNode = anchorNode;
                } else if (anchorNode.nodeType === Node.ELEMENT_NODE) {
                    const prev = anchorOffset > 0 ? anchorNode.childNodes[anchorOffset - 1] : null;
                    if (prev?.nodeType === Node.TEXT_NODE) targetNode = prev;
                    else if (anchorNode.previousSibling?.nodeType === Node.TEXT_NODE) {
                        targetNode = anchorNode.previousSibling;
                    }
                }

                if (!targetNode || targetNode.nodeType !== Node.TEXT_NODE) return;
                if (targetNode.parentNode?.nodeName === "A") return;

                const fullText = targetNode.textContent ?? "";
                // Cải thiện regex để bắt được domain như cncode.io.vn
                const hasLink = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z]{2,})|[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i.test(fullText);
                if (!hasLink) return;

                // Lưu nextSibling TRƯỚC khi autoLinkText replace node
                const parent = targetNode.parentNode;
                const nextSiblingBeforeReplace = targetNode.nextSibling;

                autoLinkText(targetNode);
                // targetNode giờ đã bị detach, nextSiblingBeforeReplace vẫn còn trong DOM

                try {
                    const newSel = window.getSelection();
                    if (!newSel) return;
                    const newRange = document.createRange();

                    if (nextSiblingBeforeReplace && nextSiblingBeforeReplace.isConnected) {
                        if (nextSiblingBeforeReplace.nodeType === Node.TEXT_NODE) {
                            // Đặt cursor sau space/enter
                            const offset = e.key === " " ? Math.min(1, nextSiblingBeforeReplace.textContent?.length ?? 0) : 0;
                            newRange.setStart(nextSiblingBeforeReplace, offset);
                        } else {
                            newRange.setStartBefore(nextSiblingBeforeReplace);
                        }
                    } else if (parent && parent.isConnected) {
                        // Không có nextSibling → cuối parent
                        newRange.selectNodeContents(parent);
                        newRange.collapse(false);
                    } else {
                        return;
                    }

                    newRange.collapse(true);
                    newSel.removeAllRanges();
                    newSel.addRange(newRange);
                } catch { }
            }, 10);
        }
    };

    // FIX 3: Handle paste — strip formatting
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const clipData = e.clipboardData;

        // Ưu tiên plain text nếu có
        const plainText = clipData.getData("text/plain");
        const htmlData = clipData.getData("text/html");

        if (htmlData) {
            // Strip toàn bộ style, giữ cấu trúc block cơ bản
            const cleaned = stripAndNormalizePaste(htmlData);
            document.execCommand("insertHTML", false, cleaned);
        } else if (plainText) {
            // Plain text: giữ nguyên, chỉ escape HTML
            const escaped = plainText
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>");
            document.execCommand("insertHTML", false, escaped);
        }

        scheduleAutosave();
    }, [scheduleAutosave]);

    return (
        <>
            <style>{editorStyles}</style>
            <div className="ed-shell">
                <div className="ed-header">
                    <div className="ed-toolbar">
                        <ToolbarButton icon={<Undo2 size={15} />} label="Undo" onClick={() => exec("undo")} />
                        <ToolbarButton icon={<Redo2 size={15} />} label="Redo" onClick={() => exec("redo")} />
                        <Sep />
                        <ToolbarButton icon={<Bold size={15} />} label="Đậm" active={active.bold} onClick={() => exec("bold")} />
                        <ToolbarButton icon={<Italic size={15} />} label="Nghiêng" active={active.italic} onClick={() => exec("italic")} />
                        <ToolbarButton icon={<Underline size={15} />} label="Gạch chân" active={active.underline} onClick={() => exec("underline")} />
                        <ToolbarButton icon={<Strikethrough size={15} />} label="Gạch ngang" active={active.strikeThrough} onClick={() => exec("strikeThrough")} />
                        <HighlightPicker active={!!activeHighlight} onSelect={applyHighlight} />
                        <Sep />
                        <ToolbarButton icon={<Superscript size={15} />} label="Mũ trên (x²)" active={active.superscript} onClick={() => { editorRef.current?.focus(); document.execCommand("superscript"); updateActiveStates(); scheduleAutosave(); }} />
                        <ToolbarButton icon={<Subscript size={15} />} label="Mũ dưới (x₂)" active={active.subscript} onClick={() => { editorRef.current?.focus(); document.execCommand("subscript"); updateActiveStates(); scheduleAutosave(); }} />
                        <Sep />
                        <ToolbarButton icon={<AlignLeft size={15} />} label="Căn trái" active={active.justifyLeft} onClick={() => exec("justifyLeft")} />
                        <ToolbarButton icon={<AlignCenter size={15} />} label="Căn giữa" active={active.justifyCenter} onClick={() => exec("justifyCenter")} />
                        <ToolbarButton icon={<AlignRight size={15} />} label="Căn phải" active={active.justifyRight} onClick={() => exec("justifyRight")} />
                        <ToolbarButton icon={<AlignJustify size={15} />} label="Căn đều" active={active.justifyFull} onClick={() => exec("justifyFull")} />
                        <Sep />
                        <ToolbarButton icon={<Quote size={15} />} label="Trích dẫn" onClick={() => { editorRef.current?.focus(); document.execCommand("formatBlock", false, "blockquote"); scheduleAutosave(); }} />
                        <ToolbarButton icon={<Code size={15} />} label="Code block" onClick={() => { saveRange(); setModal("code"); }} />
                        <ToolbarButton icon={<Sigma size={15} />} label="Công thức toán" onClick={() => { saveRange(); setModal("math"); }} />
                        <Sep />
                        <div className="ed-select-wrapper">
                            {/* FIX 6: value phản ánh heading thực tại cursor */}
                            <select value={heading} onChange={e => applyHeading(e.target.value as HeadingLevel)} className="ed-select" style={{ width: 110 }}>
                                <option value="p">Đoạn văn</option>
                                <option value="h1">Tiêu đề 1</option>
                                <option value="h2">Tiêu đề 2</option>
                                <option value="h3">Tiêu đề 3</option>
                            </select>
                        </div>
                        <input type="color" value={fontColor} onChange={e => applyColor(e.target.value)} title="Màu chữ" className="ed-color-picker" />
                        <Sep />
                        <ToolbarButton icon={<ImageIcon size={15} />} label="Chèn ảnh" onClick={() => { saveRange(); setModal("image"); }} />
                        <ToolbarButton icon={<Table size={15} />} label="Chèn bảng" onClick={insertTable} />
                    </div>
                </div>
                <div className="ed-body">
                    <div className="ed-content-wrap">
                        <div
                            ref={editorRef}
                            id="editor"
                            contentEditable
                            suppressContentEditableWarning
                            spellCheck
                            role="textbox"
                            aria-multiline
                            aria-label="Trình soạn thảo"
                            style={{
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                fontSize: "15px",
                                lineHeight: "1.75",
                            }}
                            onInput={() => { updateActiveStates(); scheduleAutosave(); }}
                            onKeyUp={updateActiveStates}
                            onMouseUp={updateActiveStates}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                        />
                    </div>
                </div>
                <div className="ed-statusbar">
                    <div className="ed-status-pills">
                        <span className={`ed-pill${status.saved ? " ed-pill-green" : ""}`}>
                            {status.saved ? "● Đã lưu" : "● Đang soạn"}
                        </span>
                        <span className="ed-pill">{status.words} từ</span>
                        <span className="ed-pill">{status.chars} ký tự</span>
                    </div>
                    <span className="ed-statusbar-right">UTF-8</span>
                </div>
                {modal === "code" && <CodeModal onClose={() => setModal(null)} onInsert={insertCode} />}
                {modal === "math" && <MathModal onClose={() => setModal(null)} onInsert={insertMath} />}
                {modal === "image" && (
                    <UploadImageModal
                        onClose={() => setModal(null)}
                        onConfirm={(src, alt) => { insertImage(src, alt); setModal(null); }}
                        onImageUpload={onImageUpload}
                        uploading={uploading}
                    />
                )}
                {modal === "file" && (
                    <UploadFileModal
                        onClose={() => setModal(null)}
                        onConfirm={(messageId, filename) => {
                            editorRef.current?.focus();
                            restoreRange();

                            // Estimate file size - sẽ hiển thị khi có thông tin từ server
                            const fileSize = '0 MB';

                            // Generate HTML cho file card với messageId
                            const fileCardHTML = generateFileCardHTML(filename, messageId, fileSize);

                            // Insert HTML vào editor
                            document.execCommand("insertHTML", false, fileCardHTML + '<p><br></p>');

                            scheduleAutosave();
                            setModal(null);
                        }}
                    />
                )}
            </div>
        </>
    );
});

CustomEditor.displayName = 'CustomEditor';

// ─── Styles ───────────────────────────────────────────────────────────────────

const editorStyles = `
  .ed-shell {
    background: #ffffff;
    border: 0.5px solid #d1d5db;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    height: 560px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    position: relative;
    isolation: isolate;
  }
  .ed-header {
    background: #fafafa;
    border-bottom: 0.5px solid #e5e7eb;
    padding: 7px 10px;
    flex-shrink: 0;
  }
  .ed-toolbar {
    display: flex;
    align-items: center;
    gap: 1px;
    flex-wrap: wrap;
  }
  .tb-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 28px; border-radius: 6px; border: none;
    background: transparent; color: #6b7280; cursor: pointer;
    transition: background 0.12s, color 0.12s; flex-shrink: 0;
  }
  .tb-btn:hover { background: #f3f4f6; color: #111827; }
  .tb-btn-active { background: #e8e7f0 !important; color: #4338ca !important; }
  .tb-sep { width: 1px; height: 20px; background: #e5e7eb; margin: 0 3px; flex-shrink: 0; }
  [title] { position: relative; }
  .ed-select-wrapper { display: inline-flex; align-items: center; }
  .ed-select {
    border: 0.5px solid #e5e7eb; border-radius: 6px; background: #f3f4f6;
    color: #374151; font-size: 12px; padding: 3px 6px; height: 28px;
    cursor: pointer; outline: none; font-family: 'Inter', system-ui, sans-serif;
  }
  .ed-select:hover { background: #e9eaec; }
  .ed-color-picker {
    width: 28px; height: 28px; border: 0.5px solid #e5e7eb; border-radius: 6px;
    cursor: pointer; padding: 2px; background: #f3f4f6;
  }
  .ed-body { display: flex; flex: 1; overflow: hidden; }
  .ed-content-wrap { flex: 1; overflow-y: auto; }

  /* FIX 9: Line-height cố định, không bao giờ thay đổi */
  #editor {
    outline: none; padding: 1.5rem 2.25rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    font-size: 15px !important;
    line-height: 1.75 !important;
    color: #111827;
    min-height: 100%; caret-color: #6366f1;
    box-sizing: border-box;
  }

  /* FIX 3: Đảm bảo mọi thứ trong editor dùng font Inter */
  #editor * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    line-height: 1.75 !important;
  }

  /* FIX 9: Khoảng cách dòng cố định */
  #editor p {
    margin: 0 0 0.7em 0 !important;
    font-size: 15px !important;
    line-height: 1.75 !important;
  }

  /* FIX 4 & 5: Heading sizes — rõ ràng, đồng nhất font-weight */
  #editor h1 {
    font-size: 1.7em !important;
    font-weight: 700 !important;
    margin: 0.6em 0 0.35em 0 !important;
    letter-spacing: -0.02em;
    color: #0f172a;
    line-height: 1.3 !important;
  }
  #editor h2 {
    font-size: 1.35em !important;
    font-weight: 700 !important;
    margin: 0.55em 0 0.3em 0 !important;
    color: #0f172a;
    line-height: 1.35 !important;
  }
  #editor h3 {
    font-size: 1.1em !important;
    font-weight: 700 !important;
    margin: 0.5em 0 0.25em 0 !important;
    color: #0f172a;
    line-height: 1.4 !important;
  }

  /* FIX 4: Bold đồng nhất với heading weight */
  #editor b, #editor strong {
    font-weight: 700 !important;
  }

  #editor blockquote {
    border-left: 3px solid #6366f1; padding: 0.5em 1.1em; margin: 0.85em 0 !important;
    color: #6b7280; font-style: italic; background: #f5f5ff; border-radius: 0 6px 6px 0;
    line-height: 1.75 !important;
  }
  #editor code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important; font-size: 0.8em;
    background: #f3f4f6; border: 0.5px solid #e5e7eb;
    padding: 0.15em 0.4em; border-radius: 4px; color: #4338ca;
    line-height: 1.75 !important;
  }
  #editor sup { font-size: 0.75em; vertical-align: super; line-height: 0 !important; }
  #editor sub { font-size: 0.75em; vertical-align: sub; line-height: 0 !important; }
  #editor .ed-code-block {
    background: #1e1e2e; border: none; border-radius: 10px;
    padding: 0; margin: 1em 0; overflow: hidden; font-size: 0;
    line-height: normal !important;
  }
  #editor .ed-code-lang-badge {
    display: block; background: rgba(255,255,255,0.07); color: #636da6;
    font-size: 10px; font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    padding: 4px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);
    letter-spacing: 0.08em; text-transform: uppercase;
    line-height: 1.6 !important;
  }
  #editor .ed-code-block code {
    display: block; background: none; border: none;
    padding: 1em 1.25em; font-size: 13px; line-height: 1.7 !important;
    color: #d4d4d4; overflow-x: auto; white-space: pre;
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
  }

  /* FIX 1: Link + email — màu xanh, gạch chân và highlight background */
  #editor a { 
    color: #2563eb !important; 
    text-decoration: underline !important; 
    text-decoration-color: #2563eb !important;
    text-decoration-thickness: 1px !important;
    background: rgba(37, 99, 235, 0.08) !important; 
    padding: 1px 3px !important;
    border-radius: 3px !important;
    cursor: pointer !important;
    transition: all 0.15s !important;
  }
  #editor a:hover { 
    color: #1d4ed8 !important; 
    text-decoration-color: #1d4ed8 !important;
    background: rgba(37, 99, 235, 0.15) !important;
  }
  #editor a[href^="mailto:"] { 
    color: #2563eb !important; 
  }

  /* FIX 11: Math inline styling */
  #editor .math-inline {
    display: inline-block;
    vertical-align: middle;
    margin: 0 2px;
  }
  #editor .math-inline math-field {
    font-size: 15px !important;
  }

  #editor ul { margin: 0.5em 0 0.5em 1.6em !important; }
  #editor ol { margin: 0.5em 0 0.5em 1.6em !important; }
  #editor li { margin: 0.2em 0 !important; line-height: 1.75 !important; }
  #editor ::selection { background: rgba(99,102,241,0.15); }

  .highlight-picker {
    position: absolute; top: 34px; left: 0;
    background: #fff; border: 0.5px solid #e5e7eb; border-radius: 8px;
    padding: 6px; display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    width: 96px;
  }
  .highlight-swatch {
    width: 18px; height: 18px; border-radius: 4px;
    border: 1.5px solid rgba(0,0,0,0.12); cursor: pointer;
    transition: transform 0.1s, border-color 0.1s;
    padding: 0;
  }
  .highlight-swatch:hover { transform: scale(1.2); border-color: #6366f1; }
  .img-placeholder { display: block; }
  .img-widget-outer { position: relative; }
  .img-toolbar {
    position: absolute; top: -34px; left: 0; z-index: 20;
    background: #1e1e2e; border-radius: 7px;
    display: flex; align-items: center; gap: 1px; padding: 3px 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.25); white-space: nowrap;
  }
  .img-tb-btn {
    background: none; border: none; color: #c8ccd8; cursor: pointer;
    padding: 3px 5px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.1s;
  }
  .img-tb-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .img-tb-btn-active { background: rgba(99,102,241,0.3) !important; color: #818cf8 !important; }
  .img-tb-btn-danger:hover { background: rgba(239,68,68,0.25) !important; color: #f87171 !important; }
  .img-tb-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.12); margin: 0 3px; }
  .img-resize-handle {
    position: absolute; right: -5px; bottom: -5px;
    width: 13px; height: 13px; background: #6366f1;
    border-radius: 3px; cursor: se-resize; z-index: 10; border: 2px solid #fff;
  }
  .table-placeholder { display: block; margin: 0.85em 0; }
  .table-widget { margin: 0.85em 0; display: inline-block; width: 100%; }
  .table-selected { outline: 2px solid #6366f1; border-radius: 8px; outline-offset: 2px; }
  .tw-table { border-collapse: collapse; font-size: 13px; font-family: 'Inter', system-ui, sans-serif !important; table-layout: fixed; }
  .tw-th { background: #f1f5f9; font-weight: 600; color: #374151; border: 1px solid #d1d5db; padding: 0; position: relative; }
  .tw-td { border: 1px solid #e5e7eb; padding: 0; position: relative; }
  .tw-cell-input { width: 100%; border: none; outline: none; background: transparent; padding: 6px 8px; font-size: 13px; font-family: 'Inter', system-ui, sans-serif !important; color: #111827; box-sizing: border-box; }
  .tw-header-input { font-weight: 600; color: #374151; }
  .tw-col-resize { position: absolute; right: 0; top: 0; bottom: 0; width: 5px; cursor: col-resize; z-index: 5; }
  .tw-col-resize:hover { background: rgba(99,102,241,0.3); }
  .tw-remove-col {
    position: absolute; top: -9px; right: 2px; width: 16px; height: 16px;
    background: #ef4444; color: white; border: none; border-radius: 50%;
    cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; z-index: 6;
  }
  .tw-remove-row {
    background: #ef4444; color: white; border: none; border-radius: 50%;
    width: 18px; height: 18px; cursor: pointer; padding: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .tw-add-col { background: #f0f9ff; cursor: pointer; border: 1px dashed #c7d2fe; min-width: 36px; text-align: center; padding: 0 8px; }
  .tw-add-col:hover { background: #e0e7ff; }
  .tw-add-row {
    display: flex; align-items: center; justify-content: center; gap: 4px;
    background: #f0f9ff; border: 1px dashed #c7d2fe;
    color: #6366f1; font-size: 12px; padding: 5px; cursor: pointer;
    border-radius: 6px; font-family: 'Inter', system-ui, sans-serif !important;
    flex: 1;
  }
  .tw-add-row:hover { background: #e0e7ff; }
  .tw-delete-table {
    display: flex; align-items: center; justify-content: center; gap: 4px;
    background: #fef2f2; border: 1px dashed #fecaca;
    color: #ef4444; font-size: 12px; padding: 5px; cursor: pointer;
    border-radius: 6px; font-family: 'Inter', system-ui, sans-serif !important;
  }
  .tw-delete-table:hover { background: #fee2e2; }
  .ed-statusbar {
    background: #fafafa; border-top: 0.5px solid #e5e7eb; padding: 5px 12px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 11px; color: #9ca3af; font-family: 'Inter', system-ui, sans-serif;
    flex-shrink: 0;
  }
  .ed-status-pills { display: flex; gap: 8px; align-items: center; }
  .ed-pill { background: #f3f4f6; border-radius: 20px; padding: 2px 9px; font-size: 10.5px; color: #9ca3af; font-family: 'Inter', system-ui, sans-serif; }
  .ed-pill-green { background: #dcfce7; color: #15803d; }
  .ed-statusbar-right { font-size: 11px; color: #9ca3af; font-family: 'Inter', system-ui, sans-serif; }
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 105;
    backdrop-filter: blur(2px);
  }
  .modal-box {
    background: #fff; border: 0.5px solid #d1d5db; border-radius: 12px;
    padding: 1.5rem; width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    display: flex; flex-direction: column; gap: 10px;
    position: relative;
    z-index: 106;
    max-height: 85vh;
    overflow-y: auto;
    animation: modalFadeIn 0.2s ease-out;
  }
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .modal-title { font-size: 14px; font-weight: 600; color: #111827; font-family: 'Inter', system-ui, sans-serif; }
  .modal-close-btn { background: none; border: none; cursor: pointer; padding: 2px; border-radius: 4px; display: flex; }
  .modal-close-btn:hover { background: #f3f4f6; }
  .modal-input {
    width: 100%; border: 0.5px solid #d1d5db; border-radius: 6px;
    padding: 7px 10px; font-size: 13px; background: #f9fafb; color: #111827;
    outline: none; font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box;
  }
  .modal-input:focus { border-color: #6366f1; }
  .modal-select {
    width: 100%; border: 0.5px solid #d1d5db; border-radius: 6px;
    padding: 7px 10px; font-size: 13px; background: #f9fafb; color: #111827;
    outline: none; font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; cursor: pointer;
  }
  .modal-textarea {
    width: 100%; border: 0.5px solid #d1d5db; border-radius: 6px;
    padding: 8px 10px; font-size: 12px; background: #1e1e2e; color: #d4d4d4;
    outline: none; font-family: 'JetBrains Mono', 'Fira Code', monospace;
    box-sizing: border-box; resize: vertical; line-height: 1.6;
  }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .btn-cancel {
    font-size: 12px; padding: 6px 14px; border-radius: 6px;
    border: 0.5px solid #d1d5db; background: #f3f4f6; color: #6b7280;
    cursor: pointer; font-family: 'Inter', system-ui, sans-serif;
  }
  .btn-cancel:hover { background: #e9eaec; }
  .btn-ok {
    font-size: 12px; padding: 6px 14px; border-radius: 6px;
    border: 0.5px solid #6366f1; background: #6366f1; color: #fff;
    cursor: pointer; font-family: 'Inter', system-ui, sans-serif;
    display: flex; align-items: center; gap: 5px;
  }
  .btn-ok:hover { background: #4f46e5; }
  .btn-ok:disabled { opacity: 0.45; cursor: not-allowed; }
`;

export default CustomEditor;