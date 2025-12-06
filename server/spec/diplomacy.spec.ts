import DiplomacyService from '../services/diplomacy';
import { DiplomaticState } from 'solaris-common';

describe('diplomacy', () => {

    const fakeGameRepo: any = {};
    const fakeEventRepo: any = {};
    const fakeDiplomacyUpkeepService: any = {};

    let service: DiplomacyService;

    beforeEach(() => {
        service = new DiplomacyService(fakeGameRepo, fakeEventRepo, fakeDiplomacyUpkeepService);
    });

    // ------------------------
    // Formal alliances enabled

    it('should return true if formal alliances is enabled', () => {
        const game: any = {
            settings: {
                diplomacy: {
                    enabled: 'enabled'
                }
            }
        };

        let result = service.isFormalAlliancesEnabled(game);

        expect(result).toBeTrue();
    });

    it('should return false if formal alliances is disabled', () => {
        const game: any = {
            settings: {
                diplomacy: {
                    enabled: 'disabled'
                }
            }
        };

        let result = service.isFormalAlliancesEnabled(game);

        expect(result).toBeFalse();
    });

    // ------------------------
    // Trade restricted enabled

    it('should return true if trade restricted is enabled', () => {
        const game: any = {
            settings: {
                diplomacy: {
                    tradeRestricted: 'enabled'
                }
            }
        };

        let result = service.isTradeRestricted(game);

        expect(result).toBeTrue();
    });

    it('should return false if trade restricted is disabled', () => {
        const game: any = {
            settings: {
                diplomacy: {
                    tradeRestricted: 'disabled'
                }
            }
        };

        let result = service.isTradeRestricted(game);

        expect(result).toBeFalse();
    });

    // ------------------------
    // Max alliances enabled

    it('should return true if max alliances is enabled', () => {
        const game: any = {
            settings: {
                general: {
                    playerLimit: 8
                },
                diplomacy: {
                    maxAlliances: 6
                }
            }
        };

        let result = service.isMaxAlliancesEnabled(game);

        expect(result).toBeTrue();
    });

    it('should return false if max alliances is disabled', () => {
        const game: any = {
            settings: {
                general: {
                    playerLimit: 8
                },
                diplomacy: {
                    maxAlliances: 7
                }
            }
        };

        let result = service.isMaxAlliancesEnabled(game);

        expect(result).toBeFalse();
    });

    // ------------------------
    // Gloal events enabled

    it('should return true if global events is enabled', () => {
        const game: any = {
            settings: {
                diplomacy: {
                    globalEvents: 'enabled'
                }
            }
        };

        let result = service.isGlobalEventsEnabled(game);

        expect(result).toBeTrue();
    });

    it('should return false if global events is disabled', () => {
        const game: any = {
            settings: {
                diplomacy: {
                    globalEvents: 'disabled'
                }
            }
        };

        let result = service.isGlobalEventsEnabled(game);

        expect(result).toBeFalse();
    });

    // ------------------------
    // Get diplomatic status to player

    const _playerIdA: any = 1;
    const _playerAliasA: string = 'Player 1';

    const _playerIdB: any = 2;
    const _playerAliasB: string = 'Player 2';

    const setupPlayerDiplomacyGame = (playerAStatusToB: DiplomaticState, playerBStatusToA: DiplomaticState) => {
        const game: any = {
            galaxy: {
                players: [
                    {
                        _id: _playerIdA,
                        alias: _playerAliasA,
                        diplomacy: [
                            {
                                playerId: _playerIdB,
                                status: playerAStatusToB
                            }
                        ]
                    },
                    {
                        _id: _playerIdB,
                        alias: _playerAliasB,
                        diplomacy: [
                            {
                                playerId: _playerIdA,
                                status: playerBStatusToA
                            }
                        ]
                    }
                ]
            }
        };

        return game;
    };

    const assertGetDiplomaticStatusToPlayer = (playerAStatusToB: DiplomaticState, playerBStatusToA: DiplomaticState, expectedStatus: DiplomaticState) => {
        const game = setupPlayerDiplomacyGame(playerAStatusToB, playerBStatusToA);

        let result = service.getDiplomaticStatusToPlayer(game, _playerIdA, _playerIdB);

        expect(result.playerIdFrom).toBe(_playerIdA);
        expect(result.playerIdTo).toBe(_playerIdB);
        expect(result.playerFromAlias).toBe(_playerAliasA);
        expect(result.playerToAlias).toBe(_playerAliasB);
        expect(result.statusFrom).toBe(playerBStatusToA);
        expect(result.statusTo).toBe(playerAStatusToB);
        expect(result.actualStatus).toBe(expectedStatus);
    };

    it('should return allies if players are allied', () => {
        assertGetDiplomaticStatusToPlayer('allies', 'allies', 'allies');
    });

    it('should return neutral if at least one or both players are neutral', () => {
        assertGetDiplomaticStatusToPlayer('allies', 'neutral', 'neutral');
        assertGetDiplomaticStatusToPlayer('neutral', 'allies', 'neutral');
        assertGetDiplomaticStatusToPlayer('neutral', 'neutral', 'neutral');
    });

    it('should return enemies if at least one player is enemies', () => {
        assertGetDiplomaticStatusToPlayer('allies', 'enemies', 'enemies');
        assertGetDiplomaticStatusToPlayer('neutral', 'enemies', 'enemies');
        assertGetDiplomaticStatusToPlayer('enemies', 'allies', 'enemies');
        assertGetDiplomaticStatusToPlayer('enemies', 'neutral', 'enemies');
        assertGetDiplomaticStatusToPlayer('enemies', 'enemies', 'enemies');
    });

    // ------------------------
    // Get diplomatic status between players

    const assertGetDiplomaticStatusBetweenPlayers = (playerAStatusToB: DiplomaticState, playerBStatusToA: DiplomaticState, expectedStatus: DiplomaticState) => {
        const game = setupPlayerDiplomacyGame(playerAStatusToB, playerBStatusToA);

        let result = service.getDiplomaticStatusBetweenPlayers(game, [_playerIdA, _playerIdB]);

        expect(result).toBe(expectedStatus);
    };

    it('should return allies if all players are allied', () => {
        assertGetDiplomaticStatusBetweenPlayers('allies', 'allies', 'allies');
    });

    it('should return neutral if all players are neutral', () => {
        assertGetDiplomaticStatusBetweenPlayers('allies', 'neutral', 'neutral');
        assertGetDiplomaticStatusBetweenPlayers('neutral', 'allies', 'neutral');
        assertGetDiplomaticStatusBetweenPlayers('neutral', 'neutral', 'neutral');
    });

    it('should return enemies if at least one player is enemies', () => {
        assertGetDiplomaticStatusBetweenPlayers('allies', 'enemies', 'enemies');
        assertGetDiplomaticStatusBetweenPlayers('neutral', 'enemies', 'enemies');
        assertGetDiplomaticStatusBetweenPlayers('enemies', 'allies', 'enemies');
        assertGetDiplomaticStatusBetweenPlayers('enemies', 'neutral', 'enemies');
        assertGetDiplomaticStatusBetweenPlayers('enemies', 'enemies', 'enemies');
    });

});
