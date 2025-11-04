/**
 * Mock Drizzle Database for Unit Tests
 *
 * Drizzle uses a chained builder pattern:
 *   db.select().from(table).where(...).all()
 *   db.insert(table).values(...).run()
 *
 * This mock implements that chainable pattern so tests can use Drizzle syntax
 * without needing a real database.
 */

export const createMockDrizzle = () => {
  const mockAll = jest.fn().mockResolvedValue([]);
  const mockRun = jest.fn().mockResolvedValue(undefined);

  const mockWhere = jest.fn().mockReturnValue({
    all: mockAll,
    run: mockRun,
  });

  const mockFrom = jest.fn().mockReturnValue({
    where: mockWhere,
    all: mockAll,
    orderBy: jest.fn().mockReturnValue({
      all: mockAll,
    }),
  });

  const mockValues = jest.fn().mockReturnValue({
    run: mockRun,
  });

  const mockSet = jest.fn().mockReturnValue({
    where: mockWhere,
  });

  const mockDb = {
    select: jest.fn().mockReturnValue({
      from: mockFrom,
    }),
    insert: jest.fn().mockReturnValue({
      values: mockValues,
    }),
    update: jest.fn().mockReturnValue({
      set: mockSet,
    }),
    delete: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: mockWhere,
      }),
    }),
    // Expose inner mocks for assertions in tests
    _mocks: {
      all: mockAll,
      run: mockRun,
      where: mockWhere,
      from: mockFrom,
      values: mockValues,
      set: mockSet,
    },
  };

  return mockDb;
};

/**
 * Usage in tests:
 *
 * The db is already mocked in jest.setup.js, so you can use it directly:
 *
 * import { db } from '../../src/db';
 *
 * describe('LogService', () => {
 *   it('adds log', async () => {
 *     // Configure mock return values
 *     (db as any)._mocks.run.mockResolvedValueOnce({ id: '123' });
 *
 *     const result = await LogService.addLog(testLog);
 *     expect(result.id).toBe('123');
 *
 *     // Verify mock was called correctly
 *     expect(db.insert).toHaveBeenCalled();
 *   });
 * });
 */
