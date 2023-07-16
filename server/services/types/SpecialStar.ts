export type SpecialStarType = 
    'randomWormHoles' | 
    'randomNebulas' | 
    'randomAsteroidFields' | 
    'randomBlackHoles' | 
    'randomBinaryStars' | 
    'randomPulsars';

export interface SpecialStar {
    id: SpecialStarType,
    name: string;
};
