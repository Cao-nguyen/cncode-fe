'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PollCreatorProps {
    onClose: () => void;
    onSubmit: (poll: { question: string; options: string[]; allowMultiple: boolean }) => void;
}

export function PollCreator({ onClose, onSubmit }: PollCreatorProps) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    console.log('PollCreator rendered');

    const addOption = () => {
        if (options.length < 10) {
            const newIndex = options.length;
            setOptions([...options, '']);
            // Focus on the new input after it's rendered
            setTimeout(() => {
                inputRefs.current[newIndex]?.focus();
            }, 0);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        const validOptions = options.filter(opt => opt.trim());
        if (!question.trim() || validOptions.length < 2) {
            alert('Vui lòng nhập câu hỏi và ít nhất 2 lựa chọn');
            return;
        }
        onSubmit({ question: question.trim(), options: validOptions, allowMultiple });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--cn-text-main)]">Tạo bình chọn</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {/* Question */}
                    <div>
                        <Label htmlFor="question">Câu hỏi *</Label>
                        <Input
                            id="question"
                            placeholder="Nhập câu hỏi bình chọn..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="mt-1"
                            maxLength={200}
                        />
                        <p className="text-xs text-[var(--cn-text-sub)] mt-1">
                            {question.length}/200 ký tự
                        </p>
                    </div>

                    {/* Options */}
                    <div>
                        <Label>Lựa chọn * (tối thiểu 2, tối đa 10)</Label>
                        <div className="space-y-2 mt-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        placeholder={`Lựa chọn ${index + 1}`}
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && index === options.length - 1 && options.length < 10) {
                                                e.preventDefault();
                                                addOption();
                                            }
                                        }}
                                        maxLength={100}
                                    />
                                    {options.length > 2 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOption(index)}
                                            className="flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 10 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                                className="mt-2 w-full gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm lựa chọn
                            </Button>
                        )}
                    </div>

                    {/* Allow Multiple */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="allowMultiple"
                            checked={allowMultiple}
                            onChange={(e) => setAllowMultiple(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[var(--cn-primary)] focus:ring-[var(--cn-primary)]"
                        />
                        <Label htmlFor="allowMultiple" className="cursor-pointer">
                            Cho phép chọn nhiều đáp án
                        </Label>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)]"
                    >
                        Tạo bình chọn
                    </Button>
                </div>
            </div>
        </div>
    );
}