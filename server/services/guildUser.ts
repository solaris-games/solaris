import { DBObjectId } from "./types/DBObjectId";
import Repository from "./repository";
import { User } from "./types/User";
import GuildService from "./guild";
import { GuildUserWithTag } from "./types/Guild";

export default class UserGuildService {
    userRepo: Repository<User>;
    guildService: GuildService;
    
    constructor(
        userRepo: Repository<User>,
        guildService: GuildService
    ) {
        this.userRepo = userRepo;
        this.guildService = guildService;
    }

    async listUsersWithGuildTags(userIds: DBObjectId[]): Promise<GuildUserWithTag[]> {
        let users = await this.userRepo.find({
            _id: {
                $in: userIds
            }
        }, {
            username: 1,
            guildId: 1,
            'gameSettings.guild.displayGuildTag': 1
        });

        let guildIds = users.filter(x => x.guildId).map(x => x.guildId!);

        let guilds = await this.guildService.listInfoByIds(guildIds);
        
        return users.map(u => {
            return {
                _id: u._id,
                username: u.username,
                displayGuildTag: u.gameSettings.guild.displayGuildTag,
                guild: guilds.find(g => u.guildId && g._id.toString() === u.guildId.toString()) || null
            };
        });
    }

};
