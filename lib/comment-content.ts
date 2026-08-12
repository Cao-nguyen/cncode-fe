/** Nội dung comment có phải HTML (WYSIWYG) không */
export function isHtmlContent(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text.trim());
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
