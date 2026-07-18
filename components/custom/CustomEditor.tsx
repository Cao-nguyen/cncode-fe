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
    FileText,
    Link2
} from "lucide-react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeadingLevel = "p" | "h1" | "h2" | "h3";
type ModalMode = "image" | "math" | "file" | "link" | null;
type ImgAlign = "center";

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
    placeholder?: string;
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
    "Code": "Ctrl+`",
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';

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
            <button onclick="(()=>{const a=document.createElement('a');a.href='${apiUrl}/api/upload/proxy/file/${messageId}';a.download='${filename}';a.click();})()" style="width:36px;height:36px;border-radius:8px;border:none;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.2s;margin-left:12px;" onmouseover="this.style.background='#e2e8f0';this.style.color='#1e293b';" onmouseout="this.style.background='#f8fafc';this.style.color='#64748b';" title="Tải xuống">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </button>
        </div>
    `;
}

// ─── FIX 1: Auto-link và highlight email/link ────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>"']*)?/g;

function autoLinkText(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        const combined: Array<{ index: number; length: number; url: string; isEmail: boolean; text: string }> = [];

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

        URL_REGEX.lastIndex = 0;
        while ((m = URL_REGEX.exec(text)) !== null) {
            const overlap = combined.some(e => m!.index >= e.index && m!.index < e.index + e.length);
            if (!overlap) {
                const matchText = m[0];
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

// ─── FIX 3: Strip paste formatting ──────────────────────────────────────────

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
            onMouseDown={(e) => e.preventDefault()}
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

// ─── Math Modal ───────────────────────────────────────────────────────────────

const MathModal: React.FC<{ onClose: () => void; onInsert: (latex: string) => void }> = ({ onClose, onInsert }) => {
    const mathFieldRef = useRef<HTMLDivElement>(null);
    const [mathField, setMathField] = useState<MathfieldElement | null>(null);

    useEffect(() => {
        if (mathFieldRef.current && !mathField) {
            import('mathlive').then(() => {
                // Khởi tạo mathlive an toàn bằng document.createElement
                const mf = document.createElement('math-field') as MathfieldElement;
                mf.style.fontSize = '20px';
                mf.style.padding = '12px';
                mf.style.border = '1px solid #d1d5db';
                mf.style.borderRadius = '6px';
                mf.style.minHeight = '60px';
                mf.style.background = '#ffffff';
                mf.mathVirtualKeyboardPolicy = 'manual';

                const style = document.createElement('style');
                style.textContent = `
                    math-field::part(virtual-keyboard-toggle) {
                        display: none !important;
                    }
                `;
                document.head.appendChild(style);
                
                // Bật bàn phím ảo một cách an toàn
                mf.addEventListener('focus', () => {
                    const mvk = (window as any).mathVirtualKeyboard;
                    if (mvk) {
                        mvk.layouts = ['numeric', 'symbols'];
                        mvk.show();
                    }
                });

                mathFieldRef.current?.appendChild(mf);
                setMathField(mf);

                setTimeout(() => {
                    mf.focus();
                    const mvk = (window as any).mathVirtualKeyboard;
                    if (mvk) {
                        mvk.layouts = ['numeric', 'symbols'];
                        mvk.show();
                    }
                }, 100);
            }).catch(err => {
                console.error('Failed to load mathlive:', err);
            });
        }

        return () => {
            const mvk = (window as any).mathVirtualKeyboard;
            if (mvk) {
                mvk.hide();
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
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
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
    onUpdate?: (id: string, data: { width?: number; rotation?: number }) => void;
    widgetId?: string;
}> = ({ src, alt, onDelete, onUpdate, widgetId }) => {
    const [rotation, setRotation] = useState(0);
    const [selected, setSelected] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onOut = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSelected(false);
        };
        document.addEventListener("mousedown", onOut);
        return () => document.removeEventListener("mousedown", onOut);
    }, []);

    const handleRotate = (delta: number) => {
        const newRotation = rotation + delta;
        setRotation(newRotation);
        onUpdate?.(widgetId || '', { rotation: newRotation });
    };

    return (
        <div
            ref={wrapRef}
            contentEditable={false}
            className={`img-widget-outer${selected ? " img-selected" : ""}`}
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                margin: "0.5em 0",
                position: "relative",
            }}
            onClick={() => setSelected(true)}
        >
            <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
                <img
                    src={src}
                    alt={alt}
                    style={{
                        width: "100%",
                        maxWidth: "100%",
                        display: "block",
                        borderRadius: 7,
                        transform: `rotate(${rotation}deg)`,
                        transition: "transform 0.2s",
                        border: selected ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
                    }}
                    draggable={false}
                />
                {selected && (
                    <>
                        {/* Nút xóa - góc trên bên phải */}
                        <button
                            className="img-delete-btn"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Xóa ảnh"
                        >
                            <X size={14} />
                        </button>
                        {/* Các nút chỉnh sửa - góc trên bên trái */}
                        <div className="img-edit-toolbar">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRotate(-90); }}
                                title="Xoay trái"
                            >
                                <RotateCcw size={12} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRotate(90); }}
                                title="Xoay phải"
                            >
                                <RotateCw size={12} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setRotation(0); onUpdate?.(widgetId || '', { rotation: 0 }); }}
                                title="Đặt lại"
                            >
                                <Maximize2 size={12} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Table Widget ─────────────────────────────────────────────────────────────

type TableSnapshot = { data: string[][]; colWidths: number[] };

const tableDataRegistry = new Map<string, () => TableSnapshot>();

function parseTableSnapshot(el: Element | null, initialRows: number, initialCols: number): TableSnapshot {
    const raw = el?.getAttribute("data-table-data");
    if (raw) {
        try {
            const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<TableSnapshot>;
            if (parsed.data?.length && parsed.data[0]?.length) {
                const colCount = parsed.data[0].length;
                return {
                    data: parsed.data,
                    colWidths: parsed.colWidths?.length === colCount
                        ? parsed.colWidths
                        : Array(colCount).fill(110),
                };
            }
        } catch { /* fall through to defaults */ }
    }
    return {
        data: Array.from({ length: initialRows + 1 }, (_, r) =>
            Array.from({ length: initialCols }, (_, c) => r === 0 ? `Header ${c + 1}` : "")
        ),
        colWidths: Array(initialCols).fill(110),
    };
}

function syncTableSnapshotToDom(id: string, snapshot: TableSnapshot) {
    const el = document.querySelector(`[data-table-id="${id}"]`);
    if (!el) return;
    el.setAttribute("data-table-data", encodeURIComponent(JSON.stringify(snapshot)));
    el.setAttribute("data-table-rows", String(Math.max(0, snapshot.data.length - 1)));
    el.setAttribute("data-table-cols", String(snapshot.data[0]?.length ?? 0));
}

function syncAllTableWidgetsToDom(editor: HTMLElement) {
    editor.querySelectorAll("[data-table-id]").forEach(el => {
        const id = el.getAttribute("data-table-id");
        if (!id) return;
        const getter = tableDataRegistry.get(id);
        if (getter) syncTableSnapshotToDom(id, getter());
    });
}

const TableWidget: React.FC<{
    initialRows: number;
    initialCols: number;
    initialSnapshot?: TableSnapshot;
    widgetId?: string;
    placeholderEl?: Element | null;
    onDelete?: () => void;
    onDataChange?: () => void;
}> = ({ initialRows, initialCols, initialSnapshot, widgetId, placeholderEl, onDelete, onDataChange }) => {
    const [data, setData] = useState<string[][]>(() => {
        if (initialSnapshot?.data.length) return initialSnapshot.data;
        const el = placeholderEl ?? (widgetId ? document.querySelector(`[data-table-id="${widgetId}"]`) : null);
        return parseTableSnapshot(el, initialRows, initialCols).data;
    });
    const [colWidths, setColWidths] = useState<number[]>(() => {
        if (initialSnapshot?.colWidths.length) return initialSnapshot.colWidths;
        const el = placeholderEl ?? (widgetId ? document.querySelector(`[data-table-id="${widgetId}"]`) : null);
        return parseTableSnapshot(el, initialRows, initialCols).colWidths;
    });
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

    useEffect(() => {
        if (!widgetId) return;
        const snapshot = () => ({ data, colWidths });
        tableDataRegistry.set(widgetId, snapshot);
        syncTableSnapshotToDom(widgetId, snapshot());
        onDataChange?.();
        return () => { tableDataRegistry.delete(widgetId); };
    }, [widgetId, data, colWidths, onDataChange]);

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
                                    <Plus size={13} style={{ color: "#818cf8" }} />
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

const CustomEditor = forwardRef<CustomEditorRef, CustomEditorProps>(({ initialValue = '', onImageUpload, uploading = false, compact = false, placeholder = "Nội dung" }, ref) => {
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
    const [isEmpty, setIsEmpty] = useState(true);
    const [heading, setHeading] = useState<HeadingLevel>("p");
    const [fontColor, setFontColor] = useState<string>("#111827");
    const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalMode>(null);

    const spaceCountRef = useRef(0);
    const imageCounter = useRef(0);
    const tableCounter = useRef(0);
    const hasInitialized = useRef(false);
    const isComposingRef = useRef(false);
    const [imageWidgets, setImageWidgets] = useState<Map<string, { src: string; alt: string }>>(new Map());
    const [tableWidgets, setTableWidgets] = useState<Map<string, { rows: number; cols: number }>>(new Map());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const updateStatus = useCallback(() => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const text = editor.innerText.trim();
        const html = editor.innerHTML.trim();

        const hasContent =
            text.length > 0 ||
            (html !== '<p><br></p>' && html !== '<p></p>' && html !== '<br>') ||
            editor.querySelector('[data-img-id]') ||
            editor.querySelector('[data-table-id]') ||
            editor.querySelector('.ed-code-block') ||
            editor.querySelector('.math-inline') ||
            editor.querySelector('.file-card') ||
            editor.querySelector('blockquote') ||
            editor.querySelector('h1, h2, h3') ||
            editor.querySelector('img') ||
            editor.querySelector('pre, code');

        const words = text ? text.split(/\s+/).length : 0;
        const chars = editor.innerText.replace(/\n/g, "").length;

        startTransition(() => {
            setStatus(s => ({ ...s, words, chars }));
            setIsEmpty(!hasContent);
        });
    }, []);

    const scheduleAutosave = useCallback(() => {
        setStatus(s => ({ ...s, saved: false }));
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setStatus(s => ({ ...s, saved: true })), 1200);
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

    // Bổ sung listener selectionchange để Active trạng thái ngay khi có tương tác / thay đổi vị trí con trỏ
    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === editorRef.current || editorRef.current?.contains(document.activeElement)) {
                updateActiveStates();
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [updateActiveStates]);

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
            const snapshot = parseTableSnapshot(el, rows, cols);
            el.innerHTML = '';
            const root = createRoot(el);
            mountedRoots.set(id, root);
            root.render(<TableWidget
                initialRows={rows}
                initialCols={cols}
                initialSnapshot={snapshot}
                widgetId={id}
                placeholderEl={el}
                onDelete={() => deleteTable(id)}
                onDataChange={scheduleAutosave}
            />);
        });
    }, [deleteTable, scheduleAutosave]);

    useEffect(() => {
        if (editorRef.current) {
            hasInitialized.current = true;
            editorRef.current.innerHTML = initialValue || '<p><br></p>';
            updateStatus();
            setTimeout(() => {
                mountImageWidgets();
                mountTableWidgets();
            }, 100);
        }
    }, [initialValue, mountImageWidgets, mountTableWidgets, updateStatus]);

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
        getContent: () => {
            if (editorRef.current) syncAllTableWidgetsToDom(editorRef.current);
            const html = editorRef.current?.innerHTML || '';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            tempDiv.querySelectorAll('.inline-code').forEach(code => {
                code.textContent = (code.textContent || '').replace(/\u200B/g, '');
            });
            return tempDiv.innerHTML;
        },
        setContent: (content: string) => {
            console.log('CustomEditor setContent called with:', content);
            if (editorRef.current) {
                editorRef.current.innerHTML = content || '<p><br></p>';
                const rootsToClear = Array.from(mountedRoots.entries());
                setTimeout(() => {
                    rootsToClear.forEach(([id, root]) => {
                        try { root.unmount(); } catch { }
                        mountedRoots.delete(id);
                    });
                    mountImageWidgets();
                    mountTableWidgets();
                    updateStatus();
                }, 100);
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

    // ================== CODE INLINE ==================
    const insertInlineCode = useCallback(() => {
        if (!editorRef.current) return;

        editorRef.current.focus();
        restoreRange();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        let existingCodeEl: Element | null = null;
        let current: Node | null = range.startContainer;

        while (current && current !== editorRef.current) {
            if (current.nodeType === Node.ELEMENT_NODE &&
                (current as Element).classList.contains('inline-code')) {
                existingCodeEl = current as Element;
                break;
            }
            current = current.parentNode;
        }

        if (existingCodeEl) {
            const exitRange = document.createRange();
            exitRange.setStartAfter(existingCodeEl);
            exitRange.collapse(true);

            const zws = document.createTextNode('\u200B');
            exitRange.insertNode(zws);
            exitRange.setStartAfter(zws);
            exitRange.collapse(true);

            sel.removeAllRanges();
            sel.addRange(exitRange);
            
            updateActiveStates();
            scheduleAutosave();
            return;
        }

        if (!range.collapsed) {
            const selectedText = sel.toString();
            document.execCommand("insertHTML", false, `<code class="inline-code">${selectedText}</code>\u200B`);
        } else {
            const tempId = `code-tmp-${Date.now()}`;
            document.execCommand("insertHTML", false, `<code class="inline-code" id="${tempId}">\u200B</code>`);
            setTimeout(() => {
                const el = document.getElementById(tempId);
                if (el) {
                    el.removeAttribute("id");
                    const newRange = document.createRange();
                    newRange.setStart(el, 1);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }
            }, 0);
        }

        scheduleAutosave();
        updateActiveStates();
    }, [restoreRange, scheduleAutosave, updateActiveStates]);

    const insertImage = useCallback((src: string, alt: string) => {
        if (!src) return;
        editorRef.current?.focus();
        restoreRange();
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const range = sel.getRangeAt(0);
        const id = `img-${++imageCounter.current}`;
        setImageWidgets(m => new Map(m).set(id, { src, alt }));
        const placeholder = document.createElement("div");
        placeholder.setAttribute("data-img-id", id);
        placeholder.setAttribute("data-img-src", src);
        placeholder.setAttribute("data-img-alt", alt);
        placeholder.className = "img-placeholder";
        placeholder.contentEditable = "false";
        range.insertNode(placeholder);
        placeholder.insertAdjacentHTML("afterend", "<p><br></p>");
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

    // Code block
    const insertCodeBlock = useCallback(() => {
        editorRef.current?.focus();
        restoreRange();

        const html = `
            <div class="ed-code-block" data-lang="javascript">
                <code contenteditable="true" class="code-editable" spellcheck="false"></code>
            </div>
            <p><br></p>
        `;

        document.execCommand("insertHTML", false, html);

        setTimeout(() => {
            const codeEl = editorRef.current?.querySelector('.code-editable:last-of-type') as HTMLElement;
            if (codeEl) {
                codeEl.focus();
                const range = document.createRange();
                const textNode = document.createTextNode('');
                codeEl.innerHTML = '';
                codeEl.appendChild(textNode);
                range.setStart(textNode, 0);
                range.collapse(true);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }, 10);

        scheduleAutosave();
    }, [restoreRange, scheduleAutosave]);

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
                const snapshot = parseTableSnapshot(el, 3, 3);
                el.innerHTML = '';
                const root = createRoot(el);
                mountedRoots.set(id, root);
                root.render(<TableWidget
                    initialRows={3}
                    initialCols={3}
                    initialSnapshot={snapshot}
                    widgetId={id}
                    placeholderEl={el}
                    onDelete={() => deleteTable(id)}
                    onDataChange={scheduleAutosave}
                />);
            }
        }, 0);
    };

    const insertMath = (latex: string) => {
        if (!latex) return;
        editorRef.current?.focus();
        restoreRange();

        const mathId = `math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const html = `<span class="math-inline" data-math-id="${mathId}" data-latex="${latex.replace(/"/g, '"')}" contenteditable="false"></span>&nbsp;`;
        document.execCommand("insertHTML", false, html);

        setTimeout(() => {
            const mathEl = editorRef.current?.querySelector(`[data-math-id="${mathId}"]`);
            if (mathEl && typeof window !== 'undefined') {
                import('mathlive').then(() => {
                    const mf = document.createElement('math-field') as any;
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
                    mathEl.textContent = latex;
                    mathEl.setAttribute('style', 'font-family:monospace;color:#111827;');
                });
            }
        }, 0);

        scheduleAutosave();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const node = range.startContainer;

            let codeElement: HTMLElement | null = null;
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                if (el.classList?.contains('inline-code')) {
                    codeElement = el;
                } else {
                    codeElement = el.closest('.inline-code');
                }
            } else if (node.parentElement) {
                codeElement = node.parentElement.closest('.inline-code');
            }

            if (codeElement) {
                const textNode = Array.from(codeElement.childNodes).find(
                    n => n.nodeType === Node.TEXT_NODE
                ) || codeElement.firstChild;

                if (textNode) {
                    const newRange = document.createRange();
                    const rawText = textNode.textContent || '';
                    const textContent = rawText.replace(/\u200B/g, '');

                    if (textContent.length === 0 && rawText.includes('\u200B')) {
                        newRange.setStart(textNode, 1);
                        newRange.collapse(true);
                    } else {
                        const offset = node === textNode ? range.startOffset : textContent.length;
                        newRange.setStart(textNode, Math.min(offset, textContent.length));
                        newRange.collapse(true);
                    }

                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
        }, 0);
    };

    const handleInput = () => {
        updateActiveStates();
        scheduleAutosave();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;

        if (isComposingRef.current && e.key !== "Enter") return;

        // ================== CODE INLINE HANDLING ==================
        let inlineCodeEl: Element | null = null;
        let current: Node | null = sel.getRangeAt(0).startContainer;

        while (current && current !== editorRef.current) {
            if (current.nodeType === Node.ELEMENT_NODE &&
                (current as Element).classList.contains('inline-code')) {
                inlineCodeEl = current as Element;
                break;
            }
            current = current.parentNode;
        }

        if (inlineCodeEl) {
            const range = sel.getRangeAt(0);
            const endRange = document.createRange();
            endRange.selectNodeContents(inlineCodeEl);
            endRange.collapse(false);
            const isAtEnd = range.collapsed &&
                range.compareBoundaryPoints(Range.END_TO_END, endRange) === 0;

            const startRange = document.createRange();
            startRange.selectNodeContents(inlineCodeEl);
            startRange.collapse(true);
            const isAtStart = range.collapsed &&
                range.compareBoundaryPoints(Range.START_TO_START, startRange) === 0;

            if (e.key === " ") {
                if (isAtEnd) {
                    spaceCountRef.current++;
                    if (spaceCountRef.current >= 2) {
                        e.preventDefault();
                        spaceCountRef.current = 0;
                        document.execCommand('delete', false, undefined);

                        const exitRange = document.createRange();
                        exitRange.setStartAfter(inlineCodeEl);
                        exitRange.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(exitRange);

                        setTimeout(() => {
                            document.execCommand("insertText", false, " ");
                        }, 10);
                    } else {
                        e.preventDefault();
                        document.execCommand('insertText', false, ' ');
                        scheduleAutosave();
                    }
                    return;
                } else {
                    spaceCountRef.current = 0;
                }
            } else if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                spaceCountRef.current = 0;
            }

            if (e.key === "ArrowRight" && isAtEnd) {
                e.preventDefault();
                spaceCountRef.current = 0;
                const exitRange = document.createRange();
                exitRange.setStartAfter(inlineCodeEl);
                exitRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(exitRange);
                return;
            }

            if (e.key === "ArrowLeft" && isAtStart) {
                e.preventDefault();
                spaceCountRef.current = 0;
                const exitRange = document.createRange();
                exitRange.setStartBefore(inlineCodeEl);
                exitRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(exitRange);
                return;
            }
        } else {
            spaceCountRef.current = 0;
        }

        // ================== ENTER TRONG CODE BLOCK ==================
        if (e.key === "Enter") {
            const sel = window.getSelection();
            if (sel?.rangeCount && editorRef.current) {
                const range = sel.getRangeAt(0);
                let current: Node | null = range.startContainer;

                while (current && current !== editorRef.current) {
                    if (current.nodeType === Node.ELEMENT_NODE) {
                        const el = current as Element;
                        if (el.classList.contains('code-editable') || el.closest('.ed-code-block')) {
                            e.preventDefault();
                            document.execCommand('insertLineBreak');
                            scheduleAutosave();
                            return;
                        }
                    }
                    current = current.parentNode;
                }
            }
        }

        if (e.key === "Backspace" || e.key === "Delete") {
            const sel = window.getSelection();
            if (sel?.rangeCount) {
                const range = sel.getRangeAt(0);
                let node: Node | null = range.startContainer;
                
                // XỬ LÝ XOÁ CODE BLOCK (NẾU RỖNG BẤM XOÁ LÀ XOÁ LUÔN CODE BLOCK)
                if (e.key === "Backspace") {
                    let codeEditableEl: Element | null = null;
                    let curr: Node | null = node;
                    while (curr && curr !== editorRef.current) {
                        if (curr.nodeType === Node.ELEMENT_NODE && (curr as Element).classList.contains('code-editable')) {
                            codeEditableEl = curr as Element;
                            break;
                        }
                        curr = curr.parentNode;
                    }

                    if (codeEditableEl) {
                        const text = codeEditableEl.textContent || "";
                        if (text.length === 0) {
                            e.preventDefault();
                            const codeBlock = codeEditableEl.closest('.ed-code-block');
                            if (codeBlock && codeBlock.parentNode) {
                                const exitRange = document.createRange();
                                exitRange.setStartBefore(codeBlock);
                                exitRange.collapse(true);
                                codeBlock.parentNode.removeChild(codeBlock);
                                sel.removeAllRanges();
                                sel.addRange(exitRange);
                                scheduleAutosave();
                            }
                            return;
                        }
                    }
                }

                let inlineCodeEl: Element | null = null;
                let current: Node | null = range.startContainer;
                while (current && current !== editorRef.current) {
                    if (current.nodeType === Node.ELEMENT_NODE &&
                        (current as Element).classList.contains('inline-code')) {
                        inlineCodeEl = current as Element;
                        break;
                    }
                    current = current.parentNode;
                }

                if (inlineCodeEl && e.key === "Backspace") {
                    const text = (inlineCodeEl.textContent || "").replace(/\u200B/g, '');
                    if (text.length === 0) {
                        e.preventDefault();
                        const parent = inlineCodeEl.parentNode;
                        if (parent) {
                            const exitRange = document.createRange();
                            exitRange.setStartBefore(inlineCodeEl);
                            exitRange.collapse(true);
                            parent.removeChild(inlineCodeEl);
                            sel.removeAllRanges();
                            sel.addRange(exitRange);
                            scheduleAutosave();
                        }
                        return;
                    }
                }

                while (node && node !== editorRef.current) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        if (el.classList.contains('math-inline')) {
                            e.preventDefault();
                            el.parentNode?.removeChild(el);
                            scheduleAutosave();
                            return;
                        }
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
            }
        }

        if (e.key === "Tab") {
            e.preventDefault();
            exec("indent");
            return;
        }

        if (e.key === " " || e.key === "Enter") {
            setTimeout(() => {
                const selAfter = window.getSelection();
                if (!selAfter?.rangeCount || !editorRef.current) return;

                const rangeAfter = selAfter.getRangeAt(0);
                const anchorNode = rangeAfter.startContainer;
                const anchorOffset = rangeAfter.startOffset;

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
                const hasLink = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z]{2,})|[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i.test(fullText);
                if (!hasLink) return;

                const parent = targetNode.parentNode;
                const nextSiblingBeforeReplace = targetNode.nextSibling;

                autoLinkText(targetNode);

                try {
                    const newSel = window.getSelection();
                    if (!newSel) return;
                    const newRange = document.createRange();

                    if (nextSiblingBeforeReplace && nextSiblingBeforeReplace.isConnected) {
                        if (nextSiblingBeforeReplace.nodeType === Node.TEXT_NODE) {
                            const offset = e.key === " " ? Math.min(1, nextSiblingBeforeReplace.textContent?.length ?? 0) : 0;
                            newRange.setStart(nextSiblingBeforeReplace, offset);
                        } else {
                            newRange.setStartBefore(nextSiblingBeforeReplace);
                        }
                    } else if (parent && parent.isConnected) {
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

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const clipData = e.clipboardData;

        const plainText = clipData.getData("text/plain");
        const htmlData = clipData.getData("text/html");

        if (htmlData) {
            const cleaned = stripAndNormalizePaste(htmlData);
            document.execCommand("insertHTML", false, cleaned);
        } else if (plainText) {
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
                <div className="ed-content-wrap">
                    <div
                        ref={editorRef}
                        id="editor"
                        className={isEmpty ? "ed-empty" : undefined}
                        data-placeholder={placeholder}
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
                        onInput={handleInput}
                        onCompositionStart={() => { isComposingRef.current = true; }}
                        onCompositionEnd={() => { isComposingRef.current = false; }}
                        onKeyUp={updateActiveStates}
                        onMouseUp={updateActiveStates}
                        onMouseDown={handleMouseDown}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                    />
                </div>
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
                        <Sep />
                        <ToolbarButton icon={<Code size={15} />} label="Code" onClick={insertInlineCode} />
                        <ToolbarButton icon={<div style={{ fontWeight: 'bold', fontSize: '12px', fontFamily: 'monospace' }}>{'</>'}</div>} label="Code block" onClick={insertCodeBlock} />
                        <ToolbarButton icon={<Sigma size={15} />} label="Công thức toán" onClick={() => { saveRange(); setModal("math"); }} />
                        <Sep />
                        <div className="ed-select-wrapper">
                            <select value={heading} onChange={e => applyHeading(e.target.value as HeadingLevel)} className="ed-select" style={{ width: 110 }}>
                                <option value="p">Đoạn văn</option>
                                <option value="h1">Tiêu đề 1</option>
                                <option value="h2">Tiêu đề 2</option>
                                <option value="h3">Tiêu đề 3</option>
                            </select>
                        </div>
                        <input type="color" value={fontColor} onChange={e => applyColor(e.target.value)} title="Màu chữ" className="ed-color-picker" />
                        <Sep />
                        <ToolbarButton icon={<ImageIcon size={15} />} label="Chèn ảnh" onClick={() => { saveRange(); fileInputRef.current?.click(); }} />
                        <ToolbarButton icon={<Table size={15} />} label="Chèn bảng" onClick={insertTable} />
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
                </div>
                {modal === "math" && <MathModal onClose={() => setModal(null)} onInsert={insertMath} />}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsUploading(true);
                        try {
                            const objectUrl = URL.createObjectURL(file);
                            const response = await fetch(objectUrl);
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

                            insertImage(result.url, file.name.replace(/\.[^.]+$/, ""));
                            toast.success("Upload ảnh thành công");
                            URL.revokeObjectURL(objectUrl);
                        } catch (error) {
                            console.error(error);
                            toast.error("Có lỗi xảy ra khi upload");
                        } finally {
                            setIsUploading(false);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }
                    }}
                />
                {modal === "file" && (
                    <UploadFileModal
                        onClose={() => setModal(null)}
                        onConfirm={(messageId, filename) => {
                            editorRef.current?.focus();
                            restoreRange();

                            const fileSize = '0 MB';
                            const fileCardHTML = generateFileCardHTML(filename, messageId, fileSize);
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
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    height: auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    position: relative;
  }
  .ed-header {
    background: transparent;
    border: none;
    padding: 6px 0 0 0;
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
    width: 30px; height: 28px; border-radius: 50%; border: none;
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
  .ed-content-wrap { position: relative; }

  #editor {
    outline: none; padding: 0.5rem 0.25rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    color: #111827;
    min-height: calc(3 * 1.5em + 1rem);
    max-height: calc(20 * 1.5em + 1rem);
    overflow-y: auto;
    caret-color: #6366f1;
    box-sizing: border-box;
    position: relative;
  }

  #editor.no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  #editor.no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  #editor.ed-empty::before {
    content: attr(data-placeholder);
    position: absolute;
    top: 0.5rem;
    left: 0.25rem;
    right: 0.25rem;
    color: #9ca3af;
    pointer-events: none;
    font-size: 15px;
    line-height: 1.75;
  }

  #editor * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    line-height: 1.5 !important;
  }

  #editor p {
    margin: 0 0 0.5em 0 !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
  }

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

  #editor b, #editor strong {
    font-weight: 700 !important;
  }

  #editor blockquote {
    border-left: 3px solid #6366f1; padding: 0.5em 1.1em; margin: 0.85em 0 !important;
    color: #6b7280; font-style: italic; background: #f5f5ff; border-radius: 0 6px 6px 0;
    line-height: 1.5 !important;
  }
  
  /* Inline code */
  #editor .inline-code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    font-size: 0.85em;
    background: #f3f4f6;
    padding: 0.15em 0.3em;
    border-radius: 4px;
    color: #4338ca;
    line-height: inherit !important;
  }
  
  /* Code block */
  #editor .ed-code-block {
    background: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 10px;
    padding: 0;
    margin: 1em 0;
    overflow: hidden;
    position: relative;
  }

  #editor .ed-code-lang-badge {
    display: inline-block;
    background: rgba(255,255,255,0.07);
    color: #636da6;
    font-size: 10px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    padding: 3px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1.6 !important;
  }

  #editor .ed-code-block .code-editable {
    display: block;
    background: none;
    border: none;
    padding: 12px 16px;
    font-size: 13.5px;
    line-height: 1.5 !important;
    color: #d4d4d4;
    overflow-x: auto;
    white-space: pre-wrap !important;
    word-break: break-all;
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    outline: none;
    min-height: 50px;
    tab-size: 4;
    box-sizing: border-box;
  }

  /* Đề phòng các thẻ div/p khi người dùng dán code bị dính margin */
  #editor .ed-code-block .code-editable p,
  #editor .ed-code-block .code-editable div {
    margin: 0 !important;
    padding: 0 !important;
  }

  #editor .ed-code-block .code-editable:focus {
    outline: none;
  }

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

  #editor .math-inline {
    display: inline-block;
    vertical-align: middle;
    margin: 0 2px;
  }
  #editor .math-inline math-field {
    font-size: 15px !important;
  }

  #editor ::selection { background: rgba(99,102,241,0.15); }

  .highlight-picker {
    position: absolute; bottom: 34px; left: 0;
    background: #fff; border: 0.5px solid #e5e7eb; border-radius: 8px;
    padding: 6px; display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    width: 96px;
  }
  .highlight-swatch {
    width: 18px; height: 18px; border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,0.12); cursor: pointer;
    transition: transform 0.1s, border-color 0.1s;
    padding: 0;
  }
  .highlight-swatch:hover { transform: scale(1.2); border-color: #6366f1; }
  
  /* Image styles - full width, centered */
  .img-placeholder { 
    display: block; 
    width: 100%;
  }
  .img-widget-outer { 
    position: relative; 
    width: 100%;
  }
  
  .img-widget-outer .img-delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 10;
  }
  .img-widget-outer .img-delete-btn:hover {
    background: rgba(239, 68, 68, 0.9);
    transform: scale(1.05);
  }
  
  .img-widget-outer .img-edit-toolbar {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    gap: 4px;
    background: rgba(0, 0, 0, 0.6);
    padding: 4px;
    border-radius: 6px;
    z-index: 10;
  }
  .img-widget-outer .img-edit-toolbar button {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .img-widget-outer .img-edit-toolbar button:hover {
    background: rgba(255,255,255,0.15);
    color: white;
  }
  
  .img-widget-outer.img-selected .img-delete-btn {
    display: flex;
  }
  
  .img-widget-outer:not(.img-selected) .img-delete-btn {
    display: none;
  }
  .img-widget-outer:not(.img-selected) .img-edit-toolbar {
    display: none;
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
    background: transparent; border-top: none; padding: 5px 0 0 0;
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
    padding: 8px 10px; font-size: 13px; font-family: 'Inter', system-ui, sans-serif;
    background: #f9fafb; color: #111827; outline: none; resize: vertical; box-sizing: border-box;
  }
  .modal-textarea:focus { border-color: #6366f1; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
  .btn-cancel {
    padding: 7px 14px; border: 0.5px solid #d1d5db; border-radius: 6px;
    background: #fff; color: #374151; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'Inter', system-ui, sans-serif;
  }
  .btn-cancel:hover { background: #f9fafb; }
  .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ok {
    padding: 7px 14px; border: none; border-radius: 6px;
    background: #6366f1; color: #fff; font-size: 13px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Inter', system-ui, sans-serif;
  }
  .btn-ok:hover { background: #4f46e5; }
  .btn-ok:disabled { opacity: 0.5; cursor: not-allowed; }
  .animate-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default CustomEditor;