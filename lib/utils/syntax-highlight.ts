const TOKEN_COLORS: Record<string, string> = {
    keyword: "#c792ea",
    string: "#c3e88d",
    comment: "#546e7a",
    number: "#f78c6c",
    function: "#82aaff",
    type: "#ffcb6b",
    tag: "#f07178",
    attr: "#ffcb6b",
    plain: "#d4d4d4",
};

export function escapeHTML(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sp(cls: string, txt: string): string {
    return `<span style="color:${TOKEN_COLORS[cls] ?? TOKEN_COLORS["plain"]}">${escapeHTML(txt)}</span>`;
}

export function tokenize(code: string, lang: string): string {
    if (lang === "plain") return escapeHTML(code);

    const rules: Array<[string, RegExp]> = [];
    rules.push(["comment", /\/\/[^\n]*/]);
    rules.push(["comment", /\/\*[\s\S]*?\*\//]);
    rules.push(["comment", /#[^\n]*/]);
    rules.push([
        "string",
        /`[\s\S]*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
    ]);
    rules.push(["number", /\b\d+\.?\d*\b/]);

    if (["javascript", "typescript"].includes(lang)) {
        rules.push([
            "keyword",
            /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|new|this|typeof|void|null|undefined|true|false|try|catch|throw|switch|case|break|continue|of|in|extends)\b/,
        ]);
        rules.push([
            "function",
            /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/,
        ]);
        if (lang === "typescript")
            rules.push([
                "type",
                /\b(string|number|boolean|any|void|never|unknown|Record|Partial|Required|Readonly)\b/,
            ]);
    } else if (lang === "python") {
        rules.push([
            "keyword",
            /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|raise|with|as|pass|break|continue|lambda|yield)\b/,
        ]);
        rules.push([
            "function",
            /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/,
        ]);
    } else if (lang === "sql") {
        rules.push([
            "keyword",
            /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ON|AS|AND|OR|NOT|IN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|DISTINCT|COUNT|SUM|AVG|MAX|MIN)\b/i,
        ]);
    } else if (lang === "css") {
        rules.push(["keyword", /@[\w-]+/]);
        rules.push(["attr", /[\w-]+(?=\s*:)/]);
        rules.push(["number", /\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg)?/]);
    }

    let result = "",
        remaining = code;
    while (remaining.length > 0) {
        let bestMatch: RegExpMatchArray | null = null;
        let bestRule: string | null = null;
        let bestIndex = Infinity;
        for (const [type, re] of rules) {
            const m = remaining.match(re);
            if (m && m.index !== undefined && m.index < bestIndex) {
                bestMatch = m;
                bestRule = type;
                bestIndex = m.index;
            }
        }
        if (bestMatch && bestRule !== null && bestIndex !== Infinity) {
            if (bestIndex > 0) result += escapeHTML(remaining.slice(0, bestIndex));
            result += sp(bestRule, bestMatch[0]);
            remaining = remaining.slice(bestIndex + bestMatch[0].length);
        } else {
            result += escapeHTML(remaining);
            break;
        }
    }
    return result;
}
