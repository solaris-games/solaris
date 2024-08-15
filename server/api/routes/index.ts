import { createValidator } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import Middleware, {MiddlewareContainer} from '../middleware';

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
import registerSpectatorRoutes from './spectator';
import registerAnnouncementsRoutes from './announcements';
import registerColourRoutes from './colour';
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, container: DependencyContainer, middleware: MiddlewareContainer) => {
    const validator = createValidator({ passError: true });

    registerAdminRoutes(router, middleware, validator, container);
    registerAnnouncementsRoutes(router, middleware, validator, container);
    registerAuthRoutes(router, middleware, validator, container);
    registerBadgeRoutes(router, middleware, validator, container);
    registerCarrierRoutes(router, middleware, validator, container);
    registerConversationRoutes(router, middleware, validator, container);
    registerDiplomacyRoutes(router, middleware, validator, container);
    registerEventRoutes(router, middleware, validator, container);
    registerGameRoutes(router, middleware, validator, container);
    registerGuildRoutes(router, middleware, validator, container);
    registerLedgerRoutes(router, middleware, validator, container);
    registerReportRoutes(router, middleware, validator, container);
    registerResearchRoutes(router, middleware, validator, container);
    registerShopRoutes(router, middleware, validator, container);
    registerSpecialistRoutes(router, middleware, validator, container);
    registerStarRoutes(router, middleware, validator, container);
    registerTradeRoutes(router, middleware, validator, container);
    registerUserRoutes(router, middleware, validator, container);
    registerSpectatorRoutes(router, middleware, validator, container);
    registerColourRoutes(router, middleware, container);

    return router;
}