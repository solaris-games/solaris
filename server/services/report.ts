import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Game } from './types/Game';
import { Report } from './types/Report';
import PlayerService from './player';
import ConversationService from "./conversation";
import {ReportCreateReportRequest} from "../api/requests/report";
import UserService from "./user";
import GameListService from "./gameList";
import GameService from "./game";
import {Conversation} from "solaris-common";

export default class ReportService {
    reportModel;
    reportRepo: Repository<Report>;
    playerService: PlayerService;
    conversationService: ConversationService;
    userService: UserService;
    gameListService: GameListService;
    gameService: GameService;

    constructor(
        reportModel,
        reportRepo: Repository<Report>,
        playerService: PlayerService,
        conversationService: ConversationService,
        userService: UserService,
        gameListService: GameListService,
        gameService: GameService,
    ) {
        this.reportRepo = reportRepo;
        this.reportModel = reportModel;
        this.playerService = playerService;
        this.conversationService = conversationService;
        this.userService = userService;
        this.gameListService = gameListService;
        this.gameService = gameService;
    }

    async reportPlayer(game: Game, req: ReportCreateReportRequest, reportedByUserId: DBObjectId) {
        const reportedPlayer = this.playerService.getById(game, req.playerId);
        const reportedByPlayer = this.playerService.getByUserId(game, reportedByUserId)!;

        if (!reportedPlayer || !reportedPlayer.userId) {
            throw new ValidationError(`The reported player is not a valid user.`);
        }

        const reasons = req.reasons;

        const report = new this.reportModel({
            gameId: game._id,
            reportedPlayerId: reportedPlayer._id,
            reportedUserId: reportedPlayer.userId,
            reportedPlayerAlias: reportedPlayer.alias,
            reportedByPlayerId: reportedByPlayer._id,
            reportedByUserId: reportedByPlayer.userId,
            reportedByPlayerAlias: reportedByPlayer.alias,
            reportedMessageId: req.messageId || null,
            reportedConversationId: req.conversationId || null,
            reasons: {
                abuse: reasons.abuse || false,
                spamming: reasons.spamming || false,
                multiboxing: reasons.multiboxing || false,
                inappropriateAlias: reasons.inappropriateAlias || false
            },
            actioned: false,
            date: new Date()
        });

        await report.save();
    }

    isUserInvolved(report: Report, userId: DBObjectId, userGameIds: string[]): boolean {
        return report.reportedByUserId === userId ||
            report.reportedUserId === userId ||
            userGameIds.includes(report.gameId.toString());
    }

    async conversationForReport(reportId: DBObjectId, userId: DBObjectId): Promise<Conversation<DBObjectId>> {
        const report = await this.reportRepo.findOne({
            _id: reportId
        }, {});

        if (!report) {
            throw new ValidationError("Report does not exist");
        }

        if (!report.reportedMessageId || !report.reportedConversationId) {
            throw new ValidationError("Report does not have a conversation attached");
        }

        const f = await this._reportFilter(userId);
        if (!f(report)) {
            throw new ValidationError("Not permitted");
        }

        const game = await this.gameService.getByIdLean(report.gameId, {
            conversations: 1,
            state: 1,
            'galaxy.players': 1,
        });

        return this.conversationService.detail(game!, report.reportedByPlayerId, report.reportedConversationId);
    }

    async listReports(userId: DBObjectId): Promise<Report[]> {
        const reports = await this.reportRepo.find({
            // All reports
        }, {
            // All fields
        }, {
            actioned: 1,    // Non-actioned first
            date: -1,
            _id: -1          // Newest first
        });

        const f = await this._reportFilter(userId);
        return reports.filter(f);
    }

    async _reportFilter(userId: DBObjectId): Promise<(report: Report) => boolean> {
        const isAdmin = await this.userService.getUserIsAdmin(userId);

        if (isAdmin) {
            return () => true;
        } else {
            const userGameIds = (await this.gameListService.listActiveGames(userId)).concat(await this.gameListService.listUserCompletedGames(userId)).map(game => game._id.toString());

            return (report) => !this.isUserInvolved(report, userId, userGameIds);
        }
    }

    async actionReport(userId: DBObjectId, reportId: DBObjectId) {
        return await this.reportRepo.updateOne({
            _id: reportId
        }, {
            actioned: true,
            actionedBy: userId
        });
    }

};