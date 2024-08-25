import { Carrier } from './types/Carrier';
import { Game } from './types/Game';
import { Player } from './types/Player';

export default class CombatGroupService {
    
    constructor() {
    }

    public getCombatGroups(game: Game, carriers: Carrier[]): Carrier[][][] {
        let playerParallelBattles: Player[][][] = [];

        let playerCarriers
            = Map.groupBy(carriers, c => c.ownedByPlayerId?.toString());

        let involvedPlayerIds: (string | undefined)[] = Array.from(playerCarriers.keys());

        // Ensure the players are ordered in the same order as the carrier owners.
        let applicablePlayers: Player[] = game.galaxy.players.filter(p => involvedPlayerIds.includes(p._id.toString()))
                                                            .sort((a, b) => involvedPlayerIds.indexOf(a._id.toString()) - involvedPlayerIds.indexOf(b._id.toString()));

        // If any carrier belongs to a player who is allied to all other involved players, put them all in the same combat group.
        // They're all friends here...
        if (applicablePlayers.some(p => applicablePlayers.every(p2 => p.diplomacy.some(d => d.playerId == p._id)))) {
            return [[carriers]];
        }

        let playerAllies: Map<string, string[]>
            = new Map(applicablePlayers.map(p => [p._id.toString(), this.flattenAllies(applicablePlayers, this.getPlayerAllyPlayerIds(applicablePlayers, p))]));

        while (applicablePlayers.length > 0) {
            playerParallelBattles.push(this.buildPlayerCombatGroups(applicablePlayers, playerAllies));
        }

        // Finally we bring the carriers into the picture and construct our parallel battles of carrier combat groups.
        // For example, this situation with 5 players, where players 1 and 3 have two carriers, and the rest have one:
        //[
        //  [
        //    [player1, player2],
        //    [player3]
        //  ],
        //  [
        //    [player4],
        //    [player5]
        //  ]
        //]
        // Becomes:
        //[
        //  [
        //    [player1Carrier1, player1Carrier2, player2Carrier1],
        //    [player3Carrier1, player3Carrier2]
        //  ],
        //  [
        //    [player4Carrier1],
        //    [player5Carrier1]
        //  ]
        //]

        return playerParallelBattles
                        .map(pb => pb.map(cg => cg.flatMap(p => playerCarriers.get(p._id.toString())!)));
    }

    private buildPlayerCombatGroups(applicablePlayers: Player[], playerAllies: Map<string, string[]>): Player[][] {
        let originalApplicablePlayers: Player[] = [...applicablePlayers];

        let playerCombatGroups: Player[][] = [];

        for (let i = 0; i < applicablePlayers.length; ++i) {
            let alliedCombatGroups: Player[][]
                = playerCombatGroups.filter(pcg => pcg.some(p => playerAllies.get(p._id.toString())!.includes(applicablePlayers[i]._id.toString())));

            let destinationCombatGroup: Player[] | null = null;

            if (alliedCombatGroups.length === 0) {
                destinationCombatGroup = [];
                playerCombatGroups.push(destinationCombatGroup);
            }
            else if (alliedCombatGroups.length === 1) {
                destinationCombatGroup = alliedCombatGroups[0];
            }

            if (destinationCombatGroup != null) {
                destinationCombatGroup.push(applicablePlayers[i]);
            }
        }

        applicablePlayers.splice(0, applicablePlayers.length);

        for (let player of originalApplicablePlayers.filter(oap => !playerCombatGroups.some(pcg => pcg.includes(oap)))) {
            applicablePlayers.push(player);
        }

        return playerCombatGroups;
    }

    private flattenAllies(players: Player[], allyPlayerIds: string[]): string[] {
        let flattenedAllies: string[] = [];

        this.flattenAlliesInternal(players, allyPlayerIds, flattenedAllies);

        return [...new Set(flattenedAllies)];
    }

    private flattenAlliesInternal(players: Player[], allyPlayerIds: string[], flattenedAllies: string[]) {
        for (let allyPlayerId of allyPlayerIds) {
            if (!flattenedAllies.includes(allyPlayerId)) {
                let player: Player = players.find(p => p._id.toString() === allyPlayerId)!;

                flattenedAllies.push(allyPlayerId);
                this.flattenAlliesInternal(players, this.getPlayerAllyPlayerIds(players, player), flattenedAllies);
            }
        }
    }

    private getPlayerAllyPlayerIds(players: Player[], player: Player): string[] {
        return player.diplomacy.filter(d => d.status === 'allies' && players.some(p => p._id.toString() === d.playerId.toString())).map(p => p.playerId.toString());
    }
}