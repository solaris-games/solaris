import mongoose from 'mongoose';
import CombatGroupService from '../services/combatGroup';
import { Carrier } from '../services/types/Carrier';
import { DBObjectId, objectId } from '../services/types/DBObjectId';
import { Game } from '../services/types/Game';
import { Player } from '../services/types/Player';

describe('combatGroup', () => {
    let combatGroupService: CombatGroupService;

    beforeAll(() => {
        // @ts-ignore
        combatGroupService = new CombatGroupService();
    });
    
    it('There should be no combat when at least one of the carriers involved is allied with every other player involved.', () => {
        let collidingCarriers: Carrier[] = [
            generateCarrier(1, 1, 100),
            generateCarrier(2, 1, 100),
            generateCarrier(3, 2, 100),
            generateCarrier(4, 3, 100),
            generateCarrier(5, 3, 100)
        ];

        const game: Game = {
            _id: objectId(createId(1)),
            galaxy: {
                players: [
                    generatePlayer(1, [3]),
                    generatePlayer(2, [3]),
                    generatePlayer(3, [1, 2]),
                ],
                carriers: [
                    ...collidingCarriers
                ]
            }
        } as unknown as Game;

        validateTestPlayerAllies(game.galaxy.players);

        const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

        expect(parallelBattles).not.toBeNull();
        expect(parallelBattles).not.toBeUndefined();
        expect(parallelBattles).toHaveSize(1);
        expect(parallelBattles[0]).toHaveSize(1);
        expect(parallelBattles[0][0]).toHaveSize(5);

        expect(parallelBattles[0][0][0]._id).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][0][0].ownedByPlayerId).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][0][0].ships).toEqual(100);

        expect(parallelBattles[0][0][1]._id).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][0][1].ownedByPlayerId).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][0][1].ships).toEqual(100);

        expect(parallelBattles[0][0][2]._id).toEqual(objectId(createId(3)));
        expect(parallelBattles[0][0][2].ownedByPlayerId).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][0][2].ships).toEqual(100);

        expect(parallelBattles[0][0][3]._id).toEqual(objectId(createId(4)));
        expect(parallelBattles[0][0][3].ownedByPlayerId).toEqual(objectId(createId(3)));
        expect(parallelBattles[0][0][3].ships).toEqual(100);

        expect(parallelBattles[0][0][4]._id).toEqual(objectId(createId(5)));
        expect(parallelBattles[0][0][4].ownedByPlayerId).toEqual(objectId(createId(3)));
        expect(parallelBattles[0][0][4].ships).toEqual(100);
    });

    it('There should be no combat when every player involved is ultimately allied with every other player involved.', () => {
        let collidingCarriers: Carrier[] = [
            generateCarrier(1, 1, 100),
            generateCarrier(2, 2, 100),
            generateCarrier(3, 3, 100),
            generateCarrier(4, 4, 100)
        ];

        const game: Game = {
            _id: objectId(createId(1)),
            galaxy: {
                players: [
                    generatePlayer(1, [2, 4]),
                    generatePlayer(2, [1, 3]),
                    generatePlayer(3, [2, 4]),
                    generatePlayer(4, [1, 3]),
                ],
                carriers: [
                    ...collidingCarriers
                ]
            }
        } as unknown as Game;

        validateTestPlayerAllies(game.galaxy.players);

        const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

        expect(parallelBattles).not.toBeNull();
        expect(parallelBattles).not.toBeUndefined();
        expect(parallelBattles).toHaveSize(1);
        expect(parallelBattles[0]).toHaveSize(1);
        expect(parallelBattles[0][0]).toHaveSize(4);

        for (let i = 0; i < 4; ++i) {
            expect(parallelBattles[0][0][i]._id).toEqual(objectId(createId(i + 1)));
            expect(parallelBattles[0][0][i].ownedByPlayerId).toEqual(objectId(createId(i + 1)));
            expect(parallelBattles[0][0][i].ships).toEqual(100);
        }
    });

    it('Two carriers belonging to two unallied players should fight.', () => {
        let collidingCarriers: Carrier[] = [
            generateCarrier(1, 1, 100),
            generateCarrier(2, 2, 100),
        ];

        const game: Game = {
            _id: objectId(createId(1)),
            galaxy: {
                players: [
                    generatePlayer(1, []),
                    generatePlayer(2, [])
                ],
                carriers: [
                    ...collidingCarriers
                ]
            }
        } as unknown as Game;

        validateTestPlayerAllies(game.galaxy.players);

        const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

        expect(parallelBattles).not.toBeNull();
        expect(parallelBattles).not.toBeUndefined();
        expect(parallelBattles).toHaveSize(1);
        expect(parallelBattles[0]).toHaveSize(2);
        expect(parallelBattles[0][0]).toHaveSize(1);
        expect(parallelBattles[0][1]).toHaveSize(1);

        for (let i = 0; i < 2; ++i) {
            expect(parallelBattles[0][i][0]._id).toEqual(objectId(createId(i + 1)));
            expect(parallelBattles[0][i][0].ownedByPlayerId).toEqual(objectId(createId(i + 1)));
            expect(parallelBattles[0][i][0].ships).toEqual(100);
        }
    });

    it('Three carriers belonging to two unallied players should fight (1).', () => {
        let collidingCarriers: Carrier[] = [
            generateCarrier(2, 2, 100),
            generateCarrier(1, 1, 75),
            generateCarrier(3, 1, 75),
        ];

        const game: Game = {
            _id: objectId(createId(1)),
            galaxy: {
                players: [
                    generatePlayer(1, []),
                    generatePlayer(2, [])
                ],
                carriers: [
                    ...collidingCarriers
                ]
            }
        } as unknown as Game;

        validateTestPlayerAllies(game.galaxy.players);

        const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

        expect(parallelBattles).not.toBeNull();
        expect(parallelBattles).not.toBeUndefined();
        expect(parallelBattles).toHaveSize(1);
        expect(parallelBattles[0]).toHaveSize(2);
        expect(parallelBattles[0][0]).toHaveSize(1);
        expect(parallelBattles[0][1]).toHaveSize(2);

        expect(parallelBattles[0][0][0]._id).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][0][0].ownedByPlayerId).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][0][0].ships).toEqual(100);

        expect(parallelBattles[0][1][0]._id).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][1][0].ownedByPlayerId).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][1][0].ships).toEqual(75);

        expect(parallelBattles[0][1][1]._id).toEqual(objectId(createId(3)));
        expect(parallelBattles[0][1][1].ownedByPlayerId).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][1][1].ships).toEqual(75);
    });

    it('Three carriers belonging to two unallied players should fight (2).', () => {
        let collidingCarriers: Carrier[] = [
            generateCarrier(1, 1, 100),
            generateCarrier(2, 2, 75),
            generateCarrier(3, 2, 75),
        ];

        const game: Game = {
            _id: objectId(createId(1)),
            galaxy: {
                players: [
                    generatePlayer(1, []),
                    generatePlayer(2, [])
                ],
                carriers: [
                    ...collidingCarriers
                ]
            }
        } as unknown as Game;

        validateTestPlayerAllies(game.galaxy.players);

        const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

        expect(parallelBattles).not.toBeNull();
        expect(parallelBattles).not.toBeUndefined();
        expect(parallelBattles).toHaveSize(1);
        expect(parallelBattles[0]).toHaveSize(2);
        expect(parallelBattles[0][0]).toHaveSize(1);
        expect(parallelBattles[0][1]).toHaveSize(2);

        expect(parallelBattles[0][0][0]._id).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][0][0].ownedByPlayerId).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][0][0].ships).toEqual(100);

        expect(parallelBattles[0][1][0]._id).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][1][0].ownedByPlayerId).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][1][0].ships).toEqual(75);

        expect(parallelBattles[0][1][1]._id).toEqual(objectId(createId(3)));
        expect(parallelBattles[0][1][1].ownedByPlayerId).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][1][1].ships).toEqual(75);
    });

    it('Increasing numbers of carriers belonging to unallied players should fight.', () => {
        for (let i = 2; i < 100; ++i) {
            let collidingCarriers: Carrier[] = Array.from({ length: i }, (v, i2) => generateCarrier(i2 + 1, i2 + 1, 100));

            const game: Game = {
                _id: objectId(createId(1)),
                galaxy: {
                    players: Array.from({ length: i }, (v, i2) => generatePlayer(i2 + 1, [])),
                    carriers: [
                        ...collidingCarriers
                    ]
                }
            } as unknown as Game;

            validateTestPlayerAllies(game.galaxy.players);

            const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

            expect(parallelBattles).not.toBeNull();
            expect(parallelBattles).not.toBeUndefined();
            expect(parallelBattles).toHaveSize(1);
            expect(parallelBattles[0]).toHaveSize(i);

            for (let k = 0; k < parallelBattles[0].length; ++k) {
                expect(parallelBattles[0][k]).toHaveSize(1);
                expect(parallelBattles[0][k][0]._id).toEqual(objectId(createId(k + 1)));
                expect(parallelBattles[0][k][0].ships).toEqual(100);
            }
        }
    });

    it('Carriers belonging to a mix of allied and unallied players should fight.', () => {
        let collidingCarriers: Carrier[] = [
            generateCarrier(1, 1, 100),
            generateCarrier(2, 2, 100),
            generateCarrier(3, 3, 100),
        ];

        const game: Game = {
            _id: objectId(createId(1)),
            galaxy: {
                players: [
                    generatePlayer(1, [2]),
                    generatePlayer(2, [1]),
                    generatePlayer(3, [])
                ],
                carriers: [
                    ...collidingCarriers
                ]
            }
        } as unknown as Game;

        validateTestPlayerAllies(game.galaxy.players);

        const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

        expect(parallelBattles).not.toBeNull();
        expect(parallelBattles).not.toBeUndefined();
        expect(parallelBattles).toHaveSize(1);
        expect(parallelBattles[0]).toHaveSize(2);
        expect(parallelBattles[0][0]).toHaveSize(2);
        expect(parallelBattles[0][1]).toHaveSize(1);

        expect(parallelBattles[0][0][0]._id).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][0][0].ownedByPlayerId).toEqual(objectId(createId(1)));
        expect(parallelBattles[0][0][0].ships).toEqual(100);

        expect(parallelBattles[0][0][1]._id).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][0][1].ownedByPlayerId).toEqual(objectId(createId(2)));
        expect(parallelBattles[0][0][1].ships).toEqual(100);

        expect(parallelBattles[0][1][0]._id).toEqual(objectId(createId(3)));
        expect(parallelBattles[0][1][0].ownedByPlayerId).toEqual(objectId(createId(3)));
        expect(parallelBattles[0][1][0].ships).toEqual(100);
    });

    it('Increasing numbers of carriers belonging to a mix of allied and unallied players should fight.', () => {
        
        for (let i = 2; i < 100; ++i) {
            let collidingCarriers: Carrier[] = Array.from({ length: i }, (v, i2) => generateCarrier(i2 + 1, i2 + 1, 100));

            // Ally every player whose number is a multiple of 3 with the preceding player.
            let calculateAllies: (i2: number) => number[] = (i2: number): number[] => {
                if ((i2 % 3) === 0) {
                    return [i2 - 1];
                }
                else if (((i2 + 1) % 3) === 0) {
                    return [i2 + 1]
                }

                return [];
            };

            const game: Game = {
                _id: objectId(createId(1)),
                galaxy: {
                    players: Array.from({ length: i }, (v, i2) => generatePlayer(i2 + 1, (i > 2 && (i2 < (i-1) || (i2+1) % 3 === 0) ? calculateAllies(i2 + 1) : []))),
                    carriers: [
                        ...collidingCarriers
                    ]
                }
            } as unknown as Game;

            //console.log(JSON.stringify(game.galaxy.players, null, 4));
            //console.log();
            //console.log('BREAK');
            //console.log();

            validateTestPlayerAllies(game.galaxy.players);

            const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

            //console.log(JSON.stringify(parallelBattles, null, 4));
            //console.log();
            //console.log('END');
            //console.log();

            expect(parallelBattles).not.toBeNull();
            expect(parallelBattles).not.toBeUndefined();
            expect(parallelBattles).toHaveSize(1);
            expect(parallelBattles[0]).toHaveSize(i - Math.floor(i / 3.0));

            let carrierIndex: number = 0;
            for (let k = 0; k < parallelBattles[0].length; ++k) {
                //console.log(`i: ${i}, k: ${k}, ${parallelBattles[0][k].length}, ${(k % 2 === 0 || ((i + 1) % 3 === 0) && k === (parallelBattles[0].length - 1)) ? 1 : 2}`);
                expect(parallelBattles[0][k]).toHaveSize((k % 2 === 0 || ((i + 1) % 3 === 0) && k === (parallelBattles[0].length - 1)) ? 1 : 2);

                for (let j = 0; j < parallelBattles[0][k].length; ++j) {
                    //console.log(`i: ${i}, k: ${k}, j: ${j}`);
                    expect(parallelBattles[0][k][j]._id).toEqual(objectId(createId(++carrierIndex)));
                    expect(parallelBattles[0][k][j].ownedByPlayerId).toEqual(objectId(createId(carrierIndex)));
                    expect(parallelBattles[0][k][j].ships).toEqual(100);
                }
            }
        }
    });

    it('Uninvolved players and carriers should not affect other carriers engaging in combat.', () => {
        let collidingCarriers: Carrier[] = [
            generateCarrier(1, 1, 100),
            generateCarrier(2, 2, 100)
        ];

        const game: Game = {
            _id: objectId(createId(1)),
            galaxy: {
                players: [
                    generatePlayer(1, [3]),
                    generatePlayer(2, [3]),
                    generatePlayer(3, [1, 2]),
                ],
                carriers: [
                    ...collidingCarriers,
                    generateCarrier(3, 3, 100)
                ]
            }
        } as unknown as Game;

        validateTestPlayerAllies(game.galaxy.players);

        const parallelBattles: Carrier[][][] = combatGroupService.getCombatGroups(game, collidingCarriers);

        expect(parallelBattles).not.toBeNull();
        expect(parallelBattles).not.toBeUndefined();
        expect(parallelBattles).toHaveSize(1);
        expect(parallelBattles[0]).toHaveSize(2);
        expect(parallelBattles[0][0]).toHaveSize(1);
        expect(parallelBattles[0][1]).toHaveSize(1);

        for (let i = 0; i < 2; ++i) {
            expect(parallelBattles[0][i][0]._id).toEqual(objectId(createId(i + 1)));
            expect(parallelBattles[0][i][0].ownedByPlayerId).toEqual(objectId(createId(i + 1)));
            expect(parallelBattles[0][i][0].ships).toEqual(100);
        }
    });

    function generatePlayer(id: number, allyIds: number[]): Player {
        return {
            _id: objectId(createId(id)), diplomacy: allyIds.map(a => { return { playerId: objectId(createId(a)), status: 'allies' } })
        } as unknown as Player;
    }

    function generateCarrier(id: number, ownedByPlayerId: number, ships: number): Carrier {
        return { _id: objectId(createId(id)), ownedByPlayerId: objectId(createId(ownedByPlayerId)), ships } as Carrier;
    }

    function createId(value: number): string {
        return value.toString(16).padStart(24, '0');
    }

    function validateTestPlayerAllies(players: Player[]) {
        for (let playerA of players) {

            let missingPlayerIds: string[] = playerA.diplomacy
                                                            .filter(d => d.status === 'allies' && !players.some(p => p._id.toString() === d.playerId.toString()))
                                                            .map(d => d.playerId.toString());

            // We throw rather than assert here because if you hit these errors then you've written your test incorrectly!  Fix it!

            if (missingPlayerIds.length > 0) {
                throw new Error(`Player ${playerA._id.toString()} is allied ${(missingPlayerIds.length === 1 ? 'with a player that does' : 'with players that do')} not exist: ${missingPlayerIds.join(', ')}`);
            }

            for (let playerB of players.filter(p => playerA.diplomacy.filter(d => d.status === 'allies').some(d => d.playerId.toString() === p._id.toString()))) {
                if (!playerB.diplomacy.some(d => d.status === 'allies' && d.playerId.toString() === playerA._id.toString())) {
                    throw new Error(`Player ${playerA._id.toString()} is allied with Player ${playerB._id.toString()}, but not vice-versa!`);
                }
            }
        }
    }
});

