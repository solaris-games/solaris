import session from "express-session";
import Repository from "./repository";
import { DBObjectId } from "./types/DBObjectId";
import { User } from "./types/User";
import MongoStore from "connect-mongo";
import { Config } from "../config/types/Config";

export default class SessionService {
    private userRepo: Repository<User>;
    private sessionStorage?: MongoStore;

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
        session.userCredits = user.credits;
        session.isImpersonating = false;
    }

    public refreshSession(session: Partial<session.SessionData>, user: User) {
        session.userId = user._id;
        session.username = user.username;
        session.roles = user.roles;
        session.userCredits = user.credits;
    }

    public startImpersonation(
        session: Partial<session.SessionData>,
        user: User,
    ) {
        session.originalUserId = session.userId;
        session.userId = user._id;
        session.username = user.username;
        session.roles = user.roles;
        session.userCredits = user.credits;
        session.isImpersonating = true;
    }

    public endImpersonation(session: Partial<session.SessionData>, user: User) {
        session.originalUserId = undefined;
        session.userId = user._id;
        session.username = user.username;
        session.roles = user.roles;
        session.userCredits = user.credits;
        session.isImpersonating = false;
    }

    public destroySession(session: session.Session): Promise<void> {
        return new Promise((resolve, reject) => {
            session.destroy((err) => (err ? reject(err) : resolve()));
        });
    }

    public static createSessionStore(config: Config): MongoStore {
        return MongoStore.create({
            mongoUrl: config.connectionString!,
            collectionName: "sessions2", // use new sessions collection
        });
    }

    public setSessionStorage(sessionStorage: MongoStore) {
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
