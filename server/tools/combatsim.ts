import {Carrier, PlayerResearch, Star} from "@solaris-common";
import containerLoader from "../services";
import config from "../config";
import {serverStub} from "../sockets/serverStub";
import {logger} from "../utils/logging";
import {DependencyContainer} from "../services/types/DependencyContainer";
import {maxBy} from "../services/utils";
import {Game} from "../services/types/Game";
import {Player} from "../services/types/Player";

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

type ResolvedCombatGroup = CombatGroup & {
    effectiveWeaponsLevels: Map<string, number>
}

type Scenario = {
    name: string,
    groups: CombatGroup[],
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

const runScenario = (phase2: WeaponsLevelsResolver, phase3: CombatResolver) => (scenario: Scenario) => {
    const resolvedGroups = phase2(scenario);
    printGroupsBeforeCombat(resolvedGroups);
    const afterCombat = phase3(resolvedGroups, scenario.combatType);
    printCombatResults(afterCombat);
}

const weaponsLevelsResolver = ({ combatService, technologyService }: DependencyContainer): WeaponsLevelsResolver => (scenario) => {
    const groupsWithShipCounts = scenario.groups.map(group => {
        const ships = group.carriers.reduce((acc, carrier) => acc + (carrier.ships || 0), 0) + (group.star?.ships ?? 0);

        return {
            group,
            ships
        }
    });

    const largestGroupShipsCount = maxBy(({ ships }) => ships, groupsWithShipCounts) || 0;

    const groups = groupsWithShipCounts.map(({ group, ships }) => {
        const isDefender = Boolean(group.star);
        const isLargest = ships === largestGroupShipsCount;
        return {
            group,
            ships,
            isDefender,
            isLargest
        }
    });

    return groups.map(({ group, ships, isDefender }) => {
        const baseWeaponsLevel = maxBy((p) => p.research.weapons, group.players) ?? 0;

        const effectiveWeaponsLevels = new Map(groups.map(other => {
            return [other.group.identifier, baseWeaponsLevel]
        }))

        return {
            ...group,
            effectiveWeaponsLevels
        }
    });
};

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
        runScenario(weaponsLevelsResolver(container), combatResolver(container))(scenario);
    }
}

main();