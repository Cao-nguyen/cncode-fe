'use client';

import CustomEditorContest, {
    type TrueFalseScale,
    type ContestQuestion,
} from '@/components/custom/CustomEditorContest';

interface CustomEditorCourseExerciseProps {
    initialContent?: string;
    initialScoreOverrides?: Record<number, number>;
    initialTrueFalseScale?: TrueFalseScale;
    onContentChange?: (content: string, questions: ContestQuestion[]) => void;
    onScoreConfigChange?: (config: {
        scoreOverrides: Record<number, number>;
        trueFalseScale: TrueFalseScale;
    }) => void;
    saveStatus?: 'unsaved' | 'saving' | 'saved';
}

export default function CustomEditorCourseExercise({
    initialContent,
    initialScoreOverrides,
    initialTrueFalseScale,
    onContentChange,
    onScoreConfigChange,
    saveStatus,
}: CustomEditorCourseExerciseProps) {
    return (
        <CustomEditorContest
            compactFrom="lg"
            initialContent={initialContent}
            initialScoreOverrides={initialScoreOverrides}
            initialTrueFalseScale={initialTrueFalseScale}
            onContentChange={onContentChange}
            onScoreConfigChange={onScoreConfigChange}
            saveStatus={saveStatus}
        />
    );
}
