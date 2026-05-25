import { DBObjectId } from './DBObjectId';
import { User } from './User';
import { InternalGameEvent } from './internalEvents/InternalGameEvent';

export interface IEmailService {
    sendWelcomeEmail(user: User): Promise<void>;
    sendGameStartedEmail(args: InternalGameEvent): Promise<void>;
    sendGameFinishedEmail(gameId: DBObjectId): Promise<void>;
}
