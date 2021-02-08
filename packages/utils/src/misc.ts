export const def = <T>(x: T): x is NonNullable<T> => x !== undefined;
