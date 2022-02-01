export default class UserGuildService {
    
    constructor(userRepo, guildService) {
        this.userRepo = userRepo;
        this.guildService = guildService;
    }

    async listUsersWithGuildTags(userIds) {
        let users = await this.userRepo.find({
            _id: {
                $in: userIds
            }
        }, {
            username: 1,
            guildId: 1,
            'gameSettings.guild.displayGuildTag': 1
        });

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
