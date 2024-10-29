import 'express-session'
import { DBObjectId } from './DBObjectId'
import { UserRoles } from './User';

declare module 'express-session' {
    interface SessionData {
        userId: DBObjectId;
        username: string;
        roles: UserRoles;
        userCredits: number;
        isImpersonating: boolean;
        originalUserId?: DBObjectId;
    }
}