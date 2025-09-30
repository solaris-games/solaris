import { SimpleGetRoute } from ".";
import { type Specialist } from "../types/common/specialist"
import { type SpecialStar } from "../types/common/specialStar"

export type MonthlyBans = {
    carrier: Specialist[],
    star: Specialist[],
    specialStar: SpecialStar[],
}

export const createSpecialistRoutes = <ID>() => ({
    listBans: new SimpleGetRoute<MonthlyBans>('/api/game/specialists/bans'),
});
