import { DependencyContainer } from "../services/types/DependencyContainer";
import {logger} from "../utils/logging";

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}  

const log = logger("Send Review Reminders Job");

export default (container: DependencyContainer) => {

    return {

        async handler(job, done) {
            try {
                if (!container.emailService.isEnabled()) { // TODO: Remove when backlog has been sent.
                    done()
                    return
                }

                const users = await container.userService.listUsersEligibleForReviewReminder(5);

                for (const user of users) {
                    try {
                        await container.emailService.sendReviewReminderEmail(user);
                    } catch (e) {
                        log.error(e);
                    } finally {
                        await container.userService.setReviewReminderEmailSent(user._id, true);
                    }

                    await sleep(1000) // Wait for a second before sending the next email.
                }

                done();
            } catch (e) {
                log.error("SendReviewReminders job threw unhandled: " + e, e);
            }
        }

    };
    
};
