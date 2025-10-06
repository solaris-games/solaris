import {GetRoute, PutRoute, SimpleGetRoute} from ".";
import { type Specialist } from "../types/common/specialist"
import { type SpecialStar } from "../types/common/specialStar"

export type MonthlyBans = {
    carrier: Specialist[],
    star: Specialist[],
    specialStar: SpecialStar[],
}

export const createSpecialistRoutes = <ID>() => ({
    listBans: new SimpleGetRoute<MonthlyBans>('/api/game/specialists/bans'),
    listCarrier: new SimpleGetRoute<Specialist[]>('/api/game/specialists/carrier'),
    listStar: new SimpleGetRoute<Specialist[]>('/api/game/specialists/star'),
    listCarrierForGame: new GetRoute<{ gameId: ID }, {}, Specialist[]>('/api/game/:gameId/specialists/carrier'),
    listStarForGame: new GetRoute<{ gameId: ID }, {}, Specialist[]>('/api/game/:gameId/specialists/star'),
    hireCarrier: new PutRoute<{ gameId: ID, carrierId: ID, specialistId: number }, {}, {}, {}>('/api/game/:gameId/carrier/:carrierId/hire/:specialistId'),
    hireStar: new PutRoute<{ gameId: ID, starId: ID, specialistId: number }, {}, {}, {}>('/api/game/:gameId/star/:starId/hire/:specialistId'),
});
