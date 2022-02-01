import ValidationError from '../errors/validation';

export default class ReportService {

    constructor(reportModel, reportRepo, playerService) {
        this.reportRepo = reportRepo;
        this.reportModel = reportModel;
        this.playerService = playerService;
    }

    async reportPlayer(game, playerId, reportedByUserId, reasons) {
        let reportedPlayer = this.playerService.getById(game, playerId);
        let reportedByPlayer = this.playerService.getByUserId(game, reportedByUserId);

        if (!reportedPlayer.userId) {
            throw new ValidationError(`The reported player is not a valid user.`);
        }

        let report = new this.reportModel({
            gameId: game._id,
            reportedPlayerId: reportedPlayer._id,
            reportedUserId: reportedPlayer.userId,
            reportedPlayerAlias: reportedPlayer.alias,
            reportedByPlayerId: reportedByPlayer._id,
            reportedByUserId: reportedByPlayer.userId,
            reportedByPlayerAlias: reportedByPlayer.alias,
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

    async actionReport(reportId) {
        return await this.reportRepo.updateOne({
            _id: reportId
        }, {
            actioned: true
        });
    }

};