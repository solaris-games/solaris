import session from "express-session";
import Repository from "./repository";
import { DBObjectId } from "./types/DBObjectId";
import { User } from "./types/User";
import { SessionStore } from "../api/sessions/sessionStore";
import { UserSession } from "../api/sessions/session";

export const SESSION_TTL_SECONDS = 3600 * 24 * 60;

export default class SessionService {
    private userRepo: Repository<User>;
    private sessionStorage?: SessionStore;

    constructor(userRepo: Repository<User>) {
        this.userRepo = userRepo;
    }

    public initialiseSession(
        session: Partial<session.SessionData>,
        user: User,
    ) {
        session.userId = user._id;
        session.username = user.username;
        session.roles = user.roles;
        session.isImpersonating = false;
    }

    public refreshSession(session: Partial<session.SessionData>, user: User) {
        session.userId = user._id;
        session.username = user.username;
        session.roles = user.roles;
    }

    public startImpersonation(
        session: Partial<session.SessionData>,
        user: User,
    ) {
        session.originalUserId = session.userId;
        session.userId = user._id;
        session.username = user.username;
        session.roles = user.roles;
        session.isImpersonating = true;
    }

    public endImpersonation(session: Partial<session.SessionData>, user: User) {
        session.originalUserId = undefined;
        session.userId = user._id;
        session.username = user.username;
        session.roles = user.roles;
        session.isImpersonating = false;
    }

    public destroySession(session: session.Session): Promise<void> {
        return new Promise((resolve, reject) => {
            session.destroy((err) => (err ? reject(err) : resolve()));
        });
    }

    public static createSessionStore(
        sessionRepository: Repository<UserSession>,
    ): SessionStore {
        return new SessionStore(sessionRepository, {
            ttl: SESSION_TTL_SECONDS,
        });
    }

    public setSessionStorage(sessionStorage: SessionStore) {
        this.sessionStorage = sessionStorage;
    }

    /**
     * Update all the sessions for a specific user (including impersonations of that user).
     * */
    public updateUserSessions(
        userId: DBObjectId,
        action: (session: session.SessionData) => void,
    ) {
        this.sessionStorage!.all(
            (
                err: any,
                obj?:
                    | session.SessionData[]
                    | { [sid: string]: session.SessionData }
                    | null,
            ) => {
                if (err != null) {
                    throw err;
                } else {
                    if (Array.isArray(obj)) {
                        for (let o of obj.filter(
                            (o) => o.userId.toString() === userId.toString(),
                        )) {
                            action(o);
                        }
                    }
                }
            },
        );
    }
}
