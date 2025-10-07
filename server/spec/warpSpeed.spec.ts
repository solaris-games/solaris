import CarrierMovementService from '../services/carrierMovement';
import StarService from '../services/star';
import mongoose from 'mongoose';

let playerId,
    carrierId,
    sourceStarId,
    destinationStarId;

let game,
    player,
    carrier,
    sourceStar,
    destinationStar,
    starSpecialist,
    carrierSpecialist,
    isFormalAlliancesEnabled,
    isDiplomaticStatusToPlayersAllied;

let gameRepo, 
    distanceService, 
    specialistService,
    diplomacyService,
    starService,
    carrierGiftService;

specialistService = {
    getByIdStar() {
        return starSpecialist;
    },
    getByIdCarrier() {
        return carrierSpecialist;
    }
}

diplomacyService = {
    isFormalAlliancesEnabled() {
        return isFormalAlliancesEnabled;
    },
    isDiplomaticStatusToPlayersAllied() {
        return isDiplomaticStatusToPlayersAllied;
    }
}

describe('warp speed', () => {

    // @ts-ignore
    const service = new CarrierMovementService(gameRepo, distanceService, starService, specialistService, diplomacyService, carrierGiftService);

    beforeEach(() => {
        // Default values:
        playerId = new mongoose.Types.ObjectId();
        carrierId = new mongoose.Types.ObjectId();
        sourceStarId = new mongoose.Types.ObjectId();
        destinationStarId = new mongoose.Types.ObjectId();

        isFormalAlliancesEnabled = false;
        isDiplomaticStatusToPlayersAllied = false;

        game = { };

        player = {
            _id: playerId
        };

        carrier = {
            _id: carrierId,
            specialistId: null,
            ownedByPlayerId: playerId
        };

        sourceStar = {
            _id: sourceStarId,
            ownedByPlayerId: playerId,
            warpGate: true,
            specialistId: null
        };

        destinationStar = {
            _id: destinationStarId,
            ownedByPlayerId: playerId,
            warpGate: true,
            specialistId: null
        };

        starSpecialist = null;
    });

    it('should not travel at warp speed if source or destination are not warp gates - source star', async () => {
        sourceStar.warpGate = false;

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not warp gates - destination star', async () => {
        destinationStar.warpGate = false;

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not warp gates - both stars', async () => {
        sourceStar.warpGate = false;
        destinationStar.warpGate = false;

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not owned by a player - source star', async () => {
        sourceStar.ownedByPlayerId = null;

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not owned by a player - destination star', async () => {
        destinationStar.ownedByPlayerId = null;

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not owned by a player - both stars', async () => {
        sourceStar.ownedByPlayerId = null;
        destinationStar.ownedByPlayerId = null;

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should travel at warp speed if source and destination are owned by the same player', async () => {
        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination are not owned by the same player - source star', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination are not owned by the same player - destination star', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should not travel at warp speed if source and destination are not owned by the same player and source is warp scrambler', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        sourceStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source and destination are not owned by the same player and destination is warp scrambler', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        destinationStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source is owned by the player and destination is not owned by the same player and destination is warp scrambler', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        destinationStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should travel at warp speed if source and destination are not owned by the same player and source is not a warp scrambler', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        sourceStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: false
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination are not owned by the same player and destination is not a warp scrambler', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        destinationStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: false
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination are not owned by the same player carrier unlocks warp gates', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        carrier.specialistId = 1;
        carrierSpecialist = {
            modifiers: {
                special: {
                    unlockWarpGates: true
                }
            }
        };
        
        destinationStar.specialistId = 1;
        sourceStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should not travel at warp speed if source and destination are not owned by the same player carrier does not unlock warp gates', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        carrier.specialistId = 1;
        carrierSpecialist = {
            modifiers: {
                special: {
                    unlockWarpGates: false
                }
            }
        };
        
        destinationStar.specialistId = 1;
        sourceStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should travel at warp speed if source and destination allied', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        isFormalAlliancesEnabled = true;
        isDiplomaticStatusToPlayersAllied = true;

        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination enemies', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        isFormalAlliancesEnabled = true;
        isDiplomaticStatusToPlayersAllied = false;
        
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination allied and warp scrambled', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        isFormalAlliancesEnabled = true;
        isDiplomaticStatusToPlayersAllied = true;

        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        destinationStar.specialistId = 1;
        sourceStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should not travel at warp speed if source and destination enemies and warp scrambled', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        isFormalAlliancesEnabled = true;
        isDiplomaticStatusToPlayersAllied = false;

        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        destinationStar.specialistId = 1;
        sourceStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should travel at warp speed if source and destination enemies and warp scrambled but carrier unlocks warp gates', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        isFormalAlliancesEnabled = true;
        isDiplomaticStatusToPlayersAllied = false;

        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        carrier.specialistId = 1;
        carrierSpecialist = {
            modifiers: {
                special: {
                    unlockWarpGates: true
                }
            }
        };

        destinationStar.specialistId = 1;
        sourceStar.specialistId = 1;
        starSpecialist = {
            modifiers: {
                special: {
                    lockWarpGates: true
                }
            }
        };

        const warpSpeed = service.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

});
