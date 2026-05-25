import {IEmailService} from "../types/IEmailService";
import {DBObjectId} from "../types/DBObjectId";

type ProcessingEmail = | { kind: 'gameFinished', gameId: DBObjectId };

export class ProcessingEmailService implements IEmailService {
    private _emails: ProcessingEmail[] = [];

    sendGameFinishedEmail(gameId: DBObjectId): Promise<void> {
        return Promise.resolve(undefined);
    }

    async process(emailService: IEmailService) {
        const emails = this._emails;
        this._emails = [];

        for (let em of emails) {
            if (em.kind === 'gameFinished') {
                await emailService.sendGameFinishedEmail(em.gameId);
            }
        }
    }
}