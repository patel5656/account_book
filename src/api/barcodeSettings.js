import apiClient from './apiClient';

export const getBarcodeSettings = async () => {
  const response = await apiClient.get('/barcode-settings');
  return response.data;
};

export const createBarcodeSetting = async (data) => {
  const response = await apiClient.post('/barcode-settings', data);
  return response.data;
};

export const updateBarcodeSetting = async (id, data) => {
  const response = await apiClient.put(`/barcode-settings/${id}`, data);
  return response.data;
};

export const deleteBarcodeSetting = async (id) => {
  const response = await apiClient.delete(`/barcode-settings/${id}`);
  return response.data;
};
