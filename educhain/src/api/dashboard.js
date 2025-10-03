// src/api/dashboard.js
import axiosInstance from './axiosInstance';

// Endpoints:
// - /api/reports/dashboard/parent/
// - /api/reports/dashboard/school/ (Teacher/Headteacher)
// - /api/reports/dashboard/county/ (Officer)

export async function fetchDashboardData(role) {
  let endpoint = '';
  if (role === 'PARENT') {
    endpoint = `/reports/dashboard/parent/`;
  } else if (role === 'TEACHER' || role === 'HEADTEACHER') {
    endpoint = `/reports/dashboard/school/`;
  } else if (role === 'OFFICER') {
    endpoint = `/reports/dashboard/county/`;
  } else {
    throw new Error('Invalid user role provided.');
  }

  const response = await axiosInstance.get(endpoint);
  return response.data;
}