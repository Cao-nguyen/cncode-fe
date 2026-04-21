import { create } from "zustand";
import type {
    AiTutorSession,
    AiTutorSessionSummary,
    ChatMessage,
} from "@/types/aiTutor.type";

interface AiTutorStore {
    sessions: AiTutorSessionSummary[];
    activeSession: AiTutorSession | null;
    isLoading: boolean;
    isStreaming: boolean;
    streamingText: string;

    setSessions: (sessions: AiTutorSessionSummary[]) => void;
    setActiveSession: (session: AiTutorSession | null) => void;
    appendMessage: (message: ChatMessage) => void;
    setStreamingText: (text: string) => void;
    appendStreamingChar: (char: string) => void;
    finalizeStream: () => void;
    setIsLoading: (v: boolean) => void;
    setIsStreaming: (v: boolean) => void;
    removeSession: (sessionId: string) => void;
    updateSessionTitle: (sessionId: string, title: string) => void;
}

export const useAiTutorStore = create<AiTutorStore>((set, get) => ({
    sessions: [],
    activeSession: null,
    isLoading: false,
    isStreaming: false,
    streamingText: "",

    setSessions: (sessions) => set({ sessions }),
    setActiveSession: (session) => set({ activeSession: session }),
    setIsLoading: (v) => set({ isLoading: v }),
    setIsStreaming: (v) => set({ isStreaming: v }),
    setStreamingText: (text) => set({ streamingText: text }),

    appendMessage: (message) => {
        const session = get().activeSession;
        if (!session) return;
        set({
            activeSession: {
                ...session,
                messages: [...session.messages, message],
            },
        });
    },

    appendStreamingChar: (char) =>
        set((state) => ({ streamingText: state.streamingText + char })),

    finalizeStream: () => {
        const { activeSession, streamingText } = get();
        if (!activeSession) return;
        set({
            activeSession: {
                ...activeSession,
                messages: [...activeSession.messages, { role: "model", content: streamingText }],
            },
            streamingText: "",
            isStreaming: false,
        });
    },

    removeSession: (sessionId) =>
        set((state) => ({
            sessions: state.sessions.filter((s) => s._id !== sessionId),
            activeSession: state.activeSession?._id === sessionId ? null : state.activeSession,
        })),

    updateSessionTitle: (sessionId, title) =>
        set((state) => ({
            sessions: state.sessions.map((s) => (s._id === sessionId ? { ...s, title } : s)),
        })),
}));