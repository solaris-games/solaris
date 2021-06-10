module.exports = class UserGuildService {
    
    constructor(userModel, guildService) {
        this.userModel = userModel;
        this.guildService = guildService;
    }

    async listUsersWithGuildTags(userIds) {
        let users = await this.userModel.find({
            _id: {
                $in: userIds
            }
        }, {
            username: 1,
            guildId: 1,
            'gameSettings.guild.displayGuildTag': 1
        })
        .lean()
        .exec();

        let guildIds = users.filter(x => x.guildId).map(x => x.guildId);

        let guilds = await this.guildService.listInfoByIds(guildIds);
        
        return users.map(u => {
            return {
                _id: u._id,
                username: u.username,
                displayGuildTag: u.gameSettings.guild.displayGuildTag,
                guild: guilds.find(g => g._id.equals(u.guildId))
            };
        });
    }

};
