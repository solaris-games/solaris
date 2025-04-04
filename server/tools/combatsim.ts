import {PlayerResearch} from "@solaris-common";
import containerLoader from "../services";
import config from "../config";
import {serverStub} from "../sockets/serverStub";
import {logger} from "../utils/logging";
import {DependencyContainer} from "../services/types/DependencyContainer";

type ReducedPlayer = {
    _id: string,
    research: Pick<PlayerResearch, 'weapons'>
}

type Carrier = {
    _id: string,
    specialistId: number;
    ships: number;
}

type Star = {
    _id: string,
    ships: number,
    playerId: string,
    specialistId: number,
}

type CombatGroup = {
    identifier: string,
    carriers: Carrier[],
    star: Star | undefined,
    players: ReducedPlayer[],
}

type PartiallyResolvedCombatGroup = CombatGroup & {
    ships: number,
    isDefender: boolean,
    isLargest: boolean,
}

type ResolvedCombatGroup = PartiallyResolvedCombatGroup & {
    effectiveWeaponsLevels: Map<string, number>,
    baseWeapons: number,
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
    const sides = groups.length;

    return groups.map(group => {
        const ownWeapons = group.baseWeapons;
        let ships = group.ships;

        for (const otherGroup of groups) {
            if (otherGroup.identifier === group.identifier) {
                continue;
            }

            const shipWeight = otherGroup.ships / sides;
            const effectiveWeapons = otherGroup.effectiveWeaponsLevels.get(group.identifier)!;
            const combatPower = effectiveWeapons * shipWeight;
            const shipDamage = combatPower / ownWeapons;
            ships -= shipDamage;
        }

        ships = Math.max(0, ships);

        return {
            ...group,
            resultShips: ships
        }
    });
}

const player = (id: string, weaponsLevel: number): ReducedPlayer => {
    return {
        _id: id,
        research: {
            weapons: {
                level: weaponsLevel,
                progress: 0
            },
        }
    }
}

const scenarios: Scenario[] = [
    {
        name: "C2S Basic 1",
        combatType: 'c2s',
        groups: [
            {
                identifier: 'A',
                carriers: [],
                star: {
                    _id: '1',
                    ships: 100,
                    playerId: 'A',
                    specialistId: 1,
                },
                players: [
                    player('A', 1)
                ],
                ships: 100,
                isDefender: false,
                isLargest: true,
                effectiveWeaponsLevels: new Map([['B', 1]]),
                baseWeapons: 1
            },
            {
                identifier: 'B',
                carriers: [],
                star: undefined,
                players: [
                    player('B', 1)
                ],
                ships: 50,
                isDefender: true,
                isLargest: false,
                effectiveWeaponsLevels: new Map([['A', 1]]),
                baseWeapons: 1
            }
        ]
    }
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