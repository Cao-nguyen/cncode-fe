// Garden Types
export type PlantLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Plant {
    id: string;
    name: string;
    level: PlantLevel;
    waterAmount: number; // Current water amount
    waterRequired: number; // Water needed to level up
    createdAt: string;
    lastWatered: string;
}

export interface GardenState {
    userId: string;
    plants: Plant[];
    availableWater: number; // Water drops available for use
    totalQuestionsAnswered: number;
    createdAt: string;
    updatedAt: string;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    exerciseId: string;
}

export interface WaterReward {
    amount: number;
    source: 'quiz' | 'bonus';
}