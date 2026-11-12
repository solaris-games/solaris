# Server Scripts

Dev variants run via `tsx`, prod variants require a prior `npm run build`.

## API & Jobs

| Script            | Description                                                                          |
|-------------------|--------------------------------------------------------------------------------------|
| `start-api:dev`   | Starts the Express API server on watch mode via `tsx` (inspector on port `9231`).    |
| `start-jobs:dev`  | Starts the background job runner on watch mode via `tsx` (inspector on port `9230`). |
| `start-api:prod`  | Runs the built API server.                                                           |
| `start-jobs:prod` | Runs the built background job runner.                                                |

## Database Maintenance

| Script                                                     | Description                                                                                                              |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `start-db-migrate:dev` / `start-db-migrate:prod`           | Runs pending database migrations (see `tools/migrate.ts`). Applied migrations are tracked in the `Migration` collection. |
| `start-db-recalc-ranks:dev` / `start-db-recalc-ranks:prod` | Recalculates user leaderboard ranks.                                                                                     |
| `start-db-recalc-stats:dev` / `start-db-recalc-stats:prod` | Resets and rebuilds user stats from closed games.                                                                        |
| `start-db-sync-indices:dev` / `start-db-sync-indices:prod` | Syncs Mongoose schema indexes to the database.                                                                           |
| `start-db-clear-reset-tokens:prod`                         | Clears expired password reset tokens (prod only).                                                                        |

## Misc tools

| Script                      | Description                                                                |
|-----------------------------|----------------------------------------------------------------------------|
| `restore-game`              | Restores a game's state from its history at a given tick.                  |
| `research-progress-samples` | Generates sample research progress data across progression configurations. |
| `combat-sim`                | Runs the old combat simulation for experimentation and comparison.         |
