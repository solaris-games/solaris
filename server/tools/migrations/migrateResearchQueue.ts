import { JobParameters } from "../tool";

// Seeds player research queues from the legacy researchingNext field for
// games and initial game states, then removes the legacy field.
export const migrateResearchQueue = async (ctx: JobParameters) => {
    const log = ctx.log;
    const gameRepo = ctx.container.gameService.gameRepo;
    const initialGameStateRepo =
        ctx.container.initialGameStateService.initialGameStateRepo;

    const seedPipeline = [
        {
            $set: {
                "galaxy.players": {
                    $map: {
                        input: "$galaxy.players",
                        as: "p",
                        in: {
                            $mergeObjects: [
                                "$$p",
                                {
                                    researchQueue: {
                                        $ifNull: [
                                            "$$p.researchQueue",
                                            ["$$p.researchingNext"],
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    ];

    const seedResult = await gameRepo.updateMany(
        {
            "galaxy.players.researchQueue": { $exists: false },
        },
        seedPipeline,
        { updatePipeline: true },
    );
    log.info(
        `Seeded research queue from researchingNext in ${seedResult.modifiedCount} games.`,
    );

    const unsetResult = await gameRepo.updateMany(
        {
            "galaxy.players.researchingNext": { $exists: true },
        },
        {
            $unset: { "galaxy.players.$[].researchingNext": "" },
        },
        { strict: false },
    );
    log.info(
        `Removed legacy researchingNext from ${unsetResult.modifiedCount} games.`,
    );

    const seedResultInit = await initialGameStateRepo.updateMany(
        {
            "galaxy.players.researchQueue": { $exists: false },
        },
        seedPipeline,
        { updatePipeline: true },
    );
    log.info(
        `Seeded research queue from researchingNext in ${seedResultInit.modifiedCount} initial game states.`,
    );

    const unsetResultInit = await initialGameStateRepo.updateMany(
        {
            "galaxy.players.researchingNext": { $exists: true },
        },
        {
            $unset: { "galaxy.players.$[].researchingNext": "" },
        },
        { strict: false },
    );
    log.info(
        `Removed legacy researchingNext from ${unsetResultInit.modifiedCount} initial game states.`,
    );
};
