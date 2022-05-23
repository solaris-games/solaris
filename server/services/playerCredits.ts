import Repository from './repository';
import { Game } from './types/Game';
import { Player } from './types/Player';

export default class PlayerCreditsService {
    gameRepo: Repository<Game>;

    constructor(
        gameRepo: Repository<Game>
    ) {
        this.gameRepo = gameRepo;
    }

    async addCredits(game: Game, player: Player, amount: number, commit: boolean = true) {
        player.credits += amount;

        let query: any = {
            updateOne: {
                filter: {
                    _id: game._id,
                    'galaxy.players._id': player._id
                },
                update: {
                    $inc: {
                        'galaxy.players.$.credits': amount
                    }
                }
            }
        }

        if (commit) {
            await this.gameRepo.bulkWrite([query]);
        }

        return query;
    }

    async addCreditsSpecialists(game: Game, player: Player, amount: number, commit: boolean = true) {
        player.creditsSpecialists += amount;

        let query: any = {
            updateOne: {
                filter: {
                    _id: game._id,
                    'galaxy.players._id': player._id
                },
                update: {
                    $inc: {
                        'galaxy.players.$.creditsSpecialists': amount
                    }
                }
            }
        }

        if (commit) {
            await this.gameRepo.bulkWrite([query]);
        }

        return query;
    }

}
