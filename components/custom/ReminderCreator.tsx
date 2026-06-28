'use client';

import { useState, useMemo } from 'react';
import { X, Clock, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReminderCreatorProps {
    onClose: () => void;
    onSubmit: (reminder: { title: string; scheduledTime: Date }) => void;
}

export function ReminderCreator({ onClose, onSubmit }: ReminderCreatorProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');

    const now = new Date();

    // Calculate days in month based on selected month and year
    const daysInMonth = useMemo(() => {
        const m = month ? parseInt(month) : 0;
        const y = year ? parseInt(year) : now.getFullYear();
        if (m === 0) return 31;
        return new Date(y, m, 0).getDate();
    }, [month, year, now]);

    const handleSubmit = () => {
        if (!title.trim()) {
            alert('Vui lòng nhập tên sự kiện');
            return;
        }

        if (!day || !month || !year || !hour || minute === '') {
            alert('Vui lòng nhập đầy đủ ngày, tháng, năm, giờ và phút');
            return;
        }

        const parsedDay = parseInt(day);
        const parsedMonth = parseInt(month);
        const parsedYear = parseInt(year);
        const parsedHour = parseInt(hour);
        const parsedMinute = parseInt(minute);

        if (parsedDay < 1 || parsedDay > daysInMonth) {
            alert(`Ngày phải từ 1 đến ${daysInMonth}`);
            return;
        }
        if (parsedMonth < 1 || parsedMonth > 12) {
            alert('Tháng phải từ 1 đến 12');
            return;
        }
        if (parsedHour < 0 || parsedHour > 23) {
            alert('Giờ phải từ 0 đến 23');
            return;
        }
        if (parsedMinute < 0 || parsedMinute > 59) {
            alert('Phút phải từ 0 đến 59');
            return;
        }

        const scheduledTime = new Date(parsedYear, parsedMonth - 1, parsedDay, parsedHour, parsedMinute);

        if (scheduledTime <= now) {
            alert('Thời gian diễn ra sự kiện phải ở tương lai');
            return;
        }

        onSubmit({ title: title.trim(), scheduledTime });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 max-w-[548px] w-full shadow-xl max-h-[90vh] overflow-y-auto min-h-[550px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--cn-text-main)] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[var(--cn-primary)]" />
                        Tạo sự kiện
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {/* Event Name */}
                    <div>
                        <Label htmlFor="title" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Tên sự kiện *
                        </Label>
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

                    {/* Event Description */}
                    <div>
                        <Label htmlFor="description" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Mô tả sự kiện
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả chi tiết về sự kiện..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1"
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-[var(--cn-text-sub)] mt-1">
                            {description.length}/500 ký tự
                        </p>
                    </div>

                    {/* Date: Day - Month - Year */}
                    <div>
                        <Label className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4" />
                            Ngày - Tháng - Năm *
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Input
                                    type="number"
                                    min={1}
                                    max={daysInMonth}
                                    placeholder={`Ngày (1-${daysInMonth})`}
                                    value={day}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= daysInMonth)) {
                                            setDay(val);
                                        }
                                    }}
                                    className="mt-0"
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min={1}
                                    max={12}
                                    placeholder="Tháng (1-12)"
                                    value={month}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                                            setMonth(val);
                                            setDay('');
                                        }
                                    }}
                                    className="mt-0"
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min={now.getFullYear()}
                                    max={now.getFullYear() + 5}
                                    placeholder={`Năm (${now.getFullYear()})`}
                                    value={year}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= now.getFullYear() && parseInt(val) <= now.getFullYear() + 5)) {
                                            setYear(val);
                                        }
                                    }}
                                    className="mt-0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Time: Hour - Minute */}
                    <div>
                        <Label className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4" />
                            Giờ - Phút *
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Input
                                    type="number"
                                    min={0}
                                    max={23}
                                    placeholder="Giờ (0-23)"
                                    value={hour}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
                                            setHour(val);
                                        }
                                    }}
                                    className="mt-0"
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min={0}
                                    max={59}
                                    step={5}
                                    placeholder="Phút (0-59)"
                                    value={minute}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                                            setMinute(val);
                                        }
                                    }}
                                    className="mt-0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {title && day && month && year && hour && minute !== '' && (
                        <div className="p-3 bg-[var(--cn-primary-light)] rounded-lg border border-[var(--cn-primary)]">
                            <p className="text-sm text-[var(--cn-text-sub)] mb-1">Xem trước:</p>
                            <p className="font-medium text-[var(--cn-text-main)]">{title}</p>
                            {description && (
                                <p className="text-sm text-[var(--cn-text-sub)] mt-1">{description}</p>
                            )}
                            <p className="text-sm text-[var(--cn-text-sub)] mt-1">
                                📅 {new Date(
                                    parseInt(year),
                                    parseInt(month) - 1,
                                    parseInt(day),
                                    parseInt(hour),
                                    parseInt(minute)
                                ).toLocaleString('vi-VN', {
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

                <div className="flex gap-3 justify-end mt-6 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)]"
                    >
                        Tạo sự kiện
                    </Button>
                </div>
            </div>
        </div>
    );
}