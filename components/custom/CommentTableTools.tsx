'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Columns3, Rows3, X } from 'lucide-react';

const GRID_SIZE = 6;
const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

function TableMenuButton({
    label,
    onClick,
    disabled,
    danger,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors disabled:opacity-40 whitespace-nowrap ${
                danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );
}

export function CommentTableBubbleMenu({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    return (
        <BubbleMenu
            editor={editor}
            appendTo={() => document.body}
            shouldShow={({ editor: ed }) => ed.isActive('table')}
            className="comment-table-bubble flex flex-wrap items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-1.5 py-1 z-[9990]"
        >
            <TableMenuButton
                label="+ Hàng trên"
                onClick={() => editor.chain().focus().addRowBefore().run()}
            />
            <TableMenuButton
                label="+ Hàng dưới"
                onClick={() => editor.chain().focus().addRowAfter().run()}
            />
            <TableMenuButton
                label="+ Cột trái"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
            />
            <TableMenuButton
                label="+ Cột phải"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
            />
            <span className="w-px h-4 bg-gray-200 mx-0.5" />
            <TableMenuButton
                label="− Hàng"
                onClick={() => editor.chain().focus().deleteRow().run()}
            />
            <TableMenuButton
                label="− Cột"
                onClick={() => editor.chain().focus().deleteColumn().run()}
            />
            <TableMenuButton
                label="Header"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            />
            <TableMenuButton
                label="Xóa bảng"
                danger
                onClick={() => editor.chain().focus().deleteTable().run()}
            />
        </BubbleMenu>
    );
}

export function CommentTableBar({ editor }: { editor: Editor | null }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!editor) return;

        const update = () => setVisible(editor.isActive('table'));
        update();
        editor.on('selectionUpdate', update);
        editor.on('transaction', update);
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', update);
        };
    }, [editor]);

    if (!editor || !visible) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-indigo-100 bg-indigo-50/70">
            <Rows3 size={13} className="text-indigo-500 shrink-0" />
            <TableMenuButton label="Thêm hàng" onClick={() => editor.chain().focus().addRowAfter().run()} />
            <TableMenuButton label="Thêm cột" onClick={() => editor.chain().focus().addColumnAfter().run()} />
            <TableMenuButton label="Xóa hàng" onClick={() => editor.chain().focus().deleteRow().run()} />
            <TableMenuButton label="Xóa cột" onClick={() => editor.chain().focus().deleteColumn().run()} />
            <TableMenuButton label="Hàng tiêu đề" onClick={() => editor.chain().focus().toggleHeaderRow().run()} />
            <TableMenuButton
                label="Xóa bảng"
                danger
                onClick={() => editor.chain().focus().deleteTable().run()}
            />
        </div>
    );
}

export function CommentTableInsertPicker({
    open,
    anchorRef,
    onClose,
    onInsert,
    inline = false,
}: {
    open: boolean;
    anchorRef?: React.RefObject<HTMLElement | null>;
    onClose: () => void;
    onInsert: (rows: number, cols: number) => void;
    inline?: boolean;
}) {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [hover, setHover] = useState({ rows: DEFAULT_ROWS, cols: DEFAULT_COLS });

    useEffect(() => {
        if (!open) {
            setHover({ rows: DEFAULT_ROWS, cols: DEFAULT_COLS });
        }
    }, [open]);

    useEffect(() => {
        if (!open || inline) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                pickerRef.current &&
                !pickerRef.current.contains(target) &&
                anchorRef?.current &&
                !anchorRef.current.contains(target)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, inline, anchorRef, onClose]);

    if (!open) return null;

    const panel = (
        <>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Columns3 size={13} className="text-indigo-500" />
                    Chọn kích thước bảng
                </div>
                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                    <X size={14} />
                </button>
            </div>

            <div
                className="grid gap-0.5 mb-2"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
                    const row = Math.floor(index / GRID_SIZE) + 1;
                    const col = (index % GRID_SIZE) + 1;
                    const active = row <= hover.rows && col <= hover.cols;

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`h-5 w-5 rounded-sm border transition-colors ${
                                active
                                    ? 'bg-indigo-400 border-indigo-500'
                                    : 'bg-gray-50 border-gray-200 hover:border-indigo-200'
                            }`}
                            onMouseEnter={() => setHover({ rows: row, cols: col })}
                            onClick={() => {
                                onInsert(row, col);
                                onClose();
                            }}
                        />
                    );
                })}
            </div>

            <p className="text-[11px] text-gray-500 text-center mb-2">
                {hover.rows} hàng × {hover.cols} cột (hàng đầu là tiêu đề)
            </p>

            <button
                type="button"
                onClick={() => {
                    onInsert(DEFAULT_ROWS, DEFAULT_COLS);
                    onClose();
                }}
                className="w-full py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
                Chèn bảng {DEFAULT_ROWS}×{DEFAULT_COLS}
            </button>
        </>
    );

    if (inline) {
        return (
            <div ref={pickerRef} className="px-3 py-3 border-b border-indigo-100 bg-indigo-50/40">
                {panel}
            </div>
        );
    }

    const rect = anchorRef?.current?.getBoundingClientRect();
    const style: React.CSSProperties = rect
        ? {
            position: 'fixed',
            top: Math.max(8, rect.top - 8),
            left: rect.left,
            transform: 'translateY(-100%)',
            zIndex: 9999,
        }
        : { display: 'none' };

    return (
        <div
            ref={pickerRef}
            style={style}
            className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[180px]"
        >
            {panel}
        </div>
    );
}

