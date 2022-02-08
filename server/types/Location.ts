export interface Location {
    x: number;
    y: number;
};

export interface LocationGeneration extends Location {
    homeStar: boolean | null;
    linkedLocations: LocationGeneration[];
    distanceToClosestReachable: number | null;
    closestReachable: LocationGeneration | null;
};
