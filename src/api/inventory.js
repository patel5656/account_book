import apiClient from './apiClient';

export const getTransactions = async (type) => {
  const response = await apiClient.get(`/inventory/${type}`);
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await apiClient.get(`/inventory/single/${id}`);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await apiClient.delete(`/inventory/${id}`);
  return response.data;
};

export const createTransaction = async (type, data) => {
  const response = await apiClient.post(`/inventory/${type}`, data);
  return response.data;
};

export const updateTransactionStatus = async (id, status) => {
  const response = await apiClient.patch(`/inventory/${id}/status`, { status });
  return response.data;
};

export const getExpiryReport = async (filter, startDate, endDate) => {
  let url = '/products/expiry-report';
  const params = new URLSearchParams();
  if (filter) params.append('filter', filter);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  const response = await apiClient.get(url);
  return response.data;
};
