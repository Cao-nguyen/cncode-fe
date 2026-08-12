const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function askBookAi(params: {
    text: string;
    lessonTitle?: string;
    bookTitle?: string;
}): Promise<{ success: boolean; data?: { answer: string }; message?: string }> {
    const response = await fetch(`${API_URL}/api/cnbooks/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Không thể hỏi AI');
    }
    return data;
}
