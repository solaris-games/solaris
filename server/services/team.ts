import {DBObjectId} from "./types/DBObjectId";
import {Game, Team} from "./types/Game";
import {Player} from "./types/Player";
import mongoose from "mongoose";
import DiplomacyService from "./diplomacy";

export type TeamAssignments = Record<number, number>;

export default class TeamService {
    diplomacyService: DiplomacyService;

    constructor(diplomacyService: DiplomacyService) {
        this.diplomacyService = diplomacyService;
    }

    getById(game: Game, id: DBObjectId): Team | null {
        return game.galaxy?.teams?.find(team => team._id.toString() === id.toString()) || null;
    }

    generateTeamAssignments(playerLimit: number, teamCount: number): TeamAssignments {
        const assignments = {};

        const playerNumbers = Array.from({length: playerLimit}, (_, i) => i + 1);

        // TODO: Shuffle if needed

        for (let teamI = 0; teamI < teamCount; teamI++) {
            const teamPlayerCount = Math.floor(playerLimit / teamCount);
            const teamPlayerNumbers = playerNumbers.splice(0, teamPlayerCount);

            for (const playerNumber of teamPlayerNumbers) {
                assignments[playerNumber] = teamI;
            }
        }

        return assignments;
    }
}