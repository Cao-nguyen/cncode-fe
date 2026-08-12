'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Highlighter,
    StickyNote,
    X,
    Trash2,
    Bookmark,
    List,
    Code,
    HelpCircle,
    Bot,
} from 'lucide-react';
import { BookContent, BookLesson } from '@/lib/data/cnbooks.data';
import { paginateContent, HIGHLIGHT_COLORS, HighlightColor } from '@/lib/cnbooks/annotations';
import { useBookAnnotations } from '@/hooks/useBookAnnotations';
import { BookPageContent, getSelectionInContent, getReadModeSelection } from '@/components/cnbooks/BookPageContent';
import { BookFlipPage } from '@/components/cnbooks/BookFlipPage';
import { BookAskAiModal } from '@/components/cnbooks/BookAskAiModal';
import { askBookAi } from '@/lib/api/cnbooks-reader.api';

type FlipState =
    | { mode: 'spread'; direction: 'next' | 'prev'; toSpread: number }
    | { mode: 'single'; direction: 'next' | 'prev'; toPage: number };

type ReaderMode = 'read' | 'highlight' | 'note';

interface BookReaderProps {
    lesson: BookLesson;
    bookTitle: string;
    onBack: () => void;
    onPrevLesson?: () => void;
    onNextLesson?: () => void;
    onOpenExercises?: () => void;
    onOpenQuiz?: () => void;
}

interface HighlightPopup {
    x: number;
    y: number;
    contentIndex: number;
    start: number;
    end: number;
    text: string;
}

interface NoteEditor {
    pageIndex: number;
    xPercent: number;
    yPercent: number;
    noteId?: string;
    text: string;
}

interface ReadSelectionPopup {
    x: number;
    y: number;
    text: string;
}

function getContentIndexForPage(
    pages: BookContent[][],
    pageIndex: number
): number {
    let index = 0;
    for (let i = 0; i < pageIndex; i++) {
        index += pages[i]?.length ?? 0;
    }
    return index;
}

