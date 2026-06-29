export const HIGHLIGHT_COLORS = [
    "#fef08a",
    "#bbf7d0",
    "#bfdbfe",
    "#fecaca",
    "#fed7aa",
    "#e9d5ff",
    "#fbcfe8",
    "transparent",
];

export const CODE_LANGUAGES = [
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

export const SHORTCUTS: Record<string, string> = {
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

const EMAIL_REGEX =
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const URL_REGEX =
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>"']*)?/g;

export function autoLinkText(node: Node) {
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
                const href = matchText.match(/^https?:\/\//)
                    ? matchText
                    : `https://${matchText}`;
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
            if (item.index > last)
                frag.appendChild(document.createTextNode(text.slice(last, item.index)));
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
        if (last < text.length)
            frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "A") {
        Array.from(node.childNodes).forEach(autoLinkText);
    }
}

export function stripAndNormalizePaste(html: string): string {
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
