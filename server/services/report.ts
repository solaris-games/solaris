import { DBObjectId } from './types/DBObjectId';
import ValidationError from '../errors/validation';
import Repository from './repository';
import { Game } from './types/Game';
import { Report } from './types/Report';
import PlayerService from './player';
import ConversationService from "./conversation";
import {ReportCreateReportRequest} from "../api/requests/report";

export default class ReportService {
    reportModel;
    reportRepo: Repository<Report>;
    playerService: PlayerService;
    conversationService: ConversationService;

    constructor(
        reportModel,
        reportRepo: Repository<Report>,
        playerService: PlayerService,
        conversationService: ConversationService
    ) {
        this.reportRepo = reportRepo;
        this.reportModel = reportModel;
        this.playerService = playerService;
        this.conversationService = conversationService;
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

    async listReports() {
        return await this.reportRepo.find({
            // All reports
        }, {
            // All fields
        }, {
            actioned: 1,    // Non-actioned first
            _id: -1          // Newest first
        });
    }

    async actionReport(reportId: DBObjectId) {
        return await this.reportRepo.updateOne({
            _id: reportId
        }, {
            actioned: true
        });
    }

};