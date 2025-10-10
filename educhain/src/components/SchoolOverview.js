import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

const SchoolOverview = ({ overview }) => {
  if (!overview) return <div className="text-center text-gray-500 py-10">No school overview data available.</div>;

  const { school, students, teachers, attendance, assessments, resource_requests } = overview;

  // Prepare charts data
  const genderData = Object.entries(students.by_gender).map(([gender, count]) => ({ name: gender, value: count }));
  const disabilityData = Object.entries(students.by_disability_type).map(([type, count]) => ({ name: type, value: count }));

  const assessmentData = Object.entries(assessments).map(([subject, stats]) => ({
    subject,
    avg: stats.avg_percentage ?? 0,
  }));

  return (
    <div className="space-y-8">
      {/* School Info */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">School Overview</h2>
        <p className="text-gray-600">
          <strong>School:</strong> {school.name} ({school.code}) | <strong>Subcounty:</strong> {school.subcounty}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
          <div className="text-3xl font-bold text-indigo-600">{students.total}</div>
          <div className="text-gray-500 mt-1">Total Students</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
          <div className="text-3xl font-bold text-green-500">{teachers}</div>
          <div className="text-gray-500 mt-1">Total Teachers</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
          <div className="text-3xl font-bold text-teal-500">{attendance.attendance_percentage ?? '--'}%</div>
          <div className="text-gray-500 mt-1">Attendance Today</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
          <div className="text-3xl font-bold text-red-500">{resource_requests.pending}</div>
          <div className="text-gray-500 mt-1">Pending Resources</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Students by Gender</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {genderData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disabilities */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Students by Disability Type</h3>
          {disabilityData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={disabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {disabilityData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">No disability data available</p>
          )}
        </div>
      </div>

      {/* Assessment Averages */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Assessment Averages</h3>
        {assessmentData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assessmentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500">No assessment data available</p>
        )}
      </div>
    </div>
  );
};

export default SchoolOverview;
