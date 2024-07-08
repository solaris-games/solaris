import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToReportCreateReportRequest } from '../requests/report';

export default (container: DependencyContainer) => {
    return {
        create: async (req, res, next) => {
            try {
                const reqObj = mapToReportCreateReportRequest(req.body);
                
                await container.reportService.reportPlayer(req.game, reqObj, req.session.userId);
                
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};
