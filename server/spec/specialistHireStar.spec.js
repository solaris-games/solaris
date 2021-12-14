const mongoose = require('mongoose');
const SpecialistHireService = require('../services/specialistHire');

describe('specialistHire - Star', () => {

    // -------------
    // Mock Objects

    function setup() {
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
            player: null,
            starId: new mongoose.Types.ObjectId(),
            specialistId: 1
        };

        obj.player = {
            _id: obj.playerId
        };

        obj.service = new SpecialistHireService(obj.gameRepo, obj.specialistService, obj.achievementService, obj.waypointService, obj.playerService, obj.starService, obj.gameTypeService);

        return obj;
    }

    function starWithSpecialist(testObj, specId) {
        return {
            _id: testObj.starId,
            ownedByPlayerId: testObj.playerId,
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
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('disabled the hiring of specialists');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the specialist is banned', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.settings.specialGalaxy.specialistBans.star.push(testObj.specialistId);

        try {
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('banned');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the star does not exist', async () => {
        let testObj = setup();
        let hasError = false;

        try {
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('you do not own');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the star is dead', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.galaxy.stars.push(starWithSpecialist(testObj, null));

        testObj.starService.isDeadStar = () => {
            return true;
        };

        try {
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('dead star');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the specialist does not exist', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.galaxy.stars.push(starWithSpecialist(testObj, null));

        testObj.starService.isDeadStar = () => {
            return false;
        };

        testObj.specialistService.getByIdStar = () => {
            return null;
        };
        
        try {
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('does not exist');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the specialist is already on the star', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.galaxy.stars.push(starWithSpecialist(testObj, testObj.specialistId));

        testObj.starService.isDeadStar = () => {
            return false;
        };

        testObj.specialistService.getByIdStar = () => {
            return specialistBasic(testObj);
        };
        
        try {
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('already has the specialist assigned');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the player cannot afford the specialist by credits', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.galaxy.stars.push(starWithSpecialist(testObj, null));

        testObj.starService.isDeadStar = () => {
            return false;
        };

        testObj.specialistService.getByIdStar = () => {
            return specialistBasic(testObj);
        };

        testObj.specialistService.getSpecialistActualCost = () => {
            return {
                credits: 1000
            }
        };

        testObj.game.settings.specialGalaxy.specialistsCurrency = 'credits';
        testObj.player.credits = 1;
        
        try {
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('cannot afford');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should throw an error if the player cannot afford the specialist by specialist credits', async () => {
        let testObj = setup();
        let hasError = false;

        testObj.game.galaxy.stars.push(starWithSpecialist(testObj, null));

        testObj.starService.isDeadStar = () => {
            return false;
        };

        testObj.specialistService.getByIdStar = () => {
            return specialistBasic(testObj);
        };

        testObj.specialistService.getSpecialistActualCost = () => {
            return {
                creditsSpecialists: 1000
            }
        };

        testObj.game.settings.specialGalaxy.specialistsCurrency = 'creditsSpecialists';
        testObj.player.creditsSpecialists = 1;
        
        try {
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
            expect(err.message).toContain('cannot afford');
        }
        
        expect(hasError).toBeTruthy();
    });

    it('should assign the specialist to the star', async () => {
        let testObj = setup();
        let hasError = false;
        let star = starWithSpecialist(testObj, null);

        testObj.game.galaxy.stars.push(star);

        testObj.specialistService.getByIdStar = (id) => {
            return specialistBasic(testObj);
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
            await testObj.service.hireStarSpecialist(testObj.game, testObj.player, testObj.starId, testObj.specialistId);
        } catch (err) {
            hasError = true;
        }
        
        expect(hasError).toBeFalsy();
        expect(star.specialistId).toBe(testObj.specialistId);
        expect(testObj.player.credits).toBe(0);
    });
})