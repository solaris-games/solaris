import { Router } from "express";
import { DependencyContainer } from "../../types/DependencyContainer";

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

    registerAdminRoutes(router, io, container);
    registerAuthRoutes(router, io, container);
    registerBadgeRoutes(router, io, container);
    registerCarrierRoutes(router, io, container);
    registerConversationRoutes(router, io, container);
    registerDiplomacyRoutes(router, io, container);
    registerEventRoutes(router, io, container);
    registerGameRoutes(router, io, container);
    registerGuildRoutes(router, io, container);
    registerLedgerRoutes(router, io, container);
    registerReportRoutes(router, io, container);
    registerResearchRoutes(router, io, container);
    registerShopRoutes(router, io, container);
    registerSpecialistRoutes(router, io, container);
    registerStarRoutes(router, io, container);
    registerTradeRoutes(router, io, container);
    registerUserRoutes(router, io, container);

    return router;
}