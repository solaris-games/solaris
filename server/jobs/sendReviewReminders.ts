import { DependencyContainer } from "../services/types/DependencyContainer";

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}  

export default (container: DependencyContainer) => {

    return {

        async handler(job, done) {
            if (!container.emailService.isEnabled()) { // TODO: Remove when backlog has been sent.
                done()
                return
            }

            const users = await container.userService.listUsersEligibleForReviewReminder(5);

            for (const user of users) {
                try {
                    await container.emailService.sendReviewReminderEmail(user);
                } catch (e) {
                    console.error(e);
                } finally {
                    await container.userService.setReviewReminderEmailSent(user._id, true);
                }
                
                await sleep(1000) // Wait for a second before sending the next email.
            }

            done();
        }

    };
    
};
