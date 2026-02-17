/**
 * Core type definitions shared across the application
 */

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ReadonlyRecord<K extends string | number | symbol, V> = {
  readonly [P in K]: V;
};

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Rectangle extends Position, Size {}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
