import { JobParameters } from "../tool";

// Seeds player research queues from the legacy researchingNext field in
// historical player snapshots, then removes the legacy field.
export const migrateResearchQueueHistory = async (ctx: JobParameters) => {
    const log = ctx.log;
    const historyRepo = ctx.container.historyService.historyRepo;

    const seedPipeline = [
        {
            $set: {
                players: {
                    $map: {
                        input: "$players",
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

    const seedFilter = {
        "players.researchQueue": { $exists: false },
        "players.researchingNext": { $exists: true },
    };

    const seedResult = await historyRepo.updateMany(seedFilter, seedPipeline);
    log.info(
        `Seeded research queue from researchingNext in ${seedResult.modifiedCount} history entries.`,
    );

    const unsetResult = await historyRepo.updateMany(seedFilter, {
        $unset: { "players.$[].researchingNext": "" },
    });
    log.info(
        `Removed legacy researchingNext from ${unsetResult.modifiedCount} history entries.`,
    );
};
