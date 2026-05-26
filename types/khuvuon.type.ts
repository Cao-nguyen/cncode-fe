export interface IGarden {
    water: number;
    growth: number;
    stage: number;
    totalCoins: number;
}

export interface IQuestion {
    _id: string;
    question: string;
    options: string[];
}

export interface AnswerResponse {
    correct: boolean;
    waterReceived?: number;
}

export interface WaterResponse {
    garden: IGarden;
    bonusCoin: number;
}