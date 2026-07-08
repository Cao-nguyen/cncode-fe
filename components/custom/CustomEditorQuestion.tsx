'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  Bold,
  Italic,
  Underline,
  Sigma,
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  Upload,
  Plus,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

interface Question {
  id: number;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswers?: string[];
  score: number;
  explanation?: string;
}

interface FormulaSnippet {
  label: string;
  latex: string;
}

const FORMULA_SNIPPETS: FormulaSnippet[] = [
  { label: 'Phân số', latex: '\\frac{a}{b}' },
  { label: 'Căn bậc hai', latex: '\\sqrt{x}' },
  { label: 'Lũy thừa', latex: 'x^{2}' },
  { label: 'Chỉ số dưới', latex: 'x_{n}' },
  { label: 'Tổng', latex: '\\sum_{i=1}^{n} a_i' },
  { label: 'Tích phân', latex: '\\int_{a}^{b} f(x)\\,dx' },
];

const TYPE_LABEL: Record<QuestionType, string> = {
  'multiple-choice': 'Trắc nghiệm',
  'true-false': 'Đúng / Sai',
  'short-answer': 'Trả lời ngắn',
};

const TYPE_BADGE_CLASS: Record<QuestionType, string> = {
  'multiple-choice': 'bg-blue-100 text-blue-700',
  'true-false': 'bg-teal-100 text-teal-700',
  'short-answer': 'bg-amber-100 text-amber-700',
};

// ============================================================================
// Parsing helpers
// ============================================================================

/** Matches an option line like "A. text", "a) text", or "*B. text" (marked correct). */
const OPTION_RE = /^(\*)?([A-Da-d])[).]\s*(.*)$/;

const extractOption = (
  trimmedLine: string
): { marked: boolean; letter: string; text: string } | null => {
  const m = trimmedLine.match(OPTION_RE);
  if (!m) return null;
  return { marked: !!m[1], letter: m[2], text: m[3] };
};

const parseQuestions = (text: string): Question[] => {
  const lines = text.split('\n');
  const parsed: Question[] = [];

  let current: Question | null = null;
  let currentOptions: string[] = [];
  let currentCorrect: string[] = [];
  let currentContent = '';

  const flush = () => {
    if (!current) return;
    current.content = currentContent.trim();
    if (currentOptions.length > 0) {
      current.options = currentOptions;
      const isTrueFalse = currentOptions.every((opt) => /^[a-d][).]/.test(opt));
      current.type = isTrueFalse ? 'true-false' : 'multiple-choice';
      current.correctAnswers = currentCorrect;
    }
    parsed.push(current);
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const questionMatch = trimmed.match(/^Câu\s*(\d+)\.\s*(.*)/);

    if (questionMatch) {
      flush();
      current = {
        id: parseInt(questionMatch[1], 10),
        type: 'multiple-choice',
        content: '',
        options: [],
        correctAnswers: [],
        score: 1,
        explanation: '',
      };
      currentOptions = [];
      currentCorrect = [];
      currentContent = questionMatch[2] || '';
      return;
    }

    const option = current ? extractOption(trimmed) : null;
    if (current && option) {
      const displayLine = `${option.letter}${trimmed.includes('.') ? '.' : ')'} ${option.text}`;
      currentOptions.push(displayLine);
      if (option.marked) currentCorrect.push(option.letter);
      return;
    }

    if (current && /^\[.*\]/.test(trimmed)) {
      const match = trimmed.match(/^\[(.*?)\]/);
      if (match) {
        current.correctAnswers = [match[1]];
        current.type = 'short-answer';
      }
      return;
    }

    if (current && /^\{LG:/i.test(trimmed)) {
      const match = trimmed.match(/^\{LG:\s*(.*?)\s*\}/i);
      if (match) current.explanation = match[1];
      return;
    }

    if (current) {
      currentContent = currentContent ? `${currentContent}\n${line}` : line;
    }
  });

  flush();
  return parsed;
};

