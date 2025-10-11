export interface RandomGen {
    getRandomNumber(max: number): number;
    getRandomNumberBetween(min: number, max: number): number;
    random(): number;
}