import { describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers.js';

const { request, createClient, createContent } = setupTestApp();

describe('clients', () => {
  it('creates a client with trimmed values and empty optional fields as null', async () => {
    const { status, body } = await request('POST', '/api/clients', {
      name: '  Deniz Kahve  ',
      email: '',
      industry: 'Yiyecek & İçecek',
    });
    expect(status).toBe(201);
    expect(body.data).toMatchObject({ name: 'Deniz Kahve', email: null, industry: 'Yiyecek & İçecek', contentCount: 0 });
  });

  it('returns field errors for invalid input', async () => {
    const { status, body } = await request('POST', '/api/clients', {
      name: 'A',
      email: 'not-an-email',
      website: 'ftp://example.com',
    });
    expect(status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.map((d: { field: string }) => d.field).sort()).toEqual(['email', 'name', 'website']);
  });

  it('rejects duplicate names using Turkish casing rules', async () => {
    await createClient('Acme Gıda');
    const { status, body } = await request('POST', '/api/clients', { name: 'ACME GIDA' });
    expect(status).toBe(409);
    expect(body.error.code).toBe('CLIENT_NAME_TAKEN');
  });

  it('lists clients in Turkish order with per-status content counts', async () => {
    const zeta = await createClient('Zeta Hukuk');
    await createClient('Çınar Yapı');
    await createClient('Atlas Mobilya');
    await createContent(zeta.id, { status: 'draft' });
    await createContent(zeta.id, { status: 'published' });

    const { body } = await request('GET', '/api/clients');
    expect(body.data.map((c: { name: string }) => c.name)).toEqual(['Atlas Mobilya', 'Çınar Yapı', 'Zeta Hukuk']);
    expect(body.data[2]).toMatchObject({ contentCount: 2, draftCount: 1, inReviewCount: 0, publishedCount: 1 });
  });

  it('searches by name case-insensitively', async () => {
    await createClient('Lina Kozmetik');
    await createClient('Pera Hukuk');
    const { body } = await request('GET', `/api/clients?q=${encodeURIComponent('KOZMETİK')}`);
    expect(body.data.map((c: { name: string }) => c.name)).toEqual(['Lina Kozmetik']);
  });

  it('updates only the given fields', async () => {
    const client = await createClient('Kuzey Otomotiv', { industry: 'Otomotiv' });
    const { status, body } = await request('PATCH', `/api/clients/${client.id}`, { contactName: 'Burak Şahin' });
    expect(status).toBe(200);
    expect(body.data).toMatchObject({ name: 'Kuzey Otomotiv', industry: 'Otomotiv', contactName: 'Burak Şahin' });
  });

  it('returns 404 for unknown or malformed ids', async () => {
    expect((await request('GET', '/api/clients/00000000-0000-4000-8000-000000000000')).status).toBe(404);
    expect((await request('GET', '/api/clients/not-a-uuid')).status).toBe(404);
  });

  it('deletes a client only when it has no content', async () => {
    const empty = await createClient('Boş Müşteri');
    const busy = await createClient('Dolu Müşteri');
    await createContent(busy.id);

    expect((await request('DELETE', `/api/clients/${empty.id}`)).status).toBe(204);

    const { status, body } = await request('DELETE', `/api/clients/${busy.id}`);
    expect(status).toBe(409);
    expect(body.error.code).toBe('CLIENT_HAS_CONTENTS');
    expect((await request('GET', `/api/clients/${busy.id}`)).status).toBe(200);
  });
});
