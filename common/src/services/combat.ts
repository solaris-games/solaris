import {Id} from "../types/id";
import {CombatGroupService} from "./combatGroup";
import {Star} from "../types/common/star";
import {Carrier} from "../types/common/carrier";

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