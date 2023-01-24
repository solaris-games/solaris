import { AiState } from './Ai';
import { DBObjectId } from "./DBObjectId";
import { PlayerDiplomaticState, PlayerShape } from './Player';

export type NonPlayerType = 'Dragon' | 'Trader'

export interface NonPlayer {
    _id: DBObjectId;
    aiState: AiState;
    defeated: boolean;
    defeatedDate: Date | null;

    colour: {
        alias: string;
        value: string;
    };
    
    shape: PlayerShape;

    type: NonPlayerType;

    diplomacy: PlayerDiplomaticState[];
    alwaysAgressive: boolean;
}