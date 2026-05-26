// app/quanly/cnbooks/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cnbookApi } from '@/lib/api/cnbook.api';
import { uploadApi } from '@/lib/upload';
import { Book, Section, Lesson, Exercise } from '@/types/cnbook.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomBadge } from '@/components/custom/CustomBadge';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';
import {
    ArrowLeft, Plus, Trash2, Edit2, Save, X,
    ChevronDown, ChevronRight, BookOpen, Upload,
    FileText, List, Layers, HelpCircle
} from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';

const CATEGORY_OPTIONS = [
    { value: 'grade10', label: 'Tin học 10' },
    { value: 'grade11', label: 'Tin học 11' },
    { value: 'grade12', label: 'Tin học 12' },
    { value: 'other', label: 'Khác' }
];

const EXERCISE_TYPE_OPTIONS = [
    { value: 'multiple_choice', label: 'Trắc nghiệm (4 đáp án)' },
    { value: 'true_false', label: 'Đúng/Sai' },
    { value: 'short_answer', label: 'Trả lời ngắn (tối đa 4 ký tự)' }
];

// Modal components
const SectionModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    const [title, setTitle] = useState(initialData?.title || '');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tên phần');
            return;
        }
        onSave({ title: title.trim() });
        setTitle('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{initialData ? 'Sửa phần' : 'Thêm phần mới'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5">
                    <CustomInput label="Tên phần" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên phần..." required />
                </div>
                <div className="flex justify-end gap-3 p-5 pt-0">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSave}>{initialData ? 'Cập nhật' : 'Thêm'}</CustomButton>
                </div>
            </div>
        </div>
    );
};

const LessonModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    const [title, setTitle] = useState(initialData?.title || '');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tên bài học');
            return;
        }
        onSave({ title: title.trim() });
        setTitle('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{initialData ? 'Sửa bài học' : 'Thêm bài học mới'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5">
                    <CustomInput label="Tên bài học" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên bài học..." required />
                </div>
                <div className="flex justify-end gap-3 p-5 pt-0">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSave}>{initialData ? 'Cập nhật' : 'Thêm'}</CustomButton>
                </div>
            </div>
        </div>
    );
};

const LessonContentModal = ({ isOpen, onClose, onSave, initialContent }: any) => {
    const editorRef = useRef<CustomEditorRef>(null);

    useEffect(() => {
        if (isOpen && editorRef.current && initialContent) {
            setTimeout(() => editorRef.current?.setContent(initialContent), 100);
        }
    }, [isOpen, initialContent]);

    if (!isOpen) return null;

    const handleSave = () => {
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung bài học');
            return;
        }
        onSave(content);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Soạn nội dung bài học</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5">
                    <CustomEditor ref={editorRef} />
                </div>
                <div className="flex justify-end gap-3 p-5 pt-0 border-t border-gray-200">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSave}>Lưu nội dung</CustomButton>
                </div>
            </div>
        </div>
    );
};

const ExerciseModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    const [type, setType] = useState(initialData?.type || 'multiple_choice');
    const [question, setQuestion] = useState(initialData?.question || '');
    const [options, setOptions] = useState<string[]>(initialData?.options || ['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState<any>(initialData?.correctAnswer || 0);
    const [explanation, setExplanation] = useState(initialData?.explanation || '');
    const [points, setPoints] = useState(initialData?.points || 1);

    useEffect(() => {
        if (isOpen) {
            setType(initialData?.type || 'multiple_choice');
            setQuestion(initialData?.question || '');
            setOptions(initialData?.options || ['', '', '', '']);
            setCorrectAnswer(initialData?.correctAnswer || 0);
            setExplanation(initialData?.explanation || '');
            setPoints(initialData?.points || 1);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!question.trim()) {
            toast.error('Vui lòng nhập câu hỏi');
            return;
        }

        const exerciseData: any = {
            type,
            question: question.trim(),
            correctAnswer,
            explanation: explanation.trim(),
            points
        };

        if (type === 'multiple_choice') {
            if (options.some(opt => !opt.trim())) {
                toast.error('Vui lòng nhập đầy đủ 4 đáp án');
                return;
            }
            exerciseData.options = options;
        }

        if (type === 'short_answer') {
            const answerStr = String(correctAnswer).trim();
            if (answerStr.length === 0 || answerStr.length > 4) {
                toast.error('Đáp án không được quá 4 ký tự');
                return;
            }
            exerciseData.correctAnswer = answerStr;
        }

        onSave(exerciseData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{initialData ? 'Sửa bài tập' : 'Thêm bài tập mới'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <CustomSelect label="Loại bài tập" options={EXERCISE_TYPE_OPTIONS} value={type} onChange={setType} />
                    <CustomInput label="Câu hỏi" value={question} onChange={(e) => setQuestion(e.target.value)} textarea rows={2} required />

                    {type === 'multiple_choice' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Đáp án</label>
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <input type="radio" name="correctAnswer" checked={correctAnswer === idx} onChange={() => setCorrectAnswer(idx)} className="w-4 h-4" />
                                    <CustomInput value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts); }} placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    {type === 'true_false' && (
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2"><input type="radio" name="trueFalse" checked={correctAnswer === true} onChange={() => setCorrectAnswer(true)} /> Đúng</label>
                            <label className="flex items-center gap-2"><input type="radio" name="trueFalse" checked={correctAnswer === false} onChange={() => setCorrectAnswer(false)} /> Sai</label>
                        </div>
                    )}

                    {type === 'short_answer' && (
                        <CustomInput label="Đáp án (tối đa 4 ký tự)" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} maxLength={4} />
                    )}

                    <CustomInput label="Giải thích (không bắt buộc)" value={explanation} onChange={(e) => setExplanation(e.target.value)} textarea rows={2} />
                    <CustomInput label="Điểm" type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value) || 1)} />
                </div>
                <div className="flex justify-end gap-3 p-5 pt-0 border-t border-gray-200">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSave}>{initialData ? 'Cập nhật' : 'Thêm'}</CustomButton>
                </div>
            </div>
        </div>
    );
};

