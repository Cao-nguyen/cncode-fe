// app/(user)/garden/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { gardenApi } from '@/lib/api/garden.api';
import { GardenStats, Question, Tree } from '@/types/garden.type';
import { TreeSVG } from '@/components/garden/TreeSVG';
import { CustomButton } from '@/components/custom/CustomButton';
import { toast } from 'sonner';
import { Droplets, Coins, BookOpen, Sprout, TreesIcon as TreeIcon, Apple, CheckCircle, XCircle, Plus, ShoppingBag, GripVertical } from 'lucide-react';

export default function GardenPage() {
    const [stats, setStats] = useState<GardenStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState<Question | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [result, setResult] = useState<{ isCorrect: boolean; message: string } | null>(null);
    const [wateringIndex, setWateringIndex] = useState<number | null>(null);
    const [harvestingIndex, setHarvestingIndex] = useState<number | null>(null);
    const [showShop, setShowShop] = useState(false);
    const [shopTrees, setShopTrees] = useState<Tree[]>([]);
    const [ownedTrees, setOwnedTrees] = useState<Tree[]>([]);
    const [buyingTreeId, setBuyingTreeId] = useState<string | null>(null);
    const [plantingTreeId, setPlantingTreeId] = useState<string | null>(null);
    const [showWaterEffect, setShowWaterEffect] = useState<number | null>(null);
    const [showHarvestEffect, setShowHarvestEffect] = useState<{ index: number; coins: number } | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, treesRes] = await Promise.all([
                gardenApi.getStats(),
                gardenApi.getTrees()
            ]);
            if (statsRes.success) setStats(statsRes.data);
            if (treesRes.success) {
                setOwnedTrees(treesRes.data.owned || []);
                setShopTrees(treesRes.data.shop || []);
            }
        } catch {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLearn = async () => {
        try {
            const res = await gardenApi.getQuestion();
            if (res.success && res.data) {
                setQuestion(res.data);
                setSelectedAnswer(null);
                setResult(null);
                setShowQuiz(true);
            } else {
                toast.error(res.message || 'Chưa có câu hỏi nào');
            }
        } catch {
            toast.error('Không thể tải câu hỏi');
        }
    };

    const handleAnswer = async (answerIndex: number) => {
        if (!question) return;
        setSubmitting(true);
        setSelectedAnswer(answerIndex);

        try {
            const res = await gardenApi.submitAnswer(question._id, answerIndex);
            if (res.success && res.data.correct) {
                setResult({
                    isCorrect: true,
                    message: `Chính xác! +${res.data.waterReceived} nước`
                });
                await fetchData();
                setTimeout(() => {
                    setShowQuiz(false);
                    setResult(null);
                }, 1500);
            } else if (res.success && !res.data.correct) {
                const correctOption = question.options[res.data.correctAnswer];
                setResult({
                    isCorrect: false,
                    message: `Sai rồi! Đáp án đúng là: ${correctOption}`
                });
                setTimeout(() => {
                    setShowQuiz(false);
                    setResult(null);
                }, 2000);
            }
        } catch {
            toast.error('Có lỗi xảy ra');
            setShowQuiz(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleWater = async (index: number) => {
        const tree = stats?.trees[index];
        if (!tree) return;
        if ((stats?.water || 0) < tree.waterRequired) {
            toast.error(`Không đủ nước! Cần ${tree.waterRequired} nước để tưới. Hãy học để kiếm thêm nước.`);
            return;
        }

        setWateringIndex(index);
        setShowWaterEffect(index);
        setTimeout(() => setShowWaterEffect(null), 1000);

        try {
            const res = await gardenApi.waterTree(index);
            if (res.success) {
                await fetchData();
                if (res.data.canHarvest) {
                    toast.success(`🌳 Cây ${tree.name} đã trưởng thành! Hãy thu hoạch!`);
                } else if (res.data.stageUp) {
                    toast.success(`🌱 Cây ${tree.name} đã lên giai đoạn ${res.data.newStage}!`);
                } else {
                    toast.success(`Đã tưới ${res.data.waterUsed} nước cho ${tree.name}! +${res.data.newGrowth}%`);
                }
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Không thể tưới cây');
        } finally {
            setWateringIndex(null);
        }
    };

    const handlePlant = async (treeId: string) => {
        if ((stats?.trees?.length || 0) >= 3) {
            toast.error('Bạn chỉ có thể trồng tối đa 3 cây cùng lúc!');
            return;
        }

        setPlantingTreeId(treeId);
        try {
            const res = await gardenApi.plantTree(treeId);
            if (res.success) {
                toast.success('Đã trồng cây mới!');
                await fetchData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Không thể trồng cây');
        } finally {
            setPlantingTreeId(null);
        }
    };

    const handleHarvest = async (index: number, treeName: string) => {
        setHarvestingIndex(index);
        try {
            const res = await gardenApi.harvestTree(index);
            if (res.success) {
                setShowHarvestEffect({ index, coins: res.data.bonusCoins });
                setTimeout(() => setShowHarvestEffect(null), 2000);
                await fetchData();
                toast.success(`🎉 Thu hoạch ${treeName} thành công! +${res.data.bonusCoins} xu!`);
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Không thể thu hoạch');
        } finally {
            setHarvestingIndex(null);
        }
    };

    const handleBuyTree = async (treeId: string, price: number) => {
        if ((stats?.totalCoins || 0) < price) {
            toast.error(`Không đủ xu! Cần ${price} xu để mua cây này.`);
            return;
        }

        setBuyingTreeId(treeId);
        try {
            const res = await gardenApi.buyTree(treeId);
            if (res.success) {
                toast.success('Mua cây thành công!');
                await fetchData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Không thể mua cây');
        } finally {
            setBuyingTreeId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const canPlantMore = (stats?.trees?.length || 0) < 3;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 py-6">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-green-800">🌳 Khu Vườn Học Tập</h1>
                    <p className="text-green-600 text-sm">Học kiếm nước, tưới cây, thu hoạch xu!</p>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-2 shadow-md text-center">
                        <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-600">{stats?.water || 0}</p>
                        <p className="text-[10px] text-gray-500">Nước</p>
                    </div>
                    <div className="bg-white rounded-xl p-2 shadow-md text-center">
                        <Coins className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-yellow-600">{stats?.totalCoins || 0}</p>
                        <p className="text-[10px] text-gray-500">Xu</p>
                    </div>
                    <div className="bg-white rounded-xl p-2 shadow-md text-center">
                        <BookOpen className="w-5 h-5 text-green-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-600">{stats?.correctAnswers || 0}</p>
                        <p className="text-[10px] text-gray-500">Đã học</p>
                    </div>
                    <div className="bg-white rounded-xl p-2 shadow-md text-center">
                        <Apple className="w-5 h-5 text-red-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-red-600">{stats?.totalHarvests || 0}</p>
                        <p className="text-[10px] text-gray-500">Thu hoạch</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-green-800">🌱 Khu vườn của bạn</h2>
                    <div className="flex gap-2">
                        <CustomButton onClick={handleLearn} size="small" className="!px-3 !py-1.5 text-sm">
                            <BookOpen className="w-3 h-3" /> Học
                        </CustomButton>
                        <CustomButton onClick={() => setShowShop(true)} variant="secondary" size="small" className="!px-3 !py-1.5 text-sm">
                            <ShoppingBag className="w-3 h-3" /> Cửa hàng
                        </CustomButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {stats?.trees?.map((tree, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-3 shadow-md border-2 border-green-100 relative">
                            {showWaterEffect === idx && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-white/50 rounded-xl">
                                    <div className="text-3xl animate-bounce">💧</div>
                                </div>
                            )}
                            {showHarvestEffect?.index === idx && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-white/50 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-2xl animate-bounce">💰</div>
                                        <div className="text-sm font-bold text-yellow-600 animate-pulse">+{showHarvestEffect.coins} xu</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-green-800 text-sm">{tree.name}</h3>
                                <div className="flex gap-1">
                                    {tree.canHarvest && (
                                        <button
                                            onClick={() => handleHarvest(idx, tree.name)}
                                            disabled={harvestingIndex === idx}
                                            className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full hover:bg-yellow-600"
                                        >
                                            Thu hoạch
                                        </button>
                                    )}
                                </div>
                            </div>
                            <TreeSVG stage={tree.stage} growth={tree.growth} />
                            <div className="mt-2 text-center">
                                <p className="text-xs text-gray-500">{tree.stageName}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-400">💧 {tree.waterRequired}</span>
                                    <button
                                        onClick={() => handleWater(idx)}
                                        disabled={wateringIndex === idx}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {wateringIndex === idx ? 'Đang tưới...' : 'Tưới'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {canPlantMore && (
                        <div className="bg-white rounded-xl p-3 shadow-md border-2 border-dashed border-green-300 flex flex-col items-center justify-center min-h-[200px]">
                            <Sprout className="w-10 h-10 text-green-300 mb-2" />
                            <p className="text-sm text-gray-400 text-center mb-2">Còn trống {3 - (stats?.trees?.length || 0)} chỗ</p>
                            <button
                                onClick={() => setShowShop(true)}
                                className="px-3 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                            >
                                + Trồng cây
                            </button>
                        </div>
                    )}
                </div>

                {showShop && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-800">🌿 Cửa hàng cây</h2>
                                <button onClick={() => setShowShop(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-700 mb-2 text-sm">🌱 Cây đã sở hữu</h3>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {ownedTrees.map((tree) => (
                                        <div key={tree._id} className="border border-green-200 rounded-lg p-2 text-center bg-green-50">
                                            <TreeIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                            <p className="text-xs font-medium text-gray-700">{tree.name}</p>
                                            <button
                                                onClick={() => handlePlant(tree._id)}
                                                disabled={plantingTreeId === tree._id || !canPlantMore}
                                                className="mt-1 px-2 py-0.5 bg-green-500 text-white rounded text-xs w-full disabled:opacity-50"
                                            >
                                                {plantingTreeId === tree._id ? 'Đang trồng...' : 'Trồng'}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {shopTrees.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-gray-700 mb-2 text-sm">🛒 Cây mới</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {shopTrees.map((tree) => (
                                                <div key={tree._id} className="border border-gray-200 rounded-lg p-2 text-center">
                                                    <TreeIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                                    <p className="text-xs font-medium text-gray-700">{tree.name}</p>
                                                    <p className="text-xs text-yellow-600 font-bold">{tree.price} xu</p>
                                                    <button
                                                        onClick={() => handleBuyTree(tree._id, tree.price)}
                                                        disabled={buyingTreeId === tree._id}
                                                        className="mt-1 px-2 py-0.5 bg-yellow-500 text-white rounded text-xs w-full disabled:opacity-50"
                                                    >
                                                        {buyingTreeId === tree._id ? 'Đang mua...' : 'Mua'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showQuiz && question && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                                            {question.category === 'math' ? '📐 Toán' :
                                                question.category === 'programming' ? '💻 Lập trình' :
                                                    question.category === 'science' ? '🔬 Khoa học' : '📚 Kiến thức'}
                                        </span>
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                            {question.difficulty === 'easy' ? 'Dễ' :
                                                question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-green-600 font-medium">+{question.xpReward} nước</span>
                                </div>
                            </div>

                            <div className="p-5">
                                <p className="text-base font-medium text-gray-800 mb-4">{question.question}</p>
                                <div className="space-y-2">
                                    {question.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={submitting || selectedAnswer !== null}
                                            className={`w-full p-3 text-left border rounded-xl text-sm transition-all ${selectedAnswer === idx
                                                ? result?.isCorrect
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                                                }`}
                                        >
                                            <span className="font-medium">{String.fromCharCode(65 + idx)}. </span>
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                {result && (
                                    <div className={`mt-4 p-2 rounded-lg flex items-center gap-2 text-sm ${result.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {result.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        <span>{result.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}