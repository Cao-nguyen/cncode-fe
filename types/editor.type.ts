// Types cho editor components
export type HeadingLevel = "p" | "h1" | "h2" | "h3";
export type ModalMode = "image" | "code" | "math" | "file" | null;
export type ImgAlign = "left" | "center" | "right";

export interface ActiveStates {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    justifyLeft: boolean;
    justifyCenter: boolean;
    justifyRight: boolean;
    justifyFull: boolean;
    superscript: boolean;
    subscript: boolean;
}

export interface EditorStatus {
    words: number;
    chars: number;
    saved: boolean;
}

export interface BaseEditorProps {
    initialValue?: string;
    onImageUpload?: (base64Image: string) => Promise<string>;
    uploading?: boolean;
    height?: string;
}

export interface BaseEditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
}

// Type definitions cho mathlive
export interface MathfieldElement extends HTMLElement {
    value: string;
    readOnly: boolean;
    mathVirtualKeyboardPolicy?: string;
}

declare global {
    interface Window {
        katex?: {
            render: (
                latex: string,
                element: HTMLElement,
                options?: { throwOnError?: boolean; displayMode?: boolean }
            ) => void;
        };
    }
}
