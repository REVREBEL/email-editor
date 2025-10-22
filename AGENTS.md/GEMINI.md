# Gemini Agent Brief — Vue Email Editor Integration (Unlayer)
# Agent Brief — Vue Email Editor Integration (Unlayer)

** history can be found in the chat folder for reference **

## Project Goal

Integrate the **Unlayer Vue Email Editor** (`vue-email-editor`) into a Vue app, modernize the configuration, and add a persistence & media layer so users can **create, edit, version, and publish email designs** to **PostgreSQL**, with support for:

- Template Picker
- File Manager & Custom Media Library
- User Saved Blocks
- Style Guide (design tokens / brand guardrails)
- Merge Tags & Design Tags
- Versioning & Autosave
- Publishing workflow (draft → publish → usage)

This brief serves as the single source of truth for both **product and engineering** — describing the high-level vision, architecture, backend contracts, data model, DevOps considerations, and operational guardrails.

---

## High-Level Architecture

### Frontend (Vue 3 + Vite)
- `vue-email-editor` component wrapper
- State store (Pinia) for user/session, current template, save status
- UI surfaces: Template Picker modal, File Manager modal, Saved Blocks, Style Guide panel, Merge/Design tag menus

### Backend (Node/Express or Nest)
- REST/JSON endpoints for templates, designs, user blocks, media, tags
- Auth middleware (JWT or session cookie) + RBAC for media/templates

### Database (PostgreSQL + Prisma)
- Tables: `users`, `templates`, `versions`, `user_blocks`, `media_assets`, `merge_tags`, `design_tags`
- Soft-deletes + versioning (immutable `versions` rows)

### Object Storage
- S3-compatible (AWS S3, Cloudflare R2, GCS) for media assets
- Signed upload URLs, MIME checks, image processing pipeline (optional)

### Queues (optional)
- For heavy exports (HTML inlining, image optimization)

---


# Agent Secret Access Documentation

To operate correctly, the agent requires access to sensitive credentials. 
These credentials are provided securely at runtime using the 1Password CLI tool.

**The agent should never contain hardcoded secrets.**

### Accessing Secrets

The secrets are exposed to the agent as standard environment variables within its 
runtime environment. The agent code must read these variables during initialization.

CLOUDFLARE_KEY	The API Key for Cloudflare Storage	op://AI/Cloudflare Storage API Key/credential
POSTGRES_CONN_STR	The full PostgreSQL connection string	op://AI/PostgresSQL/connection string

Code Implementation (Example: Node.js)
The agent should use its language's standard method for reading environment variables. 

javascript
// Example in Node.js/JavaScript
const cloudflareKey = process.env.CLOUDFLARE_KEY;
const postgresConnString = process.env.POSTGRES_CONN_STR;

if (!cloudflareKey || !postgresConnString) {
    console.error("ERROR: Required secrets were not loaded into the environment.");
    process.exit(1);
}

// Proceed with agent logic...
// useApiKey(cloudflareKey);
// connectToDatabase(postgresConnString);


## POSTGRES CONNECTION CREDENTIALS

** The Postgres Database is hosted on a local network server. 
It's NOT running on docker on this machine. 
Connect using either of the option below, both contain the same 
endpoint for the connection string to the network server at 192.168.8.105:5432 
including the db user and password.


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

## Core End-to-End Flows

### 1. Template Lifecycle (Draft → Publish → Use)
- **Create Template**: Name + org → auto-create initial **Draft v1**.
- **Edit Draft**: Update content (`design_json`), preview HTML, autosave.
- **Publish**: Locks draft and sets `currentPublishedVersionId`. Draft remains editable or is cleared.
- **Fork New Draft**: Create a new draft from the published version.
- **Archive**: Soft-delete templates (never delete versions).

### 2. Versioning
- Templates have at most **one current draft** and **one current published version**.
- Publishing locks a version (`locked=true`, `status=PUBLISHED`).
- Version numbers increment sequentially per template.

### 3. Merge Tags
- Defined **per org** with unique `(org_id, key)`.
- System tags (e.g., `{{ unsubscribe_url }}`) are reserved.
- Unknown tags → validation error with list of unknown keys.

### 4. Media Assets
- Upload to storage; store `storage_key` and `checksum`.
- Signed URLs generated on demand (`public_url` optional).
- Deduplicate on `(org_id, checksum)`.

