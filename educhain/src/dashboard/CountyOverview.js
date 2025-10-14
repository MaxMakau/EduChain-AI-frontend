import React from "react";
import {
  Users,
  School,
  ClipboardList,
  Activity,
  Accessibility,
  PieChart,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const CountyOverview = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-500 animate-pulse">
        Loading county overview...
      </div>
    );
  }

  const {
    total_students = 0,
    active_teachers = 0,
    schools_managed = 0,
    attendance_rate = 0,
    gender_distribution = { female: 0, male: 0 },
    assessment_performance = [],
    resource_requests = [],
    schools_per_subcounty = [],
    pwd_overview = { total_pwd: 0, top_disabilities: [] },
  } = data;

  const assessmentChartData =
    assessment_performance.length > 0
      ? assessment_performance
      : [
          { subject: "Mathematics", score: 0 },
          { subject: "English", score: 0 },
          { subject: "Science", score: 0 },
        ];

  const subcountyChartData =
    schools_per_subcounty.length > 0
      ? schools_per_subcounty
      : [
          { subcounty: "Makadara", schools: 0 },
          { subcounty: "Roysambu", schools: 0 },
          { subcounty: "Starehe", schools: 0 },
        ];

  const stats = [
    {
      label: "Total Students",
      value: total_students,
      icon: Users,
      color: "#3B82F6",
      gradient: "from-blue-50 to-white",
    },
    {
      label: "Active Teachers",
      value: active_teachers,
      icon: ClipboardList,
      color: "#2563EB",
      gradient: "from-indigo-50 to-white",
    },
    {
      label: "Schools Managed",
      value: schools_managed,
      icon: School,
      color: "#0E7490",
      gradient: "from-cyan-50 to-white",
    },
    {
      label: "Attendance Rate",
      value: `${attendance_rate}%`,
      icon: Activity,
      color: "#059669",
      gradient: "from-emerald-50 to-white",
    },
  ];

  return (
    <section className="space-y-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, gradient }) => (
          <div
            key={label}
            className={`bg-gradient-to-b ${gradient} rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <Icon className="mb-3" color={color} size={26} />
            </div>
            <h3 className="text-gray-600 text-sm tracking-wide">{label}</h3>
            <p className="text-3xl font-semibold text-[#1E293B] mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Gender Distribution */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <PieChart size={20} className="text-[#2772A0]" /> Student Gender Distribution
        </h3>
        <div className="flex flex-col sm:flex-row justify-around text-center">
          <div className="flex flex-col items-center">
            <p className="text-gray-600 text-sm">Female</p>
            <p className="text-3xl font-bold text-pink-600 mt-1">
              {gender_distribution.female}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-gray-600 text-sm">Male</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {gender_distribution.male}
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Performance */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-[#2772A0]" /> Assessment Performance (%)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assessmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="subject" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#2772A0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Schools per Subcounty */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <School size={20} className="text-[#2772A0]" /> Schools per Subcounty
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subcountyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="subcounty" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="schools" fill="#0E7490" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PWD Overview */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <Accessibility size={20} className="text-[#2772A0]" /> Students with Disabilities (PWD)
        </h3>
        <p className="text-gray-600 mb-3">
          <span className="font-semibold">{pwd_overview.total_pwd}</span> total PWD students.
        </p>
        {pwd_overview.top_disabilities?.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {pwd_overview.top_disabilities.map((d, idx) => (
              <li
                key={idx}
                className="py-2 flex justify-between text-sm text-gray-700"
              >
                <span className="capitalize">{d.type}</span>
                <span className="font-medium">{d.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <AlertCircle size={16} /> No disability data available.
          </p>
        )}
      </div>

      {/* Pending Resources */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-3 flex items-center gap-2">
          <ClipboardList size={20} className="text-[#2772A0]" /> Pending Resource Requests
        </h3>
        {resource_requests.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {resource_requests.map((req, idx) => (
              <li
                key={idx}
                className="py-3 text-sm text-gray-700 flex justify-between"
              >
                <span>{req.school_name}</span>
                <span className="text-gray-500">{req.request_type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No pending requests.</p>
        )}
      </div>
    </section>
  );
};

export default CountyOverview;
