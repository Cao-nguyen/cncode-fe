"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DocumentUpload } from "iconsax-react";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ImportedQuestion {
    type: "multiple_choice" | "short_answer" | "essay" | "code";
    content: string;
    points: number;
    options?: string[];
    correctIndex?: number;
    shortAnswer?: { correctAnswer: string; hint?: string };
    essay?: { keywords?: string[]; sampleAnswer?: string };
    code?: { starterCode?: string; testCases?: Array<{ input: string; expectedOutput: string; isHidden: boolean }> };
    explanation?: string;
}

interface ImportQuestionsProps {
    onImport: (questions: ImportedQuestion[]) => void;
}

interface ParsingQuestion {
    type?: string;
    content?: string;
    points?: number;
    correctAnswer?: string;
}

export function ImportQuestions({ onImport }: ImportQuestionsProps) {
    const [parsing, setParsing] = useState(false);

    const readPDF = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => "str" in item ? item.str : "").join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    };

    const readDOCX = async (file: File): Promise<string> => {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.default.extractRawText({ arrayBuffer });
        return result.value;
    };

    const readFileContent = async (file: File): Promise<string> => {
        if (file.type.includes("wordprocessingml")) {
            return await readDOCX(file);
        }
        if (file.type === "application/pdf") {
            return await readPDF(file);
        }
        throw new Error("Unsupported file type");
    };

    const parseTextToQuestions = (text: string): ImportedQuestion[] => {
        const questions: ImportedQuestion[] = [];
        const lines = text.split("\n");

        let currentQuestion: ParsingQuestion | null = null;
        let currentOptions: string[] = [];
        let currentTestCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }> = [];
        let explanationLines: string[] = [];
        let isCollectingExplanation = false;

        const pushQuestion = (): void => {
            if (!currentQuestion) return;

            if (currentQuestion.type === "multiple_choice" && currentOptions.length > 0) {
                questions.push({
                    type: "multiple_choice",
                    content: currentQuestion.content || "",
                    points: 1,
                    options: currentOptions,
                    correctIndex: currentOptions.findIndex(opt => opt.startsWith("*")),
                    explanation: explanationLines.join("\n") || undefined,
                });
            } else if (currentQuestion.type === "short_answer") {
                questions.push({
                    type: "short_answer",
                    content: currentQuestion.content || "",
                    points: 2,
                    shortAnswer: { correctAnswer: currentQuestion.correctAnswer || "" },
                    explanation: explanationLines.join("\n") || undefined,
                });
            } else if (currentQuestion.type === "essay") {
                questions.push({
                    type: "essay",
                    content: currentQuestion.content || "",
                    points: 5,
                    explanation: explanationLines.join("\n") || undefined,
                });
            } else if (currentQuestion.type === "code") {
                questions.push({
                    type: "code",
                    content: currentQuestion.content || "",
                    points: 10,
                    code: { testCases: currentTestCases },
                    explanation: explanationLines.join("\n") || undefined,
                });
            }
        };

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const questionMatch = trimmed.match(/^(?:Câu\s*)?(\d+)\.\s*(.+)$/i);
            if (questionMatch && !trimmed.includes("Testcase") && !trimmed.includes("LGCT:")) {
                pushQuestion();
                currentQuestion = { content: questionMatch[2], type: "multiple_choice" };
                currentOptions = [];
                currentTestCases = [];
                explanationLines = [];
                isCollectingExplanation = false;
                continue;
            }

            const optionMatch = trimmed.match(/^([A-E])\.\s+(.+)$/i);
            if (optionMatch && currentQuestion?.type === "multiple_choice") {
                let optText = optionMatch[2];
                const isCorrect = optText.startsWith("*");
                if (isCorrect) optText = optText.substring(1).trim();
                currentOptions.push(isCorrect ? `*${optText}` : optText);
                continue;
            }

            const shortAnswerMatch = trimmed.match(/^=>\s*(.+)$/);
            if (shortAnswerMatch && currentQuestion?.type === "multiple_choice") {
                currentQuestion.type = "short_answer";
                currentQuestion.correctAnswer = shortAnswerMatch[1].trim();
                continue;
            }

            const essayMatch = trimmed.match(/^Trả lời:\s*(.+)$/i);
            if (essayMatch && currentQuestion?.type === "multiple_choice") {
                currentQuestion.type = "essay";
                continue;
            }

            const testcaseMatch = trimmed.match(/^Testcase\s+\d+\s*\((\w+)\):\s*input:\s*(.+?)\s*[-–]\s*output:\s*(.+)$/i);
            if (testcaseMatch && currentQuestion?.type === "multiple_choice") {
                currentQuestion.type = "code";
                currentTestCases.push({
                    input: testcaseMatch[2].trim(),
                    expectedOutput: testcaseMatch[3].trim(),
                    isHidden: testcaseMatch[1].toLowerCase() === "yes",
                });
                continue;
            }

            const simpleTestcase = trimmed.match(/^input:\s*(.+)\s*[-–]\s*output:\s*(.+)$/i);
            if (simpleTestcase && currentQuestion?.type === "multiple_choice") {
                currentQuestion.type = "code";
                currentTestCases.push({
                    input: simpleTestcase[1].trim(),
                    expectedOutput: simpleTestcase[2].trim(),
                    isHidden: false,
                });
                continue;
            }

            const explanationMatch = trimmed.match(/^LGCT:\s*(.+)$/i);
            if (explanationMatch) {
                isCollectingExplanation = true;
                explanationLines.push(explanationMatch[1]);
                continue;
            }

            if (isCollectingExplanation) {
                explanationLines.push(trimmed);
            }
        }

        pushQuestion();
        return questions;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParsing(true);
        try {
            const text = await readFileContent(file);
            const questions = parseTextToQuestions(text);

            if (questions.length === 0) {
                toast.error("Không tìm thấy câu hỏi trong file");
                return;
            }

            onImport(questions);
            toast.success(`Đã import ${questions.length} câu hỏi`);
        } catch (error) {
            console.error("Parse error:", error);
            toast.error("Lỗi khi đọc file");
        } finally {
            setParsing(false);
            e.target.value = "";
        }
    };

    return (
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition">
            <input
                type="file"
                id="import-questions"
                accept=".docx,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={parsing}
            />
            <label
                htmlFor="import-questions"
                className="flex flex-col items-center gap-2 cursor-pointer"
            >
                {parsing ? (
                    <>
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground">Đang đọc file...</span>
                    </>
                ) : (
                    <>
                        <DocumentUpload size={32} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Import câu hỏi từ Word/PDF</span>
                        <span className="text-xs text-muted-foreground">
                            Hỗ trợ định dạng: câu trắc nghiệm (* đáp án đúng), =&gt; (trả lời ngắn),
                            Trả lời: (tự luận), Testcase (code), LGCT: (lời giải)
                        </span>
                    </>
                )}
            </label>
        </div>
    );
}