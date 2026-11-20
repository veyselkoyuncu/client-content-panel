import { describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers.js';

const { request, createClient, createContent } = setupTestApp();

describe('dashboard summary', () => {
  it('returns zeros for an empty database', async () => {
    const { status, body } = await request('GET', '/api/dashboard/summary');
    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      totalClients: 0,
      totalContents: 0,
      contentsByStatus: { draft: 0, in_review: 0, published: 0 },
      overdueCount: 0,
      attention: [],
    });
  });

  it('counts contents per status and keeps the total consistent', async () => {
    const a = await createClient('Müşteri A');
    const b = await createClient('Müşteri B');
    await createClient('Müşteri C');
    await createContent(a.id, { status: 'draft' });
    await createContent(a.id, { status: 'draft' });
    await createContent(b.id, { status: 'in_review', dueDate: '2020-01-01' });
    const published = await createContent(b.id, { status: 'published' });

    const { body } = await request('GET', '/api/dashboard/summary');
    const { totalClients, totalContents, contentsByStatus, overdueCount } = body.data;
    expect({ totalClients, totalContents, contentsByStatus, overdueCount }).toEqual({
      totalClients: 3,
      totalContents: 4,
      contentsByStatus: { draft: 2, in_review: 1, published: 1 },
      overdueCount: 1,
    });

    await request('PATCH', `/api/contents/${published.id}/status`, { status: 'draft' });
    const after = (await request('GET', '/api/dashboard/summary')).body.data;
    expect(after.contentsByStatus).toEqual({ draft: 3, in_review: 1, published: 0 });
    expect(after.totalContents).toBe(4);
  });

  it('returns at most two latest items per status and overdue items needing attention', async () => {
    const client = await createClient('Müşteri');
    for (const title of ['Taslak 1', 'Taslak 2', 'Taslak 3']) {
      await createContent(client.id, { title, status: 'draft' });
    }
    await createContent(client.id, { title: 'Geciken', status: 'in_review', dueDate: '2020-01-01' });
    await createContent(client.id, { title: 'Uzak tarih', status: 'draft', dueDate: '2099-01-01' });

    const { body } = await request('GET', '/api/dashboard/summary');
    expect(body.data.latestByStatus.draft).toHaveLength(2);
    expect(body.data.latestByStatus.in_review.map((c: { title: string }) => c.title)).toEqual(['Geciken']);
    expect(body.data.attention.map((c: { title: string }) => c.title)).toEqual(['Geciken']);
  });
});
