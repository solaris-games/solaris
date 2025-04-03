import {Carrier, PlayerResearch, Star} from "@solaris-common";
import containerLoader from "../services";
import config from "../config";
import {serverStub} from "../sockets/serverStub";
import {logger} from "../utils/logging";
import {DependencyContainer} from "../services/types/DependencyContainer";
import {maxBy} from "../services/utils";
import {Game} from "../services/types/Game";
import {Player} from "../services/types/Player";
import TechnologyService from "../services/technology";

type ReducedPlayer = {
    _id: string,
    research: Pick<PlayerResearch, 'weapons'>
}

type CombatGroup = {
    identifier: string,
    carriers: Carrier<string>[],
    star: Star<string> | undefined,
    players: ReducedPlayer[],
}

type PartiallyResolvedCombatGroup = CombatGroup & {
    ships: number,
    isDefender: boolean,
    isLargest: boolean,
}

type ResolvedCombatGroup = PartiallyResolvedCombatGroup & {
    effectiveWeaponsLevels: Map<string, number>,
}

type Scenario = {
    name: string,
    groups: ResolvedCombatGroup[],
    combatType: 'c2c' | 'c2s'
}

type CombatGroupResult = ResolvedCombatGroup & {
    resultShips: number,
};

type WeaponsLevelsResolver = (scenario: Scenario) => ResolvedCombatGroup[];

type CombatResolver = (groups: ResolvedCombatGroup[], combatType: 'c2c' | 'c2s') => CombatGroupResult[];

const computeTotalShips = (group: ResolvedCombatGroup) => {
    return (group.star?.ships ?? 0) + group.carriers.reduce((acc, carrier) => acc + (carrier.ships || 0), 0);
}

const printGroupsBeforeCombat = (groups: ResolvedCombatGroup[]) => {
    for (let group of groups) {
        const totalShips = computeTotalShips(group);

        const effectiveWeapons: Map<number, string[]> = new Map();

        for (let [playerId, level] of group.effectiveWeaponsLevels) {
            if (!effectiveWeapons.has(level)) {
                effectiveWeapons.set(level, []);
            }

            effectiveWeapons.get(level)?.push(playerId);
        }

        const weaponsStr = Array.from(effectiveWeapons.entries()).map(([level, players]) => `${players.join(', ')}: ${level}`).join('| ');
        console.log(`Group ${group.identifier}: ${totalShips} ships, weapons: ${weaponsStr}`);
    }
}

const printCombatResults = (results: CombatGroupResult[]) => {
    for (let result of results) {
        console.log(`Group ${result.identifier} has ${result.resultShips} ships remaining`);
    }

    const winner = results.find(g => g.resultShips > 0);
    if (winner) {
        console.log(`Winner: ${winner.identifier}`);
    } else {
        console.log('No winner');
    }
}

const runScenario = (phase3: CombatResolver) => (scenario: Scenario) => {
    printGroupsBeforeCombat(scenario.groups);
    const afterCombat = phase3(scenario.groups, scenario.combatType);
    printCombatResults(afterCombat);
}

const combatResolver = (container: DependencyContainer): CombatResolver => (groups, combatType) => {
    return groups.map(group => ({
        ...group,
        resultShips: computeTotalShips(group)
    }));
}

const scenarios: Scenario[] = [

];

const main = () => {
    const log = logger('combat-sim');
    const container = containerLoader(config, serverStub, log);

    for (let scenario of scenarios) {
        console.log(`Running scenario: ${scenario.name}`);
        runScenario(combatResolver(container))(scenario);
    }
}

main();