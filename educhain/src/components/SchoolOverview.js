import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, UserCheck, BookOpen, Package } from "lucide-react";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"];

const SchoolOverview = ({ overview }) => {
  if (!overview)
    return (
      <div className="text-center text-gray-500 py-10">
        No school overview data available.
      </div>
    );

  const { school, students, teachers, attendance, assessments, resource_requests } = overview;

  // Data for charts
  const genderData = Object.entries(students.by_gender).map(([gender, count]) => ({
    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
    count,
  }));

  const disabilityData = Object.entries(students.by_disability_type).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const assessmentData = Object.entries(assessments).map(([subject, stats]) => ({
    subject,
    avg: stats.avg_percentage ?? 0,
  }));

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">School Overview</h2>
        <p className="text-gray-600">
          <strong>{school.name}</strong> ({school.code}) —{" "}
          <span className="font-medium">{school.subcounty}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition">
          <Users className="text-indigo-600 mb-2" size={28} />
          <div className="text-3xl font-bold text-indigo-700">{students.total}</div>
          <p className="text-gray-500 mt-1 text-sm">Total Students</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition">
          <UserCheck className="text-green-600 mb-2" size={28} />
          <div className="text-3xl font-bold text-green-600">{teachers}</div>
          <p className="text-gray-500 mt-1 text-sm">Total Teachers</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition">
          <BookOpen className="text-teal-600 mb-2" size={28} />
          <div className="text-3xl font-bold text-teal-600">
            {attendance.attendance_percentage ?? "--"}%
          </div>
          <p className="text-gray-500 mt-1 text-sm">Attendance Today</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition">
          <Package className="text-red-600 mb-2" size={28} />
          <div className="text-3xl font-bold text-red-600">
            {resource_requests.pending}
          </div>
          <p className="text-gray-500 mt-1 text-sm">Pending Resources</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Students by Gender (Bar Graph) */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Students by Gender
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip cursor={{ fill: "rgba(79,70,229,0.05)" }} />
                <Legend />
                <defs>
                  <linearGradient id="boysColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="girlsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F472B6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#FDA4AF" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <Bar dataKey="count" fill="url(#boysColor)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by Disability Type */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Students by Disability Type
          </h3>
          {disabilityData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={disabilityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {disabilityData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">No disability data available</p>
          )}
        </div>
      </div>

      {/* Assessment Performance */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Assessment Averages by Subject
        </h3>
        {assessmentData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={assessmentData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill="#4F46E5" radius={[6, 6, 0, 0]} />
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
