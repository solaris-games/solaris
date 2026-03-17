import type {Id} from "../types/id";
import type {CombatGroupService} from "./combatGroup";
import type {Star} from "../types/common/star";
import type {Carrier} from "../types/common/carrier";

export class CombatService<ID extends Id> {
    combatGroupService: CombatGroupService<ID>;

    constructor(combatGroupService: CombatGroupService<ID>) {
        this.combatGroupService = combatGroupService;
    }

    performStar(star: Star<ID>, carriers: Carrier<ID>[]) {

    }

    performCarrier(carriers: Carrier<ID>[]) {

    }
}