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
    Loader2
} from "lucide-react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeadingLevel = "p" | "h1" | "h2" | "h3";
type ModalMode = "image" | "code" | null;
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
}

export interface CustomEditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
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

// ─── Auto-link detection ──────────────────────────────────────────────────────

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"']+|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>"']*)?/g;

function autoLinkText(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        if (!URL_REGEX.test(text)) return;
        URL_REGEX.lastIndex = 0;
        const frag = document.createDocumentFragment();
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = URL_REGEX.exec(text)) !== null) {
            if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
            const a = document.createElement("a");
            const href = m[0].startsWith("http") ? m[0] : `https://${m[0]}`;
            a.href = href;
            a.textContent = m[0];
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            frag.appendChild(a);
            last = m.index + m[0].length;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "A") {
        Array.from(node.childNodes).forEach(autoLinkText);
    }
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

// ─── Image Widget ─────────────────────────────────────────────────────────────

// components/custom/CustomEditor.tsx - Sửa ImageWidget

const ImageWidget: React.FC<{
    src: string;
    alt: string;
    onDelete: () => void;
    onUpdate?: (id: string, data: { width?: number; rotation?: number; align?: string; x?: number; y?: number }) => void;
    widgetId?: string;
}> = ({ src, alt, onDelete, onUpdate, widgetId }) => {
    // Lấy giá trị từ attribute nếu có
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

    // Lưu thay đổi vào attribute
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

const TableWidget: React.FC<{ initialRows: number; initialCols: number }> = ({ initialRows, initialCols }) => {
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
                <button className="tw-add-row" onClick={addRow}>
                    <Plus size={12} /> Thêm hàng
                </button>
            )}
        </div>
    );
};

// ─── Mounted Widget Roots tracker ─────────────────────────────────────────────

const mountedRoots = new Map<string, ReturnType<typeof createRoot>>();

// ─── Main Editor ──────────────────────────────────────────────────────────────

