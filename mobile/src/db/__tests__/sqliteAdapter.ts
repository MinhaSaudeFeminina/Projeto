import { DatabaseSync } from 'node:sqlite';

/**
 * The slice of `expo-sqlite`'s `SQLiteDatabase` that this app uses, backed by
 * Node's built-in SQLite. It lets the schema and every query string run against
 * a real engine in tests: `expo-sqlite` itself is a native module, and its
 * Node build is a no-op stub.
 */
export function createTestDatabase() {
  const db = new DatabaseSync(':memory:');

  const bind = (params: unknown[]) =>
    params.length === 1 && isNamedParams(params[0])
      ? [stripDollars(params[0] as Record<string, unknown>)]
      : params;

  const database = {
    async execAsync(sql: string) {
      db.exec(sql);
    },
    async getAllAsync<T>(sql: string, ...params: unknown[]) {
      return db.prepare(sql).all(...(bind(params) as never[])) as T[];
    },
    async getFirstAsync<T>(sql: string, ...params: unknown[]) {
      return (db.prepare(sql).get(...(bind(params) as never[])) ?? null) as T | null;
    },
    async prepareAsync(sql: string) {
      const statement = db.prepare(sql);

      return {
        async executeAsync(params: Record<string, unknown>) {
          statement.run(stripDollars(params) as never);
        },
        async finalizeAsync() {},
      };
    },
    async runAsync(sql: string, ...params: unknown[]) {
      const result = db.prepare(sql).run(...(bind(params) as never[]));

      return {
        changes: Number(result.changes),
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    // expo-sqlite does not implement `withExclusiveTransactionAsync` on web, so
    // neither does this double: reintroducing it would break the browser.
    async withTransactionAsync(operation: () => Promise<void>) {
      db.exec('BEGIN');

      try {
        await operation();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return database;
}

function isNamedParams(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => key.startsWith('$'))
  );
}

function stripDollars(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key.replace(/^\$/, ''), value]),
  );
}
