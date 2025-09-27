import { DBObjectId } from './types/DBObjectId';
import UserService from './user';
import { ValidationError, Tutorial } from "solaris-common";

const tutorials = require('../config/game/tutorials.json') as Tutorial[];
const defaultTutorialKey = "original"

export default class TutorialService {
    userService: UserService;

    constructor(
        userService: UserService
    ) {
        this.userService = userService;
    }

    getByKey(key: string): Tutorial {
        if (!key)
            key = defaultTutorialKey
        const tutorial = tutorials.find((x) => x.key === key);
        if (!tutorial)
            throw new ValidationError(`Tutorial does not exist.`);
        return tutorial;
    }

    listAllTutorials(): Tutorial[] {
        return tutorials.slice();
    }

    async listUserTutorials(userId: DBObjectId) {
        const completed = await this.userService.listTutorialsCompleted(userId);
        const tutorials = this.listAllTutorials();
        tutorials.forEach(t => {
            t.completed = completed.includes(t.key)
        })
        return tutorials;
    }
};
