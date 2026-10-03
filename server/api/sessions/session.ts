import { DBObjectId } from "../../services/types/DBObjectId";
import { UserRoles } from "../../services/types/User";

export type UserSession = {
    _id: DBObjectId;
    userId: DBObjectId;
    username: string;
    roles: UserRoles;
    isImpersonating: boolean;
    originalUserId?: DBObjectId;
    expires: Date;
    lastModified: Date;
};
