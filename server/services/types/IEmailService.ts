import { DBObjectId } from "./DBObjectId";

export interface IEmailService {
    sendGameFinishedEmail(gameId: DBObjectId): Promise<void>;
}
