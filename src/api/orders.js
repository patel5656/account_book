import apiClient from './apiClient';

const fetchOrders = async () => {
  try {
    const response = await apiClient.get('/products/order-list');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export default fetchOrders;
