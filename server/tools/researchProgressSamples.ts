import {
    ResearchProgressService,
    RESEARCH_TYPES_NOT_RANDOM,
} from "@solaris/common";
import type { ResearchTypeNotRandom } from "@solaris/common";

const service = new ResearchProgressService();

const EXPENSE_TIERS = [
    "cheap",
    "standard",
    "expensive",
    "veryExpensive",
    "crazyExpensive",
] as const;
type ExpenseTier = (typeof EXPENSE_TIERS)[number];

type ProgressionConfig =
    | { progression: "standard" }
    | { progression: "cumulative"; scalingFactor: number }
    | { progression: "exponential"; growthFactor: "soft" | "medium" | "hard" };

const PROGRESSIONS: ProgressionConfig[] = [
    { progression: "standard" },
    { progression: "cumulative", scalingFactor: 0.25 },
    { progression: "cumulative", scalingFactor: 0.5 },
    { progression: "cumulative", scalingFactor: 0.75 },
    { progression: "cumulative", scalingFactor: 1.0 },
    { progression: "exponential", growthFactor: "soft" },
    { progression: "exponential", growthFactor: "medium" },
    { progression: "exponential", growthFactor: "hard" },
];

const MIN_LEVEL = 1;
const MAX_LEVEL = 20;

// Minimal fake game object using schema defaults
const makeGame = (
    tech: ResearchTypeNotRandom,
    expenseTier: ExpenseTier,
    progression: ProgressionConfig,
) => ({
    constants: {
        research: {
            progressMultiplier: 50,
            exponentialGrowthFactors: {
                soft: 1.25,
                medium: 1.5,
                hard: 1.75,
            },
        },
        star: {
            infrastructureExpenseMultipliers: {
                cheap: 1,
                standard: 2,
                expensive: 4,
                veryExpensive: 8,
                crazyExpensive: 16,
            },
        },
    },
    settings: {
        technology: {
            researchCosts: Object.fromEntries(
                RESEARCH_TYPES_NOT_RANDOM.map((t) => [
                    t,
                    t === tech ? expenseTier : "standard",
                ]),
            ),
            researchCostProgressions: Object.fromEntries(
                RESEARCH_TYPES_NOT_RANDOM.map((t) => [
                    t,
                    t === tech ? progression : { progression: "standard" },
                ]),
            ),
        },
    },
});

const progressionLabel = (p: ProgressionConfig): string => p.progression;
const scalingFactorLabel = (p: ProgressionConfig): string =>
    p.progression === "cumulative" ? String(p.scalingFactor) : "";
const growthFactorLabel = (p: ProgressionConfig): string =>
    p.progression === "exponential" ? p.growthFactor : "";

// CSV header
console.log(
    "technologyKey,expenseCost,progression,scalingFactor,growthFactor,level,requiredProgress",
);

for (const tech of RESEARCH_TYPES_NOT_RANDOM) {
    for (const expenseTier of EXPENSE_TIERS) {
        for (const progression of PROGRESSIONS) {
            const game = makeGame(tech, expenseTier, progression) as any;
            for (let level = MIN_LEVEL; level <= MAX_LEVEL; level++) {
                const required = service.getRequiredResearchProgress(
                    game,
                    tech,
                    level,
                );
                console.log(
                    [
                        tech,
                        expenseTier,
                        progressionLabel(progression),
                        scalingFactorLabel(progression),
                        growthFactorLabel(progression),
                        level,
                        required,
                    ].join(","),
                );
            }
        }
    }
}
