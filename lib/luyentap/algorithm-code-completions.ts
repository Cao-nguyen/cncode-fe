import type { Completion } from '@codemirror/autocomplete';
import type { CodeLanguage } from '@/types/luyentap.type';

const PYTHON_SNIPPETS: Completion[] = [
    { label: 'print', type: 'function', apply: 'print()', detail: 'In ra màn hình' },
    { label: 'input', type: 'function', apply: 'input()', detail: 'Nhập từ bàn phím' },
    { label: 'for', type: 'keyword', apply: 'for i in range():\n    ', detail: 'Vòng lặp for' },
    { label: 'while', type: 'keyword', apply: 'while :\n    ', detail: 'Vòng lặp while' },
    { label: 'if', type: 'keyword', apply: 'if :\n    ', detail: 'Điều kiện if' },
    { label: 'def', type: 'keyword', apply: 'def name():\n    ', detail: 'Định nghĩa hàm' },
    { label: 'int', type: 'keyword', apply: 'int()', detail: 'Ép kiểu số nguyên' },
    { label: 'list', type: 'keyword', apply: '[]', detail: 'Danh sách' },
];

const JS_SNIPPETS: Completion[] = [
    { label: 'console.log', type: 'function', apply: 'console.log();', detail: 'In ra console' },
    { label: 'for', type: 'keyword', apply: 'for (let i = 0; i < n; i++) {\n    \n}', detail: 'Vòng lặp for' },
    { label: 'while', type: 'keyword', apply: 'while () {\n    \n}', detail: 'Vòng lặp while' },
    { label: 'if', type: 'keyword', apply: 'if () {\n    \n}', detail: 'Điều kiện if' },
    { label: 'function', type: 'keyword', apply: 'function name() {\n    \n}', detail: 'Hàm' },
    { label: 'const', type: 'keyword', apply: 'const  = ;', detail: 'Hằng số' },
    { label: 'let', type: 'keyword', apply: 'let  = ;', detail: 'Biến' },
];

const CPP_SNIPPETS: Completion[] = [
    { label: 'cout', type: 'function', apply: 'cout <<  << endl;', detail: 'In ra' },
    { label: 'cin', type: 'function', apply: 'cin >> ;', detail: 'Nhập' },
    { label: 'for', type: 'keyword', apply: 'for (int i = 0; i < n; i++) {\n    \n}', detail: 'Vòng lặp for' },
    { label: 'while', type: 'keyword', apply: 'while () {\n    \n}', detail: 'Vòng lặp while' },
    { label: 'if', type: 'keyword', apply: 'if () {\n    \n}', detail: 'Điều kiện if' },
    { label: 'include', type: 'keyword', apply: '#include <iostream>\nusing namespace std;', detail: 'Thư viện IO' },
    { label: 'int main', type: 'function', apply: 'int main() {\n    \n    return 0;\n}', detail: 'Hàm main' },
];

const PASCAL_SNIPPETS: Completion[] = [
    { label: 'writeln', type: 'function', apply: 'writeln();', detail: 'In ra' },
    { label: 'readln', type: 'function', apply: 'readln();', detail: 'Nhập' },
    { label: 'for', type: 'keyword', apply: 'for  :=  to  do\nbegin\n    \nend;', detail: 'Vòng lặp for' },
    { label: 'while', type: 'keyword', apply: 'while  do\nbegin\n    \nend;', detail: 'Vòng lặp while' },
    { label: 'if', type: 'keyword', apply: 'if  then\nbegin\n    \nend;', detail: 'Điều kiện if' },
    { label: 'program', type: 'keyword', apply: 'program Main;\nbegin\n    \nend.', detail: 'Khung chương trình' },
];

const CSHARP_SNIPPETS: Completion[] = [
    { label: 'Console.WriteLine', type: 'function', apply: 'Console.WriteLine();', detail: 'In ra' },
    { label: 'for', type: 'keyword', apply: 'for (int i = 0; i < n; i++) {\n    \n}', detail: 'Vòng lặp for' },
    { label: 'while', type: 'keyword', apply: 'while () {\n    \n}', detail: 'Vòng lặp while' },
    { label: 'if', type: 'keyword', apply: 'if () {\n    \n}', detail: 'Điều kiện if' },
];

const SNIPPETS_BY_LANG: Partial<Record<CodeLanguage, Completion[]>> = {
    python: PYTHON_SNIPPETS,
    javascript: JS_SNIPPETS,
    cpp: CPP_SNIPPETS,
    pascal: PASCAL_SNIPPETS,
    csharp: CSHARP_SNIPPETS,
};

export function getAlgorithmSnippetCompletions(language: CodeLanguage): Completion[] {
    return SNIPPETS_BY_LANG[language] || PYTHON_SNIPPETS;
}

export const ALGORITHM_LANGUAGES = [
    { value: 'pascal' as const, label: 'Pascal' },
    { value: 'python' as const, label: 'Python' },
    { value: 'javascript' as const, label: 'JavaScript' },
    { value: 'cpp' as const, label: 'C/C++' },
];
