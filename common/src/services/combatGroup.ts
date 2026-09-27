import { type Game } from "../types/common/game";
import type { Id } from "../types/id";
import type { CombatBasePlayer } from "../types/common/combat";

export type CombatPlayerGrouping<ID, P extends CombatBasePlayer<ID>> = {
    groups: P[][];
    mapping: Map<ID, number>; // maps player ID to combat group idx
};

interface IDiplomacyService<ID extends Id> {
    isFormalAlliancesEnabled(game: Game<ID>): boolean;
    isDiplomaticStatusToPlayersAllied(
        game: Game<ID>,
        playerId: ID,
        otherPlayerIds: ID[],
    ): boolean;
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

    computeCombatGroups<P extends CombatBasePlayer<ID>>(
        game: Game<ID>,
        players: P[],
    ): CombatPlayerGrouping<ID, P> {
        const alliesMap = new Map<P, P[]>();

        for (let player of players) {
            const allies = players.filter((other) =>
                this._areAllied(game, player, other),
            );
            alliesMap.set(player, allies);
        }

        let groups: P[][] = players.map((p) => [p]);

        // arguably, this is not the most efficient algorithm for computing this (in big-O notation).
        // However, we are assuming that n will be relatively small (usually <5)

        while (true) {
            let idx = 0;
            let changed = false;

            while (idx < groups.length) {
                const group = groups[idx];
                const candidates = group.flatMap(
                    (p) =>
                        alliesMap
                            .get(p)
                            ?.filter((ally) => !group.includes(ally)) || [],
                );

                if (candidates.length === 0) {
                    idx++;
                    continue;
                }

                let newGroups = [group];

                for (const otherGroup of groups) {
                    if (otherGroup === group) {
                        continue;
                    }

                    // union
                    if (otherGroup.find((op) => candidates.includes(op))) {
                        group.push(...otherGroup);
                        changed = true;
                    } else {
                        // group is distinct
                        newGroups.push(otherGroup);
                    }
                }

                groups = newGroups;
                idx = 0;
            }

            if (!changed) {
                break;
            }
        }

        const mapping: Map<ID, number> = new Map();
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            for (let player of group) {
                mapping.set(player._id, i);
            }
        }

        return {
            groups,
            mapping,
        };
    }

    _areAllied<P extends CombatBasePlayer<ID>>(
        game: Game<ID>,
        player1: P,
        player2: P,
    ) {
        return this.diplomacyService.isDiplomaticStatusToPlayersAllied(
            game,
            player1._id,
            [player2._id],
        );
    }
}
