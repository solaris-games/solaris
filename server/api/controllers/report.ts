import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToReportCreateReportRequest } from '../requests/report';

export default (container: DependencyContainer) => {
    return {
        create: async (req, res, next) => {
            try {
                const reqObj = mapToReportCreateReportRequest(req.body);
                
                await container.reportService.reportPlayer(req.game, reqObj, req.session.userId);
                
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
