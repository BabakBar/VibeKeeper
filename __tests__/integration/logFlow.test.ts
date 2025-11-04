/**
 * Integration tests for Log Flow
 *
 * Tests database schema & Drizzle ORM operations (direct SQLite layer).
 *
 * For service-level integration tests, see services.test.ts
 *
 * See INTEGRATION_TESTING.md for detailed pattern explanation.
 */

import { createTestDb } from '../helpers/testDb';
import { createMockLog, createMockLogs } from '../helpers/mockData';
import { cigaretteLogs, settings } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Integration: Database & Schema', () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeAll(() => {
    testDb = createTestDb();
  });

  beforeEach(async () => {
    testDb.sqlite.exec('DELETE FROM cigarette_logs');
  });

  afterAll(() => {
    testDb.sqlite.close();
  });

  describe('Database operations', () => {
    it('inserts log and queries it back', () => {
      const log = createMockLog({ notes: 'Test log' });

      testDb.db.insert(cigaretteLogs).values({
        id: log.id,
        timestamp: log.timestamp,
        notes: log.notes || null,
        time: log.time || null,
        created_at: log.createdAt,
        updated_at: log.updatedAt,
      }).run();

      const persisted = testDb.db
        .select()
        .from(cigaretteLogs)
        .where(eq(cigaretteLogs.id, log.id))
        .all();

      expect(persisted).toHaveLength(1);
      expect(persisted[0].notes).toBe('Test log');
    });

    it('inserts multiple logs', () => {
      const logs = createMockLogs(3);

      logs.forEach(log => {
        testDb.db.insert(cigaretteLogs).values({
          id: log.id,
          timestamp: log.timestamp,
          notes: log.notes || null,
          time: log.time || null,
          created_at: log.createdAt,
          updated_at: log.updatedAt,
        }).run();
      });

      const all = testDb.db.select().from(cigaretteLogs).all();
      expect(all).toHaveLength(3);
    });

    it('updates log in database', () => {
      const log = createMockLog({ notes: 'Original' });

      testDb.db.insert(cigaretteLogs).values({
        id: log.id,
        timestamp: log.timestamp,
        notes: log.notes || null,
        time: log.time || null,
        created_at: log.createdAt,
        updated_at: log.updatedAt,
      }).run();

      testDb.db
        .update(cigaretteLogs)
        .set({ notes: 'Updated' })
        .where(eq(cigaretteLogs.id, log.id));

      const updated = testDb.db
        .select()
        .from(cigaretteLogs)
        .where(eq(cigaretteLogs.id, log.id))
        .all();

      expect(updated[0].notes).toBe('Updated');
    });

    it('deletes log from database', () => {
      const log = createMockLog();

      testDb.db.insert(cigaretteLogs).values({
        id: log.id,
        timestamp: log.timestamp,
        notes: log.notes || null,
        time: log.time || null,
        created_at: log.createdAt,
        updated_at: log.updatedAt,
      }).run();

      testDb.db
        .delete(cigaretteLogs)
        .where(eq(cigaretteLogs.id, log.id))
        .run();

      const deleted = testDb.db
        .select()
        .from(cigaretteLogs)
        .where(eq(cigaretteLogs.id, log.id))
        .all();

      expect(deleted).toHaveLength(0);
    });

    it('queries logs by timestamp range', () => {
      const now = Date.now();
      const log1 = createMockLog({ timestamp: now - 86400000 }); // 1 day ago
      const log2 = createMockLog({ timestamp: now });
      const log3 = createMockLog({ timestamp: now + 86400000 }); // 1 day from now

      [log1, log2, log3].forEach(log => {
        testDb.db.insert(cigaretteLogs).values({
          id: log.id,
          timestamp: log.timestamp,
          notes: log.notes || null,
          time: log.time || null,
          created_at: log.createdAt,
          updated_at: log.updatedAt,
        }).run();
      });

      // Query logs from 24 hours ago to now
      const logs = testDb.db
        .select()
        .from(cigaretteLogs)
        .all()
        .filter(l => l.timestamp >= now - 86400000 && l.timestamp <= now);

      expect(logs).toHaveLength(2);
    });
  });

  describe('Schema validation', () => {
    it('cigarette_logs table exists and has correct columns', () => {
      const log = createMockLog();

      // Should not throw if schema is correct
      expect(() => {
        testDb.db.insert(cigaretteLogs).values({
          id: log.id,
          timestamp: log.timestamp,
          notes: null,
          time: null,
          created_at: log.createdAt,
          updated_at: log.updatedAt,
        }).run();
      }).not.toThrow();
    });

    it('preserves null values in optional fields', () => {
      const log = createMockLog({ notes: undefined, time: undefined });

      testDb.db.insert(cigaretteLogs).values({
        id: log.id,
        timestamp: log.timestamp,
        notes: null,
        time: null,
        created_at: log.createdAt,
        updated_at: log.updatedAt,
      }).run();

      const persisted = testDb.db
        .select()
        .from(cigaretteLogs)
        .where(eq(cigaretteLogs.id, log.id))
        .all();

      expect(persisted[0].notes).toBeNull();
      expect(persisted[0].time).toBeNull();
    });
  });
});

