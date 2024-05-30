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

        const playerNumbers = Array.from({length: playerLimit}, (_, i) => i);

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

    async setDiplomacyStates(game: Game) {
        if (game.settings.general.mode !== 'teamConquest') {
            return;
        }

        const teams = game.galaxy.teams!;

        const teamsNumber = teams.length;

        for (let ti = 0; ti < teamsNumber; ti++) {
            const team = teams[ti];
            const playersForTeam = team.players.map(pid => game.galaxy.players.find(p => p._id.toString() === pid.toString())!);

            for (let pi1 = 0; pi1 < playersForTeam.length; pi1++) {
                for (let pi2 = 0; pi2 < playersForTeam.length; pi2++) {
                    if (pi1 === pi2) {
                        continue;
                    }

                    await this.diplomacyService.declareAlly(game, playersForTeam[pi1]._id, playersForTeam[pi2]._id, false);
                }
            }
        }
    }
}