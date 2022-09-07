import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer, io) => {
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
    
                return res.status(200).json(bans);
            } catch (err) {
                return next(err);
            }
        },
        listCarrier: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listCarrier(null);
    
                return res.status(200).json(specialists);
            } catch (err) {
                return next(err);
            }
        },
        listStar: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listStar(null);
    
                return res.status(200).json(specialists);
            } catch (err) {
                return next(err);
            }
        },
        listCarrierForGame: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listCarrier(req.game);
    
                return res.status(200).json(specialists);
            } catch (err) {
                return next(err);
            }
        },
        listStarForGame: async (req, res, next) => {
            try {
                let specialists = await container.specialistService.listStar(req.game);
    
                return res.status(200).json(specialists);
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
    
                return res.status(200).json({
                    waypoints: result.waypoints
                });
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
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};
