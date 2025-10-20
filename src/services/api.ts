import type { Design } from '../components/types';

const API_BASE_URL = '/api';

export const getLatestDesign = async (): Promise<Design | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/latest`);
    if (response.ok) {
      const data = await response.json();
      return data.design;
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest design:', error);
    return null;
  }
};

export const saveDesign = async (design: Design): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ design }),
    });
  } catch (error) {
    console.error('Error saving design:', error);
    throw error;
  }
};

export const getTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates`);
    if(response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}