export function BookReader({
    lesson,
    bookTitle,
    onBack,
    onPrevLesson,
    onNextLesson,
    onOpenExercises,
    onOpenQuiz,
}: BookReaderProps) {
    const contentPages = useMemo(
        () => paginateContent(lesson.content, 5),
        [lesson.content]
    );

    const {
        loaded,
        highlights,
        notes,
        currentPage,
        setCurrentPage,
        addHighlight,
        removeHighlight,
        addNote,
        updateNote,
        removeNote,
        clearAll,
    } = useBookAnnotations(lesson.slug);

    const [mode, setMode] = useState<ReaderMode>('read');
    const [highlightPopup, setHighlightPopup] = useState<HighlightPopup | null>(null);
    const [readSelection, setReadSelection] = useState<ReadSelectionPopup | null>(null);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiAnswer, setAiAnswer] = useState('');
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiSelectedText, setAiSelectedText] = useState('');
    const [noteEditor, setNoteEditor] = useState<NoteEditor | null>(null);
    const [showToc, setShowToc] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [flip, setFlip] = useState<FlipState | null>(null);

    const leftPageRef = useRef<HTMLDivElement>(null);
    const rightPageRef = useRef<HTMLDivElement>(null);
    const mobilePageRef = useRef<HTMLDivElement>(null);

    const isFlipping = flip !== null;

    const spreadIndex = Math.floor(currentPage / 2);
    const leftPageIndex = spreadIndex * 2;
    const rightPageIndex = leftPageIndex + 1;
    const totalPages = contentPages.length;
    const totalSpreads = Math.ceil(totalPages / 2);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const goToSpread = useCallback(
        (spread: number, instant = false) => {
            const clamped = Math.max(0, Math.min(spread, totalSpreads - 1));
            if (instant) {
                setFlip(null);
                setCurrentPage(clamped * 2);
                return;
            }
            if (isFlipping || clamped === spreadIndex) return;
            const direction = clamped > spreadIndex ? 'next' : 'prev';
            setFlip({ mode: 'spread', direction, toSpread: clamped });
        },
        [totalSpreads, setCurrentPage, spreadIndex, isFlipping]
    );

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (isFlipping) return;
            if (e.key === 'ArrowRight') {
                if (isMobile) {
                    if (currentPage < totalPages - 1) {
                        setFlip({ mode: 'single', direction: 'next', toPage: currentPage + 1 });
                    }
                } else if (spreadIndex < totalSpreads - 1) {
                    setFlip({ mode: 'spread', direction: 'next', toSpread: spreadIndex + 1 });
                }
            }
            if (e.key === 'ArrowLeft') {
                if (isMobile) {
                    if (currentPage > 0) {
                        setFlip({ mode: 'single', direction: 'prev', toPage: currentPage - 1 });
                    }
                } else if (spreadIndex > 0) {
                    setFlip({ mode: 'spread', direction: 'prev', toSpread: spreadIndex - 1 });
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        isFlipping,
        isMobile,
        currentPage,
        spreadIndex,
        totalPages,
        totalSpreads,
    ]);

    const completeFlip = useCallback(() => {
        if (!flip) return;
        if (flip.mode === 'single') {
            setCurrentPage(flip.toPage);
        } else {
            setCurrentPage(flip.toSpread * 2);
        }
        setFlip(null);
    }, [flip, setCurrentPage]);

    const prevPage = () => {
        if (isFlipping) return;
        if (isMobile) {
            if (currentPage <= 0) return;
            setFlip({ mode: 'single', direction: 'prev', toPage: currentPage - 1 });
        } else {
            if (spreadIndex <= 0) return;
            setFlip({ mode: 'spread', direction: 'prev', toSpread: spreadIndex - 1 });
        }
    };

    const nextPage = () => {
        if (isFlipping) return;
        if (isMobile) {
            if (currentPage >= totalPages - 1) return;
            setFlip({ mode: 'single', direction: 'next', toPage: currentPage + 1 });
        } else {
            if (spreadIndex >= totalSpreads - 1) return;
            setFlip({ mode: 'spread', direction: 'next', toSpread: spreadIndex + 1 });
        }
    };

    const handleTextSelection = useCallback(
        (container: HTMLElement | null) => {
            if (!container) return;

            setTimeout(() => {
                if (mode === 'highlight') {
                    const result = getSelectionInContent(container);
                    if (!result) {
                        setHighlightPopup(null);
                        return;
                    }

                    const sel = window.getSelection();
                    if (!sel || sel.rangeCount === 0) return;
                    const rect = sel.getRangeAt(0).getBoundingClientRect();

                    setReadSelection(null);
                    setHighlightPopup({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        ...result,
                    });
                    return;
                }

                if (mode === 'read') {
                    const result = getReadModeSelection(container);
                    if (!result) {
                        setReadSelection(null);
                        return;
                    }
                    setHighlightPopup(null);
                    setReadSelection(result);
                }
            }, 10);
        },
        [mode]
    );

    const openAskAi = async (text: string) => {
        setAiSelectedText(text);
        setAiModalOpen(true);
        setAiLoading(true);
        setAiAnswer('');
        setAiError(null);
        setReadSelection(null);
        window.getSelection()?.removeAllRanges();

        try {
            const res = await askBookAi({
                text,
                lessonTitle: lesson.title,
                bookTitle,
            });
            setAiAnswer(res.data?.answer ?? '');
        } catch (err) {
            setAiError(err instanceof Error ? err.message : 'Không thể hỏi AI');
        } finally {
            setAiLoading(false);
        }
    };

    const closeAiModal = () => {
        setAiModalOpen(false);
        setAiLoading(false);
        setAiAnswer('');
        setAiError(null);
        setAiSelectedText('');
    };

    useEffect(() => {
        const dismiss = () => setReadSelection(null);
        window.addEventListener('scroll', dismiss, true);
        return () => window.removeEventListener('scroll', dismiss, true);
    }, []);

    const handleHighlightColor = (color: HighlightColor) => {
        if (!highlightPopup) return;

        const overlapping = highlights.some(
            (h) =>
                h.contentIndex === highlightPopup.contentIndex &&
                !(h.end <= highlightPopup.start || h.start >= highlightPopup.end)
        );
        if (!overlapping) {
            addHighlight({
                contentIndex: highlightPopup.contentIndex,
                start: highlightPopup.start,
                end: highlightPopup.end,
                text: highlightPopup.text,
                color,
            });
        }

        window.getSelection()?.removeAllRanges();
        setHighlightPopup(null);
    };

    const handlePageClick = (
        e: React.MouseEvent<HTMLDivElement>,
        pageIndex: number,
        pageRef: React.RefObject<HTMLDivElement | null>
    ) => {
        if (mode !== 'note' || !pageRef.current) return;
        if ((e.target as HTMLElement).closest('[data-note-marker]')) return;

        const rect = pageRef.current.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        setNoteEditor({
            pageIndex,
            xPercent: Math.max(5, Math.min(85, xPercent)),
            yPercent: Math.max(5, Math.min(85, yPercent)),
            text: '',
        });
    };

    const saveNote = () => {
        if (!noteEditor || !noteEditor.text.trim()) return;

        if (noteEditor.noteId) {
            updateNote(noteEditor.noteId, noteEditor.text.trim());
        } else {
            addNote({
                pageIndex: noteEditor.pageIndex,
                xPercent: noteEditor.xPercent,
                yPercent: noteEditor.yPercent,
                text: noteEditor.text.trim(),
            });
        }
        setNoteEditor(null);
    };

    const renderPage = (
        pageIndex: number,
        pageRef?: React.RefObject<HTMLDivElement | null>,
        interactive = true
    ) => {
        if (pageIndex >= totalPages || pageIndex < 0) {
            return (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm italic">
                    Trang trống
                </div>
            );
        }

        const pageNotes = notes.filter((n) => n.pageIndex === pageIndex);

        return (
            <div
                ref={pageRef}
                className={`relative h-full overflow-hidden px-8 py-10 md:px-10 md:py-12 ${
                    interactive && mode === 'note' ? 'cursor-crosshair' : ''
                }`}
                onClick={
                    interactive && pageRef
                        ? (e) => handlePageClick(e, pageIndex, pageRef)
                        : undefined
                }
                onMouseUp={
                    interactive && pageRef
                        ? () => handleTextSelection(pageRef.current)
                        : undefined
                }
            >
                {/* Paper texture lines */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 27px, #e5e7eb 28px)',
                    }}
                />

                <BookPageContent
                    items={contentPages[pageIndex]}
                    startContentIndex={getContentIndexForPage(contentPages, pageIndex)}
                    highlights={highlights}
                    selectable={mode === 'highlight' || mode === 'read'}
                />

                {pageNotes.map((note) => (
                    <div
                        key={note.id}
                        data-note-marker
                        className="absolute z-20 max-w-[160px] group"
                        style={{
                            left: `${note.xPercent}%`,
                            top: `${note.yPercent}%`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rotate-45 shadow-sm" />
                            <div className="bg-yellow-100 border border-yellow-300 shadow-md rounded-sm p-2 pt-3">
                                <p className="text-[11px] leading-snug text-gray-800 line-clamp-4">
                                    {note.text}
                                </p>
                                {mode === 'note' && (
                                    <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() =>
                                                setNoteEditor({
                                                    pageIndex: note.pageIndex,
                                                    xPercent: note.xPercent,
                                                    yPercent: note.yPercent,
                                                    noteId: note.id,
                                                    text: note.text,
                                                })
                                            }
                                            className="text-[10px] text-blue-600 hover:underline"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => removeNote(note.id)}
                                            className="text-[10px] text-red-600 hover:underline"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="absolute bottom-4 left-0 right-0 text-center text-[11px] text-gray-400">
                    {pageIndex + 1}
                </div>
            </div>
        );
    };

    if (!loaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <BookOpen className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
        );
    }

    const displayLeft = isMobile ? currentPage : leftPageIndex;
    const displayRight = isMobile ? -1 : rightPageIndex;

    const spreadFlipPages = flip?.mode === 'spread' ? (() => {
        const from = spreadIndex;
        const to = flip.toSpread;
        if (flip.direction === 'next') {
            return {
                staticLeft: from * 2,
                staticRight: null as number | null,
                underRight: to * 2,
                underLeft: null as number | null,
                flipFront: from * 2 + 1,
                flipBack: to * 2,
            };
        }
        return {
            staticLeft: null as number | null,
            staticRight: from * 2 + 1,
            underRight: null as number | null,
            underLeft: to * 2 + 1,
            flipFront: from * 2,
            flipBack: to * 2 + 1,
        };
    })() : null;

    const singleFlipPages =
        flip?.mode === 'single'
            ? {
                  under: flip.toPage,
                  front: flip.direction === 'next' ? flip.toPage - 1 : flip.toPage + 1,
                  back: flip.toPage,
              }
            : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top bar */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="min-w-0">
                            <p className="text-[11px] text-blue-600 uppercase tracking-widest truncate font-medium">
                                {bookTitle}
                            </p>
                            <h1 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                                {lesson.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <span className="hidden sm:inline text-xs text-gray-400 mr-2">
                            Trang {Math.min(displayLeft + 1, totalPages)}
                            {!isMobile && displayRight < totalPages
                                ? `–${displayRight + 1}`
                                : ''}{' '}
                            / {totalPages}
                        </span>
                        {onPrevLesson && (
                            <button
                                onClick={onPrevLesson}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                title="Bài trước"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        )}
                        {onNextLesson && (
                            <button
                                onClick={onNextLesson}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                title="Bài sau"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Book */}
            <main className="flex-1 flex items-center justify-center px-3 py-6 md:py-10">
                <div className="relative w-full max-w-5xl">
                    {/* Book shadow */}
                    <div className="absolute -inset-4 bg-gray-200/40 blur-2xl rounded-3xl" />

                    <div
                        className="relative flex rounded-lg overflow-hidden shadow-lg border border-gray-200"
                        style={{
                            perspective: '2000px',
                            minHeight: isMobile ? '520px' : '580px',
                        }}
                    >
                        {/* Left cover edge */}
                        <div className="hidden md:block w-2 bg-gradient-to-r from-blue-600 to-blue-500 shrink-0" />

                        {/* Left page */}
                        <div
                            className={`flex-1 bg-white relative ${
                                !isMobile ? 'border-r border-gray-100' : ''
                            }`}
                            style={{
                                backgroundImage:
                                    'linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 4%)',
                            }}
                        >
                            {isMobile ? (
                                <div className="relative h-full" style={{ perspective: '1600px' }}>
                                    {flip?.mode === 'single' && singleFlipPages ? (
                                        <>
                                            <div className="absolute inset-0">
                                                {renderPage(singleFlipPages.under, undefined, false)}
                                            </div>
                                            <BookFlipPage
                                                direction={flip.direction}
                                                front={renderPage(singleFlipPages.front, undefined, false)}
                                                back={renderPage(singleFlipPages.back, undefined, false)}
                                                onComplete={completeFlip}
                                            />
                                        </>
                                    ) : (
                                        renderPage(displayLeft, mobilePageRef)
                                    )}
                                </div>
                            ) : flip?.mode === 'spread' && spreadFlipPages ? (
                                <div className="relative h-full" style={{ perspective: '1600px' }}>
                                    {flip.direction === 'prev' ? (
                                        <>
                                            <div className="absolute inset-0">
                                                {renderPage(
                                                    spreadFlipPages.underLeft!,
                                                    undefined,
                                                    false
                                                )}
                                            </div>
                                            <BookFlipPage
                                                direction="prev"
                                                front={renderPage(
                                                    spreadFlipPages.flipFront,
                                                    undefined,
                                                    false
                                                )}
                                                back={renderPage(
                                                    spreadFlipPages.flipBack,
                                                    undefined,
                                                    false
                                                )}
                                                onComplete={completeFlip}
                                            />
                                        </>
                                    ) : (
                                        renderPage(spreadFlipPages.staticLeft!, leftPageRef, !isFlipping)
                                    )}
                                </div>
                            ) : (
                                renderPage(displayLeft, leftPageRef)
                            )}
                        </div>

                        {/* Spine */}
                        {!isMobile && (
                            <div
                                className="w-6 shrink-0 relative bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"
                                style={{
                                    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.06)',
                                }}
                            />
                        )}

                        {/* Right page */}
                        {!isMobile && (
                            <div
                                className="flex-1 bg-white relative"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to left, rgba(0,0,0,0.02) 0%, transparent 4%)',
                                }}
                            >
                                {flip?.mode === 'spread' && spreadFlipPages ? (
                                    <div className="relative h-full" style={{ perspective: '1600px' }}>
                                        {flip.direction === 'next' ? (
                                            <>
                                                <div className="absolute inset-0">
                                                    {renderPage(
                                                        spreadFlipPages.underRight!,
                                                        undefined,
                                                        false
                                                    )}
                                                </div>
                                                <BookFlipPage
                                                    direction="next"
                                                    front={renderPage(
                                                        spreadFlipPages.flipFront,
                                                        undefined,
                                                        false
                                                    )}
                                                    back={renderPage(
                                                        spreadFlipPages.flipBack,
                                                        undefined,
                                                        false
                                                    )}
                                                    onComplete={completeFlip}
                                                />
                                            </>
                                        ) : (
                                            renderPage(
                                                spreadFlipPages.staticRight!,
                                                rightPageRef,
                                                !isFlipping
                                            )
                                        )}
                                    </div>
                                ) : (
                                    renderPage(displayRight, rightPageRef)
                                )}
                            </div>
                        )}

                        {/* Right cover edge */}
                        <div className="hidden md:block w-2 bg-gradient-to-l from-blue-600 to-blue-500 shrink-0" />
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            onClick={prevPage}
                            disabled={
                                isFlipping ||
                                (isMobile ? currentPage <= 0 : spreadIndex <= 0)
                            }
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Trang trước
                        </button>
                        <button
                            onClick={nextPage}
                            disabled={
                                isFlipping ||
                                (isMobile
                                    ? currentPage >= totalPages - 1
                                    : spreadIndex >= totalSpreads - 1)
                            }
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                        >
                            Trang sau
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>

            {/* Read mode — Ask AI popup */}
            {readSelection && mode === 'read' && (
                <div
                    className="fixed z-[100] -translate-x-1/2 -translate-y-full"
                    style={{ left: readSelection.x, top: readSelection.y }}
                >
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => openAskAi(readSelection.text)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full shadow-lg transition-colors"
                    >
                        <Bot className="w-4 h-4" />
                        Hỏi AI
                    </button>
                </div>
            )}

            <BookAskAiModal
                open={aiModalOpen}
                selectedText={aiSelectedText}
                answer={aiAnswer}
                loading={aiLoading}
                error={aiError}
                onClose={closeAiModal}
            />

            {/* Highlight color popup */}
            {highlightPopup && (
                <div
                    className="fixed z-[100] -translate-x-1/2 -translate-y-full"
                    style={{ left: highlightPopup.x, top: highlightPopup.y }}
                >
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex gap-1.5">
                        {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
                            <button
                                key={color}
                                onClick={() => handleHighlightColor(color)}
                                className="w-7 h-7 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform"
                                style={{ backgroundColor: HIGHLIGHT_COLORS[color].bg }}
                                title={HIGHLIGHT_COLORS[color].label}
                            />
                        ))}
                        <button
                            onClick={() => {
                                window.getSelection()?.removeAllRanges();
                                setHighlightPopup(null);
                            }}
                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                            <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    </div>
                </div>
            )}

            {/* Note editor popup */}
            {noteEditor && (
                <div
                    className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-yellow-300 p-4 w-72"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <StickyNote className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-gray-800">
                            {noteEditor.noteId ? 'Sửa ghi chú' : 'Thêm ghi chú'}
                        </span>
                    </div>
                    <textarea
                        value={noteEditor.text}
                        onChange={(e) =>
                            setNoteEditor({ ...noteEditor, text: e.target.value })
                        }
                        placeholder="Viết ghi chú..."
                        className="w-full h-24 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={saveNote}
                            className="flex-1 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
                        >
                            Lưu
                        </button>
                        <button
                            onClick={() => setNoteEditor(null)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom toolbar */}
            <footer className="sticky bottom-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-center gap-2 flex-wrap">
                    <ToolbarBtn
                        active={mode === 'read'}
                        onClick={() => {
                            setMode('read');
                            setHighlightPopup(null);
                            setReadSelection(null);
                        }}
                        icon={<BookOpen className="w-4 h-4" />}
                        label="Đọc"
                    />
                    <ToolbarBtn
                        active={mode === 'highlight'}
                        onClick={() => {
                            setMode('highlight');
                            setNoteEditor(null);
                            setReadSelection(null);
                        }}
                        icon={<Highlighter className="w-4 h-4" />}
                        label="Highlight"
                    />
                    <ToolbarBtn
                        active={mode === 'note'}
                        onClick={() => {
                            setMode('note');
                            setHighlightPopup(null);
                            setReadSelection(null);
                        }}
                        icon={<StickyNote className="w-4 h-4" />}
                        label="Ghi chú"
                    />

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {onOpenExercises && (
                        <ToolbarBtn
                            onClick={onOpenExercises}
                            icon={<Code className="w-4 h-4" />}
                            label="Bài tập"
                        />
                    )}
                    {onOpenQuiz && (
                        <ToolbarBtn
                            onClick={onOpenQuiz}
                            icon={<HelpCircle className="w-4 h-4" />}
                            label="Quiz"
                        />
                    )}

                    <ToolbarBtn
                        onClick={() => setShowToc(!showToc)}
                        icon={<List className="w-4 h-4" />}
                        label="Mục lục"
                        active={showToc}
                    />

                    {(highlights.length > 0 || notes.length > 0) && (
                        <ToolbarBtn
                            onClick={() => {
                                if (confirm('Xóa tất cả highlight và ghi chú?')) clearAll();
                            }}
                            icon={<Trash2 className="w-4 h-4" />}
                            label="Xóa"
                            danger
                        />
                    )}
                </div>

                {mode === 'read' && (
                    <p className="text-center text-[11px] text-gray-400 pb-2">
                        Bôi chọn văn bản → bấm Hỏi AI
                    </p>
                )}
                {mode === 'highlight' && (
                    <p className="text-center text-[11px] text-gray-400 pb-2">
                        Bôi đen văn bản → chọn màu highlight
                    </p>
                )}
                {mode === 'note' && (
                    <p className="text-center text-[11px] text-gray-400 pb-2">
                        Click vào trang sách để đặt ghi chú
                    </p>
                )}
            </footer>

            {/* Annotations sidebar / TOC overlay */}
            {showToc && (
                <div
                    className="fixed inset-0 z-[90] bg-black/20"
                    onClick={() => setShowToc(false)}
                >
                    <div
                        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-gray-200 overflow-y-auto shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-blue-500" />
                                Ghi chú & Highlight
                            </h3>
                            <button
                                onClick={() => setShowToc(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {highlights.length > 0 && (
                                <section>
                                    <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">
                                        Highlight ({highlights.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {highlights.map((hl) => (
                                            <div
                                                key={hl.id}
                                                className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 group"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-sm shrink-0 mt-0.5"
                                                    style={{
                                                        backgroundColor:
                                                            HIGHLIGHT_COLORS[hl.color].bg,
                                                    }}
                                                />
                                                <p className="text-xs text-gray-600 flex-1 line-clamp-2">
                                                    &ldquo;{hl.text}&rdquo;
                                                </p>
                                                <button
                                                    onClick={() => removeHighlight(hl.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {notes.length > 0 && (
                                <section>
                                    <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">
                                        Ghi chú ({notes.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {notes.map((note) => (
                                            <div
                                                key={note.id}
                                                className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 group"
                                            >
                                                <p className="text-xs text-gray-700">
                                                    {note.text}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] text-gray-400">
                                                        Trang {note.pageIndex + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            goToSpread(
                                                                Math.floor(note.pageIndex / 2),
                                                                true
                                                            );
                                                            setShowToc(false);
                                                        }}
                                                        className="text-[10px] text-blue-600 hover:underline"
                                                    >
                                                        Xem
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {highlights.length === 0 && notes.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-8">
                                    Chưa có ghi chú hay highlight nào.
                                    <br />
                                    Dùng công cụ bên dưới để thêm.
                                </p>
                            )}

                            {lesson.keyTakeaways.length > 0 && (
                                <section>
                                    <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">
                                        Điểm chính
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {lesson.keyTakeaways.map((t, i) => (
                                            <li
                                                key={i}
                                                className="text-xs text-gray-500 flex gap-2"
                                            >
                                                <span className="text-blue-500">•</span>
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ToolbarBtn({
    active,
    onClick,
    icon,
    label,
    danger,
}: {
    active?: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                active
                    ? 'bg-blue-600 text-white'
                    : danger
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
