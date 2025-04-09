import {PlayerResearch} from "@solaris-common";
import containerLoader from "../services";
import config from "../config";
import {serverStub} from "../sockets/serverStub";
import {logger} from "../utils/logging";
import {DependencyContainer} from "../services/types/DependencyContainer";
import {maxBy} from "../services/utils";
import {Game} from "../services/types/Game";
import {Attacker, Defender} from "../services/types/Combat";

type ReducedPlayer = {
    _id: string,
    research: Pick<PlayerResearch, 'weapons'>
}

type Carrier = {
    _id: string,
    specialistId: number | undefined;
    ships: number;
}

type Star = {
    _id: string,
    ships: number,
    playerId: string,
    specialistId: number | undefined,
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

const runScenario = (phase2: WeaponsLevelsResolver, phase3: CombatResolver, name: string) => (scenario: Scenario) => {
    const resolvedGroups = phase2(scenario);
    console.log(`Runner ${name}`);
    printGroupsBeforeCombat(resolvedGroups);
    const afterCombat = phase3(resolvedGroups, scenario.combatType);
    printCombatResults(afterCombat);
    console.log('-----------------------------------');
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

    return groups.map(({ group, ships, isDefender, isLargest }) => {
        const baseWeaponsLevel = maxBy((p) => p.research.weapons.level, group.players) ?? 0;

        const effectiveWeaponsLevels = new Map();
        groups.forEach(other => {
            effectiveWeaponsLevels.set(other.group.identifier, baseWeaponsLevel);
        });

        const res: ResolvedCombatGroup = {
            ...group,
            baseWeapons: baseWeaponsLevel,
            effectiveWeaponsLevels,
            ships,
            isDefender,
            isLargest,
        };

        return res;
    });
};

const combatPowerCombatResolver = (container: DependencyContainer): CombatResolver => (groups, combatType) => {
    const sides = groups.length;

    return groups.map(group => {
        const ownWeapons = group.baseWeapons;
        let ships = group.ships;

        for (const otherGroup of groups) {
            if (otherGroup.identifier === group.identifier) {
                continue;
            }

            const shipWeight = otherGroup.ships / (sides - 1);
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

const legacyCombatResolver = (container: DependencyContainer): CombatResolver => (groups, combatType) => {
    const combatService = container.combatService;

    const attackerGroup = groups.find(g => !g.isDefender)!;
    const defenderGroup = groups.find(g => g.isDefender)!;

    const defender: Defender = {
        ships: defenderGroup.ships,
        weaponsLevel: defenderGroup.effectiveWeaponsLevels.get(attackerGroup.identifier)!
    };

    const attacker: Attacker = {
        ships: attackerGroup.ships,
        weaponsLevel: attackerGroup.effectiveWeaponsLevels.get(defenderGroup.identifier)!
    };

    const result = combatService.calculate(defender, attacker, combatType === 'c2s');

    return [
        {
            ...attackerGroup,
            resultShips: result.after.attacker,
        },
        {
            ...defenderGroup,
            resultShips: result.after.defender,
        }
    ]
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
                    specialistId: undefined,
                },
                players: [
                    player('A', 1)
                ],
            },
            {
                identifier: 'B',
                carriers: [
                    {
                        _id: '2',
                        specialistId: undefined,
                        ships: 50,
                    }
                ],
                star: undefined,
                players: [
                    player('B', 1)
                ],
            }
        ]
    }
];

const main = () => {
    const log = logger('combat-sim');
    const container = containerLoader(config, serverStub, log);

    for (let scenario of scenarios) {
        console.log(`Running scenario: ${scenario.name}`);
        runScenario(weaponsLevelsResolver(container), legacyCombatResolver(container), "legacy")(scenario);
        runScenario(weaponsLevelsResolver(container), combatPowerCombatResolver(container), "combatpower")(scenario);
    }
}

main();