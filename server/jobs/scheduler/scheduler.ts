import {Persistence} from "./persistence";

export type JobSpec = {
    name: string;
    job: () => Promise<void>,
    interval: number;
}


export type SchedulerOptions = {
    checkInterval: number;
}

export class Scheduler {
    jobs: JobSpec[] = [];
    persistence: Persistence;

    constructor(jobs: JobSpec[]) {
        this.jobs = jobs;
        this.persistence = new Persistence();
    }
    
}