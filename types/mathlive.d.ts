// types/mathlive.d.ts
import { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'math-field': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
                ref?: React.Ref<HTMLElement>;
                value?: string;
                onInput?: (e: Event) => void;
                virtualKeyboardMode?: 'manual' | 'auto' | 'onfocus';
            }
        }
    }
}

export { };