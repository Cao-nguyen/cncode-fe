'use client';

import { useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReminderCreatorProps {
    onClose: () => void;
    onSubmit: (reminder: { title: string; scheduledTime: Date }) => void;
}

export function ReminderCreator({ onClose, onSubmit }: ReminderCreatorProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleSubmit = () => {
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề nhắc hẹn');
            return;
        }

        if (!date || !time) {
            alert('Vui lòng chọn ngày và giờ');
            return;
        }

        // Combine date and time
        const scheduledTime = new Date(`${date}T${time}`);

        // Check if time is in the future
        if (scheduledTime <= new Date()) {
            alert('Thời gian nhắc phải ở tương lai');
            return;
        }

        onSubmit({ title: title.trim(), scheduledTime });
    };

    // Get min date (today) and min time (if today is selected)
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 max-w-md w-full shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--cn-text-main)] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[var(--cn-primary)]" />
                        Tạo nhắc hẹn
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title">Tiêu đề nhắc hẹn *</Label>
                        <Input
                            id="title"
                            placeholder="Ví dụ: Họp team, Deadline dự án..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1"
                            maxLength={100}
                        />
                        <p className="text-xs text-[var(--cn-text-sub)] mt-1">
                            {title.length}/100 ký tự
                        </p>
                    </div>

                    {/* Date */}
                    <div>
                        <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Ngày *
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={today}
                            className="mt-1"
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <Label htmlFor="time" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Giờ *
                        </Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            min={date === today ? currentTime : undefined}
                            className="mt-1"
                        />
                    </div>

                    {/* Preview */}
                    {title && date && time && (
                        <div className="p-3 bg-[var(--cn-primary-light)] rounded-lg border border-[var(--cn-primary)]">
                            <p className="text-sm text-[var(--cn-text-sub)] mb-1">Xem trước:</p>
                            <p className="font-medium text-[var(--cn-text-main)]">{title}</p>
                            <p className="text-sm text-[var(--cn-text-sub)] mt-1">
                                📅 {new Date(`${date}T${time}`).toLocaleString('vi-VN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)]"
                    >
                        Tạo nhắc hẹn
                    </Button>
                </div>
            </div>
        </div>
    );
}