/** Renders **bold**, __underline__, *italic* and $formula$ within a line of text. */
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(__(.+?)__)|(\*(.+?)\*)|(\$(.+?)\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-t-${key++}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      );
    }
    if (match[1]) {
      nodes.push(<strong key={`${keyPrefix}-b-${key++}`}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<u key={`${keyPrefix}-u-${key++}`}>{match[4]}</u>);
    } else if (match[5]) {
      nodes.push(<em key={`${keyPrefix}-i-${key++}`}>{match[6]}</em>);
    } else if (match[7]) {
      let html: string;
      try {
        html = katex.renderToString(match[8], { throwOnError: false, displayMode: false });
      } catch {
        html = match[8];
      }
      nodes.push(
        <span key={`${keyPrefix}-f-${key++}`} dangerouslySetInnerHTML={{ __html: html }} />
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<React.Fragment key={`${keyPrefix}-t-${key++}`}>{text.slice(lastIndex)}</React.Fragment>);
  }
  return nodes;
};

const IMAGE_LINE_RE = /^!\[(.*?)\]\((.*?)\)\s*$/;

const ContentBlock: React.FC<{ content: string; questionId: number }> = React.memo(({ content, questionId }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const imgMatch = line.trim().match(IMAGE_LINE_RE);
        if (imgMatch) {
          return (
            <img
              key={`img-${questionId}-${i}`}
              src={imgMatch[2]}
              alt={imgMatch[1] || 'Hình minh họa'}
              className="max-w-full max-h-64 rounded-lg border border-gray-200 object-contain"
            />
          );
        }
        if (line.trim() === '') return null;
        return (
          <p key={`line-${questionId}-${i}`} className="leading-relaxed">
            {renderInline(line, `c${questionId}-${i}`)}
          </p>
        );
      })}
    </div>
  );
});
ContentBlock.displayName = 'ContentBlock';

// ============================================================================
// Component
// ============================================================================

// Type definitions for mathlive
interface MathfieldElement extends HTMLElement {
  value: string;
  readOnly: boolean;
  mathVirtualKeyboardPolicy?: string;
}

