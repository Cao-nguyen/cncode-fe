export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface TextHighlight {
    id: string;
    contentIndex: number;
    start: number;
    end: number;
    text: string;
    color: HighlightColor;
}

export interface PositionNote {
    id: string;
    pageIndex: number;
    xPercent: number;
    yPercent: number;
    text: string;
    createdAt: number;
}

export interface BookAnnotations {
    highlights: TextHighlight[];
    notes: PositionNote[];
    currentPage: number;
}

export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; label: string }> = {
    yellow: { bg: 'rgba(250, 204, 21, 0.45)', label: 'Vàng' },
    green: { bg: 'rgba(74, 222, 128, 0.4)', label: 'Xanh lá' },
    blue: { bg: 'rgba(96, 165, 250, 0.4)', label: 'Xanh dương' },
    pink: { bg: 'rgba(244, 114, 182, 0.4)', label: 'Hồng' },
};

const STORAGE_PREFIX = 'cnbooks-annotations';

export function getStorageKey(slug: string) {
    return `${STORAGE_PREFIX}:${slug}`;
}

export function loadAnnotations(slug: string): BookAnnotations {
    if (typeof window === 'undefined') {
        return { highlights: [], notes: [], currentPage: 0 };
    }
    try {
        const raw = localStorage.getItem(getStorageKey(slug));
        if (!raw) return { highlights: [], notes: [], currentPage: 0 };
        const parsed = JSON.parse(raw) as BookAnnotations;
        return {
            highlights: parsed.highlights ?? [],
            notes: parsed.notes ?? [],
            currentPage: parsed.currentPage ?? 0,
        };
    } catch {
        return { highlights: [], notes: [], currentPage: 0 };
    }
}

export function saveAnnotations(slug: string, data: BookAnnotations) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getStorageKey(slug), JSON.stringify(data));
}

export function paginateContent<T>(items: T[], blocksPerPage = 5): T[][] {
    const pages: T[][] = [];
    let current: T[] = [];
    let weight = 0;

    for (const item of items) {
        const type = (item as { type?: string }).type;
        const itemWeight =
            type === 'code' ? 3 : type === 'heading' ? 1.5 : type === 'note' ? 1.2 : 1;

        if (weight + itemWeight > blocksPerPage && current.length > 0) {
            pages.push(current);
            current = [];
            weight = 0;
        }
        current.push(item);
        weight += itemWeight;
    }

    if (current.length > 0) pages.push(current);
    return pages.length > 0 ? pages : [[]];
}
