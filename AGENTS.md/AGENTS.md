# Gemini Agent Brief — Vue Email Editor Integration (Unlayer)

**Project Goal**
Integrate the **Unlayer Vue Email Editor** (`vue-email-editor`) into a Vue app, modernize config (docs are a bit out-of-date), and add a persistence & media layer so users can **create, edit, and save email designs** to **PostgreSQL**, with support for:

* Template Picker
* File Manager
* Custom Media Library
* User Saved Blocks
* Style Guide (design tokens / brand guardrails)
* Merge Tags
* Design Tags
* User Template Updates (versioning & autosave)

The work should use the `dev-example.vue` as the starting reference to enumerate features and integration points.

---

## High-Level Architecture

**Frontend (Vue 3 + Vite)**

* `vue-email-editor` component wrapper
* State store (Pinia) for user/session, current template, save status
* UI surfaces: Template Picker modal, File Manager modal, Saved Blocks, Style Guide panel, Merge/Design tag menus

**Backend (Node/Express or Nest)**

* REST/JSON endpoints for templates, designs, user blocks, media, tags
* Auth middleware (JWT or session cookie) + RBAC for media/templates

**Database (PostgreSQL + Prisma/Knex)**

* Tables: `users`, `templates`, `design_versions`, `user_blocks`, `media_assets`, `merge_tags`, `design_tags`
* Soft-deletes + versioning (immutable `design_versions`)

**Object Storage** (recommended)

* S3-compatible (S3, Cloudflare R2, or GCS) for media assets
* Signed upload URLs, virus/mime checks, image resizes via webhook/queue (optional)

**Queues (optional)**

* For heavy exports (HTML inlining, image optimization)

---

## Database Schema (Proposed)

```sql
-- users
id (uuid pk)
email (text unique not null)
name (text)
role (text check in ['admin','editor','viewer'])
created_at, updated_at

-- templates (logical entity)
id (uuid pk)
owner_id (uuid fk -> users)
name (text)
slug (text unique)
status (text check in ['draft','published','archived'])
current_version_id (uuid fk -> design_versions)
style_guide_id (uuid null)
created_at, updated_at

-- design_versions (history)
id (uuid pk)
template_id (uuid fk -> templates)
version (int)
design_json (jsonb) -- Unlayer design
html_export (text)  -- optional cached export
notes (text)
created_by (uuid fk -> users)
created_at

-- user_blocks (saved blocks/snippets)
id (uuid pk)
owner_id (uuid fk -> users)
name (text)
category (text)
block_json (jsonb)
created_at, updated_at

-- media_assets
id (uuid pk)
owner_id (uuid fk -> users)
folder (text)
filename (text)
mime_type (text)
size_bytes (int)
url (text) -- public or signed
meta (jsonb) -- width/height, exif, etc.
created_at, updated_at

-- merge_tags (per org/app scope)
id (uuid pk)
key (text unique)      -- e.g. "user.first_name"
label (text)
default_value (text)
created_at, updated_at

-- design_tags (arbitrary, per template)
id (uuid pk)
template_id (uuid fk -> templates)
key (text)
value (text)
created_at, updated_at
```

---

## Backend API (Contract)

**Auth**

* `POST /api/auth/login` → { token }
* `GET /api/auth/me`

**Templates & Versions**

* `GET /api/templates?owner=:id&status=draft|published`
* `POST /api/templates` { name, slug? } → { id }
* `GET /api/templates/:id`
* `PATCH /api/templates/:id` { name?, status? }
* `POST /api/templates/:id/versions` { design_json, notes? } → { version_id }
* `GET /api/templates/:id/versions` → list
* `GET /api/templates/:id/versions/:version` → { design_json, html_export? }
* `POST /api/templates/:id/export` → { html } (server exports via Unlayer HTML export or MJML pipeline)
* `POST /api/templates/:id/autosave` { design_json }

**Saved Blocks**

* `GET /api/blocks?owner=:id`
* `POST /api/blocks` { name, category, block_json }
* `DELETE /api/blocks/:id`

**Media**

* `GET /api/media?folder=:path`
* `POST /api/media/sign` { filename, mime } → { uploadUrl, assetUrl }
* `DELETE /api/media/:id`

**Tags**

* `GET /api/merge-tags` → [{ key, label, default }]
* `GET /api/templates/:id/design-tags` → key/value list
* `POST /api/templates/:id/design-tags` { key, value }

---

## Frontend Integration — Key Tasks

1. **Start from `dev-example.vue`**

   * Ensure ref access to editor (`<EmailEditor ref="editorRef" :options="editorOptions" @load="onLoad" />`).
   * Implement `onLoad` to set config, load initial design if `template.current_version` exists.
   * Expose `saveDesign`, `exportHtml`, `loadDesign` via methods bound to UI buttons.

