import { DependencyContainer } from "../../services/types/DependencyContainer";
import {MiddlewareContainer} from '../middleware';

import registerConfigRoutes from './config';
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
import registerShopProcessRoutes from './shopProcess';
import registerShopPurchaseRoutes from './shopPurchase';
import registerSpecialistRoutes from './specialist';
import registerStarRoutes from './star';
import registerTradeRoutes from './trade';
import registerUserRoutes from './user';
import registerSpectatorRoutes from './spectator';
import registerAnnouncementsRoutes from './announcements';
import registerColourRoutes from './colour';
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, container: DependencyContainer, middleware: MiddlewareContainer) => {
    registerConfigRoutes(router, middleware, container);
    registerAdminRoutes(router, middleware, container);
    registerAnnouncementsRoutes(router, middleware, container);
    registerAuthRoutes(router, middleware, container);
    registerBadgeRoutes(router, middleware, container);
    registerCarrierRoutes(router, middleware, container);
    registerConversationRoutes(router, middleware, container);
    registerDiplomacyRoutes(router, middleware, container);
    registerEventRoutes(router, middleware, container);
    registerGameRoutes(router, middleware, container);
    registerGuildRoutes(router, middleware, container);
    registerLedgerRoutes(router, middleware, container);
    registerReportRoutes(router, middleware, container);
    registerResearchRoutes(router, middleware, container);
    registerShopProcessRoutes(router, middleware, container);
    registerShopPurchaseRoutes(router, middleware, container);
    registerSpecialistRoutes(router, middleware, container);
    registerStarRoutes(router, middleware, container);
    registerTradeRoutes(router, middleware, container);
    registerUserRoutes(router, middleware, container);
    registerSpectatorRoutes(router, middleware, container);
    registerColourRoutes(router, middleware, container);

    return router;
}