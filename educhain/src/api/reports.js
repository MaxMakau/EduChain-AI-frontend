import axiosInstance from './axiosInstance';

/**
 * Fetches dashboard data based on the user's role.
 * Endpoints: 
 * - GET /reports/dashboard/parent/
 * - GET /reports/dashboard/school/ (Teacher/Headteacher)
 * - GET /reports/dashboard/county/ (Officer)
 */
export async function fetchDashboardData(role) {
  let endpoint = '';
  const roleName = role.toUpperCase();

  if (roleName === 'PARENT') {
    endpoint = `/reports/dashboard/parent/`;
  } else if (roleName === 'TEACHER' || roleName === 'HEADTEACHER') {
    endpoint = `/reports/dashboard/school/`;
  } else if (roleName === 'OFFICER') {
    endpoint = `/reports/dashboard/county/`;
  } else {
    throw new Error('Invalid user role provided for dashboard lookup.');
  }

  try {
    // --- TEST GET DASHBOARD ENDPOINT ---
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${roleName} dashboard:`, error.response?.data || error.message);
    throw error;
  }
}
