import AchievementService from '../services/achievement';

const userId = 'abc';

describe('achievement', () => {
    const incrementAchievementTest = async (key: string, incrementAmount: number, incrementFunctionCallback) => {
        let calls = 0;

        const fakeUserRepo = {
            async updateOne(query, update) {
                if (query._id === userId 
                    && update.$inc[key] == incrementAmount) {
                    calls++;
                }
            }
        };

        const fakeGuildService = {};

        // @ts-ignore
        let service = new AchievementService(fakeUserRepo, fakeGuildService);
        
        await incrementFunctionCallback(service);

        expect(calls).toBe(1);
    }

    it('should increment specialists hired achievement', async () => {
        incrementAchievementTest('achievements.infrastructure.specialistsHired', 1, async (service) => {
            await service.incrementSpecialistsHired(userId, 1);
        });
    });

    it('should increment warp gates built achievement', async () => {
        incrementAchievementTest('achievements.infrastructure.warpGates', 1, async (service) => {
            await service.incrementWarpGatesBuilt(userId, 1);
        });
    });

    it('should increment warp gates destroyed achievement', async () => {
        incrementAchievementTest('achievements.infrastructure.warpGatesDestroyed', 1, async (service) => {
            await service.incrementWarpGatesDestroyed(userId, 1);
        });
    });

    it('should increment carriers built achievement', async () => {
        incrementAchievementTest('achievements.infrastructure.carriers', 1, async (service) => {
            await service.incrementCarriersBuilt(userId, 1);
        });
    });

    it('should increment infrastructure economy built achievement', async () => {
        incrementAchievementTest('achievements.infrastructure.economy', 1, async (service) => {
            await service.incrementInfrastructureBuilt('economy', userId, 1);
        });
    });

    it('should increment infrastructure industry built achievement', async () => {
        incrementAchievementTest('achievements.infrastructure.industry', 1, async (service) => {
            await service.incrementInfrastructureBuilt('industry', userId, 1);
        });
    });

    it('should increment infrastructure science built achievement', async () => {
        incrementAchievementTest('achievements.infrastructure.science', 1, async (service) => {
            await service.incrementInfrastructureBuilt('science', userId, 1);
        });
    });

    it('should increment trade credits sent achievement', async () => {
        incrementAchievementTest('achievements.trade.creditsSent', 1, async (service) => {
            await service.incrementTradeCreditsSent(userId, 1);
        });
    });

    it('should increment trade credits received achievement', async () => {
        incrementAchievementTest('achievements.trade.creditsReceived', 1, async (service) => {
            await service.incrementTradeCreditsReceived(userId, 1);
        });
    });

    it('should increment trade credits specialists sent achievement', async () => {
        incrementAchievementTest('achievements.trade.creditsSpecialistsSent', 1, async (service) => {
            await service.incrementTradeCreditsSpecialistsSent(userId, 1);
        });
    });

    it('should increment trade credits specialists received achievement', async () => {
        incrementAchievementTest('achievements.trade.creditsSpecialistsReceived', 1, async (service) => {
            await service.incrementTradeCreditsSpecialistsReceived(userId, 1);
        });
    });

    it('should increment trade technology sent achievement', async () => {
        incrementAchievementTest('achievements.trade.technologySent', 1, async (service) => {
            await service.incrementTradeTechnologySent(userId, 1);
        });
    });

    it('should increment trade technology received achievement', async () => {
        incrementAchievementTest('achievements.trade.technologyReceived', 1, async (service) => {
            await service.incrementTradeTechnologyReceived(userId, 1);
        });
    });

    it('should increment trade renown sent achievement', async () => {
        incrementAchievementTest('achievements.trade.renownSent', 1, async (service) => {
            await service.incrementRenownSent(userId, 1);
        });
    });

    it('should increment trade renown received achievement', async () => {
        incrementAchievementTest('achievements.renown', 1, async (service) => {
            await service.incrementRenownReceived(userId, 1);
        });
    });

    it('should increment defeated achievement', async () => {
        incrementAchievementTest('achievements.defeated', 1, async (service) => {
            await service.incrementDefeated(userId, 1);
        });
    });

    it('should increment joined achievement', async () => {
        incrementAchievementTest('achievements.joined', 1, async (service) => {
            await service.incrementJoined(userId, 1);
        });
    });

    it('should increment quit achievement', async () => {
        incrementAchievementTest('achievements.quit', 1, async (service) => {
            await service.incrementQuit(userId, 1);
        });
    });

});
