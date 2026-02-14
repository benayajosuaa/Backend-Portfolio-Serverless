# Portfolio Backend - Serverless

Backend API serverless untuk portfolio menggunakan Vercel Functions, Prisma, dan Supabase.

## 🚀 Tech Stack

- **Runtime**: Vercel Serverless Functions
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Storage**: Supabase Storage
- **Language**: TypeScript

## 📁 Struktur Folder

```
my-app/
├── api/                    # Vercel Serverless Functions
│   ├── index.ts           # Root endpoint
│   ├── auth/
│   │   └── [action].ts    # /api/auth/login, /api/auth/register
│   ├── journeys/
│   │   ├── index.ts       # GET, POST /api/journeys
│   │   └── [id].ts        # GET, PUT, DELETE /api/journeys/:id
│   ├── works/
│   │   ├── index.ts       # GET, POST /api/works
│   │   └── [id].ts        # GET, PUT, DELETE /api/works/:id
│   └── contact/
│       ├── index.ts       # GET, POST /api/contact
│       ├── [id].ts        # GET, DELETE /api/contact/:id
│       └── [id]/
│           ├── reply.ts   # POST /api/contact/:id/reply
│           └── status.ts  # PUT /api/contact/:id/status
├── lib/                    # Shared utilities
│   ├── auth.ts            # JWT authentication
│   ├── cors.ts            # CORS handling
│   ├── mailer.ts          # Email service
│   ├── parseFormData.ts   # Form data parser
│   ├── prisma.ts          # Prisma client
│   └── supabase.ts        # Supabase client & storage
├── services/               # Business logic
│   ├── auth.services.ts
│   ├── contact.services.ts
│   ├── journey.services.ts
│   └── work.services.ts
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── vercel.json            # Vercel configuration
├── package.json
└── tsconfig.json
```

## 🔧 Setup

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan isi dengan nilai yang sesuai:

```bash
cp .env.example .env
```

**Environment Variables:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase connection string (with pgbouncer) |
| `DIRECT_URL` | Supabase direct connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret key untuk JWT tokens |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password/app password |

### 3. Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Buat Storage Buckets:
   - `journeys` - untuk gambar journey
   - `works` - untuk gambar works
3. Set bucket policies ke public read

### 4. Setup Database

```bash
# Generate Prisma Client
npm run build

# Push schema ke database
npm run db:push

# Atau run migrations
npm run db:migrate
```

### 5. Enable RLS (Row Level Security)

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Lihat file: prisma/migrations/20260211000000_enable_rls/migration.sql
```

## 🏃 Development

```bash
# Run locally dengan Vercel CLI
vercel dev
```

Server akan berjalan di `http://localhost:3000`

## 🚀 Deployment

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### Environment Variables di Vercel

Tambahkan semua environment variables di Vercel Dashboard:
Project Settings → Environment Variables

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/register` | Register user | Public |

### Journeys

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/journeys` | Get all journeys | Public |
| GET | `/api/journeys/:id` | Get journey by ID | Public |
| POST | `/api/journeys` | Create journey | Admin |
| PUT | `/api/journeys/:id` | Update journey | Admin |
| DELETE | `/api/journeys/:id` | Delete journey | Admin |

### Works

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/works` | Get all works | Public |
| GET | `/api/works/:id` | Get work by ID | Public |
| POST | `/api/works` | Create work | Admin |
| PUT | `/api/works/:id` | Update work | Admin |
| DELETE | `/api/works/:id` | Delete work | Admin |

### Contact Messages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/contact` | Send contact message | Public |
| GET | `/api/contact` | Get all messages | Admin |
| GET | `/api/contact/:id` | Get message by ID | Admin |
| DELETE | `/api/contact/:id` | Delete message | Admin |
| POST | `/api/contact/:id/reply` | Reply to message | Admin |
| PUT | `/api/contact/:id/status` | Update message status | Admin |

## 🔒 Authentication

Gunakan Bearer Token di header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request Examples

### Login
```bash
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

### Create Journey (with image)
```bash
curl -X POST https://your-domain.vercel.app/api/journeys \
  -H "Authorization: Bearer <token>" \
  -F "title=My Journey" \
  -F "type=Education" \
  -F "excerpt=This is my journey" \
  -F "year=2024" \
  -F "order_index=1" \
  -F "cover_image=@/path/to/image.jpg"
```

## 🛡️ Security Notes

- RLS (Row Level Security) enabled di semua tabel Supabase
- JWT token expire dalam 1 hari
- Passwords di-hash menggunakan bcrypt
- CORS configured untuk frontend domain
- Service Role Key hanya digunakan di backend

---

## ⚠️ Penting: CORS & OPTIONS di Vercel Serverless

Agar API backend ini **selalu kompatibel dengan frontend** (terutama di Vercel), setiap handler di `/api` WAJIB:

1. **Memanggil middleware CORS** (`cors(req, res)`) di bagian paling atas handler.
2. **Menangani method `OPTIONS` secara eksplisit**:
   ```ts
   if (req.method === "OPTIONS") return res.status(200).end();
   ```
   Ini WAJIB, karena Vercel/Next.js TIDAK otomatis handle preflight CORS. Jika tidak, request dari frontend bisa error CORS/404/500!
3. **JANGAN gunakan fallback handler catchall** (`[...catchall].ts`) untuk CORS kecuali sangat paham routing Vercel.

Cek juga file `/lib/cors.ts` untuk daftar domain frontend yang diizinkan. Tambahkan domain baru jika perlu.

---
