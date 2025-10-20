# Addendum — Vue Email Editor Integration (Unlayer)

## Highest-Impact Additions

### 1) Tenancy & Sharing
- Add multi-tenant scope and collaboration.
- **Tables**
  - `organizations(id, name, created_at, updated_at)`
  - `org_members(org_id, user_id, role ['owner','admin','member'])`
  - `template_collaborators(template_id, user_id, permission ['owner','editor','viewer'])`
- Add `org_id` to: `users`, `templates`, `media_assets`, `merge_tags`, `user_blocks`, and (optionally) `design_tags`.

### 2) Editor Event Plumbing
- Listen for `design:updated` (dirty state) → throttled autosave.
- Register merge tags on load and persist last-used set per org/user.
- Override media selection to route through your File Manager (custom picker → returns URL to Unlayer).

### 3) Style-Guide Guardrails
- Central JSON of brand tokens (colors, fonts, radii, spacing).
- Pre-publish/export **linter**:
  - Reject/warn on non-approved fonts/colors/line-heights.
  - Enforce alt text and basic contrast checks.
- Optionally lock disallowed tools/colors in Unlayer options.

### 4) Export Fidelity & Deliverability
- Cache multiple export variants.
- Inline CSS, absolutize URLs, sanitize/minify.
- Store compatibility results (e.g., rules run) alongside exports.

### 5) File Manager Hardening
- Signed uploads + **AV scan** (async).
- Thumbnails and responsive sizes on upload.
- Quotas, folder permissions, and retention policies.

---

## Database Schema — Deltas (SQL Sketch)

```sql
-- Tenancy
CREATE TABLE organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ADD COLUMN org_id uuid REFERENCES organizations(id);
CREATE INDEX ON users(org_id);

CREATE TABLE org_members (
  org_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES users(id),
  role text CHECK (role IN ('owner','admin','member')) NOT NULL,
  PRIMARY KEY (org_id, user_id)
);

-- Collaboration
CREATE TABLE template_collaborators (
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  permission text CHECK (permission IN ('owner','editor','viewer')) NOT NULL,
  PRIMARY KEY (template_id, user_id)
);

-- Scope existing tables
ALTER TABLE templates ADD COLUMN org_id uuid REFERENCES organizations(id);
ALTER TABLE media_assets ADD COLUMN org_id uuid REFERENCES organizations(id);
ALTER TABLE merge_tags ADD COLUMN org_id uuid REFERENCES organizations(id);

-- Merge tag uniqueness per org
CREATE UNIQUE INDEX merge_tags_org_key_key ON merge_tags(org_id, key);

-- Exports cache
CREATE TABLE exports (
  id uuid PRIMARY KEY,
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE,
  version int NOT NULL,
  type text CHECK (type IN ('html_inlined','raw','txt')) NOT NULL,
  html text,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON exports(template_id, version, type);

-- Jobs (AV scan, thumbnails, heavy exports)
CREATE TABLE jobs (
  id uuid PRIMARY KEY,
  type text NOT NULL,
  payload jsonb NOT NULL,
  status text CHECK (status IN ('queued','running','succeeded','failed')) DEFAULT 'queued',
  attempts int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Media robustness
ALTER TABLE media_assets
  ADD COLUMN storage_key text,
  ADD COLUMN checksum text,
  ADD COLUMN status text CHECK (status IN ('pending','scanned','blocked')) DEFAULT 'pending';
CREATE INDEX ON media_assets(org_id, folder, created_at);
```

> **Notes**
> - Consider `current_draft_version_id` and `current_published_version_id` instead of a single `current_version_id`.
> - Use UUIDv7 or identity columns; add `ON DELETE CASCADE` selectively.

---

## API Surface — Additions

- `POST /api/templates/:id/duplicate`
- `POST /api/templates/:id/publish`  
  Validates style guide → creates export(s) → updates `current_published_version_id`.
- `GET /api/templates/:id/exports`
- `GET /api/templates/:id/exports/:exportId`
- `POST /api/media/scan/:id` (enqueue AV scan)
- `POST /api/blocks/:id/thumbnail` (or generate on upload)
- `GET /api/style-guide` (serve versioned tokens)
- `POST /api/webhooks` (register), `GET /api/webhooks/events`
- **AuthZ**: All routes enforce `(org_id, user_id)` scope and collaborator permission.