// Math Modal Component
const MathModal: React.FC<{ onClose: () => void; onInsert: (latex: string) => void }> = ({ onClose, onInsert }) => {
  const mathFieldRef = useRef<HTMLDivElement>(null);
  const [mathField, setMathField] = useState<MathfieldElement | null>(null);

  useEffect(() => {
    if (mathFieldRef.current && !mathField) {
      import('mathlive').then((MathLive) => {
        const MathfieldElementClass = MathLive.MathfieldElement as unknown as {
          new(): MathfieldElement;
        };

        const mf = new MathfieldElementClass();
        mf.style.fontSize = '20px';
        mf.style.padding = '12px';
        mf.style.border = '1px solid #d1d5db';
        mf.style.borderRadius = '6px';
        mf.style.minHeight = '60px';
        mf.style.background = '#ffffff';
        mf.mathVirtualKeyboardPolicy = 'manual';

        // Hide virtual keyboard toggle button
        const style = document.createElement('style');
        style.textContent = `
          math-field::part(virtual-keyboard-toggle) {
            display: none !important;
          }
        `;
        document.head.appendChild(style);

        mf.addEventListener('focus', () => {
          if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { show(): void } }).mathVirtualKeyboard) {
            (window as Window & { mathVirtualKeyboard: { show(): void } }).mathVirtualKeyboard.show();
          }
        });

        mathFieldRef.current?.appendChild(mf);
        setMathField(mf);

        // Show keyboard when modal opens
        setTimeout(() => {
          mf.focus();
          if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { show(): void } }).mathVirtualKeyboard) {
            (window as Window & { mathVirtualKeyboard: { show(): void } }).mathVirtualKeyboard.show();
          }
        }, 100);
      }).catch(err => {
        console.error('Failed to load mathlive:', err);
      });
    }

    return () => {
      if (typeof window !== 'undefined' && (window as Window & { mathVirtualKeyboard?: { hide(): void } }).mathVirtualKeyboard) {
        (window as Window & { mathVirtualKeyboard: { hide(): void } }).mathVirtualKeyboard.hide();
      }
    };
  }, [mathField]);

  const handleInsert = () => {
    if (mathField) {
      const latex = mathField.value;
      if (latex && latex.trim()) {
        onInsert(latex.trim());
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl w-[480px] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Chèn công thức toán</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontFamily: "Inter, system-ui, sans-serif" }}>
          Sử dụng bàn phím ảo để nhập công thức toán học
        </div>
        <div ref={mathFieldRef} style={{ marginBottom: 12 }} />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
            Hủy
          </button>
          <button onClick={handleInsert} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Chèn
          </button>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_CODE = `Câu 1. Nhập nội dung câu hỏi ở đây
A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D`;

const CustomEditorQuestion: React.FC<{
  initialContent?: string;
  onContentChange?: (content: string, questions: Question[]) => void;
  saveStatus?: 'unsaved' | 'saving' | 'saved'
}> = ({ initialContent, onContentChange, saveStatus = 'unsaved' }) => {
  const [code, setCode] = useState<string>(initialContent || DEFAULT_CODE);
  const [scoreOverrides, setScoreOverrides] = useState<Record<number, number>>({});
  const [typeOverrides, setTypeOverrides] = useState<Record<number, QuestionType>>({});
  const [showMathModal, setShowMathModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');
  const [imageUrlDraft, setImageUrlDraft] = useState('');
  const [imageAltDraft, setImageAltDraft] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const parsedQuestions = useMemo(() => parseQuestions(code), [code]);

  const renderInlineMemoized = useMemo(() => renderInline, []);

  const questions = useMemo<Question[]>(
    () =>
      parsedQuestions.map((q) => ({
        ...q,
        score: scoreOverrides[q.id] ?? q.score,
        type: typeOverrides[q.id] ?? q.type,
      })),
    [parsedQuestions, scoreOverrides, typeOverrides]
  );

  // Initialize with initial content when it changes
  useEffect(() => {
    if (initialContent && initialContent !== code) {
      setCode(initialContent);
    }
  }, [initialContent]);

  // Notify parent when content changes
  useEffect(() => {
    if (onContentChange) {
      onContentChange(code, questions);
    }
  }, [code, questions, onContentChange]);

  const lineNumbers = useMemo(() => code.split('\n').map((_, i) => i + 1), [code]);

  const stats = useMemo(() => {
    const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    return { count: questions.length, totalScore };
  }, [questions]);

  // --------------------------------------------------------------------
  // Editor text manipulation
  // --------------------------------------------------------------------

  const applyWrap = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = code.slice(start, end) || placeholder;
    const newText = code.slice(0, start) + before + selected + after + code.slice(end);
    setCode(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = code.slice(0, start);
    const after = code.slice(end);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    const insertion = (needsNewline ? '\n' : '') + text + '\n';
    const newText = before + insertion + after;
    setCode(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = before.length + insertion.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 'b') {
      e.preventDefault();
      applyWrap('**', '**', 'in đậm');
    } else if (e.key === 'i') {
      e.preventDefault();
      applyWrap('*', '*', 'in nghiêng');
    } else if (e.key === 'u') {
      e.preventDefault();
      applyWrap('__', '__', 'gạch chân');
    }
  };

  const addQuestionTemplate = (type: QuestionType) => {
    const nextId = questions.length ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    let template = '';
    if (type === 'multiple-choice') {
      template = `Câu ${nextId}. Nội dung câu hỏi\nA. Phương án A\nB. Phương án B\nC. Phương án C\nD. Phương án D`;
    } else if (type === 'true-false') {
      template = `Câu ${nextId}. Nội dung câu hỏi\na. Phát biểu 1\nb. Phát biểu 2\nc. Phát biểu 3\nd. Phát biểu 4`;
    } else {
      template = `Câu ${nextId}. Nội dung câu hỏi\n[Đáp án]`;
    }
    setCode((prev) => `${prev.trim()}\n\n${template}\n`);
  };

  const insertMathFormula = (latex: string) => {
    applyWrap('$', '$', latex);
  };

  // --------------------------------------------------------------------
  // Image insertion
  // --------------------------------------------------------------------

  const confirmInsertImage = (src: string) => {
    if (!src) return;
    insertAtCursor(`![${imageAltDraft || 'Hình ảnh'}](${src})`);
    setShowImageModal(false);
    setImageUrlDraft('');
    setImageAltDraft('');
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') confirmInsertImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --------------------------------------------------------------------
  // Answer correctness (writes '*' markers back into the raw source)
  // --------------------------------------------------------------------

  const markCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    let nextCorrect: string[];

    if (question.type === 'multiple-choice') {
      nextCorrect = [String.fromCharCode(65 + optionIndex)];
    } else {
      const letter = String.fromCharCode(97 + optionIndex);
      const current = question.correctAnswers || [];
      nextCorrect = current.includes(letter)
        ? current.filter((l) => l !== letter)
        : [...current, letter];
    }

    const lines = code.split('\n');
    let questionIndexCounter = -1;
    let optionCounter = -1;
    const newLines = lines.map((line) => {
      const trimmed = line.trim();
      if (/^Câu\s*\d+\./.test(trimmed)) {
        questionIndexCounter++;
        optionCounter = -1;
        return line;
      }
      if (questionIndexCounter !== questionIndex) return line;

      const option = extractOption(trimmed);
      if (option) {
        optionCounter++;
      }
      if (optionCounter !== optionIndex) return line;
      if (!option) return line;

      const shouldMark = nextCorrect.includes(option.letter);
      // Just add or remove the * marker from the original line
      if (shouldMark) {
        return trimmed.startsWith('*') ? line : `*${line}`;
      } else {
        return trimmed.startsWith('*') ? line.slice(1) : line;
      }
    });

    setCode(newLines.join('\n'));
  };

  const changeQuestionType = (id: number, type: QuestionType) => {
    setTypeOverrides((prev) => ({ ...prev, [id]: type }));
  };

  const changeScore = (id: number, score: number) => {
    setScoreOverrides((prev) => ({ ...prev, [id]: score }));
  };

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const container = dividerRef.current?.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setLeftPanelWidth(Math.max(20, Math.min(80, newLeftWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex h-full bg-gray-50 font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left column — question preview, styled like a paper exam sheet */}
      <div
        className="overflow-y-auto border-r border-gray-200"
        style={{
          width: `${leftPanelWidth}%`,
          background:
            'repeating-linear-gradient(white, white 35px, #e5e7eb 36px)',
          backgroundAttachment: 'local',
        }}
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Xem trước đề thi</h2>
            <div className={`w-2 h-2 rounded-full ${saveStatus === 'unsaved' ? 'bg-orange-500' :
                saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                  'bg-green-500'
              }`} title={saveStatus === 'unsaved' ? 'Chưa lưu' : saveStatus === 'saving' ? 'Đang lưu...' : 'Đã lưu'} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              {stats.count} câu
            </span>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              {stats.totalScore} điểm
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5 pb-0">
          {questions.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              Chưa có câu hỏi nào. Hãy bắt đầu soạn ở khung bên phải.
            </div>
          )}

          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-baseline gap-2 text-lg text-gray-900">
                  <span className="font-bold text-blue-600">Câu {q.id}.</span>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_BADGE_CLASS[q.type]}`}>
                  {TYPE_LABEL[q.type]}
                </span>
              </div>

              <div className="text-[15px] text-gray-900 mb-4">
                <ContentBlock content={q.content} questionId={q.id} />
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4 p-2.5 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600">Điểm:</label>
                  <input
                    type="number"
                    value={q.score}
                    onChange={(e) => changeScore(q.id, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 bg-white rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600">Dạng:</label>
                  <select
                    value={q.type}
                    onChange={(e) => changeQuestionType(q.id, e.target.value as QuestionType)}
                    className="px-2 py-1 border border-gray-300 bg-white rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="multiple-choice">Trắc nghiệm</option>
                    <option value="true-false">Đúng sai</option>
                    <option value="short-answer">Trả lời ngắn</option>
                  </select>
                </div>
              </div>

              {q.type !== 'short-answer' && q.options && (
                <div className="space-y-1.5">
                  {q.options.map((opt, optIndex) => {
                    const letter = opt.charAt(0);
                    const isCorrect = q.correctAnswers?.includes(letter);
                    return (
                      <div
                        key={optIndex}
                        onClick={() => markCorrectAnswer(index, optIndex)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-all ${isCorrect
                            ? 'bg-green-50 border-green-300'
                            : 'border-transparent hover:bg-blue-50 hover:border-blue-200'
                          }`}
                      >
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                          {letter.toUpperCase()}
                        </span>
                        <span className="flex-1 text-gray-900">
                          {renderInlineMemoized(opt.slice(opt.indexOf(' ') + 1), `opt-${q.id}-${optIndex}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === 'short-answer' && q.correctAnswers && (
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <span className="font-medium text-gray-600 mr-3">Đáp án:</span>
                  <span className="text-lg font-bold text-blue-600">{q.correctAnswers[0]}</span>
                </div>
              )}

              {q.explanation && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <span className="font-medium text-gray-600 mr-3">Lời giải:</span>
                  <span className="text-gray-900">
                    {renderInlineMemoized(q.explanation, `exp-${q.id}`)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resizable divider */}
      <div
        ref={dividerRef}
        onMouseDown={handleMouseDown}
        className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors ${isResizing ? 'bg-blue-500' : ''
          }`}
        style={{ flex: '0 0 4px' }}
      />

      {/* Right column — source editor */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 relative">
          <ToolbarButton icon={<Bold size={15} />} title="In đậm (Ctrl+B)" onClick={() => applyWrap('**', '**', 'in đậm')} />
          <ToolbarButton icon={<Italic size={15} />} title="In nghiêng (Ctrl+I)" onClick={() => applyWrap('*', '*', 'in nghiêng')} />
          <ToolbarButton icon={<Underline size={15} />} title="Gạch chân (Ctrl+U)" onClick={() => applyWrap('__', '__', 'gạch chân')} />

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarButton icon={<Sigma size={15} />} title="Chèn công thức" onClick={() => setShowMathModal(true)} />

          <ToolbarButton icon={<ImageIcon size={15} />} title="Chèn hình ảnh" onClick={() => setShowImageModal(true)} />

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <button
            type="button"
            onClick={() => addQuestionTemplate('multiple-choice')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus size={13} /> Trắc nghiệm
          </button>
          <button
            type="button"
            onClick={() => addQuestionTemplate('true-false')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus size={13} /> Đúng/Sai
          </button>
          <button
            type="button"
            onClick={() => addQuestionTemplate('short-answer')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus size={13} /> Trả lời ngắn
          </button>
        </div>

        {/* Code editor with line numbers */}
        <div className="flex-1 flex overflow-hidden">
          <div className="bg-gray-100 text-gray-500 py-2.5 px-3 font-mono text-sm leading-[1.6] text-right select-none min-w-[45px] overflow-hidden border-r border-gray-200">
            {lineNumbers.map((num) => (
              <div key={num} className="h-[22.4px] px-1">
                {num}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            className="flex-1 bg-white text-gray-900 font-mono text-sm leading-[1.6] py-2.5 px-4 border-none outline-none resize-none whitespace-pre overflow-auto"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            wrap="off"
            style={{ tabSize: 2, scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #ffffff' }}
          />
        </div>
      </div>

      {/* Math modal */}
      {showMathModal && (
        <MathModal onClose={() => setShowMathModal(false)} onInsert={insertMathFormula} />
      )}

      {/* Image insert modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-[420px] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Chèn hình ảnh</h3>
              <button onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setImageTab('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${imageTab === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
              >
                <LinkIcon size={14} /> Từ URL
              </button>
              <button
                onClick={() => setImageTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${imageTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
              >
                <Upload size={14} /> Tải lên
              </button>
            </div>

            <input
              type="text"
              placeholder="Mô tả ảnh (không bắt buộc)"
              value={imageAltDraft}
              onChange={(e) => setImageAltDraft(e.target.value)}
              className="w-full px-3 py-2 mb-3 border border-gray-300 bg-white rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/30"
            />

            {imageTab === 'url' ? (
              <>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrlDraft}
                  onChange={(e) => setImageUrlDraft(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border border-gray-300 bg-white rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  onClick={() => confirmInsertImage(imageUrlDraft)}
                  disabled={!imageUrlDraft}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Chèn ảnh
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-blue-500 transition-colors">
                <Upload size={22} className="text-gray-500" />
                <span className="text-sm text-gray-500">Chọn file ảnh từ máy tính</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void }> = React.memo(({
  icon,
  title,
  onClick,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors"
  >
    {icon}
  </button>
));
ToolbarButton.displayName = 'ToolbarButton';

export default CustomEditorQuestion;

