import { DependencyContainer } from "../../services/types/DependencyContainer";
import {
    parseUpdateResearchQueueRequest,
    parseUpdateResearchNowRequest,
} from "../requests/research";

export default (container: DependencyContainer) => {
    return {
        updateNow: async (req, res, next) => {
            try {
                const reqObj = parseUpdateResearchNowRequest(req.body);

                await container.researchService.updateResearchNow(
                    req.game,
                    req.player,
                    reqObj.preference,
                );

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        updateQueue: async (req, res, next) => {
            try {
                const reqObj = parseUpdateResearchQueueRequest(req.body);

                await container.researchService.updateResearchQueue(
                    req.game,
                    req.player,
                    reqObj.queue,
                );

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
    };
};
