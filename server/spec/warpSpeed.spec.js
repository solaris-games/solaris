const StarService = require('../services/star');
const mongoose = require('mongoose');

let playerId,
    carrierId,
    sourceStarId,
    destinationStarId;

let player,
    carrier,
    sourceStar,
    destinationStar,
    starSpecialist,
    carrierSpecialist;

let gameRepo, 
    randomService, 
    nameService, 
    distanceService, 
    starDistanceService, 
    technologyService, 
    specialistService,
    userService, 
    diplomacyService;

specialistService = {
    getByIdStar() {
        return starSpecialist;
    },
    getByIdCarrier() {
        return carrierSpecialist;
    }
}

describe('warp speed', () => {

    const service = new StarService(gameRepo, randomService, nameService, distanceService, starDistanceService, technologyService, specialistService, userService, diplomacyService);

    beforeEach(() => {
        // Default values:
        playerId = new mongoose.Types.ObjectId();
        carrierId = new mongoose.Types.ObjectId();
        sourceStarId = new mongoose.Types.ObjectId();
        destinationStarId = new mongoose.Types.ObjectId();

        player = {
            _id: playerId
        };

        carrier = {
            _id: carrierId,
            specialistId: null
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

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not warp gates - destination star', async () => {
        destinationStar.warpGate = false;

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not warp gates - both stars', async () => {
        sourceStar.warpGate = false;
        destinationStar.warpGate = false;

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not owned by a player - source star', async () => {
        sourceStar.ownedByPlayerId = null;

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not owned by a player - destination star', async () => {
        destinationStar.ownedByPlayerId = null;

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should not travel at warp speed if source or destination are not owned by a player - both stars', async () => {
        sourceStar.ownedByPlayerId = null;
        destinationStar.ownedByPlayerId = null;

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

    it('should travel at warp speed if source and destination are owned by the same player', async () => {
        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination are not owned by the same player - source star', async () => {
        sourceStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeTruthy();
    });

    it('should travel at warp speed if source and destination are not owned by the same player - destination star', async () => {
        destinationStar.ownedByPlayerId = new mongoose.Types.ObjectId();

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
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

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
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

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
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

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
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

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
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

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
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

        const warpSpeed = service.canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar);
        
        expect(warpSpeed).toBeFalsy();
    });

});
