import {logger} from "../../utils/logging";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseLeanDefaults = require('mongoose-lean-defaults');

export type JobExecuted = {
    jobName: string,
    date: Date,
}

const schema = new Schema({
    jobName: { type: String, required: true },
    date: { type: Date, required: true, default: () => new Date() }
});

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('jobs_executed', schema);

const loadJob = async (jobName: string): Promise<JobExecuted | null> => {
    return await model.findOne({ jobName }).lean();
}

const saveJob = async (jobName: string): Promise<void> => {
    await model.updateOne({ jobName }, { jobName, date: new Date() }, { upsert: true });
}

const log = logger("Jobs persistence");

export class Persistence {
    cache: Map<string, Date> = new Map();

    constructor() {
    }

    async loadExecutionsFor(...jobs: string[]) {
        try {
            log.info("Loading job executions for: " + jobs.join(", "));

            this.cache.clear();

            const executions = await model.find({ jobName: { $in: jobs } }).lean();

            for (const execution of executions) {
                this.cache.set(execution.jobName, execution.date);
            }
        } catch (e) {
            log.error(e, "Failed to load job executions");

            throw new Error("Failed to initialize job persistence: " + (e as Error)?.message);
        }
    }

    async getLastExecution(jobName: string): Promise<Date | null> {
        let result: Date | null = null;

        try {
            const stored = await loadJob(jobName);
            if (stored) {
                result = stored.date;
                this.cache.set(jobName, result);
            }
        } catch (e) {
            log.error(e, "Failed to load job execution for " + jobName);
        }

        return result || this.cache.get(jobName) || null;
    }

    async saveExecution(jobName: string, date: Date): Promise<void> {
        this.cache.set(jobName, date);

        try {
            await saveJob(jobName);
        } catch (e) {
            log.error(e, "Failed to save job execution for " + jobName);
        }
    }
}