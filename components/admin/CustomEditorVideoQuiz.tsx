'use client';

import CustomEditorContest from '@/components/custom/CustomEditorContest';
import type { VideoQuizQuestion } from '@/lib/khoahoc/video-quiz.utils';

type ContestQuestion = {
    id: number;
    type: string;
    content: string;
    options?: string[];
    correctAnswers?: string[];
    score: number;
    explanation?: string;
    time?: number;
    leftItems?: string[];
    rightItems?: string[];
    matchingPairs?: Array<{ left: string; right: string }>;
    codeMode?: 'algorithm' | 'web';
    language?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isSample: boolean }>;
    algoRequirement?: string;
    algoInputDesc?: string;
    algoOutputDesc?: string;
    webRequirements?: unknown[];
};

function toVideoQuizQuestions(questions: ContestQuestion[]): VideoQuizQuestion[] {
    return questions.map((q) => ({
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options,
        correctAnswers: q.correctAnswers,
        score: q.score,
        explanation: q.explanation,
        time: q.time ?? 0,
        leftItems: q.leftItems,
        rightItems: q.rightItems,
        matchingPairs: q.matchingPairs,
        codeMode: q.codeMode,
        language: q.language,
        testCases: q.testCases,
        algoRequirement: q.algoRequirement,
        algoInputDesc: q.algoInputDesc,
        algoOutputDesc: q.algoOutputDesc,
        webRequirements: q.webRequirements,
    }));
}

interface CustomEditorVideoQuizProps {
    initialContent?: string;
    onContentChange?: (content: string, questions: VideoQuizQuestion[]) => void;
    saveStatus?: 'unsaved' | 'saving' | 'saved';
}

export default function CustomEditorVideoQuiz({
    initialContent = '',
    onContentChange,
    saveStatus,
}: CustomEditorVideoQuizProps) {
    return (
        <CustomEditorContest
            variant="video-quiz"
            initialContent={initialContent}
            onContentChange={(content, questions) => {
                onContentChange?.(content, toVideoQuizQuestions(questions as ContestQuestion[]));
            }}
            saveStatus={saveStatus}
        />
    );
}
