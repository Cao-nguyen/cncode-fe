/** Nội dung comment có phải HTML (WYSIWYG) không */
export function isHtmlContent(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text.trim());
}

/** Convert markdown sang HTML đơn giản */
export function markdownToHtml(markdown: string): string {
    if (!markdown?.trim()) return markdown;

    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/-(.*?)-/g, '<em>$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Lists (simple)
        .replace(/^\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>')
        .replace(/^-\s+(.*$)/gim, '<ul><li>$1</li></ul>');

    // Fix list tags (join consecutive list items)
    html = html.replace(/<\/ol>\s*<ol>/g, '')
        .replace(/<\/ul>\s*<ul>/g, '');

    return html;
}

/** Loại bỏ đoạn `<p>` trống / chỉ có `<br>` do TipTap thêm cuối HTML */
export function sanitizeCommentHtml(html: string): string {
    if (!html?.trim()) return html;

    let cleaned = html
        .replace(/<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\u00a0|\s)*<\/p>/gi, '')
        .replace(/<p[^>]*>\s*<\/p>/gi, '')
        .trim();

    // TipTap đôi khi để lại `<p><br class="ProseMirror-trailingBreak"></p>` ở cuối
    while (/<p[^>]*>\s*(?:<br[^>]*>\s*)*<\/p>\s*$/i.test(cleaned)) {
        cleaned = cleaned.replace(/<p[^>]*>\s*(?:<br[^>]*>\s*)*<\/p>\s*$/i, '').trim();
    }

    return cleaned;
}

/** Comment rỗng (HTML hoặc plain text) */
export function isCommentContentEmpty(content: string): boolean {
    if (!content?.trim()) return true;
    if (isHtmlContent(content)) {
        const text = content
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();
        return !text;
    }
    return !content.trim();
}
