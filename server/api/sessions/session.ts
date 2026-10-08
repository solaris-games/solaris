import { DBObjectId } from "../../services/types/DBObjectId";
import { UserRoles } from "../../services/types/User";
import { Cookie } from "express-session";

export type UserSession = {
    sessionId: string;
    userId: DBObjectId;
    username: string;
    roles: UserRoles;
    isImpersonating: boolean;
    originalUserId?: DBObjectId;
    expires: Date;
    lastModified: Date;
    cookie?: Cookie;
};
