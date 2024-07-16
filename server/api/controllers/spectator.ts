import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer) => {
    return {
        invite: async (req, res, next) => {
            try {
                await container.spectatorService.invite(
                    req.game,
                    req.player,
                    req.body.username);
                
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        uninvite: async (req, res, next) => {
            try {
                await container.spectatorService.uninvite(
                    req.game,
                    req.player,
                    req.params.userId);
                
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        clear: async (req, res, next) => {
            try {
                await container.spectatorService.clearSpectators(
                    req.game,
                    req.player);
                
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        list: async (req, res, next) => {
            try {
                const spectators = await container.spectatorService.listSpectators(req.game);
                
                res.status(200).json(spectators);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
