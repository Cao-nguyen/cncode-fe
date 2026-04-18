"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { DocumentUpload, CloseCircle, DocumentText } from "iconsax-react";
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

interface FileInfo {
    name: string;
    size: number;
    type: string;
}

export function ImportQuestions({ onImport }: ImportQuestionsProps) {
    const [parsing, setParsing] = useState<boolean>(false);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const readPDF = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str || "")
                .join(" ");
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
        if (file.type === "application/pdf") {
            return await readPDF(file);
        }
        if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            return await readDOCX(file);
        }
        throw new Error("Chỉ hỗ trợ file .pdf hoặc .docx");
    };

    const parseTextToQuestions = (text: string): ImportedQuestion[] => {
        const questions: ImportedQuestion[] = [];
        const lines = text.split("\n");

        let i = 0;
        const total = lines.length;

        while (i < total) {
            const line = lines[i].trim();

            // Tìm câu hỏi: C1. , C2. , Câu 1. , 1.
            const qMatch = line.match(/^(?:C(?:âu)?\s*)?(\d+)[\.\)]\s*(.+)$/i);

            if (qMatch) {
                const content = qMatch[2];
                let type: ImportedQuestion["type"] = "multiple_choice";
                const options: string[] = [];
                let correctAnswer = "";
                const testCases: [] = [];
                let explanation = "";
                let isCollectingExplanation = false;

                i++;

                // Thu thập các dòng tiếp theo
                while (i < total) {
                    const currentLine = lines[i].trim();

                    // Nếu gặp câu mới thì dừng
                    if (currentLine.match(/^(?:C(?:âu)?\s*)?\d+[\.\)]/i)) {
                        break;
                    }

                    // Đáp án trắc nghiệm: A. ... hoặc *A. ...
                    const optMatch = currentLine.match(/^([A-E])\.\s+(.+)$/i);
                    if (optMatch && type === "multiple_choice") {
                        options.push(optMatch[2]);
                        i++;
                        continue;
                    }

                    // Trả lời ngắn: => ...
                    const shortMatch = currentLine.match(/^=>\s*(.+)$/);
                    if (shortMatch) {
                        type = "short_answer";
                        correctAnswer = shortMatch[1];
                        i++;
                        continue;
                    }

                    // Tự luận: Trả lời:
                    const essayMatch = currentLine.match(/^Trả lời:/i);
                    if (essayMatch) {
                        type = "essay";
                        i++;
                        continue;
                    }

                    // Test case: TC1: input -> output hoặc Testcase 1: input -> output
                    const tcMatch = currentLine.match(/^(?:Testcase|TC)\s*\d+\s*:?\s*input:\s*(.+?)\s*[-–>]\s*output:\s*(.+)$/i);
                    if (tcMatch) {
                        type = "code";
                        testCases.push({
                            input: tcMatch[1].trim(),
                            expectedOutput: tcMatch[2].trim(),
                            isHidden: false,
                        });
                        i++;
                        continue;
                    }

                    // Lời giải: LGCT:
                    const lgctMatch = currentLine.match(/^LGCT:\s*(.+)$/i);
                    if (lgctMatch) {
                        isCollectingExplanation = true;
                        explanation = lgctMatch[1];
                        i++;
                        // Thu thập thêm các dòng LGCT tiếp
                        while (i < total) {
                            const nextLine = lines[i].trim();
                            if (nextLine.match(/^(?:C(?:âu)?\s*)?\d+[\.\)]/i)) break;
                            if (nextLine && !nextLine.match(/^[A-E]\./i) && !nextLine.match(/^=>/) && !nextLine.match(/^Trả lời:/i) && !nextLine.match(/^(?:Testcase|TC)/i)) {
                                explanation += "\n" + nextLine;
                            }
                            i++;
                        }
                        continue;
                    }

                    i++;
                }

                // Xử lý câu hỏi trắc nghiệm
                if (type === "multiple_choice" && options.length > 0) {
                    let correctIndex = -1;
                    const cleanOptions = options.map((opt, idx) => {
                        if (opt.startsWith("*")) {
                            correctIndex = idx;
                            return opt.substring(1).trim();
                        }
                        return opt;
                    });

                    questions.push({
                        type: "multiple_choice",
                        content: content,
                        points: 1,
                        options: cleanOptions,
                        correctIndex: correctIndex === -1 ? 0 : correctIndex,
                        explanation: explanation || undefined,
                    });
                }
                // Xử lý câu trả lời ngắn
                else if (type === "short_answer") {
                    questions.push({
                        type: "short_answer",
                        content: content,
                        points: 2,
                        shortAnswer: { correctAnswer: correctAnswer },
                        explanation: explanation || undefined,
                    });
                }
                // Xử lý câu tự luận
                else if (type === "essay") {
                    questions.push({
                        type: "essay",
                        content: content,
                        points: 5,
                        explanation: explanation || undefined,
                    });
                }
                // Xử lý câu lập trình
                else if (type === "code") {
                    questions.push({
                        type: "code",
                        content: content,
                        points: 10,
                        code: { testCases: testCases },
                        explanation: explanation || undefined,
                    });
                }

                continue;
            }

            i++;
        }

        return questions;
    };

    const processFile = async (file: File): Promise<void> => {
        if (!file) return;

        const validTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Chỉ hỗ trợ file .pdf hoặc .docx");
            return;
        }

        setParsing(true);
        setSelectedFile({
            name: file.name,
            size: file.size,
            type: file.type,
        });

        try {
            const text = await readFileContent(file);
            const questions = parseTextToQuestions(text);

            if (questions.length === 0) {
                toast.error("Không tìm thấy câu hỏi trong file");
                return;
            }

            // Debug
            console.log("Imported questions:", questions.map(q => ({
                content: q.content?.substring(0, 50),
                options: q.options,
                correctIndex: q.correctIndex,
                type: q.type
            })));

            onImport(questions);
            toast.success(`✅ Đã import ${questions.length} câu hỏi`);
            setSelectedFile(null);
        } catch (error) {
            console.error("Parse error:", error);
            toast.error("Lỗi khi đọc file");
        } finally {
            setParsing(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            processFile(files[0]);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        e.target.value = "";
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="w-full">
            <div
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                    ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/20"}
                    ${parsing ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={parsing}
                />

                {parsing ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-foreground">Đang đọc file...</p>
                    </div>
                ) : selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                        <DocumentText size={24} className="text-emerald-500" />
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="absolute top-2 right-2"
                        >
                            <CloseCircle size={16} className="text-muted-foreground" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <DocumentUpload size={28} className="text-primary" />
                        <p className="text-sm font-medium text-foreground">
                            Kéo thả file hoặc <span className="text-primary">chọn file</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Hỗ trợ: .docx, .pdf</p>
                    </div>
                )}
            </div>

            <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                    📄 <span className="font-medium">Định dạng mẫu:</span>
                </p>
                <pre className="mt-2 text-xs bg-background p-2 rounded overflow-x-auto">
                    {`C1. Nội dung câu hỏi?
A. Đáp án A
*B. Đáp án B (đúng)
C. Đáp án C
D. Đáp án D

LGCT: Lời giải chi tiết

C2. Câu trả lời ngắn?
=> Đáp án

C3. Câu tự luận?
Trả lời:

C4. Viết hàm tính tổng?
TC1: input: 1 2 -> output: 3
TC2: input: 5 7 -> output: 12`}
                </pre>
            </div>
        </div>
    );
}