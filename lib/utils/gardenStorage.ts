import { Plant, PlantLevel, GardenState } from '@/types/garden.type';

const STORAGE_KEY = 'cncode_garden';

// Water required for each level (cumulative)
const WATER_REQUIREMENTS: Record<PlantLevel, number> = {
    1: 10,
    2: 25,
    3: 45,
    4: 70,
    5: 100,
    6: 135,
    7: 175,
    8: 220,
    9: 270,
    10: 999999, // Max level
};

class GardenStorage {
    private getStorage(): GardenState | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }

    private setStorage(state: GardenState): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // Initialize garden for user
    initGarden(userId: string): GardenState {
        const existing = this.getStorage();
        if (existing && existing.userId === userId) {
            return existing;
        }

        const newGarden: GardenState = {
            userId,
            plants: [this.createPlant('Cây của tôi')],
            availableWater: 5, // Starting water
            totalQuestionsAnswered: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.setStorage(newGarden);
        return newGarden;
    }

    // Get garden state
    getGarden(userId: string): GardenState | null {
        const garden = this.getStorage();
        if (!garden || garden.userId !== userId) {
            return this.initGarden(userId);
        }
        return garden;
    }

    // Create new plant
    private createPlant(name: string): Plant {
        return {
            id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            level: 1,
            waterAmount: 0,
            waterRequired: WATER_REQUIREMENTS[1],
            createdAt: new Date().toISOString(),
            lastWatered: new Date().toISOString(),
        };
    }

    // Add new plant
    addPlant(userId: string, name: string): Plant {
        const garden = this.getGarden(userId);
        if (!garden) throw new Error('Garden not initialized');

        const newPlant = this.createPlant(name);
        garden.plants.push(newPlant);
        garden.updatedAt = new Date().toISOString();

        this.setStorage(garden);
        return newPlant;
    }

    // Water a plant
    waterPlant(userId: string, plantId: string, waterAmount: number): { plant: Plant; leveledUp: boolean; newLevel?: PlantLevel } {
        const garden = this.getGarden(userId);
        if (!garden) throw new Error('Garden not initialized');

        if (garden.availableWater < waterAmount) {
            throw new Error('Not enough water');
        }

        const plant = garden.plants.find(p => p.id === plantId);
        if (!plant) throw new Error('Plant not found');

        // Deduct water from available
        garden.availableWater -= waterAmount;

        // Add water to plant
        plant.waterAmount += waterAmount;
        plant.lastWatered = new Date().toISOString();

        let leveledUp = false;
        let newLevel: PlantLevel | undefined;

        // Check if plant can level up
        if (plant.level < 10 && plant.waterAmount >= plant.waterRequired) {
            const nextLevel = (plant.level + 1) as PlantLevel;
            plant.level = nextLevel;
            plant.waterAmount = 0; // Reset water for next level
            plant.waterRequired = WATER_REQUIREMENTS[nextLevel];
            leveledUp = true;
            newLevel = nextLevel;
        }

        garden.updatedAt = new Date().toISOString();
        this.setStorage(garden);

        return { plant, leveledUp, newLevel };
    }

    // Add water drops (from answering questions)
    addWater(userId: string, amount: number): number {
        const garden = this.getGarden(userId);
        if (!garden) throw new Error('Garden not initialized');

        garden.availableWater += amount;
        garden.totalQuestionsAnswered += 1;
        garden.updatedAt = new Date().toISOString();

        this.setStorage(garden);
        return garden.availableWater;
    }

    // Get available water
    getAvailableWater(userId: string): number {
        const garden = this.getGarden(userId);
        return garden?.availableWater || 0;
    }

    // Get all plants
    getPlants(userId: string): Plant[] {
        const garden = this.getGarden(userId);
        return garden?.plants || [];
    }

    // Get plant by ID
    getPlant(userId: string, plantId: string): Plant | null {
        const garden = this.getGarden(userId);
        if (!garden) return null;
        return garden.plants.find(p => p.id === plantId) || null;
    }

    // Delete plant
    deletePlant(userId: string, plantId: string): void {
        const garden = this.getGarden(userId);
        if (!garden) throw new Error('Garden not initialized');

        garden.plants = garden.plants.filter(p => p.id !== plantId);
        garden.updatedAt = new Date().toISOString();

        this.setStorage(garden);
    }

    // Rename plant
    renamePlant(userId: string, plantId: string, newName: string): Plant {
        const garden = this.getGarden(userId);
        if (!garden) throw new Error('Garden not initialized');

        const plant = garden.plants.find(p => p.id === plantId);
        if (!plant) throw new Error('Plant not found');

        plant.name = newName;
        garden.updatedAt = new Date().toISOString();

        this.setStorage(garden);
        return plant;
    }

    // Get stats
    getStats(userId: string): {
        totalPlants: number;
        totalWater: number;
        highestLevel: PlantLevel;
        questionsAnswered: number;
    } {
        const garden = this.getGarden(userId);
        if (!garden) {
            return {
                totalPlants: 0,
                totalWater: 0,
                highestLevel: 1,
                questionsAnswered: 0,
            };
        }

        const highestLevel = garden.plants.reduce((max, plant) =>
            plant.level > max ? plant.level : max, 1 as PlantLevel
        );

        return {
            totalPlants: garden.plants.length,
            totalWater: garden.availableWater,
            highestLevel,
            questionsAnswered: garden.totalQuestionsAnswered,
        };
    }

    // Clear garden (for testing)
    clearGarden(userId: string): void {
        const garden = this.getGarden(userId);
        if (garden && garden.userId === userId) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

export const gardenStorage = new GardenStorage();
export { WATER_REQUIREMENTS };