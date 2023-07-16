export interface UserLevel {
    id: number;
    name: string;
    rankPoints: number;
    rankPointsNext?: number | null;
    rankPointsProgress?: number | null;
};
