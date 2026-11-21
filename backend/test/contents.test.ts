import { describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers.js';

const { request, createClient, createContent } = setupTestApp();

const titles = (body: { data: { title: string }[] }) => body.data.map((c) => c.title).sort();

describe('contents', () => {
  it('creates content as draft with its client', async () => {
    const client = await createClient('Deniz Kahve');
    const { status, body } = await request('POST', '/api/contents', {
      clientId: client.id,
      title: 'Kış menüsü lansmanı',
      type: 'social_post',
      dueDate: '2030-01-15',
    });
    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      title: 'Kış menüsü lansmanı',
      status: 'draft',
      dueDate: '2030-01-15',
      isOverdue: false,
      client: { id: client.id, name: 'Deniz Kahve' },
    });
  });

  it('stores an optional http(s) link and clears it with null', async () => {
    const client = await createClient('Link Müşterisi');
    const invalid = await request('POST', '/api/contents', {
      clientId: client.id,
      title: 'Bağlantılı içerik',
      type: 'web_page',
      link: 'javascript:alert(1)',
    });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.details[0].field).toBe('link');

    const content = await createContent(client.id, { link: 'https://example.com/sayfa' });
    const list = await request('GET', `/api/contents?clientId=${client.id}`);
    expect(list.body.data[0].link).toBe('https://example.com/sayfa');

    const cleared = await request('PATCH', `/api/contents/${content.id}`, { link: null });
    expect(cleared.body.data.link).toBeNull();
  });

  it('requires an existing client', async () => {
    const missing = await request('POST', '/api/contents', { title: 'Başlık', type: 'blog_post' });
    expect(missing.status).toBe(400);

    const unknown = await request('POST', '/api/contents', {
      clientId: '00000000-0000-4000-8000-000000000000',
      title: 'Başlık',
      type: 'blog_post',
    });
    expect(unknown.status).toBe(400);
    expect(unknown.body.error.details).toEqual([{ field: 'clientId', message: 'Seçilen müşteri bulunamadı.' }]);
  });

  it('rejects invalid type, status and date', async () => {
    const client = await createClient('Atlas Mobilya');
    const { status, body } = await request('POST', '/api/contents', {
      clientId: client.id,
      title: 'Geçerli başlık',
      type: 'video',
      status: 'archived',
      dueDate: '2030-13-40',
    });
    expect(status).toBe(400);
    expect(body.error.details.map((d: { field: string }) => d.field).sort()).toEqual(['dueDate', 'status', 'type']);
  });

  it('updates the status through the status endpoint', async () => {
    const client = await createClient('Mavi Diş Kliniği');
    const content = await createContent(client.id);

    const { status, body } = await request('PATCH', `/api/contents/${content.id}/status`, { status: 'in_review' });
    expect(status).toBe(200);
    expect(body.data.status).toBe('in_review');

    expect((await request('PATCH', `/api/contents/${content.id}/status`, { status: 'done' })).status).toBe(400);
  });

  it('moves content to another client and keeps untouched fields', async () => {
    const first = await createClient('Birinci Müşteri');
    const second = await createClient('İkinci Müşteri');
    const content = await createContent(first.id, { body: 'Brif metni' });

    const { body } = await request('PATCH', `/api/contents/${content.id}`, { clientId: second.id });
    expect(body.data).toMatchObject({ client: { id: second.id }, body: 'Brif metni', title: 'Örnek içerik' });
  });

  it('filters by status, client, type and title and reports status counts', async () => {
    const a = await createClient('Müşteri A');
    const b = await createClient('Müşteri B');
    await createContent(a.id, { title: 'Kampanya görseli', type: 'social_post', status: 'draft' });
    await createContent(a.id, { title: 'Blog yazısı', type: 'blog_post', status: 'published' });
    await createContent(a.id, { title: 'Yeni kampanya sayfası', type: 'web_page', status: 'in_review' });
    await createContent(b.id, { title: 'Hukuk bülteni', type: 'blog_post', status: 'published' });

    const byStatus = await request('GET', '/api/contents?status=published');
    expect(titles(byStatus.body)).toEqual(['Blog yazısı', 'Hukuk bülteni']);

    const byClient = await request('GET', `/api/contents?clientId=${a.id}`);
    expect(byClient.body.meta).toEqual({ total: 3, statusCounts: { draft: 1, in_review: 1, published: 1 } });

    const combined = await request('GET', `/api/contents?clientId=${a.id}&type=blog_post&status=published`);
    expect(titles(combined.body)).toEqual(['Blog yazısı']);

    const search = await request('GET', `/api/contents?q=${encodeURIComponent('KAMPANYA')}`);
    expect(titles(search.body)).toEqual(['Kampanya görseli', 'Yeni kampanya sayfası']);

    const wildcard = await request('GET', '/api/contents?q=%25');
    expect(wildcard.body.data).toEqual([]);
  });

  it('paginates with the total of the filtered result', async () => {
    const client = await createClient('Sayfalı Müşteri');
    for (let index = 1; index <= 5; index++) {
      await createContent(client.id, { title: `İçerik ${index}`, status: index <= 3 ? 'draft' : 'published' });
    }

    const first = await request('GET', '/api/contents?sort=title&page=1&pageSize=2');
    expect(first.body.data.map((c: { title: string }) => c.title)).toEqual(['İçerik 1', 'İçerik 2']);
    expect(first.body.meta).toMatchObject({ total: 5, page: 1, pageSize: 2 });

    const last = await request('GET', '/api/contents?sort=title&page=3&pageSize=2');
    expect(last.body.data.map((c: { title: string }) => c.title)).toEqual(['İçerik 5']);

    const drafts = await request('GET', '/api/contents?status=draft&page=1&pageSize=2');
    expect(drafts.body.meta.total).toBe(3);
    expect(drafts.body.data).toHaveLength(2);

    expect((await request('GET', '/api/contents?page=0')).status).toBe(400);
    expect((await request('GET', '/api/contents?page=1&pageSize=500')).status).toBe(400);
  });

  it('rejects unknown filter values', async () => {
    expect((await request('GET', '/api/contents?status=done')).status).toBe(400);
    expect((await request('GET', '/api/contents?clientId=abc')).status).toBe(400);
    expect((await request('GET', '/api/contents?sort=random')).status).toBe(400);
  });

  it('flags unpublished content with a past due date as overdue', async () => {
    const client = await createClient('Kuzey Otomotiv');
    await createContent(client.id, { title: 'Geciken içerik', status: 'in_review', dueDate: '2020-01-01' });
    await createContent(client.id, { title: 'Yayındaki eski içerik', status: 'published', dueDate: '2020-01-01' });

    const { body } = await request('GET', '/api/contents');
    const overdue = body.data.filter((c: { isOverdue: boolean }) => c.isOverdue).map((c: { title: string }) => c.title);
    expect(overdue).toEqual(['Geciken içerik']);
  });

  it('deletes content', async () => {
    const client = await createClient('Pera Hukuk');
    const content = await createContent(client.id);
    expect((await request('DELETE', `/api/contents/${content.id}`)).status).toBe(204);
    expect((await request('GET', `/api/contents/${content.id}`)).status).toBe(404);
  });
});
