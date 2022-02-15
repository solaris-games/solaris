const mongoose = require('mongoose');
import SpecialistHireService from '../services/specialistHire';

describe('specialistHire - Carrier', () => {

    // -------------
    // Mock Objects

    function setup(): any {
        let obj = {
            service: null,
            gameRepo: {
                bulkWrite: () => {}
            },
            specialistService: {},
            achievementService: {
                incrementSpecialistsHired: () => {}
            },
            waypointService: {
                cullWaypointsByHyperspaceRangeDB: () => {}
            },
            playerService: {},
            starService: {},
            gameTypeService: {
                isTutorialGame: () => { return false; }
            },
            game: { 
                settings: {
                    specialGalaxy: {
                        specialistCost: 'standard',
                        specialistsCurrency: 'credits',
                        specialistBans: {
                            star: [],
                            carrier: []
                        }
                    }
                },
                galaxy: {
                    carriers: [],
                    stars: []
                }
            },
            playerId: new mongoose.Types.ObjectId(),
            player: {
                _id: null
            },
            carrierId: new mongoose.Types.ObjectId(),
            starId: new mongoose.Types.ObjectId(),
            specialistId: 1
        };

        obj.player._id = obj.playerId;

        // @ts-ignore
        obj.service = new SpecialistHireService(obj.gameRepo, obj.specialistService, obj.achievementService, obj.waypointService, obj.playerService, obj.starService, obj.gameTypeService);

        return obj;
    }

    function carrierUnowned(testObj) {
        return {
            _id: testObj.carrierId,
            ownedByPlayerId: new mongoose.Types.ObjectId(),
            orbiting: testObj.starId,
            specialistId: null
        };
    }

    function carrierInTransit(testObj) {
        return {
            _id: testObj.carrierId,
            ownedByPlayerId: testObj.playerId,
            orbiting: null,
            specialistId: null
        };
    }
    
    function carrierInOrbit(testObj) {
        return {
            _id: testObj.carrierId,
            ownedByPlayerId: testObj.playerId,
            orbiting: testObj.starId,
            specialistId: null
        };
    }

    function starBasic(testObj) {
        return {
            _id: testObj.starId
        };
    }

    function carrierInOrbitWithSpec(testObj, specId) {
        return {
            _id: testObj.carrierId,
            ownedByPlayerId: testObj.playerId,
            orbiting: testObj.starId,
            specialistId: specId || null
        };
    }

    function specialistBasic(testObj) {
        return {
            id: testObj.specialistId
        }
    }

    // -------------

    it('should throw an error if specialists are disabled', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.settings.specialGalaxy.specialistCost = 'none';

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('disabled the hiring of specialists');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the specialist is banned', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.settings.specialGalaxy.specialistBans.carrier.push(testObj.specialistId);

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('banned');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the carrier does not exist', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.galaxy.carriers.push(carrierUnowned(testObj));

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('you do not own');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the carrier is not in orbit', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.galaxy.carriers.push(carrierInTransit(testObj));

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('in transit');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error trying to hire the specialist on a dead star', async () => {
        let testObj = setup();
        let hasError = false;
        let star = starBasic(testObj);

        testObj.game.galaxy.carriers.push(carrierInOrbit(testObj));
        testObj.game.galaxy.stars.push(star);

        testObj.specialistService.getByIdCarrier = (id) => {
            return null;
        };

        testObj.starService.getById = () => {
            return star;
        };

        testObj.starService.isDeadStar = () => {
            return true;
        };

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('dead star');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the specialist does not exist', async () => {
        let testObj = setup();
        let hasError = false;
        let star = starBasic(testObj);

        testObj.game.galaxy.carriers.push(carrierInOrbit(testObj));
        testObj.game.galaxy.stars.push(star);

        testObj.specialistService.getByIdCarrier = (id) => {
            return null;
        };

        testObj.starService.getById = () => {
            return star;
        };

        testObj.starService.isDeadStar = () => {
            return false;
        };

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('does not exist');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the specialist is already on the carrier', async () => {
        let testObj = setup();
        let hasError = false;
        let star = starBasic(testObj);

        testObj.game.galaxy.carriers.push(carrierInOrbitWithSpec(testObj, testObj.specialistId));
        testObj.game.galaxy.stars.push(star);

        testObj.specialistService.getByIdCarrier = (id) => {
            return specialistBasic(testObj);
        };

        testObj.starService.getById = () => {
            return star;
        };

        testObj.starService.isDeadStar = () => {
            return false;
        };

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('already has the specialist assigned');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the player cannot afford the specialist by credits', async () => {
        let testObj = setup();
        let hasError = false;
        let star = starBasic(testObj);

        testObj.game.galaxy.carriers.push(carrierInOrbitWithSpec(testObj, null));
        testObj.game.galaxy.stars.push(star);

        testObj.specialistService.getByIdCarrier = (id) => {
            return specialistBasic(testObj);
        };

        testObj.starService.getById = () => {
            return star;
        };

        testObj.starService.isDeadStar = () => {
            return false;
        };

        testObj.specialistService.getSpecialistActualCost = () => {
            return {
                credits: 1000
            }
        };

        testObj.game.settings.specialGalaxy.specialistsCurrency = 'credits';
        testObj.player.credits = 1;

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('cannot afford');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the player cannot afford the specialist by specialist credits', async () => {
        let testObj = setup();
        let hasError = false;
        let star = starBasic(testObj);

        testObj.game.galaxy.carriers.push(carrierInOrbitWithSpec(testObj, null));
        testObj.game.galaxy.stars.push(star);

        testObj.specialistService.getByIdCarrier = (id) => {
            return specialistBasic(testObj);
        };

        testObj.starService.getById = () => {
            return star;
        };

        testObj.starService.isDeadStar = () => {
            return false;
        };

        testObj.specialistService.getSpecialistActualCost = () => {
            return {
                creditsSpecialists: 1000
            }
        };

        testObj.game.settings.specialGalaxy.specialistsCurrency = 'creditsSpecialists';
        testObj.player.creditsSpecialists = 1;

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err: any) {
            hasError = true;
            expect(err.message).toContain('cannot afford');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should assign the specialist to the carrier', async () => {
        let testObj = setup();
        let hasError = false;
        let carrier = carrierInOrbitWithSpec(testObj, null);
        let star = starBasic(testObj);

        testObj.game.galaxy.carriers.push(carrier);
        testObj.game.galaxy.stars.push(star);

        testObj.specialistService.getByIdCarrier = (id) => {
            return specialistBasic(testObj);
        };

        testObj.starService.getById = () => {
            return star;
        };

        testObj.starService.isDeadStar = () => {
            return false;
        };

        testObj.specialistService.getSpecialistActualCost = () => {
            return {
                credits: 100
            }
        };

        testObj.playerService.addCredits = (game, player, amount) => {
            expect(amount).toBe(-100);
        };

        testObj.game.settings.specialGalaxy.specialistsCurrency = 'credits';
        testObj.player.credits = 100;

        try {
            await testObj.service.hireCarrierSpecialist(testObj.game, testObj.player, testObj.carrierId, testObj.specialistId);
        } catch (err) {
            hasError = true;
        }
        
        expect(hasError).toBeFalsy();
        expect(carrier.specialistId).toBe(testObj.specialistId);
        expect(testObj.player.credits).toBe(0);
    });
})