2. **Editor Options (enable features)**

   * **Template Picker**: wrapper UI modal lists `/api/templates`; on select → `editor.loadDesign` with chosen version.
   * **File Manager / Custom Media Library**: provide a custom picker that lists `/api/media`, supports upload via `/api/media/sign`, and returns selected file URL to the editor (see *Asset Picker Hook* below).
   * **User Saved Blocks**: implement UI to insert blocks from `/api/blocks`; use Unlayer `editor.addModule` or `editor.loadDesign` fragment merge (see *Blocks Hook* below).
   * **Style Guide**: pass base styles via editor `appearance` + enforceable tokens (colors, fonts). Provide a read-only panel describing brand rules; optional lint on export.
   * **Merge Tags**: load from `/api/merge-tags` and register with editor (see *Merge/Design Tags* below).
   * **Design Tags**: bind key/value to template context; expose small form to edit; persist via `/api/templates/:id/design-tags`.
   * **User Template Updates**: when editing, autosave to `design_versions` (new draft version) every N seconds or on change events.

3. **Autosave & Versioning**

   * Throttle change listener (e.g., 5–10s). On trigger → `editor.saveDesign` → POST `/api/templates/:id/autosave`.
   * Manual **Save New Version** button → POST `/api/templates/:id/versions` to bump `version` and set `current_version_id`.

4. **Export Pipeline**

   * `Export HTML` button → `editor.exportHtml(cb)` then POST to `/api/templates/:id/versions/:v/export` to cache.
   * Optional: inline CSS and validate HTML (ESP compatibility).

5. **Asset Picker Hook (Images/Files)**

   * Provide a custom picker callable from the editor’s image/file selection UI (custom toolbar button or override file-select handler). The picker should:

     * List folders/files
     * Upload via signed URL
     * Return a selected asset URL back to the editor callback

6. **Blocks Hook (Saved Blocks)**

   * Allow selecting a saved block, then insert into design using editor API to add content at cursor or append to body. Provide preview thumbnails.

7. **Merge/Design Tags Integration**

   * Register merge tags with the editor so users can insert tokens like `{{ user.first_name }}`.
   * Expose Design Tags (e.g., `campaign_id`, `audience`) in a side panel and persist to DB.

8. **Style Guide Enforcement**

   * Configure `appearance` defaults: brand colors, font stacks, container widths, button radii.
   * Optionally add a pre-export check to warn if non-approved colors/fonts are detected in `design_json`.

9. **Template Picker**

   * Modal with search/sort (owner, updated_at, status). Selecting a template loads its latest version; provide “Duplicate” to fork.

10. **File Manager**

* Tree view for folders; grid for files; drag-drop upload; server-side pagination.

---

## Example Vue Pseudocode (Key Spots)

```ts
// dev-example.vue (sketch)

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EmailEditor from 'vue-email-editor'
import { useSession } from '@/stores/session'
import { api } from '@/lib/api'

const editorRef = ref<any>(null)
const editorOptions = ref({
  projectId: import.meta.env.VITE_UNLAYER_PROJECT_ID, // if needed
  appearance: {
    theme: 'dark',
    panels: { tools: { dock: 'left' } },
    fonts: { defaultFont: 'Inter' },
    colors: ['#163666','#B2D3DE','#0b1320','#e8eef6']
  },
  mergeTags: [], // load in onLoad
})

function onLoad() {
  // Load merge tags
  api.get('/merge-tags').then(tags => {
    editorRef.value?.editor?.setMergeTags?.(tags)
  })

  // Load selected template design
  const t = /* from route/store */
  if (t?.current_version) {
    editorRef.value?.editor?.loadDesign(t.current_version.design_json)
  }
}

async function saveVersion() {
  editorRef.value?.editor?.saveDesign(async (design: any) => {
    await api.post(`/templates/${t.id}/versions`, { design_json: design })
  })
}

async function exportHtml() {
  editorRef.value?.editor?.exportHtml(async ({ html }) => {
    await api.post(`/templates/${t.id}/export`, { html })
  })
}
</script>

<template>
  <div class="editor-shell">
    <Toolbar
      @save="saveVersion"
      @export="exportHtml"
      @openTemplates="openTemplatePicker"
      @openMedia="openMedia"
      @openBlocks="openBlocks"
    />
    <EmailEditor ref="editorRef" :options="editorOptions" @load="onLoad" />
  </div>
</template>
```

> Note: actual Unlayer methods may differ slightly; rely on the `dev-example.vue` instance methods available via `vue-email-editor`.

---

## Task Breakdown & Sequence (Recommended)

**Phase 0 — Repo & Local Env**

1. Clone scaffolding (`vue-email-editor`) and confirm `dev-example.vue` runs.
2. Add Pinia store, Axios wrapper, envs (`VITE_API_BASE`, `VITE_UNLAYER_PROJECT_ID`).
3. Create basic Express API + Prisma; migrate DB schema.

**Phase 1 — Persistence MVP**
4. Implement `/templates` CRUD and `/templates/:id/versions` (save design JSON).
5. Wire `saveDesign` and `loadDesign` in `dev-example.vue`.
6. Implement autosave endpoint and throttle listener.

**Phase 2 — Template Picker & Versioning**
7. Build Template Picker modal; load latest version on select.
8. Add version list & restore; implement Publish/Archive.

