import { AiState } from './Ai';
import { DBObjectId } from "./DBObjectId";
import { PlayerShape } from './Player';

export type DiplomaticState = 'hostile' | 'neutral' | 'passive';
export type NonPlayerType = 'Dragon' | 'Trader'

export interface NonPlayerDiplomaticState { 
    playerId: DBObjectId;
    status: DiplomaticState;
}

export interface NonPlayer {
    _id: DBObjectId;
    aiState: AiState;
    stars: DBObjectId[];
    defeated: boolean;
    defeatedDate: Date | null;

    colour: {
        alias: string;
        value: string;
    };
    
    shape: PlayerShape;

    type: NonPlayerType;

    diplomacy: NonPlayerDiplomaticState[];
    alwaysAgressive: boolean;
    canDestroyInfrastructure: boolean;
}