import { Location } from "./types/Location";

export default class RandomService {

    getRandomNumber(max: number) {
        return Math.floor(Math.random() * max);
    }

    // Note that the max is INCLUSIVE
    getRandomNumberBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getRandomNumberBetweenEXP(min: number, max: number, P1: number = 0.5): number {
        // P1 is the chance that the result is below half. So if the end result is between 0 and 1, like a Math.random,
        // P1 describes the chance of the number being between 0 and 0.5, this makes P2 the chance of it being between 0.5 and 1
        let P2 = 1 - P1;
        if (P1 <= 0) {
            return max;
        } else if (P1 >= 1) {
            return min;
        }
        let t = Math.random()
        let exp = Math.log(P2) / Math.log(0.5)
        // t**exp is still a value between 0 and 1, however the odds on each range is not the same, for example, if exp = 2, the odds on t**exp > 0.5 are 75%,
        return Math.floor(t**exp * (max - min + 1) + min);
    }

    getRandomAngle(): number {
        return Math.random() * Math.PI * 2;
    }

    getRandomRadius(maxRadius: number, offset: number): number {
        return maxRadius * Math.random()**offset;
    }

    getRandomRadiusInRange(minRadius: number, maxRadius: number): number {
        return (Math.random()*(maxRadius**2 - minRadius**2) + minRadius**2)**0.5;
    }

    getRandomPositionInCircle(maxRadius: number, offset: number = 0.5): Location {
        let angle = this.getRandomAngle();
        let radius = this.getRandomRadius(maxRadius, offset);

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }

    getRandomPositionInCircleFromOrigin(originX: number, originY: number, radius: number): Location {
        let position = this.getRandomPositionInCircle(radius);

        position.x += originX;
        position.y += originY;

        return position;
    }

    getRandomPositionInDoughnut(minRadius: number, maxRadius: number): Location {
        let angle = this.getRandomAngle();
        let radius = this.getRandomRadiusInRange(minRadius, maxRadius)
    
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }

    generateStarNaturalResources(radius: number, x: number, y: number, minResources: number, maxResources: number, fuzzy: boolean = false): number {
        const RS_BASE = 2;
        const RS_EXPONENT = 5.8;

        let vector = Math.hypot(x, y);
        
        //How far from the outside (%) is the point
        let vectorScale = (radius - vector) / radius;

        let resourceRange = maxResources - minResources;

        let naturalResources = minResources + (resourceRange * vectorScale);

        // TODO: This is a better approach however appears to be incorrect. Seems to be returning
        // the reverse of what is intended. i.e Center of the galaxy returns max resources instead of min.
        // let naturalResources = minResources + (resourceRange * Math.pow(RS_BASE, -RS_EXPONENT * Math.pow(vectorScale, 2)));

        if (fuzzy) {
            const FUZZY_LIMIT = 10;

            let floorFuzzyNR = Math.max(minResources, naturalResources - FUZZY_LIMIT);
            let ceilFuzzyNR = Math.min(maxResources, naturalResources + FUZZY_LIMIT);

            naturalResources = this.getRandomNumberBetween(floorFuzzyNR, ceilFuzzyNR);
        }

        // Double check.
        naturalResources = Math.max(minResources, naturalResources);
        naturalResources = Math.min(maxResources, naturalResources);

        return naturalResources;
    }

};
