import {Persistence} from "./persistence";
import {logger} from "../../utils/logging";

export type JobSpec = {
    name: string;
    job: () => Promise<void>,
    interval: number;
}


export type SchedulerOptions = {
    checkInterval: number;
}

const log = logger("Scheduler");

export class Scheduler {
    jobs: JobSpec[] = [];
    options: SchedulerOptions;
    persistence: Persistence;
    pending: Promise<void> | null =  null;
    lastExecution: number = 0;

    constructor(jobs: JobSpec[], options: SchedulerOptions) {
        this.jobs = jobs;
        this.options = options;
        this.persistence = new Persistence();
    }

    _process() {
        const runJobs = async () => {
            const now = Date.now();

            const jobsToProcess: JobSpec[] = [];

            for (const job of this.jobs) {
                const lastExecution = await this.persistence.getLastExecution(job.name);

                if (lastExecution === null || now - lastExecution >= job.interval) {
                    jobsToProcess.push(job);
                }
            }

            for (const job of jobsToProcess) {
                log.info(`Running job: ${job.name}`);

                try {
                    await job.job();
                } catch (e) {
                    log.error(e, `Failed to run job: ${job.name}`);
                }

                await this.persistence.saveExecution(job.name, now);
            }

            this.lastExecution = now;
        }

        this.pending = runJobs();

        this.pending.then(() => {
            this.pending = null;

            setTimeout(() => {
                this._process();
            }, this.options.checkInterval);
        })
    }

    async startup() {
        await this.persistence.loadExecutionsFor(...this.jobs.map(j => j.name));
    }

    run(): Promise<void> {
        return new Promise(((finish, reject) => {
            process.on('SIGINT', () => {
                log.info('Shutdown requested...');

                if (this.pending) {
                    log.info("Shutdown after awaiting pending job");

                    this.pending.then(() => {
                        finish();
                    });
                } else {
                    log.info("Shutdown immediately");

                    finish();
                }
            });

            this._process();
        }));
    }
}