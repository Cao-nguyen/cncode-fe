/** Nội dung comment có phải HTML (WYSIWYG) không */
export function isHtmlContent(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text.trim());
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
