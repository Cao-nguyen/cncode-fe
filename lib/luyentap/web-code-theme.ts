import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

/** VS Code Dark+ — xám trung tính, quen mắt. */
export const webIdeEditorTheme = EditorView.theme(
    {
        '&': {
            color: '#d4d4d4',
            backgroundColor: '#1e1e1e',
            fontSize: '15px',
            lineHeight: '1.65',
        },
        '.cm-scroller': {
            lineHeight: '1.65',
            backgroundColor: '#1e1e1e',
        },
        '.cm-content': {
            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
            caretColor: '#aeafad',
            padding: '12px 0',
            userSelect: 'text',
        },
        '.cm-editor': {
            userSelect: 'text',
        },
        '.cm-gutters': {
            backgroundColor: '#1e1e1e',
            color: '#858585',
            border: 'none',
            minWidth: '3.2rem',
        },
        '.cm-activeLineGutter': {
            backgroundColor: '#282828',
            color: '#c6c6c6',
        },
        '.cm-activeLine': {
            backgroundColor: '#ffffff0a',
        },
        '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 10px 0 6px',
        },
        '.cm-cursor': {
            borderLeftColor: '#aeafad',
        },
        '.cm-matchingBracket': {
            backgroundColor: '#0064001a',
            outline: '1px solid #888',
        },
        '.cm-tooltip': {
            backgroundColor: '#252526',
            border: '1px solid #454545',
            color: '#cccccc',
            fontSize: '14px',
        },
        '.cm-tooltip-autocomplete': {
            '& > ul > li[aria-selected]': {
                backgroundColor: '#094771',
                color: '#ffffff',
            },
        },
    },
    { dark: true },
);

export const webIdeSyntaxHighlight = syntaxHighlighting(
    HighlightStyle.define([
        { tag: t.keyword, color: '#569cd6' },
        { tag: [t.name, t.deleted, t.character, t.macroName], color: '#d4d4d4' },
        { tag: [t.propertyName], color: '#9cdcfe' },
        { tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: '#ce9178' },
        { tag: [t.function(t.variableName), t.labelName], color: '#dcdcaa' },
        { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#4fc1ff' },
        { tag: [t.definition(t.name), t.separator], color: '#d4d4d4' },
        { tag: [t.className], color: '#4ec9b0' },
        { tag: [t.number, t.changed, t.annotation, t.modifier, t.self], color: '#b5cea8' },
        { tag: [t.typeName], color: '#4ec9b0' },
        { tag: [t.operator, t.operatorKeyword], color: '#d4d4d4' },
        { tag: [t.url, t.escape, t.regexp, t.link], color: '#d16969' },
        { tag: t.meta, color: '#808080' },
        { tag: [t.comment], color: '#6a9955', fontStyle: 'italic' },
        { tag: t.strong, fontWeight: 'bold' },
        { tag: t.emphasis, fontStyle: 'italic' },
        { tag: t.strikethrough, textDecoration: 'line-through' },
        { tag: t.link, color: '#569cd6', textDecoration: 'underline' },
        { tag: t.heading, fontWeight: 'bold', color: '#569cd6' },
        { tag: [t.atom, t.bool], color: '#569cd6' },
        { tag: [t.tagName], color: '#569cd6' },
        { tag: t.attributeName, color: '#9cdcfe' },
        { tag: t.invalid, color: '#f44747' },
    ]),
);

export const WEB_IDE_COLORS = {
    editorBg: '#1e1e1e',
    panelBg: '#252526',
    tabActiveBg: '#1e1e1e',
    tabInactiveBg: '#2d2d2d',
    border: '#3c3c3c',
    mutedText: '#858585',
    tabActiveText: '#ffffff',
    tabInactiveText: '#969696',
} as const;
