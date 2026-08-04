import { JobParameters } from "../tool";

export const migrateCombatMalusStrategy = async (ctx: JobParameters) => {
    const log = ctx.log;

    const userRepository = ctx.container.userService.userRepo;
};
