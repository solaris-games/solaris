export type SpecialStarType = 
    'randomWormHoles' | 
    'randomNebulas' | 
    'randomAsteroidFields' | 
    'randomBlackHoles' | 
    'randomBinaryStars' | 
    'randomPulsars';

export type SpecialStar = {
    id: SpecialStarType,
    name: string,
};
