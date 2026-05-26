// app/admin/garden/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { gardenApi } from '@/lib/api/garden.api';
import { Question, Tree } from '@/types/garden.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';
import {
    Plus, Edit2, Trash2, X, BookOpen, TreePine,
    FileText, Upload, ShoppingBag, Droplets, Coins, TrendingUp
} from 'lucide-react';

const CATEGORY_OPTIONS = [
    { value: 'programming', label: '💻 Lập trình' },
    { value: 'math', label: '📐 Toán học' },
    { value: 'science', label: '🔬 Khoa học' },
    { value: 'general', label: '📚 Kiến thức chung' }
];

const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' }
];

export default function AdminGardenPage() {
    const [activeTab, setActiveTab] = useState<'questions' | 'trees'>('questions');

    // ==================== QUESTIONS STATE ====================
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [questionSubmitting, setQuestionSubmitting] = useState(false);
    const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<Question | null>(null);

    const [questionForm, setQuestionForm] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        category: 'general',
        difficulty: 'easy',
        xpReward: 15
    });

    // ==================== TREES STATE ====================
    const [trees, setTrees] = useState<Tree[]>([]);
    const [treesLoading, setTreesLoading] = useState(true);
    const [showTreeModal, setShowTreeModal] = useState(false);
    const [editingTree, setEditingTree] = useState<Tree | null>(null);
    const [treeSubmitting, setTreeSubmitting] = useState(false);
    const [deleteTreeTarget, setDeleteTreeTarget] = useState<Tree | null>(null);

    const [treeForm, setTreeForm] = useState({
        name: '',
        description: '',
        stages: ['Mầm non', 'Cây non', 'Cây trưởng thành', 'Cây sai quả'],
        waterRequired: 10,
        growthPerWater: 25,
        stageThresholds: [0, 30, 70, 100],
        minCoins: 20,
        maxCoins: 100,
        price: 0,
        isDefault: false,
        isActive: true
    });

    // ==================== FETCH DATA ====================
    useEffect(() => {
        if (activeTab === 'questions') {
            fetchQuestions();
        } else {
            fetchTrees();
        }
    }, [activeTab, page]);

    const fetchQuestions = async () => {
        setQuestionsLoading(true);
        try {
            const res = await gardenApi.getAllQuestions(page, 10);
            if (res.success) {
                setQuestions(res.questions);
                setTotalPages(res.totalPages);
            }
        } catch {
            toast.error('Không thể tải câu hỏi');
        } finally {
            setQuestionsLoading(false);
        }
    };

    const fetchTrees = async () => {
        setTreesLoading(true);
        try {
            const res = await gardenApi.getAllTrees();
            if (res.success) setTrees(res.data);
        } catch {
            toast.error('Không thể tải cây');
        } finally {
            setTreesLoading(false);
        }
    };

    // ==================== QUESTION HANDLERS ====================
    const handleSaveQuestion = async () => {
        if (!questionForm.question.trim()) {
            toast.error('Vui lòng nhập câu hỏi');
            return;
        }
        if (questionForm.options.some(opt => !opt.trim())) {
            toast.error('Vui lòng nhập đầy đủ 4 đáp án');
            return;
        }

        setQuestionSubmitting(true);
        try {
            let res;
            if (editingQuestion) {
                res = await gardenApi.updateQuestion(editingQuestion._id, questionForm);
            } else {
                res = await gardenApi.addQuestion(questionForm);
            }
            if (res.success) {
                toast.success(editingQuestion ? 'Cập nhật thành công' : 'Thêm thành công');
                setShowQuestionModal(false);
                resetQuestionForm();
                fetchQuestions();
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setQuestionSubmitting(false);
        }
    };

    const handleBulkSave = async () => {
        if (!bulkText.trim()) {
            toast.error('Vui lòng nhập nội dung câu hỏi');
            return;
        }

        setBulkSubmitting(true);
        try {
            const res = await gardenApi.addMultipleQuestions(bulkText);
            if (res.success) {
                const successCount = res.data.filter(r => r.success).length;
                toast.success(`Thêm thành công ${successCount}/${res.data.length} câu hỏi`);
                setShowBulkModal(false);
                setBulkText('');
                fetchQuestions();
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setBulkSubmitting(false);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!deleteQuestionTarget) return;
        try {
            const res = await gardenApi.deleteQuestion(deleteQuestionTarget._id);
            if (res.success) {
                toast.success('Xóa thành công');
                setDeleteQuestionTarget(null);
                fetchQuestions();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const resetQuestionForm = () => {
        setEditingQuestion(null);
        setQuestionForm({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            category: 'general',
            difficulty: 'easy',
            xpReward: 15
        });
    };

    const openEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setQuestionForm({
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            category: question.category,
            difficulty: question.difficulty,
            xpReward: question.xpReward
        });
        setShowQuestionModal(true);
    };

    // ==================== TREE HANDLERS ====================
    const handleSaveTree = async () => {
        if (!treeForm.name.trim()) {
            toast.error('Vui lòng nhập tên cây');
            return;
        }

        setTreeSubmitting(true);
        try {
            let res;
            if (editingTree) {
                res = await gardenApi.updateTree(editingTree._id, treeForm);
            } else {
                res = await gardenApi.addTree(treeForm);
            }
            if (res.success) {
                toast.success(editingTree ? 'Cập nhật thành công' : 'Thêm thành công');
                setShowTreeModal(false);
                resetTreeForm();
                fetchTrees();
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setTreeSubmitting(false);
        }
    };

    const handleDeleteTree = async () => {
        if (!deleteTreeTarget) return;
        try {
            const res = await gardenApi.deleteTree(deleteTreeTarget._id);
            if (res.success) {
                toast.success('Xóa thành công');
                setDeleteTreeTarget(null);
                fetchTrees();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const resetTreeForm = () => {
        setEditingTree(null);
        setTreeForm({
            name: '',
            description: '',
            stages: ['Mầm non', 'Cây non', 'Cây trưởng thành', 'Cây sai quả'],
            waterRequired: 10,
            growthPerWater: 25,
            stageThresholds: [0, 30, 70, 100],
            minCoins: 20,
            maxCoins: 100,
            price: 0,
            isDefault: false,
            isActive: true
        });
    };

    const openEditTree = (tree: Tree) => {
        setEditingTree(tree);
        setTreeForm({
            name: tree.name,
            description: tree.description || '',
            stages: tree.stages,
            waterRequired: tree.waterRequired,
            growthPerWater: tree.growthPerWater,
            stageThresholds: tree.stageThresholds,
            minCoins: tree.minCoins,
            maxCoins: tree.maxCoins,
            price: tree.price || 0,
            isDefault: tree.isDefault || false,
            isActive: tree.isActive
        });
        setShowTreeModal(true);
    };

    // ==================== RENDER ====================
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">🌳 Quản lý Khu Vườn Học Tập</h1>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'questions'
                            ? 'border-b-2 border-green-500 text-green-600'
                            : 'text-gray-500'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" /> Câu hỏi
                    </button>
                    <button
                        onClick={() => setActiveTab('trees')}
                        className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'trees'
                            ? 'border-b-2 border-green-500 text-green-600'
                            : 'text-gray-500'
                            }`}
                    >
                        <TreePine className="w-4 h-4" /> Cây trồng
                    </button>
                </div>

                {/* ==================== QUESTIONS TAB ==================== */}
                {activeTab === 'questions' && (
                    <div>
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                            <p className="text-gray-500 text-sm">Quản lý câu hỏi trắc nghiệm</p>
                            <div className="flex gap-2">
                                <CustomButton onClick={() => setShowBulkModal(true)} variant="secondary" size="small">
                                    <FileText className="w-4 h-4" /> Nhập nhanh
                                </CustomButton>
                                <CustomButton onClick={() => setShowQuestionModal(true)} size="small">
                                    <Plus className="w-4 h-4" /> Thêm câu hỏi
                                </CustomButton>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {questionsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : questions.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Chưa có câu hỏi nào</p>
                                    <CustomButton onClick={() => setShowQuestionModal(true)} className="mt-4" size="small">
                                        Thêm câu hỏi đầu tiên
                                    </CustomButton>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr className="text-left">
                                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Câu hỏi</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Danh mục</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Độ khó</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Thưởng</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {questions.map((q) => (
                                                    <tr key={q._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-md truncate">{q.question}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {q.category === 'programming' ? 'Lập trình' :
                                                                q.category === 'math' ? 'Toán' :
                                                                    q.category === 'science' ? 'Khoa học' : 'Kiến thức'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{q.xpReward} nước</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => openEditQuestion(q)} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setDeleteQuestionTarget(q)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex justify-center gap-2 px-4 py-3 border-t border-gray-200">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                            >
                                                Trước
                                            </button>
                                            <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
                                            <button
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ==================== TREES TAB ==================== */}
                {activeTab === 'trees' && (
                    <div>
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                            <p className="text-gray-500 text-sm">Quản lý các loại cây trong vườn</p>
                            <CustomButton onClick={() => setShowTreeModal(true)} size="small">
                                <Plus className="w-4 h-4" /> Thêm cây
                            </CustomButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {treesLoading ? (
                                <div className="col-span-full flex justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : trees.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-400">
                                    <TreePine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Chưa có cây nào</p>
                                    <CustomButton onClick={() => setShowTreeModal(true)} className="mt-4" size="small">
                                        Thêm cây đầu tiên
                                    </CustomButton>
                                </div>
                            ) : (
                                trees.map((tree) => (
                                    <div key={tree._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <TreePine className="w-10 h-10 text-green-500" />
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{tree.name}</h3>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{tree.description || 'Chưa có mô tả'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => openEditTree(tree)} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteTreeTarget(tree)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-gray-500">
                                            <div className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {tree.waterRequired} nước/lần</div>
                                            <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{tree.growthPerWater}%/lần</div>
                                            <div className="flex items-center gap-1"><Coins className="w-3 h-3" /> {tree.minCoins} - {tree.maxCoins} xu</div>
                                            <div className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {tree.price > 0 ? `${tree.price} xu` : 'Miễn phí'}</div>
                                            <div className="col-span-2 flex items-center gap-1"><TreePine className="w-3 h-3" /> {tree.stages.length} giai đoạn</div>
                                        </div>
                                        {tree.isDefault && (
                                            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] bg-green-100 text-green-600 rounded-full">Mặc định</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ==================== QUESTION MODAL ==================== */}
            {showQuestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowQuestionModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
                            <button onClick={() => setShowQuestionModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <CustomInput
                                label="Câu hỏi"
                                value={questionForm.question}
                                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                textarea
                                rows={2}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Đáp án</label>
                                {questionForm.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={questionForm.correctAnswer === idx}
                                            onChange={() => setQuestionForm({ ...questionForm, correctAnswer: idx })}
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <CustomInput
                                            value={opt}
                                            onChange={(e) => {
                                                const newOptions = [...questionForm.options];
                                                newOptions[idx] = e.target.value;
                                                setQuestionForm({ ...questionForm, options: newOptions });
                                            }}
                                            placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <CustomSelect
                                    label="Danh mục"
                                    options={CATEGORY_OPTIONS}
                                    value={questionForm.category}
                                    onChange={(val) => setQuestionForm({ ...questionForm, category: val })}
                                />
                                <CustomSelect
                                    label="Độ khó"
                                    options={DIFFICULTY_OPTIONS}
                                    value={questionForm.difficulty}
                                    onChange={(val) => setQuestionForm({ ...questionForm, difficulty: val })}
                                />
                            </div>

                            <CustomInput
                                label="Nước thưởng"
                                type="number"
                                value={questionForm.xpReward}
                                onChange={(e) => setQuestionForm({ ...questionForm, xpReward: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex justify-end gap-3 p-6 pt-0 border-t border-gray-200">
                            <CustomButton variant="secondary" onClick={() => setShowQuestionModal(false)}>Hủy</CustomButton>
                            <CustomButton onClick={handleSaveQuestion} loading={questionSubmitting}>Lưu lại</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== BULK QUESTION MODAL ==================== */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowBulkModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Nhập nhanh câu hỏi</h2>
                            <button onClick={() => setShowBulkModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                                <p className="font-medium mb-1">📝 Hướng dẫn:</p>
                                <p className="text-xs">Câu 1: Nội dung câu hỏi</p>
                                <p className="text-xs">A. Đáp án A</p>
                                <p className="text-xs">B. Đáp án B</p>
                                <p className="text-xs">*C. Đáp án C (đúng)</p>
                                <p className="text-xs">D. Đáp án D</p>
                                <p className="text-xs mt-1">👉 Dùng * để đánh dấu đáp án đúng</p>
                            </div>
                            <CustomTextarea
                                label="Nội dung câu hỏi"
                                value={bulkText}
                                onChange={setBulkText}
                                placeholder="Câu 1: ...&#10;A. ...&#10;B. ...&#10;*C. ...&#10;D. ...&#10;&#10;Câu 2: ...&#10;*A. ...&#10;B. ...&#10;C. ...&#10;D. ..."
                                rows={12}
                            />
                        </div>
                        <div className="flex justify-end gap-3 p-6 pt-0 border-t border-gray-200">
                            <CustomButton variant="secondary" onClick={() => setShowBulkModal(false)}>Hủy</CustomButton>
                            <CustomButton onClick={handleBulkSave} loading={bulkSubmitting}>Xử lý</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== TREE MODAL ==================== */}
            {showTreeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowTreeModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingTree ? 'Sửa cây' : 'Thêm cây'}</h2>
                            <button onClick={() => setShowTreeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <CustomInput
                                label="Tên cây"
                                value={treeForm.name}
                                onChange={(e) => setTreeForm({ ...treeForm, name: e.target.value })}
                                required
                            />
                            <CustomInput
                                label="Mô tả"
                                value={treeForm.description}
                                onChange={(e) => setTreeForm({ ...treeForm, description: e.target.value })}
                                textarea
                                rows={2}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <CustomInput
                                    label="Nước cần để tưới (1 lần)"
                                    type="number"
                                    value={treeForm.waterRequired}
                                    onChange={(e) => setTreeForm({ ...treeForm, waterRequired: parseInt(e.target.value) || 10 })}
                                />
                                <CustomInput
                                    label="Tăng trưởng mỗi lần tưới (%)"
                                    type="number"
                                    value={treeForm.growthPerWater}
                                    onChange={(e) => setTreeForm({ ...treeForm, growthPerWater: parseInt(e.target.value) || 25 })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomInput
                                    label="Xu tối thiểu"
                                    type="number"
                                    value={treeForm.minCoins}
                                    onChange={(e) => setTreeForm({ ...treeForm, minCoins: parseInt(e.target.value) || 20 })}
                                />
                                <CustomInput
                                    label="Xu tối đa"
                                    type="number"
                                    value={treeForm.maxCoins}
                                    onChange={(e) => setTreeForm({ ...treeForm, maxCoins: parseInt(e.target.value) || 100 })}
                                />
                            </div>
                            <CustomInput
                                label="Giá mua (xu)"
                                type="number"
                                value={treeForm.price}
                                onChange={(e) => setTreeForm({ ...treeForm, price: parseInt(e.target.value) || 0 })}
                            />
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={treeForm.isDefault}
                                        onChange={(e) => setTreeForm({ ...treeForm, isDefault: e.target.checked })}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="text-sm text-gray-700">Cây mặc định (tặng khi mới chơi)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={treeForm.isActive}
                                        onChange={(e) => setTreeForm({ ...treeForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="text-sm text-gray-700">Kích hoạt</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Các giai đoạn</label>
                                <div className="space-y-2">
                                    {treeForm.stages.map((stage, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <CustomInput
                                                value={stage}
                                                onChange={(e) => {
                                                    const newStages = [...treeForm.stages];
                                                    newStages[idx] = e.target.value;
                                                    setTreeForm({ ...treeForm, stages: newStages });
                                                }}
                                                placeholder={`Giai đoạn ${idx + 1}`}
                                            />
                                            {idx === treeForm.stages.length - 1 && treeForm.stages.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTreeForm({ ...treeForm, stages: [...treeForm.stages, ''] })}
                                                    className="px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                            {treeForm.stages.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newStages = treeForm.stages.filter((_, i) => i !== idx);
                                                        setTreeForm({ ...treeForm, stages: newStages });
                                                    }}
                                                    className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 pt-0 border-t border-gray-200">
                            <CustomButton variant="secondary" onClick={() => setShowTreeModal(false)}>Hủy</CustomButton>
                            <CustomButton onClick={handleSaveTree} loading={treeSubmitting}>Lưu lại</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== DELETE CONFIRM MODALS ==================== */}
            <ConfirmModalDelete
                isOpen={!!deleteQuestionTarget}
                onClose={() => setDeleteQuestionTarget(null)}
                onConfirm={handleDeleteQuestion}
                title="Xóa câu hỏi"
                message={`Bạn có chắc chắn muốn xóa câu hỏi "${deleteQuestionTarget?.question}"?`}
                warning="Hành động này không thể hoàn tác."
            />

            <ConfirmModalDelete
                isOpen={!!deleteTreeTarget}
                onClose={() => setDeleteTreeTarget(null)}
                onConfirm={handleDeleteTree}
                title="Xóa cây"
                message={`Bạn có chắc chắn muốn xóa cây "${deleteTreeTarget?.name}"?`}
                warning="Hành động này không thể hoàn tác."
            />
        </div>
    );
}