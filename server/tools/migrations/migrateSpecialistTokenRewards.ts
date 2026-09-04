import { JobParameters } from "../tool";

export const migrateSpecialistTokenRewards = async (ctx: JobParameters) => {
    const gameRepo = ctx.container.gameService.gameRepo;

    await gameRepo.updateMany(
        {
            "settings.technology.specialistTokenReward": "standard",
        },
        {
            $set: {
                "settings.technology.specialistTokenReward": "simplified",
            },
        },
    );

    ctx.log.info("Finished migrating standard -> simplified");

    await gameRepo.updateMany(
        {
            "settings.technology.specialistTokenReward": "experimental",
        },
        {
            $set: {
                "settings.technology.specialistTokenReward":
                    "dependsOnStarCount",
            },
        },
    );

    ctx.log.info("Finished migrating experimental -> dependsOnStarCount");
};
