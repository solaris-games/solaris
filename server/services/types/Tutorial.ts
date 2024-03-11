export type TutorialLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Tutorial {
    id: number;
    key: string;
    file: string;
    name: string;
    description: string;
    level: TutorialLevel;
    completed?: boolean;
};
