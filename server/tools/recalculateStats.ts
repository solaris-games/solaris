import {makeJob} from "./tool";
import {User} from "../services/types/User";
import {StatsSlice} from "solaris-common";
import {DBObjectId, objectIdFromString} from "../services/types/DBObjectId";
import {groupBy} from "solaris-common";

const dbQuery = {
    closed: true,
};

const job = makeJob("Recalculate stats", async ({log, container, mongo}) => {
    const statisticsService = container.statisticsService;
    const gameService = container.gameService;
    const statsSliceRepository = statisticsService.statsSliceRepository;

    log.info("Resetting user stats...");

    const users: User[] = await container.userService.userRepo.findAsModels({}, {
            _id: 1,
            achievements: 1
        },
        { _id: 1 });


    for (const user of users) {
        user.achievements.stats = JSON.parse(JSON.stringify(user.achievements.legacyStats));

        // @ts-ignore
        await user.save();
    }

    const sliceData: StatsSlice<DBObjectId>[] = await statsSliceRepository.findAsModels(dbQuery, { _id: 1, gameId: 1 }, {  });

    log.info(`Found ${sliceData.length} stats slices to process.`);

    const slicesByGameId = groupBy(sliceData, (slice: StatsSlice<DBObjectId>) => slice.gameId.toString());

    for (let [gameId, slicesForGame] of slicesByGameId) {
        log.info(`Processing game ${gameId} with ${slicesForGame.length} slices.`);

        const game = await gameService.getByIdLean(objectIdFromString(gameId), {
            'galaxy.players': 1,
            'settings': 1,
            'state': 1,
        });

        if (!game) {
            log.warn(`Game with ID ${gameId} not found, skipping...`);
            continue;
        }

        if (!game.state.endDate) {
            log.warn(`Game with ID ${gameId} is not finished, skipping...`);
            continue;
        }

        for (let slice of slicesForGame) {
            slice.processed = false; // Reset processed state to reprocess the slice

            await statisticsService.processSlice(game, slice);

            // @ts-ignore
            await slice.save();
        }
    }

    log.info("All slices processed.");
});

job();

export {};