export function insertCommentTable(editor: Editor, bodyRows: number, cols: number) {
    const rowCount = Math.max(2, bodyRows + 1);
    const colCount = Math.max(1, cols);

    const inserted = editor
        .chain()
        .focus()
        .insertTable({
            rows: rowCount,
            cols: colCount,
            withHeaderRow: true,
        })
        .run();

    if (!inserted) {
        editor
            .chain()
            .focus('end')
            .insertTable({
                rows: rowCount,
                cols: colCount,
                withHeaderRow: true,
            })
            .run();
    }

    requestAnimationFrame(() => {
        const tableEl = editor.view.dom.querySelector('.tableWrapper');
        tableEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
}

export const COMMENT_TABLE_STYLES = `
    .ProseMirror.comment-wysiwyg .tableWrapper,
    .comment-wysiwyg .tableWrapper {
        display: block;
        overflow-x: auto;
        margin: 0.5em 0;
        max-width: 100%;
    }
    .ProseMirror.comment-wysiwyg table,
    .comment-wysiwyg table {
        border-collapse: collapse;
        width: 100%;
        min-width: 260px;
        margin: 0;
        font-size: 13px;
        table-layout: fixed;
        font-family: Inter, system-ui, sans-serif;
        border: 1px solid #d1d5db;
        background: #fff;
    }
    .ProseMirror.comment-wysiwyg th,
    .ProseMirror.comment-wysiwyg td,
    .comment-wysiwyg th,
    .comment-wysiwyg td {
        border: 1px solid #d1d5db !important;
        padding: 8px 10px;
        vertical-align: top;
        position: relative;
        min-width: 72px;
        min-height: 36px;
        word-break: break-word;
        box-sizing: border-box;
    }
    .ProseMirror.comment-wysiwyg th,
    .comment-wysiwyg th {
        background: #f1f5f9;
        font-weight: 600;
        color: #374151;
    }
    .ProseMirror.comment-wysiwyg td,
    .comment-wysiwyg td {
        background: #fff;
        color: #111827;
    }
    .ProseMirror.comment-wysiwyg td p,
    .ProseMirror.comment-wysiwyg th p,
    .comment-wysiwyg td p,
    .comment-wysiwyg th p {
        margin: 0;
        min-height: 1.25em;
    }
    .ProseMirror.comment-wysiwyg .selectedCell:after,
    .comment-wysiwyg .selectedCell:after {
        background: rgba(99, 102, 241, 0.12);
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        position: absolute;
        z-index: 2;
    }
    .ProseMirror.comment-wysiwyg .column-resize-handle,
    .comment-wysiwyg .column-resize-handle {
        background-color: #6366f1;
        bottom: -2px;
        pointer-events: none;
        position: absolute;
        right: -2px;
        top: 0;
        width: 4px;
    }
    .ProseMirror.comment-wysiwyg.resize-cursor,
    .comment-wysiwyg.resize-cursor {
        cursor: col-resize;
    }
`;
