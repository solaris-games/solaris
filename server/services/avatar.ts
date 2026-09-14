import { ValidationError, Avatar, UserAvatar, Guild } from "@solaris/common";
import Repository from "./repository";
import SessionService from "./session";
import { DBObjectId } from "./types/DBObjectId";
import { User } from "./types/User";
import UserService from "./user";
import GuildService from "./guild";

export default class AvatarService {
    constructor(
        private userRepo: Repository<User>,
        private userService: UserService,
        private sessionService: SessionService,
        private guildService: GuildService,
    ) {}

    listAllAvatars(): Avatar[] {
        return require("../config/game/avatars").slice();
    }

    listAllSolarisAvatars(): Avatar[] {
        return this.listAllAvatars().filter(
            (a) => a.avatarType === "normal" && !a.isPatronAvatar,
        );
    }

    listAllAliases(): string[] {
        return require("../config/game/aliases").slice();
    }

    async listUserAvatars(userId: DBObjectId): Promise<UserAvatar[]> {
        const avatars = this.listAllAvatars();

        const user = await this.userRepo.findById(userId, {
            avatars: 1,
            guildId: 1,
        });

        if (!user) {
            return [];
        }

        const unlockedAvatarIds = user.avatars || [];

        let guild: Guild<DBObjectId> | null;
        if (user.guildId) {
            guild = await this.guildService.getInfoById(user.guildId);
        }

        return avatars.map((avatar) => {
            if (avatar.avatarType === "normal") {
                return {
                    ...avatar,
                    unlocked:
                        avatar.price === null ||
                        unlockedAvatarIds.includes(avatar.id),
                };
            } else if (avatar.avatarType === "guild") {
                return {
                    ...avatar,
                    unlocked: guild?.avatars?.includes(avatar.id) || false,
                };
            } else {
                throw new Error("Unrecognized avatar type");
            }
        });
    }

    async getUserAvatar(
        userId: DBObjectId,
        avatarId: number,
    ): Promise<UserAvatar> {
        return (await this.listUserAvatars(userId)).find(
            (a) => a.id === avatarId,
        )!;
    }

    async purchaseAvatar(userId: DBObjectId, avatarId: number) {
        let userCredits = await this.userService.getCredits(userId);
        let avatar = await this.getUserAvatar(userId, avatarId);

        if (!avatar) {
            throw new ValidationError(`Avatar ${avatarId} does not exist.`);
        }

        if (avatar.avatarType !== "normal") {
            throw new ValidationError(
                `Avatar ${avatarId} cannot be purchased.`,
            );
        }

        if (avatar.unlocked) {
            throw new ValidationError(
                `You have already purchased this avatar.`,
            );
        }

        if (userCredits < avatar.price) {
            throw new ValidationError(
                `You do not have enough credits to purchase this avatar. The cost is ${avatar.price} credits, you have ${userCredits}.`,
            );
        }

        await this.userRepo.updateOne(
            {
                _id: userId,
            },
            {
                $inc: {
                    credits: -avatar.price,
                },
                $addToSet: {
                    avatars: avatarId,
                },
            },
        );

        this.sessionService.updateUserSessions(userId, (session) => {
            session.userCredits -= avatar.price;
        });
    }
}
