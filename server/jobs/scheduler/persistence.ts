import {logger} from "../../utils/logging";

import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";

const Schema = mongoose.Schema;
const Types = Schema.Types;
export type JobExecuted = {
    jobName: string,
    timestamp: number,
}

const schema = new Schema({
    jobName: { type: Types.String, required: true },
    timestamp: { type: Types.Number, required: true }
});

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('executedJob', schema);

const loadJob = async (jobName: string): Promise<JobExecuted | null> => {
    return await model.findOne({ jobName }).lean();
}

const saveJob = async (jobName: string, timestamp: number): Promise<void> => {
    await model.updateOne({ jobName }, { jobName, timestamp }, { upsert: true });
}

const log = logger("Jobs persistence");

export class Persistence {
    cache: Map<string, number> = new Map();

    constructor() {
    }

    async loadExecutionsFor(...jobs: string[]) {
        try {
            log.info("Loading job executions for: " + jobs.join(", "));

            this.cache.clear();

            const executions = await model.find({ jobName: { $in: jobs } }).lean();

            for (const execution of executions) {
                this.cache.set(execution.jobName, execution.timestamp);
            }
        } catch (e) {
            log.error(e, "Failed to load job executions");

            throw new Error("Failed to initialize job persistence: " + (e as Error)?.message);
        }
    }

    async getLastExecution(jobName: string): Promise<number | null> {
        let result: number | null = null;

        try {
            const stored = await loadJob(jobName);
            if (stored) {
                result = stored.timestamp;
                this.cache.set(jobName, result);
            }
        } catch (e) {
            log.error(e, "Failed to load job execution for " + jobName);
        }

        return result || this.cache.get(jobName) || null;
    }

    async saveExecution(jobName: string, timestamp: number): Promise<void> {
        this.cache.set(jobName, timestamp);

        try {
            await saveJob(jobName, timestamp);
        } catch (e) {
            log.error(e, "Failed to save job execution for " + jobName);
        }
    }
}