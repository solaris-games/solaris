import { parseArgs } from "node:util";
import mongoose from "mongoose";
import GameModel from "../db/models/Game";
import { GAME_TYPES } from "@solaris/common";
import "./quietDotenv";
import config from "../config";

type GameStartRow = {
    _id: mongoose.Types.ObjectId;
    settings: { general: { name: string } };
    state: { startDate: Date | null };
    galaxy: { players: { afk?: boolean }[] };
};

const csvEscape = (value: string): string => {
    if (/[",\r\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
};

const { positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
});

const gameType = positionals[0];

if (gameType && !(GAME_TYPES as readonly string[]).includes(gameType)) {
    console.error(`Invalid game type: ${gameType}`);
    console.error(
        `Valid game types: ${GAME_TYPES.join(", ")} (or omit the game type to list all non-tutorial games)`,
    );
    process.exit(1);
}

const run = async () => {
    if (!config.connectionString) {
        throw new Error("No connection string set (CONNECTION_STRING)");
    }

    const mongo = await mongoose.connect(config.connectionString, {
        maxPoolSize: 1,
    });

    try {
        const query = gameType
            ? {
                  "settings.general.type": gameType,
                  "state.startDate": { $ne: null },
              }
            : {
                  "settings.general.type": { $ne: "tutorial" },
                  "state.startDate": { $ne: null },
              };

        const games = (await GameModel.find(query, {
            "settings.general.name": 1,
            "state.startDate": 1,
            "galaxy.players.afk": 1,
        })
            .sort({ "state.startDate": 1 })
            .lean()) as GameStartRow[];

        console.log("id,name,startDate,afkPlayers");

        for (const game of games) {
            const name = csvEscape(game.settings?.general?.name ?? "");
            const startDate = game.state?.startDate
                ? game.state.startDate.toISOString()
                : "";
            const afkPlayers =
                game.galaxy?.players?.filter((p) => p.afk === true).length ?? 0;

            console.log(`${game._id},${name},${startDate},${afkPlayers}`);
        }

        console.error(
            gameType
                ? `Found ${games.length} game(s) of type "${gameType}".`
                : `Found ${games.length} game(s) across all game types (excluding tutorial).`,
        );
    } finally {
        await mongo.disconnect();
    }
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

export {};
