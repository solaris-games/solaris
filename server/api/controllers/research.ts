import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToResearchUpdateNextRequest, mapToResearchUpdateNowRequest } from '../requests/research';

export default (container: DependencyContainer) => {
    return {
        updateNow: async (req, res, next) => {
            try {
                const reqObj = mapToResearchUpdateNowRequest(req.body);

                let eta = await container.researchService.updateResearchNow(req.game, req.player, reqObj.preference);
                
                res.status(200).json(eta);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        updateNext: async (req, res, next) => {
            try {
                const reqObj = mapToResearchUpdateNextRequest(req.body);
                
                let eta = await container.researchService.updateResearchNext(req.game, req.player, reqObj.preference);
    
                res.status(200).json(eta);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
