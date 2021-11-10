const ValidationError = require('../errors/validation');

module.exports = class AvatarService {

    constructor(userRepo, userService) {
        this.userRepo = userRepo;
        this.userService = userService;
    }

    listAllAvatars() {
        return require('../config/game/avatars').slice();
    }

    async listUserAvatars(userId) {
        let avatars = require('../config/game/avatars').slice();

        let userAvatars = await this.userRepo.findById(userId, {
            avatars: 1
        });

        for (let avatar of avatars) {
            avatar.purchased = avatar.price == null || (userAvatars.avatars || []).indexOf(avatar.id) > -1;
        }

        return avatars;
    }

    async getUserAvatar(userId, avatarId) {
        return (await this.listUserAvatars(userId)).find(a => a.id === avatarId);
    }

    async purchaseAvatar(userId, avatarId) {
        let userCredits = await this.userService.getUserCredits(userId);
        let avatar = await this.getUserAvatar(userId, +avatarId);

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
    }

};
