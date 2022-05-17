import { DependencyContainer } from '../../types/DependencyContainer';
import { ResearchType, ResearchTypeNotRandom } from '../../types/Player';
import { mapToResearchUpdateNextRequest, mapToResearchUpdateNowRequest } from '../requests/research';

export default (container: DependencyContainer, io) => {
    return {
        updateNow: async (req, res, next) => {
            try {
                const reqObj = mapToResearchUpdateNowRequest(req.body);

                reqObj.preference = reqObj.preference.toLowerCase().trim() as ResearchTypeNotRandom;

                let eta = await container.researchService.updateResearchNow(req.game, req.player, reqObj.preference);
                
                return res.status(200).json(eta);
            } catch (err) {
                return next(err);
            }
        },
        updateNext: async (req, res, next) => {
            try {
                const reqObj = mapToResearchUpdateNextRequest(req.body);
                
                reqObj.preference = reqObj.preference.toLowerCase().trim() as ResearchType;

                let eta = await container.researchService.updateResearchNext(req.game, req.player, reqObj.preference);
    
                return res.status(200).json(eta);
            } catch (err) {
                return next(err);
            }
        }
    }
};
