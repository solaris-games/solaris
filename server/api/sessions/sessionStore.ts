import session, { Store } from "express-session";
import Repository from "../../services/repository";
import type { UserSession } from "./session";
import { logger } from "../../utils/logging";

const log = logger("Session store");

export type SessionStoreOptions = {
    ttl: number;
};

// The whole session store is ill-designed but we cannot change that
export class SessionStore extends Store {
    constructor(
        private sessionRepository: Repository<UserSession>,
        private options: SessionStoreOptions,
    ) {
        super();
    }

    _notExpiredQuery() {
        return {
            expires: { $gt: new Date() },
        };
    }

    all(
        callback: (
            err: any,
            obj?:
                | session.SessionData[]
                | {
                      [p: string]: session.SessionData;
                  }
                | null,
        ) => void,
    ): void {
        throw new Error(
            "This is a stupid method and you should not be using it.",
        );
    }

    clear(callback?: (err?: any) => void): void {
        this.sessionRepository
            .deleteMany({})
            .then(() => {
                log.info("Sessions cleared");
                callback && callback(null);
            })
            .catch((e) => {
                log.error(e, `Failed to clear sessions: ${e.toString()}`);
                callback && callback(e);
            });
    }

    destroy(sid: string, callback?: (err?: any) => void): void {
        this.sessionRepository
            .deleteOne({
                sessionId: sid,
            })
            .then(() => {
                callback && callback();
            })
            .catch((e) => {
                log.error(
                    e,
                    `Error destroying session ${sid}: ${e.toString()}`,
                );
                callback && callback(e);
            });
    }

    get(
        sid: string,
        callback: (err: any, session?: session.SessionData | null) => void,
    ): void {
        this.sessionRepository
            .findOneAsModel({
                sessionId: sid,
                ...this._notExpiredQuery(),
            })
            .then((session) => {
                callback(null, session as session.SessionData);
            })
            .catch((e) => {
                log.error(e, `Error getting session ${sid}: ${e.toString()}`);
                callback(e, undefined);
            });
    }

    length(callback: (err: any, length?: number) => void): void {
        this.sessionRepository
            .count(this._notExpiredQuery())
            .then((n) => {
                callback(null, n);
            })
            .catch((e) => {
                log.error(e, `Error loading session length: ${e.toString()}`);
                callback(e, undefined);
            });
    }

    set(
        sid: string,
        session: session.SessionData,
        callback?: (err?: any) => void,
    ): void {
        const tSession = session as UserSession;

        tSession.expires = this._expireFromNow(session);
        tSession.lastModified = new Date();

        const update = {
            $set: {
                sessionId: sid,
                userId: tSession.userId,
                username: tSession.username,
                roles: tSession.roles,
                isImpersonating: tSession.isImpersonating,
                originalUserId: tSession.originalUserId,
                expires: tSession.expires,
                lastModified: tSession.lastModified,
                cookie: tSession.cookie,
            },
        };

        this.sessionRepository
            .updateOne(
                {
                    sessionId: sid,
                },
                update,
                {
                    upsert: true,
                },
            )
            .then(() => {
                callback && callback();
            })
            .catch((e) => {
                log.error(e, `Error setting session ${sid}: ${e.toString()}`);
                callback && callback(e);
            });
    }

    touch(
        sid: string,
        session: session.SessionData,
        callback?: (e?) => void,
    ): void {
        const tSession = session as UserSession;

        tSession.expires = this._expireFromNow(session);
        tSession.lastModified = new Date();

        const update = {
            $set: {
                expires: tSession.expires,
                lastModified: tSession.lastModified,
            },
        };

        this.sessionRepository
            .updateOne(
                {
                    sessionId: sid,
                },
                update,
            )
            .then((res) => {
                if (res.matchedCount === 0) {
                    log.error(`Tried to touch non-existent session: ${sid}`);
                }

                callback &&
                    callback(`Tried to touch non-existent session: ${sid}`);
            })
            .catch((e) => {
                log.error(e, `Error touching session ${sid}: ${e.toString()}`);
                callback && callback(e);
            });
    }

    private _expireFromNow(session: session.SessionData): Date {
        if (session.cookie?.expires) {
            return new Date(session.cookie.expires);
        }

        return new Date(Date.now() + this.options.ttl * 1000);
    }
}
