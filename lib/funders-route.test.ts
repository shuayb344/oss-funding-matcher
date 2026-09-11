import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFunders = [
  { id: 1, name: 'Funder A' },
  { id: 2, name: 'Funder B' },
];

describe('GET /api/funders route (end-to-end with mocked Supabase)', () => {
  beforeEach(() => {
    // Ensure module cache is cleared between tests when we re-mock
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns funders list when supabase returns data', async () => {
    // Mock the Supabase client used by the route
    vi.doMock('@/lib/db', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({ data: mockFunders, error: null }),
          }),
        }),
      },
    }));

    // Simplify NextResponse.json to return the payload directly
    vi.doMock('next/server', () => ({
      NextResponse: {
        json: (payload: any, init?: any) => ({ payload, status: init?.status ?? 200 }),
      },
    }));

    const { GET } = await import('../app/api/funders/route');
    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.payload).toHaveProperty('funders');
    expect(res.payload.funders).toEqual(mockFunders);
  });

  it('returns 500 when supabase returns an error', async () => {
    vi.doMock('@/lib/db', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({ data: null, error: { message: 'boom' } }),
          }),
        }),
      },
    }));

    vi.doMock('next/server', () => ({
      NextResponse: {
        json: (payload: any, init?: any) => ({ payload, status: init?.status ?? 200 }),
      },
    }));

    const { GET } = await import('../app/api/funders/route');
    const res = await GET();

    expect(res.status).toBe(500);
    expect(res.payload).toHaveProperty('error', 'Failed to load funders');
  });
});
