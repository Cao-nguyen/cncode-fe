export interface Tree {
    _id: string;
    name: string;
    description: string;
    stages: string[];
    waterRequired: number;
    growthPerWater: number;
    stageThresholds: number[];
    minCoins: number;
    maxCoins: number;
    isActive: boolean;
}

export interface GardenStats {
    water: number;
    totalCoins: number;
    totalQuestions: number;
    correctAnswers: number;
    availableQuestions: number;
    totalHarvests: number;
    currentTree: {
        id: string;
        name: string;
        stage: number;
        growth: number;
        stageName: string;
        waterRequired: number;
        canHarvest: boolean;
    } | null;
}

export interface Question {
    _id: string;
    question: string;
    options: string[];
    category: string;
    difficulty: string;
    xpReward: number;
    correctAnswer: number;
}