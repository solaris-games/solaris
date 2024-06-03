import { DBObjectId } from './types/DBObjectId';
import ValidationError from '../errors/validation';
import Repository from './repository';
import { Game } from './types/Game';
import { Report } from './types/Report';
import PlayerService from './player';
import ConversationService from "./conversation";
import {ReportCreateReportRequest} from "../api/requests/report";
import UserService from "./user";
import GameListService from "./gameList";

export default class ReportService {
    reportModel;
    reportRepo: Repository<Report>;
    playerService: PlayerService;
    conversationService: ConversationService;
    userService: UserService;
    gameListService: GameListService;

    constructor(
        reportModel,
        reportRepo: Repository<Report>,
        playerService: PlayerService,
        conversationService: ConversationService,
        userService: UserService,
        gameListService: GameListService,
    ) {
        this.reportRepo = reportRepo;
        this.reportModel = reportModel;
        this.playerService = playerService;
        this.conversationService = conversationService;
        this.userService = userService;
        this.gameListService = gameListService;
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
            actioned: false
        });

        await report.save();
    }

    isUserInvolved(report: Report, userId: DBObjectId, userGameIds: string[]): boolean {
        return report.reportedByUserId === userId ||
            report.reportedUserId === userId ||
            userGameIds.includes(report.gameId.toString());
    }

    async listReports(userId: DBObjectId): Promise<Report[]> {
        const isAdmin = await this.userService.getUserIsAdmin(userId);

        const reports = await this.reportRepo.find({
            // All reports
        }, {
            // All fields
        }, {
            actioned: 1,    // Non-actioned first
            _id: -1          // Newest first
        });

        if (isAdmin) {
            return reports;
        } else {
            // CM can only see reports that do not involve them/a game they're in
            const results: Report[] = [];
            const userGameIds = (await this.gameListService.listActiveGames(userId)).concat(await this.gameListService.listUserCompletedGames(userId)).map(game => game._id.toString());

            for (let report of reports) {
                if (!this.isUserInvolved(report, userId, userGameIds)) {
                    results.push(report);
                }
            }

            return results;
        }
    }

    async actionReport(reportId: DBObjectId) {
        return await this.reportRepo.updateOne({
            _id: reportId
        }, {
            actioned: true
        });
    }

};