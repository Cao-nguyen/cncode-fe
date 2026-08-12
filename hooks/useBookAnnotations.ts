'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    BookAnnotations,
    HighlightColor,
    PositionNote,
    TextHighlight,
    loadAnnotations,
    saveAnnotations,
} from '@/lib/cnbooks/annotations';

export function useBookAnnotations(slug: string) {
    const [annotations, setAnnotations] = useState<BookAnnotations>({
        highlights: [],
        notes: [],
        currentPage: 0,
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setAnnotations(loadAnnotations(slug));
        setLoaded(true);
    }, [slug]);

    useEffect(() => {
        if (!loaded) return;
        saveAnnotations(slug, annotations);
    }, [slug, annotations, loaded]);

    const setCurrentPage = useCallback((page: number) => {
        setAnnotations((prev) => ({ ...prev, currentPage: page }));
    }, []);

    const addHighlight = useCallback(
        (highlight: Omit<TextHighlight, 'id'>) => {
            const id = `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setAnnotations((prev) => ({
                ...prev,
                highlights: [...prev.highlights, { ...highlight, id }],
            }));
            return id;
        },
        []
    );

    const removeHighlight = useCallback((id: string) => {
        setAnnotations((prev) => ({
            ...prev,
            highlights: prev.highlights.filter((h) => h.id !== id),
        }));
    }, []);

    const addNote = useCallback(
        (note: Omit<PositionNote, 'id' | 'createdAt'>) => {
            const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setAnnotations((prev) => ({
                ...prev,
                notes: [
                    ...prev.notes,
                    { ...note, id, createdAt: Date.now() },
                ],
            }));
            return id;
        },
        []
    );

    const updateNote = useCallback((id: string, text: string) => {
        setAnnotations((prev) => ({
            ...prev,
            notes: prev.notes.map((n) => (n.id === id ? { ...n, text } : n)),
        }));
    }, []);

    const removeNote = useCallback((id: string) => {
        setAnnotations((prev) => ({
            ...prev,
            notes: prev.notes.filter((n) => n.id !== id),
        }));
    }, []);

    const clearAll = useCallback(() => {
        setAnnotations((prev) => ({
            highlights: [],
            notes: [],
            currentPage: prev.currentPage,
        }));
    }, []);

    return {
        loaded,
        highlights: annotations.highlights,
        notes: annotations.notes,
        currentPage: annotations.currentPage,
        setCurrentPage,
        addHighlight,
        removeHighlight,
        addNote,
        updateNote,
        removeNote,
        clearAll,
    };
}

export type { HighlightColor, PositionNote, TextHighlight };
