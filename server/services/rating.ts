import { ObjectId } from "mongoose";
import DatabaseRepository from "../models/DatabaseRepository";
import { Game } from "../types/Game";
import { User } from "../types/User";
import UserService from "./user";

const EloRating = require('elo-rating');

export default class RatingService {
    userRepo: DatabaseRepository<User>;
    gameRepo: DatabaseRepository<Game>;
    userService: UserService;

    constructor(
        userRepo: DatabaseRepository<User>,
        gameRepo: DatabaseRepository<Game>,
        userService: UserService
    ) {
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
        this.userService = userService;
    }

    recalculateEloRating(userA: User, userB: User, userAIsWinner: boolean) {
        // Note that some players may no longer have accounts, in which case consider it a win for the
        // player against the same rank as their own.
        let userARating = userA == null ? userB.achievements.eloRating : userA.achievements.eloRating;
        let userBRating = userB == null ? userA.achievements.eloRating : userB.achievements.eloRating;

        let eloResult = EloRating.calculate(
            userARating == null ? 1200 : userARating, 
            userBRating == null ? 1200 : userBRating, 
            userAIsWinner);

        if (userA) {
            userA.achievements.eloRating = eloResult.playerRating;
        }

        if (userB) {
            userB.achievements.eloRating = eloResult.opponentRating;
        }
    }

};