### 5. Render & Preview
- Compile `design_json` → HTML; substitute merge tags; inline CSS.
- Generate **test sends** (rate-limited).
- Capture renderer metadata for reproducibility.

### 6. Usage in Sending
- External systems reference `template_id` + optional `version_id`.
- If `version_id` is omitted → latest `currentPublishedVersionId` is used.
- Audit logs record which version was rendered.

### 7. Access Control & Audit
- RBAC per org (Author / Publisher / Admin).
- Audit logs: template changes, version publishes, asset uploads.

### 8. Webhooks & Events
- `template.published`, `template.version.created`, `asset.created`, `send.previewed`

---

## Frontend Integration — Key Tasks

### 1. Start from `dev-example.vue`
- Initialize `vue-email-editor`
- Load merge tags, initial design
- Implement `saveDesign`, `exportHtml`, `loadDesign` methods

### 2. Editor Event Plumbing
- Listen for `design:updated` (dirty state) → throttled autosave (5–10s).
- Register merge tags on load and persist last-used set per org/user.
- Override media selection to route through your File Manager (custom picker → returns URL to Unlayer).

### 3. Editor Options
- Template Picker
- File Manager (custom picker + signed uploads)
- Saved Blocks
- Style Guide enforcement
- Merge Tag registration
- Design Tags form

### 4. Autosave
- Throttled autosave → `POST /api/templates/:id/autosave`
- Cancel on route leave; show states: *Saving… / Saved / Failed*
- On revisit, if autosave is newer than draft, prompt to **Restore**

### 5. Export Pipeline
- `exportHtml` → POST `/api/versions/:versionId/render`
- Cache multiple export variants
- Inline CSS, absolutize URLs, sanitize & minify output
- Store compatibility results (e.g., linter results, deliverability checks)

### 6. Version Browser
- Side panel list with author, timestamp
- “Open as draft” and “Restore” actions

### 7. Publish Flow
- Run linter → show grouped violations → block or warn based on severity

### 8. Merge-Tag Picker
- Searchable; insert at cursor; preview with defaults

### 9. File Manager
- Single picker UX across image/file tools
- Thumbnails, folder support, drag-drop upload
- AV scan (async) on upload
- Responsive sizes and quotas with retention policies

---

## Guardrails & Invariants

- Published versions are immutable (`locked=true`).
- Drafts are the only mutable state.
- Merge tags unique per org (case-insensitive).
- Media URLs are derived from `storage_key`; ephemeral signed URLs should never be persisted.
- Assets cannot be deleted if referenced by any version.
- Publish without a draft → `409 Conflict`.

### Style-Guide Guardrails
- Central JSON of brand tokens (colors, fonts, radii, spacing).
- Pre-publish/export **linter**:
  - Reject/warn on non-approved fonts/colors/line-heights.
  - Enforce alt text and basic contrast checks.
- Optionally lock disallowed tools/colors in Unlayer options.

#### Example Style-Guide Tokens
```json
{
  "colors": {
    "background": {
      "dark": "#B2D3DE",
      "light": "#FAFAFA"
    },
    "brandPrimary": "#163666",
    "brandSecondary": "#B2D3DE",
    "button": {
      "dark": "#163666",
      "light": "#B2D3DE"
    },
    "danger": "#F37D59",
    "error": "#E05047",
    "info": "#B2D3DE",
    "textDark": "#0B1320",
    "textLight": "#334155",
    "warning": "#FACA78"
  },
  "fontFamily": {
    "btn": "'Khand', 'Oswald', 'Impact', sans-serif",
    "header": "'Khand', 'Oswald', 'Impact', sans-serif",
    "primary": "'General Sans', 'Public Sans', 'Inter', 'Andale Mono', Tahoma, sans-serif"
  },
  "fontWeight": {
    "btn": 700,
    "header": 700,
    "primary": 400
  },
  "layout": {
    "maxWidth": 640
  },
  "padding": {
    "btn": {
      "top": 20,
      "right": 24,
      "bottom": 20,
      "left": 24
    }
  },
  "radius": {
    "btn": 3
  },
  "spacing": {
    "btn": 8,
    "contentGutter": 24,
    "sectionGap": 32
  }
}
```

---

## Database Schema (Finalized)

