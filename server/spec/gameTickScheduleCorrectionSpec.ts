import { DateTime } from "luxon";
import { applyTickScheduleCorrection } from "../services/gameTick";

const ONE_MINUTE_MS = 60000;

const utcDate = (iso: string) => DateTime.fromISO(iso, { zone: "utc" });

describe("applyTickScheduleCorrection", () => {
    const durationMs = ONE_MINUTE_MS; // 1 minute tick duration (e.g. real-time speed 60s)
    const capMs = 0.25 * durationMs; // maximum correction of 25% of the duration

    it("fully corrects when lateness is below the cap", () => {
        const lastTick = utcDate("2026-10-31T13:00:00Z");
        const now = utcDate("2026-10-31T13:01:10Z"); // tick ran 10s late

        const result = applyTickScheduleCorrection(lastTick, now, durationMs);

        // Anchor snapped back to the due timepoint of the previous tick.
        expect(result.toJSDate().getTime()).toBe(
            utcDate("2026-10-31T13:01:00Z").toJSDate().getTime(),
        );
    });

    it("caps the correction at 25% of the duration for fast games", () => {
        const lastTick = utcDate("2026-10-31T12:00:00Z");
        const now = utcDate("2026-10-31T13:10:00Z"); // tick ran 10 minutes late

        const result = applyTickScheduleCorrection(lastTick, now, durationMs);

        expect(result.toJSDate().getTime()).toBe(
            now.minus({ milliseconds: capMs }).toJSDate().getTime(),
        );
    });

    it("never shortens the next interval below 75% of the duration", () => {
        const lastTick = utcDate("2026-10-31T12:00:00Z");
        const now = utcDate("2026-10-31T18:00:00Z"); // extremely late

        const result = applyTickScheduleCorrection(lastTick, now, durationMs);
        const nextDue = result.plus({ milliseconds: durationMs });

        expect(nextDue.diff(now).milliseconds).toBe(
            durationMs - capMs, // 75% of the duration remains before the next tick is due
        );
    });

    it("does not correct an on-time tick", () => {
        const lastTick = utcDate("2026-10-31T12:00:00Z");
        const now = utcDate("2026-10-31T12:01:00Z"); // exactly one duration later

        const result = applyTickScheduleCorrection(lastTick, now, durationMs);

        expect(result.toJSDate().getTime()).toBe(now.toJSDate().getTime());
    });

    it("does not correct an early tick", () => {
        const lastTick = utcDate("2026-10-31T12:00:00Z");
        const now = utcDate("2026-10-31T12:00:30Z"); // forceTick / RTQ / all players ready

        const result = applyTickScheduleCorrection(lastTick, now, durationMs);

        expect(result.toJSDate().getTime()).toBe(now.toJSDate().getTime());
    });

    it("caps turn-based correction at 25% of the whole-run duration", () => {
        const lastTick = utcDate("2026-05-31T12:00:00Z");
        const durationMs = ONE_MINUTE_MS; // maxTurnWait 1 min
        const now = utcDate("2026-05-31T12:10:00Z"); // run 10 minutes late

        const result = applyTickScheduleCorrection(lastTick, now, durationMs);

        expect(result.toJSDate().getTime()).toBe(
            now
                .minus({ milliseconds: 0.25 * durationMs })
                .toJSDate()
                .getTime(),
        );
    });

    it("corrects the boundary case of lateness exactly equal to the cap", () => {
        const lastTick = utcDate("2026-10-31T12:00:00Z");
        const now = utcDate("2026-10-31T12:01:15Z"); // 15s late == cap

        const result = applyTickScheduleCorrection(lastTick, now, durationMs);

        expect(result.toJSDate().getTime()).toBe(
            utcDate("2026-10-31T12:01:00Z").toJSDate().getTime(),
        );
    });
});
