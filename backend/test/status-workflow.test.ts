import { describe, expect, it } from 'vitest';
import { setupTestApp, TEST_USER } from './helpers.js';

const { request, createClient, createContent } = setupTestApp();

describe('status workflow', () => {
  it('only creates content as draft or in review', async () => {
    const client = await createClient('Akış Müşterisi');
    const { status, body } = await request('POST', '/api/contents', {
      clientId: client.id,
      title: 'Doğrudan yayın',
      type: 'blog_post',
      status: 'published',
    });
    expect(status).toBe(400);
    expect(body.error.details[0].field).toBe('status');
  });

  it('allows draft → in review → published and rejects skipping review', async () => {
    const client = await createClient('Akış Müşterisi');
    const content = await createContent(client.id);

    const skip = await request('PATCH', `/api/contents/${content.id}/status`, { status: 'published' });
    expect(skip.status).toBe(409);
    expect(skip.body.error.code).toBe('INVALID_TRANSITION');

    expect((await request('PATCH', `/api/contents/${content.id}/status`, { status: 'in_review' })).status).toBe(200);
    expect((await request('PATCH', `/api/contents/${content.id}/status`, { status: 'draft' })).status).toBe(200);
    expect((await request('PATCH', `/api/contents/${content.id}`, { status: 'in_review' })).status).toBe(200);
    expect((await request('PATCH', `/api/contents/${content.id}/status`, { status: 'published' })).status).toBe(200);
  });

  it('locks published content until it is unpublished', async () => {
    const client = await createClient('Akış Müşterisi');
    const content = await createContent(client.id, { status: 'published' });

    const edit = await request('PATCH', `/api/contents/${content.id}`, { title: 'Yeni başlık' });
    expect(edit.status).toBe(409);
    expect(edit.body.error.code).toBe('CONTENT_LOCKED');
    expect((await request('PATCH', `/api/contents/${content.id}/status`, { status: 'draft' })).status).toBe(409);
    expect((await request('DELETE', `/api/contents/${content.id}`)).status).toBe(409);

    const unpublished = await request('POST', `/api/contents/${content.id}/unpublish`);
    expect(unpublished.body.data.status).toBe('draft');
    expect((await request('PATCH', `/api/contents/${content.id}`, { title: 'Yeni başlık' })).status).toBe(200);
    expect((await request('POST', `/api/contents/${content.id}/unpublish`)).status).toBe(409);
  });

  it('records every status change with the acting user, newest first', async () => {
    const client = await createClient('Akış Müşterisi');
    const content = await createContent(client.id, { status: 'published' });
    await request('POST', `/api/contents/${content.id}/unpublish`);

    const { body } = await request('GET', `/api/contents/${content.id}/history`);
    const steps = body.data.map((e: { fromStatus: string | null; toStatus: string }) => `${e.fromStatus}→${e.toStatus}`);
    expect(steps).toEqual(['published→draft', 'in_review→published', 'null→in_review']);
    expect(body.data[0].user.name).toBe(TEST_USER.name);
  });

  it('does not record an event when the status does not change', async () => {
    const client = await createClient('Akış Müşterisi');
    const content = await createContent(client.id);
    await request('PATCH', `/api/contents/${content.id}`, { title: 'Sadece başlık', status: 'draft' });
    await request('PATCH', `/api/contents/${content.id}/status`, { status: 'draft' });

    const { body } = await request('GET', `/api/contents/${content.id}/history`);
    expect(body.data).toHaveLength(1);
  });

  it('lists activity with client and status filters and pagination', async () => {
    const a = await createClient('Müşteri A');
    const b = await createClient('Müşteri B');
    await createContent(a.id, { status: 'published' });
    await createContent(b.id);

    const all = await request('GET', '/api/activity?page=1&pageSize=2');
    expect(all.body.meta).toEqual({ total: 3, page: 1, pageSize: 2 });
    expect(all.body.data).toHaveLength(2);

    const forA = await request('GET', `/api/activity?clientId=${a.id}`);
    expect(forA.body.meta.total).toBe(2);
    expect(forA.body.data.every((e: { client: { id: string } }) => e.client.id === a.id)).toBe(true);

    const published = await request('GET', '/api/activity?status=published');
    expect(published.body.data.map((e: { client: { name: string } }) => e.client.name)).toEqual(['Müşteri A']);

    expect((await request('GET', '/api/activity?status=done')).status).toBe(400);
  });

  it('searches activity by content title with Turkish casing', async () => {
    const client = await createClient('Arama Müşterisi');
    await createContent(client.id, { title: 'İstanbul Işık Festivali', status: 'published' });
    await createContent(client.id, { title: 'Kış menüsü' });
    await createContent(client.id, { title: '%100 indirim' });

    const festival = await request('GET', `/api/activity?q=${encodeURIComponent('istanbul ışık')}`);
    expect(festival.body.meta.total).toBe(2);
    expect(festival.body.data.every((e: { content: { title: string } }) => e.content.title === 'İstanbul Işık Festivali')).toBe(true);

    const combined = await request('GET', `/api/activity?q=${encodeURIComponent('FESTİVAL')}&status=published`);
    expect(combined.body.meta.total).toBe(1);

    const literal = await request('GET', `/api/activity?q=${encodeURIComponent('%')}`);
    expect(literal.body.data.map((e: { content: { title: string } }) => e.content.title)).toEqual(['%100 indirim']);

    expect((await request('GET', `/api/activity?q=${'a'.repeat(101)}`)).status).toBe(400);
  });
});
