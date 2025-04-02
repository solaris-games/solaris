import {Carrier, PlayerResearch, Star} from "@solaris-common";

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

const main = () => {

}

main();