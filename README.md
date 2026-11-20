# Client & Content Tracking Panel

Ajans hesap yöneticileri için müşteri ve içerik takip paneli. Müşteriler yönetilir; sosyal medya gönderisi, blog yazısı, web sayfası gibi içerikler bir müşteriye bağlı olarak takip edilir ve **Taslak → Onayda → Yayında** durumları arasında ilerletilir. Ana ekran genel durumu özetler.

Repo, her biri kendi kurulumuna, dokümantasyonuna ve yayın ortamına sahip iki bağımsız uygulamadan oluşur.

| Uygulama | Açıklama | Doküman |
|---|---|---|
| [`backend/`](backend) | REST API — Fastify, TypeScript, Kysely, PostgreSQL, Docker | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend) | Web uygulaması — Next.js, TypeScript, Tailwind CSS | [frontend/README.md](frontend/README.md) |
