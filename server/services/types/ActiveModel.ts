interface ActiveRecord {
    save(): Promise<void>;
    markModified(path: string): void;
}

export type ActiveModel<T> = T & ActiveRecord;
