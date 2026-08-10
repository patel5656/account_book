import apiClient from './apiClient';

export const getCollectionReport = async (startDate, endDate) => {
  let url = '/financial/collections';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return apiClient.get(url);
};

export const getDayBookSummary = async (dateType, fromDate, toDate, withItems, voucherType) => {
  let url = '/financial/day-book-summary';
  const params = new URLSearchParams();
  if (dateType) params.append('dateType', dateType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (withItems !== undefined) params.append('withItems', withItems);
  if (voucherType) params.append('voucherType', voucherType);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return apiClient.get(url);
};

export const getBrandwiseSale = async (startDate, endDate, customerId) => {
  let url = '/financial/brandwise-sale';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (customerId) params.append('customerId', customerId);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return apiClient.get(url);
};

export const getBrandwisePurchase = async (startDate, endDate, supplierId) => {
  let url = '/financial/brandwise-purchase';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (supplierId) params.append('supplierId', supplierId);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return apiClient.get(url);
};

export const getCategorywiseSale = async (startDate, endDate, customerId) => {
  let url = '/financial/categorywise-sale';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (customerId) params.append('customerId', customerId);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return apiClient.get(url);
};

export const getCategorywisePurchase = async (startDate, endDate, supplierId) => {
  let url = '/financial/categorywise-purchase';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (supplierId) params.append('supplierId', supplierId);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return apiClient.get(url);
};

export const getItemwiseSale = async (startDate, endDate, customerId, search) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (customerId) params.append('customerId', customerId);
  if (search) params.append('search', search);
  const qs = params.toString();
  return apiClient.get(`/financial/itemwise-sale${qs ? '?' + qs : ''}`);
};

export const getItemwisePurchase = async (startDate, endDate, supplierId, search) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (supplierId) params.append('supplierId', supplierId);
  if (search) params.append('search', search);
  const qs = params.toString();
  return apiClient.get(`/financial/itemwise-purchase${qs ? '?' + qs : ''}`);
};

export const getEmployeewiseSale = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const qs = params.toString();
  return apiClient.get(`/financial/employeewise-sale${qs ? '?' + qs : ''}`);
};

export const getInvoicesReport = async (type, fromDate, toDate, customerId) => {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (customerId) params.append('customerId', customerId);
  const qs = params.toString();
  return apiClient.get(`/financial/invoices-report${qs ? '?' + qs : ''}`);
};