```sql
-- templates
id (uuid pk)
org_id (uuid fk -> orgs)
name (text)
slug (text unique)
status (text check in ['draft','published','archived'])
current_draft_version_id (uuid fk -> versions null)
current_published_version_id (uuid fk -> versions null)
style_guide_id (uuid null)
deleted_at (timestamp null)
created_at, updated_at

-- versions
id (uuid pk)
template_id (uuid fk -> templates)
number (int)
status (text check in ['DRAFT','PUBLISHED'])
design_json (jsonb)
html_compiled (text)
renderer_name (text)
renderer_ver (text)
inliner_ver (text)
created_by (uuid fk -> users)
created_at (timestamp)
published_at (timestamp)
locked (boolean default false)

-- media_assets
id (uuid pk)
org_id (uuid fk -> orgs)
filename (text)
content_type (text)
byte_size (int)
storage_key (text)
public_url (text null)
checksum (text)
meta (jsonb)
created_by (uuid fk -> users)
created_at, updated_at, deleted_at
unique (org_id, checksum)

-- merge_tags
id (uuid pk)
org_id (uuid fk -> orgs)
key (citext)
label (text)
default_value (text)
system (boolean default false)
created_at, updated_at
unique (org_id, key)
```

### Schema Extensions & Advanced Tables

- `organizations`, `org_members`, `template_collaborators` for multi-tenancy & permissions
- `exports` table for multiple cached variants
- `jobs` table for AV scans, thumbnails, heavy exports
- `audit_logs` table for traceability

---

## Backend API (Contract)

### Templates & Versions
- `POST /api/templates`
- `GET /api/templates`
- `GET /api/templates/:id`
- `PATCH /api/templates/:id`
- `POST /api/templates/:id/versions`
- `GET /api/templates/:id/versions`
- `GET /api/versions/:versionId`
- `POST /api/versions/:versionId`
- `POST /api/versions/:versionId/publish`
- `POST /api/versions/:versionId/render`
- `POST /api/versions/:versionId/test-send`

### Media
- `GET /api/media`
- `POST /api/media/sign`
- `GET /api/media/:id/url`
- `DELETE /api/media/:id`

### API Additions
- `POST /api/templates/:id/duplicate`
- `GET /api/templates/:id/exports`
- `GET /api/templates/:id/exports/:exportId`
- `POST /api/media/scan/:id`
- `GET /api/style-guide`
- `POST /api/webhooks`, `GET /api/webhooks/events`

---

### Templates & Versions
- `POST /api/templates`
- `GET /api/templates`
- `GET /api/templates/:id`
- `PATCH /api/templates/:id`
- `POST /api/templates/:id/versions`
- `GET /api/templates/:id/versions`
- `GET /api/versions/:versionId`
- `POST /api/versions/:versionId`
- `POST /api/versions/:versionId/publish`
- `POST /api/versions/:versionId/render`
- `POST /api/versions/:versionId/test-send`

---

## Testing Plan

### Media
- `GET /api/media`
- `POST /api/media/sign`
- `GET /api/media/:id/url`
- `DELETE /api/media/:id`

### API Additions
- `POST /api/templates/:id/duplicate`
- `GET /api/templates/:id/exports`
- `GET /api/templates/:id/exports/:exportId`
- `POST /api/media/scan/:id`
- `GET /api/style-guide`
- `POST /api/webhooks`, `GET /api/webhooks/events`

### Tags Additions
**Tags**

- [ ] Multi-tenant model & collaborator permissions
- [ ] Editor event hooks wired (dirty, autosave, export)
- [ ] Style-guide tokens + linter + publish gate
- [ ] Exports, jobs, audit_logs, template_collaborators tables
- [ ] Draft vs published semantics clarified and implemented
- [ ] File Manager override + AV scan + thumbnails + quotas
- [ ] CSP/CORS, pooling, backups, metrics
- [ ] Tight indexes & scoped uniqueness
- [ ] Secrets only in `.env.example`

---

## DevOps / Platform Considerations

- **CORS/CSP**: Allow Unlayer iframe domain; set `img-src`/`media-src` to CDN + `data:`.
- **DB Pooling**: Use pgbouncer or node-pg pool.
- **Migrations/Seeds**: Seed org, users, template, tags, media.
- **Observability**: Include `request_id`, `user_id`, `org_id` in logs.
- **Metrics**: saves/sec, exports latency, AV scan times.
- **Backups**: Daily PG snapshots; media lifecycle rules (IA/Glacier).
- **Secrets**: Only `.env.example`; never commit real credentials.

