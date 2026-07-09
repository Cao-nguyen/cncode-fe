'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Droplets, Plus, Trash2, Edit2, Trophy, TrendingUp,
    Sparkles, HelpCircle, CheckCircle, XCircle, Sprout
} from 'lucide-react';
import { Plant, QuizQuestion } from '@/types/garden.type';
import { gardenStorage, WATER_REQUIREMENTS } from '@/lib/utils/gardenStorage';
import { CustomButton } from '@/components/custom/CustomButton';
import { useAuthStore } from '@/store/auth.store';
import { AddPlantModal, WaterPlantModal, QuizModal } from '@/components/garden/GardenModals';

export default function GardenPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [availableWater, setAvailableWater] = useState(0);
    const [stats, setStats] = useState({ totalPlants: 0, totalWater: 0, highestLevel: 1, questionsAnswered: 0 });
    const [showQuiz, setShowQuiz] = useState(false);
    const [showAddPlant, setShowAddPlant] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [waterAmount, setWaterAmount] = useState(1);

    const loadGarden = () => {
        if (!user) return;

        const garden = gardenStorage.getGarden(user._id);
        if (garden) {
            setPlants(garden.plants);
            setAvailableWater(garden.availableWater);
            setStats(gardenStorage.getStats(user._id));
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadGarden();
    }, [user, router]);

    const handleAddPlant = (name: string) => {
        if (!user || !name.trim()) return;

        try {
            gardenStorage.addPlant(user._id, name.trim());
            loadGarden();
            setShowAddPlant(false);
        } catch (error) {
            alert('Không thể thêm cây mới');
        }
    };

    const handleWaterPlant = (plant: Plant) => {
        if (!user) return;

        if (availableWater < waterAmount) {
            alert('Không đủ nước! Hãy trả lời câu hỏi để nhận thêm nước.');
            return;
        }

        try {
            const result = gardenStorage.waterPlant(user._id, plant.id, waterAmount);

            if (result.leveledUp) {
                alert(`🎉 Chúc mừng! Cây của bạn đã lên cấp ${result.newLevel}!`);
            }

            loadGarden();
            setSelectedPlant(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tưới nước';
            alert(message);
        }
    };

    const handleAnswerQuestion = () => {
        setShowQuiz(true);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sprout className="w-7 h-7 text-green-500" />
                                Khu vườn học tập
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Trồng cây, tưới nước và nhìn chúng lớn lên!
                            </p>
                        </div>
                        <CustomButton
                            onClick={() => setShowAddPlant(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Trồng cây mới
                        </CustomButton>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Droplets className="w-5 h-5 text-blue-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Nước hiện có</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{availableWater}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Sprout className="w-5 h-5 text-green-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Số cây</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalPlants}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="w-5 h-5 text-purple-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Cấp cao nhất</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.highestLevel}</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-5 h-5 text-orange-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Câu hỏi</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.questionsAnswered}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Garden */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Get Water Button */}
                <div className="mb-6 flex justify-center">
                    <button
                        onClick={handleAnswerQuestion}
                        className="flex items-center gap-3 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg transition-all hover:scale-105"
                    >
                        <HelpCircle className="w-6 h-6" />
                        <div className="text-left">
                            <div className="font-bold">Trả lời câu hỏi</div>
                            <div className="text-xs opacity-90">Nhận nước để tưới cây</div>
                        </div>
                    </button>
                </div>

                {/* Plants Grid */}
                {plants.length === 0 ? (
                    <div className="text-center py-16">
                        <Sprout className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Chưa có cây nào
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Hãy trồng cây đầu tiên của bạn!
                        </p>
                        <CustomButton onClick={() => setShowAddPlant(true)}>
                            Trồng cây ngay
                        </CustomButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {plants.map((plant) => (
                            <PlantCard
                                key={plant.id}
                                plant={plant}
                                onWater={() => {
                                    setSelectedPlant(plant);
                                }}
                                onDelete={() => {
                                    if (confirm('Bạn có chắc muốn xóa cây này?')) {
                                        gardenStorage.deletePlant(user._id, plant.id);
                                        loadGarden();
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Plant Modal */}
            {showAddPlant && (
                <AddPlantModal
                    onClose={() => setShowAddPlant(false)}
                    onAdd={handleAddPlant}
                />
            )}

            {/* Water Plant Modal */}
            {selectedPlant && (
                <WaterPlantModal
                    plant={selectedPlant}
                    availableWater={availableWater}
                    waterAmount={waterAmount}
                    onWaterAmountChange={setWaterAmount}
                    onWater={() => handleWaterPlant(selectedPlant)}
                    onClose={() => {
                        setSelectedPlant(null);
                        setWaterAmount(1);
                    }}
                />
            )}

            {/* Quiz Modal */}
            {showQuiz && (
                <QuizModal
                    onClose={() => setShowQuiz(false)}
                    onSuccess={(waterEarned: number) => {
                        if (user) {
                            gardenStorage.addWater(user._id, waterEarned);
                            loadGarden();
                        }
                        setShowQuiz(false);
                    }}
                    userId={user._id}
                />
            )}
        </div>
    );
}

// Plant Card Component
function PlantCard({
    plant,
    onWater,
    onDelete
}: {
    plant: Plant;
    onWater: () => void;
    onDelete: () => void;
}) {
    const progress = (plant.waterAmount / plant.waterRequired) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            {/* Plant Image */}
            <div className="relative aspect-square bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-900/20 dark:to-green-900/20 rounded-xl mb-3 flex items-end justify-center overflow-hidden">
                <img
                    src={`/garden/${plant.level}.png`}
                    alt={plant.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.currentTarget.src = '/garden/placeholder.png';
                    }}
                />
                <span className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-full">
                    Lv.{plant.level}
                </span>
            </div>

            {/* Plant Info */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{plant.name}</h3>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Nước</span>
                    <span>{plant.waterAmount}/{plant.waterRequired}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onWater}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Droplets className="w-4 h-4" />
                    Tưới
                </button>
                <button
                    onClick={onDelete}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}