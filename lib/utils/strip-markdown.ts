

export function stripMarkdown(markdown: string): string {
    if (!markdown) return '';

    let text = markdown;

    
    text = text.replace(/&aacute;/g, 'á');
    text = text.replace(/&agrave;/g, 'à');
    text = text.replace(/&acirc;/g, 'â');
    text = text.replace(/&atilde;/g, 'ã');
    text = text.replace(/&auml;/g, 'ä');
    text = text.replace(/&eacute;/g, 'é');
    text = text.replace(/&egrave;/g, 'è');
    text = text.replace(/&ecirc;/g, 'ê');
    text = text.replace(/&euml;/g, 'ë');
    text = text.replace(/&iacute;/g, 'í');
    text = text.replace(/&igrave;/g, 'ì');
    text = text.replace(/&icirc;/g, 'î');
    text = text.replace(/&iuml;/g, 'ï');
    text = text.replace(/&oacute;/g, 'ó');
    text = text.replace(/&ograve;/g, 'ò');
    text = text.replace(/&ocirc;/g, 'ô');
    text = text.replace(/&otilde;/g, 'õ');
    text = text.replace(/&ouml;/g, 'ö');
    text = text.replace(/&uacute;/g, 'ú');
    text = text.replace(/&ugrave;/g, 'ù');
    text = text.replace(/&ucirc;/g, 'û');
    text = text.replace(/&uuml;/g, 'ü');
    text = text.replace(/&ccedil;/g, 'ç');
    text = text.replace(/&ntilde;/g, 'ñ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');

    
    text = text.replace(/<[^>]+>/g, ' ');

    
    text = text.replace(/```[\s\S]*?```/g, '');

    
    text = text.replace(/`([^`]+)`/g, '$1');

    
    text = text.replace(/^#{1,6}\s+/gm, '');

    
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');

    
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');

    
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

    
    text = text.replace(/^>\s+/gm, '');
    text = text.replace(/^(\s*[-*_]){3,}\s*$/gm, '');
    text = text.replace(/^(\s*[-+*]\s+|\s*\d+\.\s+)/gm, '');
    text = text.replace(/\s+/g, ' ');
    text = text.trim();

    return text;
}