---

## Testing Plan

- **Contract tests**: editor bridges (load/save/export, media select)
- **Snapshot tests**: exported HTML (goldens)
- **Security tests**: object-level auth across orgs
- **E2E tests**: full flow — create → edit → autosave → publish → export

---

## Definition of Done (Checklist)

- [ ] Multi-tenant model & collaborator permissions
- [ ] Editor event hooks wired (dirty, autosave, export)
- [ ] Style-guide tokens + linter + publish gate
- [ ] Exports, jobs, audit_logs, template_collaborators tables
- [ ] Draft vs published semantics clarified and implemented
- [ ] File Manager override + AV scan + thumbnails + quotas
- [ ] CSP/CORS, pooling, backups, metrics
- [ ] Tight indexes & scoped uniqueness
- [ ] Secrets only in `.env.example`

---

## Spec Addendum (Summary)

- One draft and one published version per template.
- Published versions are immutable.
- Merge tags scoped per org.
- Signed URLs are ephemeral and derived at read-time.
- Compiled HTML cached for current published version.
- Signed URL TTL default: 15 minutes.
- Metrics: render latency, publish latency, error rates.

## ⚙️ Local Development Notes

* **Server Control:** When working on local development, please let me handle starting and stopping the dev server — manual restarts during active work can cause the agent to freeze or lose state.

* **Port Consistency:** Keep the local dev server port fixed in `vite.config.ts` at:

  ```ts
  server: {
    port: 9022
  }
  ```

* **Network Flow / Reverse Proxy Setup:**
  External requests from outside IPs follow this path:

  ```
  SSL :443 (External Request)
        ↓
  Reverse Proxy Server
        ↓
  Local Dev Server (192.168.8.137:9022)
  ```

This ensures stable connections during testing and remote access, while avoiding conflicts with the agent runtime.


## Issues
- Review the AGENT_issues.md file for a list of current open issues.
- Use this file as the source of truth for tracking bugs, feature gaps, tech debt, and pending decisions.


## Resolved
- When an issue listed in AGENT_issues.md is confirmed fixed or completed, move that exact line into AGENT_resolved.md.
- Immediately below the original line, add the tag RESOLVED followed by the data and include a brief summary of the high-level steps taken to resolve it.
- This ensures historical traceability and keeps the issues list clean while preserving context for future reference.

---

## 🧰 Issue Template

### Issue [#] | [MM-DD-YYYY]

**Title:** [Short, descriptive title of the issue]

**Description:**
[Detailed description of the issue, how it was discovered, and any reproduction steps if relevant.]

**Impact:**
[What part of the system is affected and how it impacts users or workflows.]

**Status:** Open
**Priority:** [Low | Medium | High | Critical]
**Owner:** [Team or individual responsible]
**Reference:** [Optional: internal tracking ID, issue number, or ticket link]

---

### RESOLVED | [MM-DD-YYYY]

**Resolution Summary:**
[Brief explanation of the fix or solution implemented.]

**Commit:** [Commit hash or link]
**Linked PR:** [PR number or link]
**Verified By:** [QA name or date]

---

## ✅ Examples — Real Issue

### Issue 1 | 10-19-2025

**Title:** Autosave fails silently when the editor tab loses focus.

**Description:**
Users reported that when the browser tab is backgrounded during editing, the `design:updated` event is not always triggered. As a result, autosave does not fire, leading to potential data loss if the tab is closed or refreshed before a manual save.

**Impact:**

* Draft data can be lost unexpectedly.
* Increases user frustration and reduces trust in autosave reliability.

**Status:** Open
**Priority:** High
**Owner:** Frontend Integration Team
**Reference:** `editor_autosave_event_bug`

---

### RESOLVED | 10-25-2025

**Resolution Summary:**
✅ Added a visibility change listener to trigger a final autosave before the tab loses focus.
✅ Implemented a fallback debounce timer to ensure autosave fires even if the event is skipped.
✅ Added logging and metrics to monitor autosave failures in production.

