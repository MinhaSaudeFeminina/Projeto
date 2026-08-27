import { Platform } from 'react-native';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import {
  DatabaseUnavailableError,
  needsReload,
  type DatabaseFailureReason,
} from './errors';
import { migrate } from './migrations';

const databaseName = 'minhasaude.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

/**
 * The one connection the app uses. `openDatabaseAsync` caches by name, so a
 * module re-evaluated by Fast Refresh gets the same underlying handle back.
 *
 * A provider (`SQLiteProvider` + `useSQLiteContext`) would put the handle in
 * React context, and services are plain functions that cannot read it - every
 * service would have to take a `db` argument passed down from a screen, which
 * is the pages-doing-I/O boundary this app deliberately avoids.
 */
export function getDatabase(): Promise<SQLiteDatabase> {
  databasePromise ??= open().catch((error: unknown) => {
    // A transient failure must not stay cached, or one bad moment would keep
    // the cycle broken until the app is killed. The failures that only a reload
    // can clear are kept, so every screen does not retry an open that cannot
    // succeed.
    const permanent =
      error instanceof DatabaseUnavailableError && needsReload(error.reason);

    if (!permanent) {
      databasePromise = null;
    }

    throw error;
  });

  return databasePromise;
}

async function open() {
  assertWebIsSupported();

  let db: SQLiteDatabase;

  try {
    db = await openDatabaseAsync(databaseName);

    // Both pragmas are per-connection and are ignored inside a transaction, so
    // they run on every open, before the migration.
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
  } catch (error) {
    throw new DatabaseUnavailableError(classifyOpenFailure(error), error);
  }

  await migrate(db);

  return db;
}

/**
 * On web the database file is held through an OPFS sync access handle, and the
 * browser allows exactly one per file. A second tab on the same origin cannot
 * open it, and once its worker has failed the VFS stays unusable - closing the
 * other tab is not enough, the page has to be reloaded.
 */
function classifyOpenFailure(error: unknown): DatabaseFailureReason {
  const message = error instanceof Error ? error.message : String(error);
  const isLocked =
    message.includes('NoModificationAllowedError') ||
    message.includes('Invalid VFS state');

  return isLocked ? 'lockedByAnotherTab' : 'unavailable';
}

/**
 * On web, expo-sqlite runs wa-sqlite in a worker and talks to it through
 * `SharedArrayBuffer`, which browsers only expose to a cross-origin-isolated
 * document. There is no fallback, so this is checked up front to fail with
 * something readable instead of a `SharedArrayBuffer is not defined`.
 *
 * `metro.config.js` sets the COOP/COEP headers, but the Expo dev server
 * answers the HTML document from its own middleware stack before Metro's, so
 * `expo start --web` is not isolated. An exported build served with those
 * headers is.
 */
function assertWebIsSupported() {
  if (Platform.OS !== 'web') {
    return;
  }

  const isolated = (globalThis as { crossOriginIsolated?: boolean })
    .crossOriginIsolated;

  if (!isolated || typeof SharedArrayBuffer === 'undefined') {
    throw new DatabaseUnavailableError('notIsolated');
  }
}
