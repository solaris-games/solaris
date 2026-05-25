import UserService from "../user";
import {Game} from "../types/Game";
import {ActiveModel} from "../types/ActiveModel";
import {User} from "../types/User";
import {IEmailService} from "../types/IEmailService";
import {INotificationService} from "../types/INotificationService";
import {IEventService} from "../types/IEventService";
import {IStatisticsService} from "../types/IStatisticsService";

export class GameTickContext {
    game: Game;
    gameUsers: ActiveModel<User>[];
    emailService: IEmailService;
    notificationService: INotificationService;
    eventService: IEventService;
    statisticsService: IStatisticsService;

    static async load(userService: UserService, game: Game, emailService: IEmailService, notificationService: INotificationService, eventService: IEventService, statisticsService: IStatisticsService) {
        const gameUsers = await userService.getGameUsers(game);

        return new GameTickContext(game, gameUsers, emailService, notificationService, eventService, statisticsService);
    }

    constructor(game: Game, gameUsers: ActiveModel<User>[], emailService: IEmailService, notificationService: INotificationService, eventService: IEventService, statisticsService: IStatisticsService) {
        this.game = game;
        this.gameUsers = gameUsers;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.eventService = eventService;
        this.statisticsService = statisticsService;
    }

    async save() {
        for (let user of this.gameUsers) {
            await user.save();
        }
    }

    getGameUsers(): ActiveModel<User>[] {
        return this.gameUsers;
    }
}