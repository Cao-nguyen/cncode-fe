import { defaultKeymap, history, historyKeymap, indentWithTab, selectAll } from '@codemirror/commands';
import { EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';

/** Theme selection native — không dùng drawSelection (bị nền content che). */
export const ideNativeSelectionTheme = EditorView.theme(
    {
        '.cm-content': {
            caretColor: '#aeafad',
        },
        '.cm-line::selection, .cm-line *::selection, .cm-content ::selection': {
            backgroundColor: '#1a6bb8',
            color: '#ffffff',
        },
        '.cm-activeLine': {
            backgroundColor: '#ffffff0a',
        },
    },
    { dark: true },
);

/** Extension dùng chung cho IDE. */
export function createIdeEditorSetup(options?: { lineNumbers?: boolean; foldGutter?: boolean }) {
    const showLineNumbers = options?.lineNumbers !== false;
    const showFoldGutter = options?.foldGutter !== false;

    return [
        showLineNumbers ? lineNumbers() : [],
        showFoldGutter ? foldGutter() : [],
        highlightActiveLine(),
        highlightActiveLineGutter(),
        EditorState.allowMultipleSelections.of(true),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        ideNativeSelectionTheme,
        EditorView.theme(
            {
                '&': { height: '100%' },
                '.cm-scroller': {
                    height: '100%',
                    overflow: 'auto',
                },
                '.cm-content': {
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                },
                '.cm-line': {
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                },
            },
            { dark: true },
        ),
        EditorView.domEventHandlers({
            mousedown(_event, view) {
                view.focus();
                return false;
            },
        }),
        keymap.of([
            ...defaultKeymap,
            ...closeBracketsKeymap,
            ...historyKeymap,
            indentWithTab,
            { key: 'Mod-a', run: selectAll, preventDefault: true },
        ]),
    ].flat();
}

export const ideEditorCmClassName =
    'h-full [&_.cm-editor]:!h-full [&_.cm-editor]:!bg-[#1e1e1e] [&_.cm-scroller]:!h-full [&_.cm-scroller]:!overflow-auto [&_.cm-scroller]:!bg-[#1e1e1e] [&_.cm-content]:font-mono [&_.cm-gutters]:!bg-[#1e1e1e]';
