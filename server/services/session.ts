import { MongoDBStore } from 'connect-mongodb-session';
import session from 'express-session';
import Repository from './repository';
import { DBObjectId } from './types/DBObjectId';
import { User } from './types/User';

export default class SessionService {
    private userRepo: Repository<User>;
    private sessionStorage?: MongoDBStore;
    
    constructor(userRepo: Repository<User>) {
        this.userRepo = userRepo;
    }

    public setSessionStorage(sessionStorage: MongoDBStore) {
        this.sessionStorage = sessionStorage;
    }

    /**
     * Update all the sessions for a specific user (including impersonations of that user).
     * */
    public updateUserSessions(userId: DBObjectId, action: (session: session.SessionData) => void) {
        this.sessionStorage!.all((err: any, obj?: session.SessionData[] | { [sid: string]: session.SessionData; } | null) => {
            if (err != null) {
                throw err;
            }
            else {
                if (Array.isArray(obj)) {
                    for (let o of obj.filter(o => o.userId === userId)) {
                        action(o);
                    }
                }
            }
        });
    }
}