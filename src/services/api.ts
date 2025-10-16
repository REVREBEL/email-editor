import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  getTemplates() {
    return apiClient.get('/templates');
  },
  getTemplate(id: string) {
    return apiClient.get(`/templates/${id}`);
  },
  createTemplate(data: { name: string; design: any; templateId?: string }) {
    return apiClient.post('/templates', data);
  },
  updateTemplate(id: string, data: any) {
    return apiClient.patch(`/templates/${id}`, data);
  },
  createVersion(templateId: string, data: any) {
    return apiClient.post(`/templates/${templateId}/versions`, data);
  },
  getVersions(templateId: string) {
    return apiClient.get(`/templates/${templateId}/versions`);
  },
  getVersion(templateId: string, version: string) {
    return apiClient.get(`/templates/${templateId}/versions/${version}`);
  },
  autosave(templateId: string, data: any) {
    return apiClient.post(`/templates/${templateId}/autosave`, data);
  },
  getMedia() {
    return apiClient.get('/media');
  },
  uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getBlocks() {
    return apiClient.get('/blocks');
  },
  createBlock(data: any) {
    return apiClient.post('/blocks', data);
  },
  deleteBlock(id: string) {
    return apiClient.delete(`/blocks/${id}`);
  },
  getMergeTags() {
    return apiClient.get('/merge-tags');
  },
  getDesignTags(templateId: string) {
    return apiClient.get(`/templates/${templateId}/design-tags`);
  },
  createDesignTag(templateId: string, data: any) {
    return apiClient.post(`/templates/${templateId}/design-tags`, data);
  },
  exportHtml(templateId: string, html: string) {
    return apiClient.post(`/templates/${templateId}/export`, { html });
  },
};
