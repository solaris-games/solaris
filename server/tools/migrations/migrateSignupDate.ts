import { JobParameters } from "../tool";
import { User } from "../../services/types/User";

export const migrateSignupDate = async (ctx: JobParameters) => {
    const log = ctx.log;
    const userRepository = ctx.container.userService.userRepo;
    const gameRepository = ctx.container.gameListService.gameRepo;

    const allUsers = await userRepository.find({ signupDate: null }, {
        '_id': 1,
    }, { _id: 1 });

    const total = allUsers.length;
    const pageSize = 10;
    const totalPages = Math.ceil(total / pageSize);

    log.info(`Found ${total} users to migrate`);

    for (let page = 0; page < totalPages; page++) {
        const batch = allUsers.slice(page * pageSize, (page + 1) * pageSize);

        const writes = (await Promise.all(batch.map(async (user: User) => {
            const games = await gameRepository.find({
                'state.startDate': { $ne: null },
                'state.endDate': { $ne: null },
                'settings.general.type': { $ne: 'tutorial' },
                $or: [
                    { 'galaxy.players': { $elemMatch: { userId: user._id } } },
                    { 'afkers': { $in: [user._id] } }
                ]
            }, {
                'state.startDate': 1,
            }, {
                'state.startDate': 1  // ascending — oldest game first
            }, 1);

            if (!games.length) {
                return null;
            }

            return {
                updateOne: {
                    filter: { _id: user._id, signupDate: null },
                    update: { $set: { signupDate: games[0].state.startDate } }
                }
            };
        }))).filter(Boolean);

        if (writes.length) {
            await userRepository.bulkWrite(writes);
        }

        log.info(`Page ${page + 1}/${totalPages}`);
    }

    log.info("Finished migrating user signup dates");
};
