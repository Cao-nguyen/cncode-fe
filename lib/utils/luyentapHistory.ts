// Utility để lưu trữ lịch sử làm bài luyện tập trong localStorage

const LUYENTAP_HISTORY_KEY = 'luyentap_history';

export interface LuyentapHistoryItem {
    id: string; // ID bài tập
    exerciseId: string;
    exerciseTitle: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    timestamp: string;
    answers: LuyentapAnswer[];
    passed: boolean;
    coinsEarned?: number;
}

export interface LuyentapAnswer {
    questionId: string;
    questionContent: string;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    questionType: string;
}

// Get history from localStorage
export function getHistory(): LuyentapHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(LUYENTAP_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading history:', e);
        return [];
    }
}

// Save history to localStorage
export function saveHistory(history: LuyentapHistoryItem[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LUYENTAP_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Error saving history:', e);
    }
}

// Add new history item
export function addHistoryItem(item: LuyentapHistoryItem): void {
    const history = getHistory();
    // Add to beginning (most recent first)
    history.unshift(item);
    saveHistory(history);
}

// Get history item by exercise ID
export function getHistoryByExerciseId(exerciseId: string): LuyentapHistoryItem[] {
    const history = getHistory();
    return history.filter(item => item.exerciseId === exerciseId);
}

// Clear all history
export function clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(LUYENTAP_HISTORY_KEY);
    } catch (e) {
        console.error('Error clearing history:', e);
    }
}