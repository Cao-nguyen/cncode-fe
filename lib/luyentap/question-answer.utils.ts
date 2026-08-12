import type { PracticeQuestion } from '@/types/luyentap.type';

export function isQuestionAnswered(question: PracticeQuestion, answer: unknown): boolean {
    if (answer === undefined || answer === null) return false;
    if (question.type === 'code') {
        if (typeof answer === 'string') return answer.trim().length > 0;
        if (answer && typeof answer === 'object' && ('html' in answer || 'css' in answer || 'js' in answer)) {
            const project = answer as { html?: string; css?: string; js?: string };
            return Boolean(
                project.html?.trim() || project.css?.trim() || project.js?.trim(),
            );
        }
        return false;
    }
    if (typeof answer === 'number') return Number.isFinite(answer);
    if (typeof answer === 'string') return answer.trim().length > 0;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === 'object') return Object.keys(answer as object).length > 0;
    return false;
}