const ExerciseCard = ({ exercise, index, onEdit, onDelete }: any) => {
    const [expanded, setExpanded] = useState(false);

    const getTypeLabel = () => {
        switch (exercise.type) {
            case 'multiple_choice': return 'Trắc nghiệm';
            case 'true_false': return 'Đúng/Sai';
            case 'short_answer': return 'Trả lời ngắn';
            default: return 'Bài tập';
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">{index + 1}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{getTypeLabel()}</span>
                    <span className="text-xs text-yellow-600">{exercise.points} điểm</span>
                    <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
                        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(exercise)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Sửa"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(exercise._id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            {expanded && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-700 mb-2">{exercise.question}</p>
                    {exercise.options && (
                        <div className="space-y-1 mb-2 text-xs text-gray-500">
                            {exercise.options.map((opt: string, idx: number) => (
                                <div key={idx}><span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {opt}</div>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-green-600">Đáp án: {exercise.type === 'multiple_choice' ? String.fromCharCode(65 + exercise.correctAnswer) : exercise.correctAnswer}</div>
                    {exercise.explanation && <div className="text-xs text-gray-500 mt-1">{exercise.explanation}</div>}
                </div>
            )}
        </div>
    );
};

const LessonEditor = ({ lesson, onUpdate, onDelete, onAddExercise, onEditExercise, onDeleteExercise }: any) => {
    const [expanded, setExpanded] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                    <button onClick={() => setExpanded(!expanded)} className="text-gray-500">{expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
                    <span className="font-medium text-gray-800">{lesson.title}</span>
                    {lesson.content && <span className="text-xs text-green-600">✓ Đã có nội dung</span>}
                    {lesson.exercises?.length > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">📝 {lesson.exercises.length}</span>}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setShowContentModal(true)} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Soạn nội dung"><FileText className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onAddExercise(lesson)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Thêm bài tập"><Plus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(lesson._id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            {expanded && (
                <div className="p-3 space-y-3 border-t border-gray-200">
                    {lesson.content && (
                        <div className="p-2 bg-gray-50 rounded">
                            <StaticContent content={lesson.content} />
                        </div>
                    )}
                    {lesson.exercises?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Bài tập ({lesson.exercises.length})</h4>
                            <div className="space-y-2">
                                {lesson.exercises.map((ex: any, idx: number) => (
                                    <ExerciseCard key={ex._id} exercise={ex} index={idx} onEdit={onEditExercise} onDelete={onDeleteExercise} />
                                ))}
                            </div>
                        </div>
                    )}
                    {!lesson.content && <p className="text-sm text-gray-400 italic">Chưa có nội dung</p>}
                </div>
            )}
            <LessonContentModal isOpen={showContentModal} onClose={() => setShowContentModal(false)} onSave={(content: string) => onUpdate(lesson._id, { content })} initialContent={lesson.content} />
        </div>
    );
};

const SectionEditor = ({ section, sectionIndex, onUpdateSection, onDeleteSection, onAddLesson, onUpdateLesson, onDeleteLesson, onAddExercise, onEditExercise, onDeleteExercise }: any) => {
    const [expanded, setExpanded] = useState(true);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-100">
                <div className="flex items-center gap-2">
                    <button onClick={() => setExpanded(!expanded)} className="text-gray-600">{expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
                    <span className="font-semibold text-gray-800">Phần {sectionIndex + 1}: {section.title}</span>
                    <span className="text-xs text-gray-500">{section.lessons?.length || 0} bài học</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setShowSectionModal(true)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Sửa phần"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setShowLessonModal(true)} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Thêm bài học"><Plus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDeleteSection(section._id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa phần"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            {expanded && section.lessons?.length > 0 && (
                <div className="p-3 space-y-2 border-t border-gray-200">
                    {section.lessons.map((lesson: any) => (
                        <LessonEditor key={lesson._id} lesson={lesson} onUpdate={onUpdateLesson} onDelete={onDeleteLesson} onAddExercise={onAddExercise} onEditExercise={onEditExercise} onDeleteExercise={onDeleteExercise} />
                    ))}
                </div>
            )}
            {expanded && (!section.lessons || section.lessons.length === 0) && (
                <div className="p-4 text-center text-gray-400 text-sm border-t border-gray-200">Chưa có bài học nào</div>
            )}
            <SectionModal isOpen={showSectionModal} onClose={() => setShowSectionModal(false)} onSave={(data: any) => onUpdateSection(section._id, data)} initialData={section} />
            <LessonModal isOpen={showLessonModal} onClose={() => setShowLessonModal(false)} onSave={(data: any) => onAddLesson(section._id, data)} />
        </div>
    );
};

export default function EditCNBookPage() {
    const params = useParams();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        category: 'other',
        price: 0,
        discountPrice: 0,
        isFree: false
    });
    const [titleError, setTitleError] = useState('');
    const [thumbnailError, setThumbnailError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBook();
    }, [params.id]);

    const fetchBook = async () => {
        setLoading(true);
        try {
            const res = await cnbookApi.getBookById(params.id as string);
            if (res.success) {
                setBook(res.data);
                setFormData({
                    title: res.data.title,
                    description: res.data.description || '',
                    thumbnail: res.data.thumbnail,
                    category: res.data.category,
                    price: res.data.price,
                    discountPrice: res.data.discountPrice,
                    isFree: res.data.isFree
                });
            } else {
                toast.error('Không thể tải thông tin sách');
                router.push('/quanly/cnbooks');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
            router.push('/quanly/cnbooks');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh'); return; }
        setUploading(true);
        try {
            const base64 = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target?.result as string); reader.readAsDataURL(file); });
            const result = await uploadApi.uploadImage(base64, 'cnbooks');
            if (result.success && result.url) { setFormData({ ...formData, thumbnail: result.url }); toast.success('Upload ảnh thành công'); }
            else { toast.error(result.message || 'Upload thất bại'); }
        } catch { toast.error('Có lỗi xảy ra'); }
        finally { setUploading(false); }
    };

    const handleSaveBook = async () => {
        let hasError = false;
        if (!formData.title.trim()) { setTitleError('Vui lòng nhập tiêu đề sách'); hasError = true; }
        else { setTitleError(''); }
        if (!formData.thumbnail) { setThumbnailError('Vui lòng chọn ảnh thumbnail'); hasError = true; }
        else { setThumbnailError(''); }
        if (hasError) return;

        setSaving(true);
        try {
            const res = await cnbookApi.updateBook(book!._id, {
                title: formData.title.trim(),
                description: formData.description,
                thumbnail: formData.thumbnail,
                category: formData.category,
                price: formData.isFree ? 0 : formData.price,
                discountPrice: formData.isFree ? 0 : formData.discountPrice,
                isFree: formData.isFree
            });
            if (res.success) {
                toast.success('Cập nhật thông tin sách thành công');
                fetchBook();
            } else { toast.error(res.message || 'Có lỗi xảy ra'); }
        } catch { toast.error('Có lỗi xảy ra'); }
        finally { setSaving(false); }
    };

    // Section handlers
    const handleAddSection = async (data: any) => {
        try {
            const res = await cnbookApi.addSection(book!._id, data);
            if (res.success) { toast.success('Thêm phần thành công'); fetchBook(); setShowSectionModal(false); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    const handleUpdateSection = async (sectionId: string, data: any) => {
        try {
            const res = await cnbookApi.updateSection(book!._id, sectionId, data);
            if (res.success) { toast.success('Cập nhật phần thành công'); fetchBook(); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa phần này?')) return;
        try {
            const res = await cnbookApi.deleteSection(book!._id, sectionId);
            if (res.success) { toast.success('Xóa phần thành công'); fetchBook(); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    // Lesson handlers
    const handleAddLesson = async (sectionId: string, data: any) => {
        try {
            const res = await cnbookApi.addLesson(book!._id, sectionId, data);
            if (res.success) { toast.success('Thêm bài học thành công'); fetchBook(); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    const handleUpdateLesson = async (lessonId: string, data: any) => {
        try {
            const res = await cnbookApi.updateLesson(lessonId, data);
            if (res.success) { toast.success('Cập nhật bài học thành công'); fetchBook(); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
        try {
            const res = await cnbookApi.deleteLesson(lessonId);
            if (res.success) { toast.success('Xóa bài học thành công'); fetchBook(); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    // Exercise handlers
    const [exerciseModal, setExerciseModal] = useState({ isOpen: false, lesson: null, editingExercise: null });

    const handleAddExercise = (lesson: any) => {
        setExerciseModal({ isOpen: true, lesson, editingExercise: null });
    };

    const handleEditExercise = (exercise: any, lesson: any) => {
        setExerciseModal({ isOpen: true, lesson, editingExercise: exercise });
    };

    const handleSaveExercise = async (exerciseData: any) => {
        try {
            let res;
            if (exerciseModal.editingExercise) {
                res = await cnbookApi.updateExercise(exerciseModal.editingExercise._id, exerciseData);
            } else {
                res = await cnbookApi.addExercise(exerciseModal.lesson._id, exerciseData);
            }
            if (res.success) { toast.success(exerciseModal.editingExercise ? 'Cập nhật bài tập thành công' : 'Thêm bài tập thành công'); fetchBook(); setExerciseModal({ isOpen: false, lesson: null, editingExercise: null }); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    const handleDeleteExercise = async (exerciseId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
        try {
            const res = await cnbookApi.deleteExercise(exerciseId);
            if (res.success) { toast.success('Xóa bài tập thành công'); fetchBook(); }
            else { toast.error(res.message); }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
    }

    if (!book) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/quanly/cnbooks" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Quay lại</Link>
                    <CustomButton onClick={handleSaveBook} loading={saving}><Save className="w-4 h-4" /> Lưu thông tin</CustomButton>
                </div>

                {/* Book Info Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Thông tin sách</h2>
                    <div className="space-y-4">
                        <CustomInput label="Tiêu đề sách" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} error={titleError} required />
                        <CustomInput label="Mô tả sách" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} textarea rows={2} />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh thumbnail <span className="text-red-500">*</span></label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition" onClick={() => fileInputRef.current?.click()}>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                                {uploading ? (<div className="py-4"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-sm text-gray-500 mt-2">Đang upload...</p></div>)
                                    : formData.thumbnail ? (<div className="relative"><img src={formData.thumbnail} alt="Thumbnail" className="max-h-32 mx-auto rounded" /><button onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, thumbnail: '' }); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button></div>)
                                        : (<div className="py-4"><Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Click để chọn ảnh</p></div>)}
                            </div>
                            {thumbnailError && <p className="mt-1 text-sm text-red-500">{thumbnailError}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomSelect label="Danh mục" options={CATEGORY_OPTIONS} value={formData.category} onChange={(val) => setFormData({ ...formData, category: val })} />
                            <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="isFree" checked={formData.isFree} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: 0, discountPrice: 0 })} className="w-4 h-4" /><label htmlFor="isFree" className="text-sm text-gray-700">Sách miễn phí</label></div>
                        </div>

                        {!formData.isFree && (
                            <div className="grid grid-cols-2 gap-4">
                                <CustomInput label="Giá gốc (VNĐ)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
                                <CustomInput label="Giá giảm (VNĐ)" type="number" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: parseInt(e.target.value) || 0 })} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sections Editor */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">📑 Mục lục</h2>
                        <CustomButton onClick={() => setShowSectionModal(true)} size="small"><Plus className="w-4 h-4" /> Thêm phần</CustomButton>
                    </div>

                    {book.sections && book.sections.length > 0 ? (
                        <div className="space-y-3">
                            {book.sections.map((section, idx) => (
                                <SectionEditor
                                    key={section._id}
                                    section={section}
                                    sectionIndex={idx}
                                    onUpdateSection={handleUpdateSection}
                                    onDeleteSection={handleDeleteSection}
                                    onAddLesson={handleAddLesson}
                                    onUpdateLesson={handleUpdateLesson}
                                    onDeleteLesson={handleDeleteLesson}
                                    onAddExercise={handleAddExercise}
                                    onEditExercise={(ex: any) => handleEditExercise(ex, null)}
                                    onDeleteExercise={handleDeleteExercise}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Chưa có phần nào</p>
                            <CustomButton onClick={() => setShowSectionModal(true)} className="mt-4" size="small">Thêm phần đầu tiên</CustomButton>
                        </div>
                    )}
                </div>
            </div>

            <SectionModal isOpen={showSectionModal} onClose={() => setShowSectionModal(false)} onSave={handleAddSection} />
            <ExerciseModal isOpen={exerciseModal.isOpen} onClose={() => setExerciseModal({ isOpen: false, lesson: null, editingExercise: null })} onSave={handleSaveExercise} initialData={exerciseModal.editingExercise} />
        </div>
    );
}