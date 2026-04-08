import type {Id} from "../types/id";
import type {CombatGroupService} from "./combatGroup";
import type {Star} from "../types/common/star";
import type {Carrier} from "../types/common/carrier";
import {Game} from "../types/common/game";

export class CombatService<ID extends Id> {
    combatGroupService: CombatGroupService<ID>;

    constructor(combatGroupService: CombatGroupService<ID>) {
        this.combatGroupService = combatGroupService;
    }

    performStar(game: Game<ID>, star: Star<ID>, carriers: Carrier<ID>[]) {
        const playerIds = new Set<ID>([star.ownedByPlayerId!]);

        carriers.forEach((c) => playerIds.add(c.ownedByPlayerId!));

        const players = Array.from(playerIds, (p) => game.galaxy.players.find(pl => pl._id === p)!);

        const combatGroups = this.combatGroupService.computeCombatGroups(game, players);


    }

    performCarrier(game: Game<ID>, carriers: Carrier<ID>[]) {

    }
}