import {Persistence} from "./persistence";
import {logger} from "../../utils/logging";

export type JobSpec = {
    name: string;
    job: (signal: AbortSignal) => Promise<void>,
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
    abort: AbortController | null = null;

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

            jobsToProcess.sort((a, b) => a.interval - b.interval);

            for (const job of jobsToProcess) {
                log.debug(`Running job: ${job.name}`);

                try {
                    await job.job(this.abort!.signal);
                } catch (e) {
                    log.error(e, `Failed to run job: ${job.name}`);
                }

                await this.persistence.saveExecution(job.name, now);

                log.debug(`Job completed: ${job.name}`);
            }

            this.lastExecution = now;
        }

        const finishJob = () => {
            this.pending = null;

            setTimeout(() => {
                this._process();
            }, this.options.checkInterval);
        };

        this.abort = new AbortController();
        this.abort.signal.addEventListener('abort', () => {
            log.warn('Aborting pending job');

            finishJob();
        });

        this.pending = runJobs();
        this.pending.then(finishJob);
    }

    async startup() {
        await this.persistence.loadExecutionsFor(...this.jobs.map(j => j.name));
    }

    run(): Promise<void> {
        return new Promise(((finish, reject) => {
            process.on('uncaughtException', (e) => {
                log.error(e, 'Uncaught exception');

                this.abort && this.abort.abort();
            });

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