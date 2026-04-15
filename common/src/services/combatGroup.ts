import { type Game } from '../types/common/game';
import { type Player } from '../types/common/player';
import type {Id} from "../types/id";

export type CombatGroupResult<ID> = {
    groups: Player<ID>[][],
    mapping: Map<ID, number>, // maps player ID to combat group idx
}

interface IDiplomacyService<ID extends Id> {
    isFormalAlliancesEnabled(game: Game<ID>): boolean;
    isDiplomaticStatusToPlayersAllied(game: Game<ID>, playerId: ID, otherPlayerIds: ID[]): boolean;
}

/*
Theoretical perspective on combat groups:
"Alliance" is a relation that is obviously symmetric: allies(a, b) <=> allies(b, a)
To compute combat groups, we extend this to transitivity: allies(a, b) & allies(b, c) => allies(a, c)
Thus, in the alliance graph, a combat group for player a is the closure allies*(a).
If multiple distinct closures exist, they are subgraphs without connections, and therefore multiple combat groups exist => combat happens.
 */
export class CombatGroupService<ID extends Id> {
    diplomacyService: IDiplomacyService<ID>;

    constructor(diplomacyService: IDiplomacyService<ID>) {
        this.diplomacyService = diplomacyService;
    }

    computeCombatGroups(game: Game<ID>, players: Player<ID>[]): CombatGroupResult<ID> {
        const queue = Array.from(players);

        const groups: Player<ID>[][] = [];
        const mapping: Map<ID, number> = new Map();

        let groupIdx = 0;
        while (queue.length > 0) {
            const next = queue.pop()!;
            mapping.set(next._id, groupIdx);
            const group = [next];

            for (let i = 0; i < queue.length; i++) {
                const candidate = queue[i];

                if (group.find((p) => this._areAllied(game, p, candidate))) {
                    group.push(candidate);
                    mapping.set(candidate._id, groupIdx);
                    queue.splice(i, 1);
                    i--;
                }
            }

            groups.push(group);
            groupIdx++;
        }

        return {
            groups,
            mapping,
        };
    }

    _areAllied(game: Game<ID>, player1: Player<ID>, player2: Player<ID>) {
        return this.diplomacyService.isDiplomaticStatusToPlayersAllied(game, player1._id, [player2._id]);
    }
}