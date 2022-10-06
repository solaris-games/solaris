import { Router } from "express";
import { createValidator } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import Middleware from '../middleware';

import registerAdminRoutes from './admin';
import registerAuthRoutes from './auth';
import registerBadgeRoutes from './badges';
import registerCarrierRoutes from './carrier';
import registerConversationRoutes from './conversations';
import registerDiplomacyRoutes from './diplomacy';
import registerEventRoutes from './events';
import registerGameRoutes from './games';
import registerGuildRoutes from './guilds';
import registerLedgerRoutes from './ledger';
import registerReportRoutes from './report';
import registerResearchRoutes from './research';
import registerShopRoutes from './shop';
import registerSpecialistRoutes from './specialist';
import registerStarRoutes from './star';
import registerTradeRoutes from './trade';
import registerUserRoutes from './user';

export default (router: Router, io, container: DependencyContainer) => {
    const middleware = Middleware(container);
    const validator = createValidator({ passError: true });

    registerAdminRoutes(router, middleware, validator, io, container);
    registerAuthRoutes(router, middleware, validator, io, container);
    registerBadgeRoutes(router, middleware, validator, io, container);
    registerCarrierRoutes(router, middleware, validator, io, container);
    registerConversationRoutes(router, middleware, validator, io, container);
    registerDiplomacyRoutes(router, middleware, validator, io, container);
    registerEventRoutes(router, middleware, validator, io, container);
    registerGameRoutes(router, middleware, validator, io, container);
    registerGuildRoutes(router, middleware, validator, io, container);
    registerLedgerRoutes(router, middleware, validator, io, container);
    registerReportRoutes(router, middleware, validator, io, container);
    registerResearchRoutes(router, middleware, validator, io, container);
    registerShopRoutes(router, middleware, validator, io, container);
    registerSpecialistRoutes(router, middleware, validator, io, container);
    registerStarRoutes(router, middleware, validator, io, container);
    registerTradeRoutes(router, middleware, validator, io, container);
    registerUserRoutes(router, middleware, validator, io, container);

    return router;
}