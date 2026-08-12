export interface AlgorithmQuestionDisplay {
    /** Tiêu đề + yêu cầu (trước mục đầu vào/đầu ra) */
    intro: string;
    inputDesc?: string;
    outputDesc?: string;
}

const INPUT_SPLIT = /\n\nĐầu vào:\n/i;
const OUTPUT_SPLIT = /\n\nĐầu ra:\n/i;

/** Tách nội dung đề đã gộp khi lưu backend. */
export function parseAlgorithmQuestionDisplay(question: string): AlgorithmQuestionDisplay {
    const text = question.trim();
    if (!text) return { intro: '' };

    const outputParts = text.split(OUTPUT_SPLIT);
    if (outputParts.length >= 2) {
        const outputDesc = outputParts.slice(1).join('\n\nĐầu ra:\n').trim();
        const beforeOutput = outputParts[0];
        const inputParts = beforeOutput.split(INPUT_SPLIT);
        if (inputParts.length >= 2) {
            return {
                intro: inputParts[0].trim(),
                inputDesc: inputParts.slice(1).join('\n\nĐầu vào:\n').trim(),
                outputDesc,
            };
        }
        return { intro: beforeOutput.trim(), outputDesc };
    }

    const inputParts = text.split(INPUT_SPLIT);
    if (inputParts.length >= 2) {
        return {
            intro: inputParts[0].trim(),
            inputDesc: inputParts.slice(1).join('\n\nĐầu vào:\n').trim(),
        };
    }

    return { intro: text };
}
