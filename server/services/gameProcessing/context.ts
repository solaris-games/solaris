import UserService from "../user";
import { Game } from "../types/Game";
import { ActiveModel } from "../types/ActiveModel";
import { User } from "../types/User";
import { EmailService } from "../email";
import { NotificationService } from "../notification";
import { EventService } from "../event";
import StatisticsService from "../statistics";
import { IEmailService } from "../types/IEmailService";
import { IEventService } from "../types/IEventService";
import { INotificationService } from "../types/INotificationService";
import { IStatisticsService } from "../types/IStatisticsService";
import { ProcessingEventService } from "./event";
import { ProcessingEmailService } from "./email";
import { ProcessingNotificationService } from "./notification";
import { ProcessingStatisticsService } from "./statistics";

export class GameTickContext {
    private game: Game;
    private gameUsers: ActiveModel<User>[];
    private emailService: EmailService;
    private notificationService: NotificationService;
    private eventService: EventService;
    private statisticsService: StatisticsService;

    private processingEventService: ProcessingEventService;
    private processingEmailService: ProcessingEmailService;
    private processingNotificationService: ProcessingNotificationService;
    private processingStatisticsService: ProcessingStatisticsService;

    static async load(
        userService: UserService,
        game: Game,
        emailService: EmailService,
        notificationService: NotificationService,
        eventService: EventService,
        statisticsService: StatisticsService,
    ) {
        const gameUsers = await userService.getGameUsers(game);

        return new GameTickContext(
            game,
            gameUsers,
            emailService,
            notificationService,
            eventService,
            statisticsService,
        );
    }

    constructor(
        game: Game,
        gameUsers: ActiveModel<User>[],
        emailService: EmailService,
        notificationService: NotificationService,
        eventService: EventService,
        statisticsService: StatisticsService,
    ) {
        this.game = game;
        this.gameUsers = gameUsers;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.eventService = eventService;
        this.statisticsService = statisticsService;
        this.processingEventService = new ProcessingEventService();
        this.processingEmailService = new ProcessingEmailService();
        this.processingNotificationService =
            new ProcessingNotificationService();
        this.processingStatisticsService = new ProcessingStatisticsService();
    }

    async save() {
        for (let user of this.gameUsers) {
            await user.save();
        }

        await this.processingEventService.process(this.eventService);
        await this.processingEmailService.process(this.emailService);
        await this.processingNotificationService.process(
            this.notificationService,
        );
        await this.processingStatisticsService.process(this.statisticsService);
    }

    getGameUsers(): ActiveModel<User>[] {
        return this.gameUsers;
    }

    getEmailService(): IEmailService {
        return this.processingEmailService;
    }

    getNotificationService(): INotificationService {
        return this.processingNotificationService;
    }

    getEventService(): IEventService {
        return this.processingEventService;
    }

    getStatisticsService(): IStatisticsService {
        return this.processingStatisticsService;
    }
}