**Phase 3 — Media & File Manager**
9. Implement signed uploads + media listing endpoints.
10. Build File Manager UI; override editor file-pick to return selected URL.

**Phase 4 — Saved Blocks**
11. API for user blocks (CRUD).
12. UI for block library + insert into editor.

**Phase 5 — Style Guide**
13. Configure brand fonts/colors, default paddings, content width.
14. Add pre-export validator (warn on off-brand tokens).

**Phase 6 — Merge & Design Tags**
15. Load and register merge tags; expose picker UI.
16. Add Design Tags side panel and persistence.

**Phase 7 — Export & QA**
17. Export HTML endpoint; optional inline CSS; ESP lint.
18. E2E tests (Cypress/Playwright) for create → edit → save → export flow.

**Phase 8 — Hardening**
19. AuthZ (role-based access), rate limits, audit logs.
20. Backups, migrations, seed scripts, observability.

---

## Implementation Notes (per Feature)

### Template Picker

* Server: paginate templates by owner/status; include `current_version_id` & version meta.
* Client: searchable list, preview thumbnail (render HTML server-side once & screenshot optional).

### File Manager & Custom Media Library

* Use signed upload URLs to object storage; DB stores metadata + URL.
* Image validation (mime, dims), size limits, per-user folders.
* Selection returns absolute URL that the editor can embed.

### User Saved Blocks

* Store each block as JSON fragment compatible with Unlayer’s block structure.
* Offer categories and preview thumbnails; insert by calling the editor’s add/merge API.

### Style Guide

* Centralize tokens (fonts, colors, spacings) in one config file.
* Lock or hide non-approved tools/colors via editor options when possible.
* Pre-export linter to detect rogue colors or non-approved fonts in `design_json`.

### Merge Tags

* Provide a curated list with labels and defaults (e.g., `user.first_name`, `hotel.name`).
* Ensure the list syncs with your ESP/templating engine expectations.

### Design Tags

* Free-form key/value for analytics & downstream automation (e.g., `campaign_id`, `segment`).

### User Template Updates

* Autosave drafts; manual version bump on Save.
* Show status (Draft/Published) and save indicator (saving / saved).

---

## Security & Compliance

* AuthN: JWT cookies (httpOnly, secure) or session.
* AuthZ: Enforce ownership and roles on all endpoints.
* Input validation: Zod/Valibot for request bodies.
* Media: antivirus scan (ClamAV) if required; signed URLs with short TTL.
* Audit trail for create/update/delete.
* Rate limiting + CORS allow-list.

---

## Testing Strategy

* Unit: API handlers (templates, versions, media) with in-memory PG or test DB.
* Integration: Save → Load → Export using a headless browser against the editor.
* E2E: Cypress flows covering Template Picker, Media upload, Saved Blocks, Merge Tags insertion, Export.

---

## Deliverables

* Vue app with `vue-email-editor` integrated and all feature UIs.
* Node/Express backend + Prisma schema & migrations.
* Postgres SQL dump (baseline).
* API docs (OpenAPI/Swagger) covering endpoints above.
* Admin-only seed script with demo templates, merge tags, and media samples.
* README with setup, env, and run instructions.

---

## Resources Needed

* Access to the `vue-email-editor` repo & `dev-example.vue`.
* Unlayer account / Project ID (if required by advanced features).
* Postgres instance & credentials.
* S3-compatible storage (bucket, keys).
* Domain for API (for CORS) and OAuth provider if SSO desired.
* Brand tokens: fonts, colors, spacing, logo assets.

---

## Environment Variables (example)

```
# Frontend (Vite)
VITE_API_BASE=https://api.example.com
VITE_UNLAYER_PROJECT_ID=xxxxxxxx

# Backend
DATABASE_URL=postgresql://rebelbot:pass@192.168.8.105:5432/email_db
JWT_SECRET=supersecret
S3_ENDPOINT=https://s3.example.com
S3_BUCKET=emails-media
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
CORS_ORIGIN=https://app.example.com
```

---

## Definition of Done

* Users can: pick a template, edit, insert media via custom file manager, use saved blocks, apply style guide, insert merge/design tags, autosave, version, and export HTML.
* All data persisted in Postgres; media stored and retrievable.
* Tests green; docs complete; lint/format pass; CI pipeline in place.

---

## Open Questions (to resolve early)

1. Do we enforce single org/tenant or multi-tenant?
2. Which ESP downstream? (may affect merge tag syntax)
3. Require SSO?
4. Need email client compatibility (Litmus) in CI?
5. Thumbnail generation for templates/blocks (serverless vs queue)?


## POSTGRES CONNECTION CREDENTIALS

** The Postgres Database is hosted on a local network server. 
It's NOT running on docker on this machine. 
Connect using either of the options below, both contain the same 
endpoint for the connection string to the network server at 192.168.8.105:5432 
including the db user and password.


Option 1
DATABASE_URL="op://AI/PostgresSQL/connection string"

Option 2
CONNECTION_STRING="${DATABASE_URL}$""