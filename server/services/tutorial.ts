import { DBObjectId } from './types/DBObjectId';
import { Tutorial } from "./types/Tutorial";
import UserService from './user';
import ValidationError from "../errors/validation";

const tutorials = require('../config/game/tutorials.json') as Tutorial[];

export default class TutorialService {
    userService: UserService;

    constructor(
        userService: UserService
    ) {
        this.userService = userService;
    }

    getById(id: number): Tutorial {
        const tutorial = tutorials.find((x) => x.id === id);
        if (!tutorial)
            throw new ValidationError(`Tutorial does not exist.`);
        return tutorial;
    }

    getByKey(key: string): Tutorial {
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
