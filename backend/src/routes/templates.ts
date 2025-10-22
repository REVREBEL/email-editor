import { Router, Request, Response } from 'express';
export const templates = Router();

// Templates
templates.post('/orgs/:orgId/templates', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.get('/orgs/:orgId/templates', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.get('/templates/:templateId', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.patch('/templates/:templateId', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.delete('/templates/:templateId', (_req, res) => res.status(501).json({error:'not_implemented'}));

// Versions
templates.post('/templates/:templateId/versions', (_req, res) => res.status(501).json({error:'not_implemented'})); // fork draft
templates.get('/templates/:templateId/versions', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.get('/versions/:versionId', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.post('/versions/:versionId', (_req, res) => res.status(501).json({error:'not_implemented'})); // update draft
templates.post('/versions/:versionId/publish', (_req, res) => res.status(501).json({error:'not_implemented'}));

// Render & preview
templates.post('/versions/:versionId/render', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.post('/versions/:versionId/test-send', (_req, res) => res.status(501).json({error:'not_implemented'}));

// Merge Tags
templates.post('/orgs/:orgId/merge-tags', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.get('/orgs/:orgId/merge-tags', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.patch('/merge-tags/:mergeTagId', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.delete('/merge-tags/:mergeTagId', (_req, res) => res.status(501).json({error:'not_implemented'}));

// Media
templates.post('/orgs/:orgId/media-assets/sign', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.post('/orgs/:orgId/media-assets/complete', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.get('/orgs/:orgId/media-assets', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.get('/media-assets/:assetId/url', (_req, res) => res.status(501).json({error:'not_implemented'}));
templates.delete('/media-assets/:assetId', (_req, res) => res.status(501).json({error:'not_implemented'}));

export default templates;
