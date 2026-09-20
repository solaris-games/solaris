import { makeJob } from "./tool";

const CUTOFF_MS = 48 * 60 * 60 * 1000;

const job = makeJob("Clear password reset tokens", async (ctx) => {
    const cutoff = new Date(Date.now() - CUTOFF_MS);
    const userRepository = ctx.container.userService.userRepo;

    const query = {
        resetPasswordToken: { $ne: null },
        $or: [
            { resetPasswordDate: null },
            { resetPasswordDate: { $lt: cutoff } },
        ],
    };

    const count = await userRepository.count(query);

    if (count === 0) {
        ctx.log.info("No expired password reset tokens found");
        return;
    }

    await userRepository.updateMany(query, {
        $set: {
            resetPasswordToken: null,
            resetPasswordDate: null,
        },
    });

    ctx.log.info(
        `Cleared ${count} password reset token(s) older than ${cutoff.toISOString()}`,
    );
});

job();

export {};
