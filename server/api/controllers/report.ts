import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';

export default (container: DependencyContainer, io) => {
    return {
        create: async (req, res, next) => {
            let errors: string[] = [];
    
            if (!req.body.playerId) {
                errors.push('playerId is a required body field');
            }
    
            if (!req.body.reasons) {
                errors.push('reasons is a required body field');
            }
    
            try {
                if (errors.length) {
                    throw new ValidationError(errors);
                }
    
                await container.reportService.reportPlayer(req.game, req.body.playerId, req.session.userId, req.body.reasons);
                
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};
