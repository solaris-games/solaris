import { DependencyContainer } from '../../services/types/DependencyContainer';
import { ResearchType, ResearchTypeNotRandom } from '../../services/types/Player';
import { mapToResearchUpdateNextRequest, mapToResearchUpdateNowRequest } from '../requests/research';

export default (container: DependencyContainer) => {
    return {
        updateNow: async (req, res, next) => {
            try {
                const reqObj = mapToResearchUpdateNowRequest(req.body);

                let eta = await container.researchService.updateResearchNow(req.game, req.player, reqObj.preference);
                
                return res.status(200).json(eta);
            } catch (err) {
                return next(err);
            }
        },
        updateNext: async (req, res, next) => {
            try {
                const reqObj = mapToResearchUpdateNextRequest(req.body);
                
                let eta = await container.researchService.updateResearchNext(req.game, req.player, reqObj.preference);
    
                return res.status(200).json(eta);
            } catch (err) {
                return next(err);
            }
        }
    }
};
