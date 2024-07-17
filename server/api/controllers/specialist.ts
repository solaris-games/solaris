import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer) => {
    return {
        listBans: async (req, res, next) => {
            try {
                const amount = container.gameFluxService.getThisMonthSpecialistBanAmount();
                const specialistBans = container.specialistBanService.getCurrentMonthBans(amount);
                const specialStarBans = container.specialStarBanService.getCurrentMonthBans();

                const bans = {
                    ...specialistBans,
                    ...specialStarBans
                }
    
                res.status(200).json(bans);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listCarrier: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listCarrier(null);
    
                res.status(200).json(specialists);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listStar: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listStar(null);
    
                res.status(200).json(specialists);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listCarrierForGame: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listCarrier(req.game);
    
                res.status(200).json(specialists);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listStarForGame: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listStar(req.game);
    
                res.status(200).json(specialists);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        hireCarrier: async (req, res, next) => {
            try {
                let result = await container.specialistHireService.hireCarrierSpecialist(
                    req.game,
                    req.player,
                    req.params.carrierId,
                    +req.params.specialistId);
    
                await container.eventService.createPlayerCarrierSpecialistHired(
                    req.game._id,
                    req.game.state.tick,
                    req.player,
                    result.carrier,
                    result.specialist
                );
    
                res.status(200).json({
                    waypoints: result.waypoints,
                    effectiveTechs: result.carrier.effectiveTechs
                });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        hireStar: async (req, res, next) => {
            try {
                let result = await container.specialistHireService.hireStarSpecialist(
                    req.game,
                    req.player,
                    req.params.starId,
                    +req.params.specialistId);
    
                await container.eventService.createPlayerStarSpecialistHired(
                    req.game._id,
                    req.game.state.tick,
                    req.player,
                    result.star,
                    result.specialist
                );
    
                res.status(200).json({
                    effectiveTechs: result.star.effectiveTechs
                });
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