**Commit:** [`abc1234`](https://github.com/REVREBEL/email-editor/commit/abc1234)
**Linked PR:** #42
**Verified By:** QA on staging (10-24-2025)


---

# Unlayer Features & Docs Map

When implementing functionality, prefer **custom components** over broad Unlayer SDK expansion—**except** for the explicitly whitelisted “Use Unlayer Native Function: True” items below. The official Unlayer documentation has been added under `./AGENTS.md/*`. Use the relative links in this section to find the correct doc quickly.

## App Pages to Add (Builder Modes)

> Each page demonstrates a different `displayMode` with a minimal `unlayer.init(...)` example.

### 1) Page Builder (Web)
**Docs:** `./AGENTS.md/unlayer-builder/page-builder.md`

```js
unlayer.init({
  id: 'editor-container',
  displayMode: 'web',
  projectId: 1234 // REPLACE
});
```

### 2) Document Builder
**Docs:** `./AGENTS.md/unlayer-builder/document-builder.md`

```js
unlayer.init({
  id: 'editor-container',
  displayMode: 'document',
  projectId: 1234 // REPLACE
});
```

### 3) Popup Builder
**Docs:** `./AGENTS.md/builder/popup-builder.md`

```js
unlayer.init({
  id: 'editor-container',
  displayMode: 'popup',
  projectId: 1234 // REPLACE
});
```

### Export Example (all modes)
```js
unlayer.exportHtml(console.log, { title: 'Exported HTML Title' });
```

---

## Feature Flags & Native SDK (Allowed)

> The following should use **Unlayer native functions** (not custom components), per our implementation policy.

### Headers & Footers
Enable via feature flag:

```js
unlayer.init({
  features: {
    headersAndFooters: true
  }
});
```

### Page Anchors
**Docs:** (See “Page Anchors” notes in builder docs) — lets users link buttons/links to sections of the page.

```js
unlayer.init({
  features: {
    pageAnchors: true
  }
});
```

### Connect Your CDN (Optional)
Use native Unlayer integration so assets leverage  CloudFront) for faster loads.  
**Docs:** `./AGENTS.md/builder/file-storage/custom.md`

Use Tool  1Password: Get from 1Password.

Cloudflare API Key 
"op run://AI/Cloudflare Storage API Key/credential"
"op run:op://AI/PostgresSQL/connection string"
Connection URL
"op run://AI/Cloudflare Storage API Key/hostname"


---

## Custom File Storage (Native Callbacks)

**Docs:** `./AGENTS.md/builder/file-storage/custom.md`

Register Unlayer’s native `image` callback to control uploads:

```js
unlayer.registerCallback('image', function (file, done) {
  // Handle file upload here (POST to your storage/signing endpoint)
  // Example: immediately show some progress
  done({ progress: 10 });
});
```

**Update progress bar during upload:**
```js
unlayer.registerCallback('image', function (file, done) {
  // ... upload chunk ...
  done({ progress: 10 });
  // ... upload chunk ...
  done({ progress: 50 });
});
```

**Finish upload with final URL:**
```js
unlayer.registerCallback('image', function (file, done) {
  // After your upload finishes:
  done({ progress: 100, url: 'https://cdn.example.com/path/to/image.jpg' });
});
```

---

## Templates (On Your Own Servers)
**Docs:** `./AGENTS.md/builder/templates/management.md`

Load a template JSON directly:

```js
const template = { /* Unlayer design JSON */ };
unlayer.loadDesign(template);
```

---

## Custom Tools & Blocks (Native)

> Prefer Unlayer’s native extension points for tools/blocks; only build a heavy custom component if the SDK cannot cover the use case.

- **Create Custom Tools (Docs):** `./AGENTS.md/builder/tools/custom/create.md`  
- **Inject CSS/JS from Tools (Docs):** `./AGENTS.md/builder/tools/custom/css-javascript.md`  
  > Each tool can insert CSS/JS into <head> if you prefer non-inline styles.
- **Custom Blocks (Docs):** `./AGENTS.md/builder/blocks/custom.md`  
- **User Saved Blocks (Docs):** `./AGENTS.md/builder/blocks/user-saved.md`

---

## Text Management

- **Tables (Enable):** `./AGENTS.md/builder/text-management/tables`  
- **Spell Checker (Enable):** `./AGENTS.md/builder/text-management/spell-checker.md`  
  ```js
  unlayer.init({
    features: {
      textEditor: {
        spellChecker: true
      }
    }
  });
  ```