const CustomEditor = forwardRef<CustomEditorRef, CustomEditorProps>(({ initialValue = '', onImageUpload, uploading = false }, ref) => {
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
    const [heading, setHeading] = useState<HeadingLevel>("p");
    const [fontColor, setFontColor] = useState<string>("#111827");
    const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalMode>(null);

    const imageCounter = useRef(0);
    const tableCounter = useRef(0);
    const [imageWidgets, setImageWidgets] = useState<Map<string, { src: string; alt: string }>>(new Map());
    const [tableWidgets, setTableWidgets] = useState<Map<string, { rows: number; cols: number }>>(new Map());

    // ✅ 1. Khai báo updateStatus TRƯỚC
    const updateStatus = useCallback(() => {
        const text = editorRef.current?.innerText ?? "";
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.replace(/\n/g, "").length;
        startTransition(() => setStatus(s => ({ ...s, words, chars })));
    }, []);

    // ✅ 2. Khai báo scheduleAutosave SAU updateStatus
    const scheduleAutosave = useCallback(() => {
        setStatus(s => ({ ...s, saved: false }));
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setStatus(s => ({ ...s, saved: true })), 1200);
        updateStatus();
    }, [updateStatus]);

    // ✅ 3. Khai báo updateActiveStates
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
    }, []);

    // ✅ 4. Khai báo exec SAU updateActiveStates và scheduleAutosave
    const exec = useCallback((cmd: string, val?: string) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
        updateActiveStates();
        scheduleAutosave();
    }, [updateActiveStates, scheduleAutosave]);

    // ✅ 5. Khai báo deleteImage TRƯỚC khi dùng
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

    // ✅ 6. Khai báo mountImageWidgets (dùng deleteImage)
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

    // ✅ 7. Khai báo mountTableWidgets
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
            root.render(<TableWidget initialRows={rows} initialCols={cols} />);
        });
    }, []);

    // ✅ 8. useEffect mount ban đầu
    useEffect(() => {
        if (editorRef.current && initialValue) {
            editorRef.current.innerHTML = initialValue;
            updateStatus();
            setTimeout(() => {
                mountImageWidgets();
                mountTableWidgets();
            }, 0);
        }
    }, [initialValue, updateStatus, mountImageWidgets, mountTableWidgets]);

    // ✅ 9. MutationObserver effect
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

    // ✅ 10. useImperativeHandle
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

    // ✅ 11. useEffect cleanup
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
        setHeading(tag); editorRef.current?.focus();
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
                root.render(<TableWidget initialRows={3} initialCols={3} />);
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Tab") {
            e.preventDefault();
            exec("indent");
        }
        if (e.key === " " || e.key === "Enter") {
            setTimeout(() => {
                const sel = window.getSelection();
                if (!sel?.rangeCount || !editorRef.current) return;
                const rangeAfter = sel.getRangeAt(0);
                const anchorNode = rangeAfter.startContainer;
                const anchorOffset = rangeAfter.startOffset;
                const targetNode = anchorOffset === 0 && anchorNode.previousSibling
                    ? anchorNode.previousSibling
                    : anchorNode;
                if (targetNode.nodeType === Node.TEXT_NODE && targetNode.parentNode?.nodeName !== "A") {
                    autoLinkText(targetNode);
                }
                try {
                    const parent = rangeAfter.startContainer.parentNode ?? editorRef.current;
                    const newRange = document.createRange();
                    if (anchorNode.isConnected) {
                        newRange.setStart(anchorNode, anchorOffset);
                    } else {
                        newRange.selectNodeContents(parent);
                        newRange.collapse(false);
                    }
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                } catch { }
            }, 10);
        }
    };

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
                            onInput={() => { updateActiveStates(); scheduleAutosave(); }}
                            onKeyUp={updateActiveStates}
                            onMouseUp={updateActiveStates}
                            onKeyDown={handleKeyDown}
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
                {modal === "image" && (
                    <UploadImageModal
                        onClose={() => setModal(null)}
                        onConfirm={(src, alt) => { insertImage(src, alt); setModal(null); }}
                        onImageUpload={onImageUpload}
                        uploading={uploading}
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
  #editor {
    outline: none; padding: 1.5rem 2.25rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px; line-height: 1.8; color: #111827;
    min-height: 100%; caret-color: #6366f1;
    box-sizing: border-box;
  }
  #editor p { margin-bottom: 0.9em; }
  #editor h1 { font-size: 1.85em; font-weight: 700; margin-bottom: 0.5em; letter-spacing: -0.02em; color: #0f172a; }
  #editor h2 { font-size: 1.4em; font-weight: 600; margin-bottom: 0.4em; color: #0f172a; }
  #editor h3 { font-size: 1.15em; font-weight: 600; margin-bottom: 0.35em; color: #0f172a; }
  #editor blockquote {
    border-left: 3px solid #6366f1; padding: 0.5em 1.1em; margin: 0.85em 0;
    color: #6b7280; font-style: italic; background: #f5f5ff; border-radius: 0 6px 6px 0;
  }
  #editor code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.8em;
    background: #f3f4f6; border: 0.5px solid #e5e7eb;
    padding: 0.15em 0.4em; border-radius: 4px; color: #4338ca;
  }
  #editor sup { font-size: 0.75em; vertical-align: super; }
  #editor sub { font-size: 0.75em; vertical-align: sub; }
  #editor .ed-code-block {
    background: #1e1e2e; border: none; border-radius: 10px;
    padding: 0; margin: 1em 0; overflow: hidden; font-size: 0;
  }
  #editor .ed-code-lang-badge {
    display: block; background: rgba(255,255,255,0.07); color: #636da6;
    font-size: 10px; font-family: 'JetBrains Mono', 'Fira Code', monospace;
    padding: 4px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  #editor .ed-code-block code {
    display: block; background: none; border: none;
    padding: 1em 1.25em; font-size: 13px; line-height: 1.7;
    color: #d4d4d4; overflow-x: auto; white-space: pre;
  }
  #editor a { color: #6366f1; text-decoration: underline; text-decoration-color: rgba(99,102,241,0.4); }
  #editor ul { margin: 0.5em 0 0.5em 1.6em; }
  #editor ol { margin: 0.5em 0 0.5em 1.6em; }
  #editor li { margin: 0.25em 0; }
  #editor ::selection { background: rgba(99,102,241,0.15); }
  .highlight-picker {
    position: absolute; top: 34px; left: 0; z-index: 100;
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
  .tw-table { border-collapse: collapse; font-size: 13px; font-family: 'Inter', system-ui, sans-serif; table-layout: fixed; }
  .tw-th { background: #f1f5f9; font-weight: 600; color: #374151; border: 1px solid #d1d5db; padding: 0; position: relative; }
  .tw-td { border: 1px solid #e5e7eb; padding: 0; position: relative; }
  .tw-cell-input { width: 100%; border: none; outline: none; background: transparent; padding: 6px 8px; font-size: 13px; font-family: 'Inter', system-ui, sans-serif; color: #111827; box-sizing: border-box; }
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
    width: 100%; background: #f0f9ff; border: 1px dashed #c7d2fe; border-top: none;
    color: #6366f1; font-size: 12px; padding: 5px; cursor: pointer;
    border-radius: 0 0 6px 6px; font-family: 'Inter', system-ui, sans-serif;
  }
  .tw-add-row:hover { background: #e0e7ff; }
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
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; border-radius: 12px;
  }
  .modal-box {
    background: #fff; border: 0.5px solid #d1d5db; border-radius: 10px;
    padding: 1.25rem; width: 380px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    display: flex; flex-direction: column; gap: 8px;
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