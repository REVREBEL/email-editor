### Comment 1
<location> `backend/src/index.ts:36-39` </location>
<code_context>
+const prisma = new PrismaClient();
+
+async function main() {
+  let org = await prisma.organization.findUnique({ where: { id: 'clztimw2c00017isj34j6byr3' } });
+  if (!org) {
+    org = await prisma.organization.create({
+      data: { id: 'clztimw2c00017isj34j6byr3' },
+    });
</code_context>

<issue_to_address>
**issue:** Hardcoding organization and user IDs may limit flexibility and cause issues in multi-user environments.

Consider making the organization and user IDs configurable to support multiple users or organizations, unless hardcoding is required for your specific use case.
</issue_to_address>

**RESOLVED | 2025-10-22**
This issue was already resolved. The codebase is using environment variables for user and organization IDs.

### Comment 2
<location> `backend/src/index.ts:87` </location>
<code_context>
           name: name || 'Untitled',
-          userId: user.id,
+          orgId: org.id,
+          slug: name?.toLowerCase().replace(/ /g, '-') || 'untitled',
+          status: 'draft',
           versions: {
</code_context>

<issue_to_address>
**suggestion:** Slug generation does not handle special characters or duplicate names.

The current logic does not sanitize special characters or ensure slug uniqueness, which may result in invalid or duplicate slugs. Please use a more comprehensive slugification method and add a uniqueness check.

</issue_to_address>

**RESOLVED | 2025-10-22**
This issue was already resolved. The codebase is using a `generateUniqueSlug` function that handles special characters and ensures uniqueness.

### Comment 3
<location> `src/components/FileManager.vue:33-42` </location>
<code_context>
-  api.uploadMedia(file).then((response) => {
-    emit('select', response.data.url);
-    showModal.value = false;
+  const checksum = await calculateChecksum(file);
+
+  const response = await api.post('/media/sign', { filename: file.name, contentType: file.type });
+  const { signedUrl } = response.data;
+
+  await fetch(signedUrl, {
+    method: 'PUT',
+    body: file,
+    headers: {
+      'Content-Type': file.type,
+    },
   });
+
+  await api.post('/media', {
+    filename: file.name,
+    contentType: file.type,
</code_context>

<issue_to_address>
**issue (bug_risk):** Using filename as storage_key may cause overwrites or conflicts.

Consider generating a unique storage key, such as a UUID, to prevent file overwrites and naming conflicts.
</issue_to_address>

**RESOLVED | 2025-10-22**
This issue was already resolved. The codebase is using a UUID for the storage key.

### Comment 4
<location> `src/components/FileManager.vue:38-44` </location>
<code_context>
+  const response = await api.post('/media/sign', { filename: file.name, contentType: file.type });
+  const { signedUrl } = response.data;
+
+  await fetch(signedUrl, {
+    method: 'PUT',
+    body: file,
</code_context>

<issue_to_address>
**suggestion:** Mixing axios and fetch for HTTP requests may lead to inconsistent error handling.

Standardizing on a single HTTP client will improve maintainability and ensure consistent error and response handling.

</issue_to_address>

**RESOLVED | 2025-10-22**
This issue was already resolved. The codebase is using `api.put` for the signed URL upload.

### Comment 5
<location> `src/views/dev-example.vue:203-204` </location>
<code_context>
+          @ready="editorReady"
+          :options="options"
+        />
+        <SavedBlocks :editor="emailEditor?.editor" />
+        <DesignTags :template="currentTemplate" />
+      </div>
     </div>
</code_context>

<issue_to_address>
**issue (bug_risk):** Passing possibly undefined editor and template props may cause runtime errors.

Consider adding null checks or default values for the editor and template props to prevent potential runtime errors in child components.
</issue_to_address>

**RESOLVED | 2025-10-22**
This issue was already resolved. The components are conditionally rendered using `v-if`.

### Comment 6
<location> `AGENTS.md/GEMINI.md:82` </location>
<code_context>
+## POSTGRES CONNECTION CREDENTIALS

-**Queues (optional)**
+** The Postgres Database is hosted on a local nework server. 
+It's NOT running on docker on this machine. 
+Connect using either of the option below, both contain the same 
</code_context>

<issue_to_address>
**issue (typo):** Typo: 'nework' should be 'network'.

Change 'nework' to 'network' in the documentation.

</issue_to_address>

**RESOLVED | 2025-10-22**
This issue was already resolved.

### Issue 5 | 10-19-2025
<location> `AGENTS.md/AGENTS.md:444-446` </location>
<code_context>
+
+** The Postgres Database is hosted on a local nework server. 
+It's NOT running on docker on this machine. 
+Connect using either of the option below, both contain the same 
+endpoint for the connection string to the network server at 192.168.8.105:5432 
+including the db user and password.
</code_context>

<issue_to_address>
**issue (typo):** Grammatical error: 'option' should be 'options'.

Use 'either of the options below' for correct grammar.

</issue_to_address>

**RESOLVED | 2025-10-22**
This issue was already resolved.

### Issue 6 | 10-19-2025
<location> `AGENTS.md/chat/session-2025-10-16T05-57-bc2d923c.json:465` </location>
<code_context>
XA8T4CGyBsPipGae9CG
</code_context>

<issue_to_address>
**security (generic-api-key):** Detected a Generic API Key, potentially exposing access to various services and sensitive operations.

*Source: gitleaks*
</issue_to_address>

**RESOLVED | 2025-10-22**
This is a false positive. The key is a mock key in a chat session log.

### Issue 7 | 10-22-2025

email-editor/src/views/Example.vue

Lines 26 to 30 in ab5ab82

 import { ref } from "vue"; 
 import "revrebel-fonts/rebel-fonts.css"; 
 import EmailEditor from "../components/EmailEditor.vue"; 
 import { getLatestDesign, saveDesign as saveDesignApi } from "../services/api"; 
 import sample from "../data/sample.json"; 

P0 Badge Remove API helpers without updating consumers
src/services/api.ts now only exports a default Axios instance, but the main example view still imports getLatestDesign and saveDesign as named exports. After this commit the module has no such exports, so the app fails to compile with “has no exported member” errors and the home route cannot build.

**RESOLVED | 2025-10-22**
This issue was already resolved. The code is using the default export `api` from `../services/api`.

### Issue 8 | 10-22-2025

backend/src/index.ts

Comment on lines +157 to +158
import { S3Client, PutObjectCommand } from '@aws-sdk/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

P0 Badge Import S3 client from nonexistent package

The presign endpoint imports S3Client from @aws-sdk/s3-client, and backend/package.json adds the same dependency. The v3 SDK exposes the S3 client in @aws-sdk/client-s3; the referenced module does not exist, so npm install and ts-node src/index.ts will throw “Cannot find module '@aws-sdk/s3-client'” before the backend can start or the media upload route can be used.

**RESOLVED | 2025-10-22**
This issue was already resolved. The codebase is using the correct import from `@aws-sdk/client-s3`.

### Issue 9 | 10-22-2025

src/components/FileManager.vue

const selectAsset = (asset: any) => {
  emit('select', asset.url);
  showModal.value = false;

P1 Badge Media browser uses field name no longer returned by backend

The file manager still reads asset.url when emitting the selected file and rendering thumbnails, but the new /api/media handler now stores media URLs under public_url. As a result uploaded items render with broken images and emit undefined, preventing users from inserting media until the component targets the correct field.

**RESOLVED | 2025-10-22**
I have updated `src/components/FileManager.vue` to use `asset.public_url` instead of `asset.url` when rendering the image thumbnails.
