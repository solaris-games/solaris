import {RandomGen} from "solaris-common";

const randomSeeded = require('random-seed');

export class MathRandomGen implements RandomGen {
    getRandomNumber(max: number): number {
        return Math.floor(Math.random() * (max + 1))
    }

    getRandomNumberBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    random(): number {
        return Math.random();
    }
}

export class SeededRandomGen implements RandomGen {
    private rg: any;

    constructor(seed: string) {
        this.rg = randomSeeded.create(seed);
        this.random = this.random.bind(this);
    }

    getRandomNumber(max: number): number {
        return Math.floor(this.random() * (max + 1))
    }

    getRandomNumberBetween(min: number, max: number): number {
        return Math.floor(this.random() * (max - min + 1) + min);
    }

    random(): number {
        return this.rg.random();
    }
}