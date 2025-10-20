import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

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

    let user = await prisma.user.findUnique({ where: { email: 'unlayer@rebel.camp' } });
    if (!user) {
      console.log('User not found, creating new user');
      user = await prisma.user.create({
        data: { email: 'unlayer@rebel.camp', name: 'Test User' },
      });
      console.log('New user created:', user);
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
      const latestVersion = await prisma.designVersion.findFirst({
        where: { templateId: template.id },
        orderBy: { version: 'desc' },
      });
      console.log('Latest version:', latestVersion);

      const newVersion = await prisma.designVersion.create({
        data: {
          templateId: template.id,
          design_json: design,
          version: (latestVersion?.version || 0) + 1,
          createdById: user.id,
        },
      });
      console.log('New version created:', newVersion);

      await prisma.template.update({
        where: { id: template.id },
        data: { currentVersionId: newVersion.id },
      });

      res.status(201).json(newVersion);
    } else {
      console.log('Template not found, creating new template');
      // Template doesn't exist, create a new one
      const newTemplate = await prisma.template.create({
        data: {
          name: name || 'Untitled',
          userId: user.id,
          versions: {
            create: {
              design_json: design,
              version: 1,
              createdById: user.id,
            },
          },
        },
        include: { versions: true },
      });
      console.log('New template created:', newTemplate);

      await prisma.template.update({
        where: { id: newTemplate.id },
        data: { currentVersionId: newTemplate.versions[0].id },
      });

      res.status(201).json(newTemplate);
    }
  } catch (error) {
    console.error('Error in POST /api/templates:', error);
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/api/templates', async (req, res) => {
  const templates = await prisma.template.findMany();
  res.json(templates);
});

app.get('/api/templates/latest', async (req, res) => {
  try {
    const latestTemplate = await prisma.template.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        currentVersion: true
      }
    });

    if (latestTemplate && latestTemplate.currentVersion) {
      res.json({ design: latestTemplate.currentVersion.design_json });
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
    include: { versions: { orderBy: { version: 'desc' } } },
  });

  if (template) {
    // Find the current version
    const currentVersion = template.versions.find(v => v.id === template.currentVersionId);
    res.json({ ...template, design: currentVersion?.design_json });
  } else {
    res.status(404).send('Template not found');
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
