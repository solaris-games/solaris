import { ValidationError } from "@solaris-common";
import Repository from './repository';
import SessionService from './session';
import { Avatar, UserAvatar } from './types/Avatar';
import { DBObjectId } from './types/DBObjectId';
import { User } from './types/User';
import UserService from './user';

export default class AvatarService {

    constructor(private userRepo: Repository<User>,
                private userService: UserService,
                private sessionService: SessionService) {
    }

    listAllAvatars(): Avatar[] {
        return require('../config/game/avatars').slice();
    }

    listAllSolarisAvatars(): Avatar[] {
        return this.listAllAvatars().filter(a => !a.isPatronAvatar);
    }

    listAllAliases(): string[] {
        return require('../config/game/aliases').slice();
    }

    async listUserAvatars(userId: DBObjectId): Promise<UserAvatar[]> {
        let avatars = require('../config/game/avatars').slice();

        let userAvatars = await this.userRepo.findById(userId, {
            avatars: 1
        });

        if (!userAvatars) {
            return [];
        }

        for (let avatar of avatars) {
            avatar.purchased = avatar.price == null || (userAvatars.avatars || []).indexOf(avatar.id) > -1;
        }

        return avatars;
    }

    async getUserAvatar(userId: DBObjectId, avatarId: number): Promise<UserAvatar> {
        return (await this.listUserAvatars(userId)).find(a => a.id === avatarId)!;
    }

    async purchaseAvatar(userId: DBObjectId, avatarId: number) {
        let userCredits = await this.userService.getCredits(userId);
        let avatar = await this.getUserAvatar(userId, avatarId);

        if (!avatar) {
            throw new ValidationError(`Avatar ${avatarId} does not exist.`);
        }

        if (avatar.purchased) {
            throw new ValidationError(`You have already purchased this avatar.`);
        }

        if (userCredits < avatar.price) {
            throw new ValidationError(`You do not have enough credits to purchase this avatar. The cost is ${avatar.price} credits, you have ${userCredits}.`);
        }

        await this.userRepo.updateOne({
            _id: userId
        }, {
            $inc: {
                credits: -avatar.price
            },
            $addToSet: {
                avatars: avatarId
            }
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.userCredits -= avatar.price;
        });
    }

};
