export type MessageRole = "user" | "model";

export interface ChatMessage {
    role: MessageRole;
    content: string;
}

export interface AiTutorSession {
    _id: string;
    title: string;
    courseId: string | null;
    lessonId: string | null;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface AiTutorSessionSummary {
    _id: string;
    title: string;
    courseId: string | null;
    lessonId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessagePayload {
    sessionId: string;
    message: string;
    courseContext?: string;
}

export interface CreateSessionPayload {
    courseId?: string;
    lessonId?: string;
    title?: string;
}