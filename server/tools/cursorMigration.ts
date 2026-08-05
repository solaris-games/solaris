import { type Logger } from "pino";
import Repository from "../services/repository";
import type { ActiveModel } from "../services/types/ActiveModel";

export interface CursorMigrateOptions {
    name: string;
    progressInterval?: number;
    batchSize?: number;
    sort?: any;
}

export async function cursorMigrateModels<T, OM>(
    repository: Repository<T>,
    filter: Record<string, any>,
    process: (doc: ActiveModel<OM>) => Promise<void>,
    opts: CursorMigrateOptions,
    log: Logger,
): Promise<number> {
    const {
        name,
        progressInterval = 100,
        batchSize = 100,
        sort = { _id: 1 },
    } = opts;

    log.info(`[${name}] Starting cursor migration...`);

    const cursor = repository.model
        .find(filter)
        .sort(sort)
        .cursor({ batchSize });

    let count = 0;
    for await (const doc of cursor) {
        await process(doc as ActiveModel<OM>);
        count++;
        if (count % progressInterval === 0) {
            log.info(`[${name}] Processed ${count} documents...`);
        }
    }

    log.info(`[${name}] Finished. Total: ${count} documents`);
    return count;
}

export async function cursorMigrateBulk<T>(
    repository: Repository<T>,
    filter: Record<string, any>,
    map: (doc: T) => any,
    opts: CursorMigrateOptions,
    log: Logger,
): Promise<number> {
    const {
        name,
        progressInterval = 100,
        batchSize = 100,
        sort = { _id: 1 },
    } = opts;

    log.info(`[${name}] Starting cursor bulk migration...`);

    const cursor = repository.model
        .find(filter)
        .sort(sort)
        .lean({ defaults: true })
        .cursor({ batchSize });

    let count = 0;
    let batch: any[] = [];
    for await (const doc of cursor) {
        batch.push(map(doc as T));
        count++;
        if (batch.length >= batchSize) {
            await repository.model.bulkWrite(batch, { strict: false });
            batch = [];
            log.info(`[${name}] Processed ${count} documents...`);
        }
    }

    if (batch.length > 0) {
        await repository.model.bulkWrite(batch, { strict: false });
    }

    log.info(`[${name}] Finished. Total: ${count} documents`);
    return count;
}