- **Inline Font Controls (Enable):** `./AGENTS.md/builder/text-management/inline-font-controls.md`  
  ```js
  unlayer.init({
    features: {
      textEditor: {
        inlineFontControls: true
      }
    }
  });
  ```

---

## Device Support

**Docs:** `./AGENTS.md/builder/device-management.md`

```js
unlayer.init({
  devices: ['desktop', 'mobile']
});
```

---

### Implementation Notes

- **Policy:** Default to **custom components** for new functionality, **except** where this section explicitly says “Use Unlayer Native Function: True.”
- **Docs Source:** All linked docs are local to this repo under `./AGENTS.md/...` so they remain versioned with the project.
- **Project ID:** Replace `projectId` in examples with your Unlayer Project ID.
- **Export Pipeline:** Use native `exportHtml` and route the output through our **export fidelity pipeline** (inlining, absolutizing, sanitizing)—see “Export Pipeline” section earlier in this doc.


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


## Frontend Integration — Key Tasks

1. **Start from `dev-example.vue`**

   * Ensure ref access to editor (`<EmailEditor ref="editorRef" :options="editorOptions" @load="onLoad" />`).
   * Implement `onLoad` to set config, load initial design if `template.current_version` exists.
   * Expose `saveDesign`, `exportHtml`, `loadDesign` via methods bound to UI buttons.

- One draft and one published version per template.
- Published versions are immutable.
- Merge tags scoped per org.
- Signed URLs are ephemeral and derived at read-time.
- Compiled HTML cached for current published version.
- Signed URL TTL default: 15 minutes.
- Metrics: render latency, publish latency, error rates.

## ⚙️ Local Development Notes

* **Server Control:** When working on local development, please let me handle starting and stopping the dev server — manual restarts during active work can cause the agent to freeze or lose state.

* **Port Consistency:** Keep the local dev server port fixed in `vite.config.ts` at:

  ```ts
  server: {
    port: 9022
  }
  ```

* **Network Flow / Reverse Proxy Setup:**
  External requests from outside IPs follow this path:

  ```
  SSL :443 (External Request)
        ↓
  Reverse Proxy Server
        ↓
  Local Dev Server (192.168.8.137:9022)
  ```

This ensures stable connections during testing and remote access, while avoiding conflicts with the agent runtime.


## Issues
- Review the AGENT_issues.md file for a list of current open issues.
- Use this file as the source of truth for tracking bugs, feature gaps, tech debt, and pending decisions.


## Resolved
- When an issue listed in AGENT_issues.md is confirmed fixed or completed, move that exact line into AGENT_resolved.md.
- Immediately below the original line, add the tag RESOLVED followed by the data and include a brief summary of the high-level steps taken to resolve it.
- This ensures historical traceability and keeps the issues list clean while preserving context for future reference.

---

## 🧰 Issue Template

### Issue [#] | [MM-DD-YYYY]

**Title:** [Short, descriptive title of the issue]

**Description:**
[Detailed description of the issue, how it was discovered, and any reproduction steps if relevant.]

**Impact:**
[What part of the system is affected and how it impacts users or workflows.]

**Status:** Open
**Priority:** [Low | Medium | High | Critical]
**Owner:** [Team or individual responsible]
**Reference:** [Optional: internal tracking ID, issue number, or ticket link]

---

### RESOLVED | [MM-DD-YYYY]

**Resolution Summary:**
[Brief explanation of the fix or solution implemented.]

**Commit:** [Commit hash or link]
**Linked PR:** [PR number or link]
**Verified By:** [QA name or date]

---

## ✅ Examples — Real Issue

### Issue 1 | 10-19-2025

**Title:** Autosave fails silently when the editor tab loses focus.

**Description:**
Users reported that when the browser tab is backgrounded during editing, the `design:updated` event is not always triggered. As a result, autosave does not fire, leading to potential data loss if the tab is closed or refreshed before a manual save.

**Impact:**

* Draft data can be lost unexpectedly.
* Increases user frustration and reduces trust in autosave reliability.

**Status:** Open
**Priority:** High
**Owner:** Frontend Integration Team
**Reference:** `editor_autosave_event_bug`

---


## Definition of Done

* Users can: pick a template, edit, insert media via custom file manager, use saved blocks, apply style guide, insert merge/design tags, autosave, version, and export HTML.
* All data persisted in Postgres; media stored and retrievable.
* Tests green; docs complete; lint/format pass; CI pipeline in place.

---
