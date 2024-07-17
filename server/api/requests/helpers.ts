export const keyExists = (obj: any, key: string) => {
    return obj[key] != null;
};

export const keyHasStringValue = (obj: any, key: string, minLength: number = 1, maxLength: number | null = null) => {
    const value = obj[key];

    return value != null && (typeof value === 'string' || value instanceof String) && value.length >= minLength && (maxLength == null || value.length <= maxLength);
};

export const keyHasNumberValue = (obj: any, key: string) => {
    const value = obj[key];

    return value != null && !isNaN(value as any) && !isNaN(parseFloat(value.toString()));
};

export const keyHasBooleanValue = (obj: any, key: string) => {
    const value = obj[key];

    return value != null && typeof(value) === 'boolean';
};

export const keyHasObjectValue = (obj: any, key: string) => {
    const value = obj[key];

    return value != null && typeof(value) === 'object' && !Array.isArray(value);
};

export const keyHasArrayValue = (obj: any, key: string) => {
    const value = obj[key];

    return value != null && Array.isArray(value);
};
