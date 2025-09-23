import {Player, PlayerColour, PlayerColourShapeCombination, PlayerShape} from "./types/Player";
import RandomService from "./random";
import {shuffle} from "./utils";
import {Game} from "./types/Game";
import {DBObjectId} from "./types/DBObjectId";
import {MathRandomGen} from "../utils/randomGen";

type ColourGroup = {
    group: string;
    colours: PlayerColour[];
}

const SHAPES: PlayerShape[] = ['circle', 'square', 'diamond', 'hexagon'];
const COLOURS: ColourGroup[] = require('../config/game/colours').slice();

export default class PlayerColourService {
    randomService: RandomService;

    constructor(randomService: RandomService) {
        this.randomService = randomService;
    }

    getColourList(): PlayerColour[] {
        return COLOURS.flatMap(spec => spec.colours);
    }

    async setColourOverride(game: Game, player: Player, overridePlayer: string, colour: PlayerColour) {
        player.colourMapping = player.colourMapping || new Map();
        player.colourMapping.set(overridePlayer, colour);

        await game.save();
    }

    generateTeamColourShapeList(teamCount: number, teamPlayerCounts: number[]): Record<number, PlayerColourShapeCombination[]> {
        const coloursCount = COLOURS.length;

        const available: Record<string, { shape: PlayerShape, colour: PlayerColour }[]> = {};

        for (const cs of COLOURS) {
            available[cs.group] = cs.colours.map((colour, idx) => ({
                colour,
                shape: SHAPES[idx]
            }));
        }

        let colourIdx = 0;
        const result: Record<number, PlayerColourShapeCombination[]> = {};

        for (let ti = 0; ti < teamCount; ti++) {
            let fulfilled = 0;
            const combinations: PlayerColourShapeCombination[] = [];

            while (fulfilled < teamPlayerCounts[ti]) {
                const teamColourSpec = COLOURS[colourIdx % coloursCount];

                const availableShapesAndColours = available[teamColourSpec.group];

                if (!availableShapesAndColours.length) {
                    colourIdx++;
                    continue;
                }

                const shapeAndColour = availableShapesAndColours.pop()!;
                combinations.push({
                    shape: shapeAndColour.shape,
                    colour: shapeAndColour.colour
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
                spec.colours.map((colour, idx) => {
                    return {
                        shape: SHAPES[idx],
                        colour
                    };
                }));

        shuffle(new MathRandomGen(), combinations);
        return combinations.slice(0, playerCount);
    }
}