import axiosInstance from './axiosInstance';

export const getInventory = async (schoolId) => {
  try {
    const response = await axiosInstance.get(`/schools/inventory/${schoolId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateInventory = async (schoolId, inventoryData) => {
  try {
    const response = await axiosInstance.put(`/schools/inventory/${schoolId}/`, inventoryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patchInventory = async (schoolId, inventoryData) => {
    try {
      const response = await axiosInstance.patch(`/schools/inventory/${schoolId}/`, inventoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
