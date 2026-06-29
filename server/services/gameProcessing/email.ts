import { IEmailService } from "../types/IEmailService";
import { DBObjectId } from "../types/DBObjectId";
import { logger } from "../../utils/logging";

type ProcessingEmail = { kind: "gameFinished"; gameId: DBObjectId };

const log = logger("Context: ProcessingEmailService");

export class ProcessingEmailService implements IEmailService {
    private _emails: ProcessingEmail[] = [];

    sendGameFinishedEmail(gameId: DBObjectId): Promise<void> {
        this._emails.push({ kind: "gameFinished", gameId });
        return Promise.resolve(undefined);
    }

    async process(emailService: IEmailService) {
        const emails = this._emails;
        this._emails = [];

        log.info(`Processing ${emails.length} emails.`);

        for (let em of emails) {
            if (em.kind === "gameFinished") {
                await emailService.sendGameFinishedEmail(em.gameId);
            }
        }
    }
}