---

## Frontend Integration Details

- **Autosave**
  - Throttle 5–10s; cancel on route leave; show states: *Saving… / Saved / Failed*.
  - On revisit, if autosave is newer than draft, prompt to **Restore**.
- **Version Browser**
  - Side panel list with author, timestamp; “Open as draft” and “Restore”.
- **Publish Flow**
  - Run linter → show grouped violations → block or warn based on severity.
- **Merge-Tag Picker**
  - Searchable; insert at cursor; preview with defaults.
- **File Manager**
  - Single picker UX across image/file tools; thumbnails; folders; drag-drop.

---

## DevOps / Platform

- **CORS/CSP**: Allow Unlayer iframe domain; set `img-src`/`media-src` to CDN + `data:`.
- **DB Pooling**: pgbouncer or node-pg pool.
- **Migrations/Seeds**: Seed org, users, template, tags, media.
- **Observability**: request id + user id + org id in logs; metrics for saves/exports; alerts.
- **Backups**: PG daily; media lifecycle rules (IA/Glacier).
- **Secrets**: Keep only `.env.example`; never publish real connection strings.

---

## Style-Guide Tokens (Example JSON)

```json
{
  "fonts": { "primary": "Inter, Arial, sans-serif" },
  "colors": {
    "brandPrimary": "#163666",
    "brandSecondary": "#B2D3DE",
    "text": "#0b1320",
    "bg": "#ffffff"
  },
  "radii": { "button": 6 },
  "spacing": { "contentGutter": 24, "sectionGap": 32 },
  "maxWidth": 640
}
```

---

## Testing Plan

- **Contract tests** for editor bridges (load/save/export, media select).
- **Snapshot tests** for exported HTML (goldens).
- **Security tests** for object-level auth across orgs.
- **E2E**: create → edit → autosave → publish → export, plus media upload & block insert.

---

## Checklist

- [ ] Multi-tenant model & collaborator permissions.
- [ ] Editor event hooks wired (dirty, autosave, export).
- [ ] Style-guide tokens + linter + publish gate.
- [ ] `exports`, `jobs`, `audit_logs`, `template_collaborators` tables.
- [ ] Draft vs published semantics clarified and implemented.
- [ ] File Manager override + AV scan + thumbnails + quotas.
- [ ] CSP/CORS, pooling, backups, metrics.
- [ ] Tight indexes & scoped uniqueness.
- [ ] Secrets only in `.env.example`.

---

## Quick Prisma Hints (Sketch)

```prisma
model Organization { id String @id @default(uuid()) name String createdAt DateTime @default(now()) updatedAt DateTime @updatedAt users User[] templates Template[] }
model Template {
  id String @id @default(uuid())
  org   Organization @relation(fields: [orgId], references: [id])
  orgId String
  name  String
  status TemplateStatus @default(DRAFT)
  currentDraftVersionId     String?
  currentPublishedVersionId String?
  versions DesignVersion[]
  collaborators TemplateCollaborator[]
  @@index([orgId, status, updatedAt])
}
model DesignVersion { id String @id @default(uuid()) template Template @relation(fields: [templateId], references: [id]) templateId String version Int designJson Json htmlExport String? createdBy String createdAt DateTime @default(now()) @@index([templateId, version]) }
model Export { id String @id @default(uuid()) template Template @relation(fields: [templateId], references: [id]) templateId String version Int type ExportType html String? meta Json? createdAt DateTime @default(now()) @@index([templateId, version, type]) }
enum TemplateStatus { DRAFT PUBLISHED ARCHIVED }
enum ExportType { html_inlined raw txt }
```

---

## Notes on Your Original Brief (Nits)

- Make `templates.current_version_id` nullable **or** split into draft/published pointers.
- Scope `merge_tags.key` by org; add `(org_id, key)` unique index.
- `media_assets.url` may be ephemeral; store `storage_key` and compute signed URLs; keep `public_url` if applicable.
- Add `checksum` to dedupe media; track `status` for AV scanning.

