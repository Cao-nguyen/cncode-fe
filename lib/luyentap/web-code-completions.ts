import type { Completion } from '@codemirror/autocomplete';
import type { WebEditorFile } from './web-project';

const HTML_COMPLETIONS: Completion[] = [
    { label: 'div', type: 'keyword', apply: '<div>\n  \n</div>', detail: 'Khối div' },
    { label: 'p', type: 'keyword', apply: '<p></p>', detail: 'Đoạn văn' },
    { label: 'h1', type: 'keyword', apply: '<h1></h1>', detail: 'Tiêu đề cấp 1' },
    { label: 'h2', type: 'keyword', apply: '<h2></h2>', detail: 'Tiêu đề cấp 2' },
    { label: 'span', type: 'keyword', apply: '<span></span>', detail: 'Nội dung inline' },
    { label: 'a', type: 'keyword', apply: '<a href=""></a>', detail: 'Liên kết' },
    { label: 'img', type: 'keyword', apply: '<img src="" alt="" />', detail: 'Hình ảnh' },
    { label: 'button', type: 'keyword', apply: '<button></button>', detail: 'Nút bấm' },
    { label: 'ul', type: 'keyword', apply: '<ul>\n  <li></li>\n</ul>', detail: 'Danh sách' },
    { label: 'input', type: 'keyword', apply: '<input type="text" />', detail: 'Ô nhập' },
    { label: 'link', type: 'keyword', apply: '<link rel="stylesheet" href="style.css" />', detail: 'Liên kết CSS' },
    { label: 'script', type: 'keyword', apply: '<script src="script.js"></script>', detail: 'Liên kết JS' },
    { label: 'DOCTYPE', type: 'keyword', apply: '<!DOCTYPE html>', detail: 'Khai báo HTML5' },
];

const CSS_COMPLETIONS: Completion[] = [
    { label: 'color', type: 'property', apply: 'color: ;', detail: 'Màu chữ' },
    { label: 'background-color', type: 'property', apply: 'background-color: ;', detail: 'Màu nền' },
    { label: 'background', type: 'property', apply: 'background: ;', detail: 'Nền' },
    { label: 'margin', type: 'property', apply: 'margin: ;', detail: 'Lề ngoài' },
    { label: 'padding', type: 'property', apply: 'padding: ;', detail: 'Lề trong' },
    { label: 'display', type: 'property', apply: 'display: ;', detail: 'Kiểu hiển thị' },
    { label: 'flex', type: 'property', apply: 'display: flex;', detail: 'Flexbox' },
    { label: 'font-size', type: 'property', apply: 'font-size: ;', detail: 'Cỡ chữ' },
    { label: 'text-align', type: 'property', apply: 'text-align: ;', detail: 'Căn chữ' },
    { label: 'width', type: 'property', apply: 'width: ;', detail: 'Chiều rộng' },
    { label: 'height', type: 'property', apply: 'height: ;', detail: 'Chiều cao' },
    { label: 'border', type: 'property', apply: 'border: ;', detail: 'Viền' },
    { label: 'border-radius', type: 'property', apply: 'border-radius: ;', detail: 'Bo góc' },
];

const JS_COMPLETIONS: Completion[] = [
    { label: 'console.log', type: 'function', apply: 'console.log();', detail: 'In ra console' },
    { label: 'document.querySelector', type: 'function', apply: 'document.querySelector(\'\')', detail: 'Chọn phần tử' },
    { label: 'document.getElementById', type: 'function', apply: 'document.getElementById(\'\')', detail: 'Chọn theo id' },
    { label: 'addEventListener', type: 'function', apply: 'addEventListener(\'click\', () => {\n  \n});', detail: 'Sự kiện' },
    { label: 'function', type: 'keyword', apply: 'function name() {\n  \n}', detail: 'Hàm' },
    { label: 'const', type: 'keyword', apply: 'const  = ;', detail: 'Hằng số' },
    { label: 'let', type: 'keyword', apply: 'let  = ;', detail: 'Biến' },
    { label: 'if', type: 'keyword', apply: 'if () {\n  \n}', detail: 'Điều kiện' },
    { label: 'for', type: 'keyword', apply: 'for (let i = 0; i < length; i++) {\n  \n}', detail: 'Vòng lặp' },
    { label: 'return', type: 'keyword', apply: 'return ;', detail: 'Trả về' },
];

function getCompletionsForFile(file: WebEditorFile): Completion[] {
    if (file === 'index.html') return HTML_COMPLETIONS;
    if (file === 'style.css') return CSS_COMPLETIONS;
    return JS_COMPLETIONS;
}

export function getWebCodeSnippetCompletions(file: WebEditorFile): Completion[] {
    return getCompletionsForFile(file);
}
