import axiosInstance from './axiosInstance';

// List students in user's school
export async function fetchStudents() {
  const res = await axiosInstance.get('/students/all/');
  return res.data;
}

// Add new student
export async function addStudent(data) {
  const res = await axiosInstance.post('/students/add/', data);
  return res.data;
}

// Get single student details
export async function fetchStudentDetail(id) {
  const res = await axiosInstance.get(`/students/${id}/`);
  return res.data;
}

// Update student
export async function updateStudent(id, data) {
  const res = await axiosInstance.put(`/students/${id}/`, data);
  return res.data;
}

// Delete student
export async function deleteStudent(id) {
  await axiosInstance.delete(`/students/${id}/`);
}

// Fetch attendance for a student
export async function fetchStudentAttendance(id) {
  const res = await axiosInstance.get(`/students/${id}/attendance/`);
  return res.data;
}

// Fetch assessments for a student
export async function fetchStudentAssessments(id) {
  const res = await axiosInstance.get(`/students/${id}/assessments/`);
  return res.data;
}