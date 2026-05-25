interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success?: boolean;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T extends unknown[]>(statements: T): Promise<unknown[]>;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
  };
}
