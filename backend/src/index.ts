import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.send('Hello from the email editor backend!');
});

// Templates
app.post('/api/templates', async (req, res) => {
  console.log('POST /api/templates');
  console.log('Request body:', req.body);
  try {
    const { name, design, templateId } = req.body;

    let user = await prisma.user.findUnique({ where: { id: process.env.DUMMY_USER_ID! } });
    if (!user) {
      console.log('User not found, creating new user');
      user = await prisma.user.create({
        data: { id: process.env.DUMMY_USER_ID! },
      });
      console.log('New user created:', user);
    }

    let org = await prisma.organization.findUnique({ where: { id: process.env.DUMMY_ORG_ID! } });
    if (!org) {
      console.log('Organization not found, creating new organization');
      org = await prisma.organization.create({
        data: { id: process.env.DUMMY_ORG_ID! },
      });
      console.log('New organization created:', org);
    }

    let template;
    if (templateId) {
      console.log(`Searching for template with id: ${templateId}`);
      template = await prisma.template.findUnique({ where: { id: templateId } });
    } else if (name) {
      console.log(`Searching for template with name: ${name}`);
      template = await prisma.template.findFirst({ where: { name } });
    }

    if (template) {
      console.log('Template found:', template);
      // Template exists, create a new version
      const latestVersion = await prisma.version.findFirst({
        where: { templateId: template.id },
        orderBy: { number: 'desc' },
      });
      console.log('Latest version:', latestVersion);

      const newVersion = await prisma.version.create({
        data: {
          templateId: template.id,
          design_json: design,
          number: (latestVersion?.number || 0) + 1,
          createdById: user.id,
          status: 'DRAFT',
        },
      });
      console.log('New version created:', newVersion);

      await prisma.template.update({
        where: { id: template.id },
        data: { currentDraftVersionId: newVersion.id },
      });

      res.status(201).json(newVersion);
    } else {
      console.log('Template not found, creating new template');
      // Template doesn't exist, create a new one
      const newTemplate = await prisma.template.create({
        data: {
          name: name || 'Untitled',
          orgId: org.id,
          slug: await generateUniqueSlug(name || 'Untitled', org.id),
          status: 'draft',
          versions: {
            create: {
              design_json: design,
              number: 1,
              createdById: user.id,
              status: 'DRAFT',
            },
          },
        },
        include: { versions: true },
      });
      console.log('New template created:', newTemplate);

      await prisma.template.update({
        where: { id: newTemplate.id },
        data: { currentDraftVersionId: newTemplate.versions[0].id },
      });

      res.status(201).json(newTemplate);
    }
  } catch (error) {
    console.error('Error in POST /api/templates:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A template with this name already exists.' });
    }
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'
        ? (error as any).message
        : 'An unexpected error occurred.';
    res.status(500).json({ error: errorMessage });
  }
});

async function generateUniqueSlug(name: string, orgId: string): Promise<string> {
  // Basic slugification: lowercase, remove special chars, replace spaces/hyphens, trim
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')         // replace spaces with hyphens
    .replace(/-+/g, '-')          // collapse multiple hyphens
    || 'untitled';

  let slug = baseSlug;
  let suffix = 1;

  // Check for uniqueness within the org
  while (
    await prisma.template.findFirst({
      where: { slug, orgId }
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }
  return slug;
}

app.get('/api/templates', async (req, res) => {
  const templates = await prisma.template.findMany({ include: { versions: { orderBy: { number: 'desc' } } } });
  res.json(templates);
});

app.get('/api/templates/latest', async (req, res) => {
  try {
    const latestTemplate = await prisma.template.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        currentDraftVersion: true
      }
    });

    if (latestTemplate && latestTemplate.currentDraftVersion) {
      res.json({ design: latestTemplate.currentDraftVersion.design_json });
    } else {
      res.status(404).send('No templates found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  const template = await prisma.template.findUnique({
    where: { id: req.params.id },
    include: { versions: { orderBy: { number: 'desc' } } },
  });

  if (template) {
    // Find the current version
    const currentVersion = template.versions.find(v => v.id === template.currentDraftVersionId);
    res.json({ ...template, design: currentVersion?.design_json });
  } else {
    res.status(404).send('Template not found');
  }
});

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

app.post('/api/media/sign', async (req, res) => {
  try {
    const { filename, contentType, storage_key } = req.body;

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.S3_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || '',
      Key: storage_key || filename,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ signedUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.post('/api/templates/:id/design-tags', async (req, res) => {
  try {
    const { key, value } = req.body;
    const designTag = await prisma.designTag.create({
      data: {
        templateId: req.params.id,
        key,
        value,
      },
    });
    res.status(201).json(designTag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/api/templates/:id/design-tags', async (req, res) => {
  try {
    const designTags = await prisma.designTag.findMany({ where: { templateId: req.params.id } });
    res.json(designTags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/api/merge-tags', async (req, res) => {
  try {
    const mergeTags = await prisma.mergeTag.findMany();
    res.json(mergeTags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.delete('/api/blocks/:id', async (req, res) => {
  try {
    await prisma.userBlock.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.post('/api/blocks', async (req, res) => {
  try {
    let user = await prisma.user.findUnique({ where: { id: process.env.DUMMY_USER_ID! } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: process.env.DUMMY_USER_ID! },
      });
    }

    const userBlock = await prisma.userBlock.create({
      data: {
        name,
        category,
        block_json,
        userId: user.id,
      },
    });

    res.status(201).json(userBlock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/api/blocks', async (req, res) => {
  try {
    const userBlocks = await prisma.userBlock.findMany();
    res.json(userBlocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.post('/api/media', async (req, res) => {
  try {
    const { filename, contentType, byte_size, storage_key, checksum } = req.body;

    let user = await prisma.user.findUnique({ where: { id: process.env.DUMMY_USER_ID! } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: process.env.DUMMY_USER_ID! },
      });
    }

    let org = await prisma.organization.findUnique({ where: { id: process.env.DUMMY_ORG_ID! } });
    if (!org) {
      org = await prisma.organization.create({
        data: { id: process.env.DUMMY_ORG_ID! },
      });
    }

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        orgId: org.id,
        filename,
        content_type: contentType,
        byte_size,
        storage_key,
        checksum,
        createdById: user.id,
        public_url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filename}`,
      },
    });

    res.status(201).json(mediaAsset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/api/media', async (req, res) => {
  try {
    const mediaAssets = await prisma.mediaAsset.findMany();
    res.json(mediaAssets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.post('/api/templates/:id/archive', async (req, res) => {
  try {
    await prisma.template.update({
      where: { id: req.params.id },
      data: {
        status: 'archived',
        deletedAt: new Date(),
      },
    });
    res.status(200).send('Template archived');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.post('/api/templates/:id/publish', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (template && template.currentDraftVersionId) {
      await prisma.template.update({
        where: { id: req.params.id },
        data: {
          currentPublishedVersionId: template.currentDraftVersionId,
          status: 'published',
        },
      });
      await prisma.version.update({
        where: { id: template.currentDraftVersionId },
        data: { status: 'PUBLISHED' },
      });
      res.status(200).send('Template published');
    } else {
      res.status(404).send('Template or draft version not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
