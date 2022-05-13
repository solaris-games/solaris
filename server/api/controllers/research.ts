import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';

export default (container: DependencyContainer, io) => {
    return {
        updateNow: async (req, res, next) => {
            try {
                let eta = await container.researchService.updateResearchNow(req.game, req.player, req.body.preference.toLowerCase().trim());
                
                return res.status(200).json(eta);
            } catch (err) {
                return next(err);
            }
        },
        updateNext: async (req, res, next) => {
            try {
                let eta = await container.researchService.updateResearchNext(req.game, req.player, req.body.preference.toLowerCase().trim());
    
                return res.status(200).json(eta);
            } catch (err) {
                return next(err);
            }
        }
    }
};
