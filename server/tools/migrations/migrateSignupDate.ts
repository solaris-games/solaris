import { JobParameters } from "../tool";

const CUTOFF_DATE = new Date('2026-05-01T00:00:00.000Z');

export const migrateSignupDate = async (ctx: JobParameters) => {
    const log = ctx.log;
    const userRepository = ctx.container.userService.userRepo;

    const allUsers = await userRepository.find({
        $or: [
            { signupDate: null },
            { signupDate: { $lt: CUTOFF_DATE } }
        ]
    }, {
        '_id': 1,
    }, { _id: 1 });

    const total = allUsers.length;
    log.info(`Found ${total} users to migrate`);

    const writes = allUsers.map((user) => ({
        updateOne: {
            filter: {
                _id: user._id,
                $or: [
                    { signupDate: null },
                    { signupDate: { $lt: CUTOFF_DATE } }
                ]
            },
            update: { $set: { signupDate: user._id.getTimestamp() } }
        }
    }));

    if (writes.length) {
        await userRepository.bulkWrite(writes);
    }

    log.info("Finished migrating user signup dates");
};
