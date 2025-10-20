# Gemini Agent Brief — Vue Email Editor Integration (Unlayer)

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


# AGENT Issues & Resolution Log

This document is used to track current issues, their resolution status, and the steps taken once resolved.

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

## ✅ Example — Real Issue

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


