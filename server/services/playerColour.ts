import {PlayerColourShapeCombination, PlayerShape} from "./types/Player";
import RandomService from "./random";

type ColourSpec = {
    alias: string;
    shades: string[];
}

const SHAPES: PlayerShape[] = ['circle', 'square', 'diamond', 'hexagon'];
const COLOURS: ColourSpec[] = require('../config/game/colours').slice();

export default class PlayerColourService {
    randomService: RandomService;

    constructor(randomService: RandomService) {
        this.randomService = randomService;
    }

    generateTeamColourShapeList(teamCount: number, playersPerTeam: number): Record<number, PlayerColourShapeCombination[]> {
        const coloursCount = COLOURS.length;

        const available: Record<string, { shape: PlayerShape, shade: string }[]> = {};

        for (const cs of COLOURS) {
            available[cs.alias] = cs.shades.map((shade, idx) => ({
                shade,
                shape: SHAPES[idx]
            }));
        }

        let colourIdx = 0;
        const result: Record<number, PlayerColourShapeCombination[]> = {};

        for (let ti = 0; ti < teamCount; ti++) {
            let fulfilled = 0;
            const combinations: PlayerColourShapeCombination[] = [];

            while (fulfilled < playersPerTeam) {
                const teamColourSpec = COLOURS[colourIdx % coloursCount];

                const availableShadesAndShapes = available[teamColourSpec.alias];

                if (!availableShadesAndShapes.length) {
                    colourIdx++;
                    continue;
                }

                const shadeAndShape = availableShadesAndShapes.pop()!;
                combinations.push({
                    shape: shadeAndShape.shape,
                    colour: {
                        alias: teamColourSpec.alias,
                        value: shadeAndShape.shade,
                    }
                });
                fulfilled++;
            }

            result[ti] = combinations;
            colourIdx++;
        }

        return result;
    }

    generatePlayerColourShapeList(playerCount: number): PlayerColourShapeCombination[] {
        const combinations: PlayerColourShapeCombination[] =
            COLOURS.flatMap(spec =>
                spec.shades.map((shade, idx) => {
                    return {
                        shape: SHAPES[idx],
                        colour: {
                            alias: spec.alias,
                            value: shade,
                        }
                    };
                }));

        const result: PlayerColourShapeCombination[] = [];

        const maxAttempts: number = 2;
        let attempts: number = 0;

        while (result.length !== playerCount) {
            // Choose a random shape colour combination
            let shapeColourIndex = this.randomService.getRandomNumber(combinations.length - 1);
            let shapeColour = combinations[shapeColourIndex];

            // Test if the colour is already in the list,
            // if it is, try again up to the max attempt limit.
            // Ideally we do not want to have the same colours often.
            let existingColour = result.find(r => r.colour.alias === shapeColour.colour.alias);

            if (!existingColour || attempts >= maxAttempts) {
                combinations.splice(shapeColourIndex, 1);
                result.push(shapeColour);
                attempts = 0;
            } else {
                attempts++;
            }
        }

        return result;
    }
}