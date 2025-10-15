// src/dashboard/CountyOverview.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  Users,
  School,
  ClipboardList,
  Activity,
  PieChart as PieIcon,
  BarChart2,
} from "lucide-react";

const CountyOverview = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-gray-500">
        Loading overview...
      </div>
    );
  }

  // --- Transform data ---
  const subcountyData = Object.entries(data.schools_per_subcounty || {}).map(
    ([name, value]) => ({ name, schools: value })
  );

  const genderData = data.students?.by_gender
    ? Object.entries(data.students.by_gender).map(([key, val]) => ({
        name: key === "M" ? "Male" : "Female",
        value: val,
      }))
    : [];

  const disabilityData = data.students?.by_disability_type
    ? Object.entries(data.students.by_disability_type).map(([key, val]) => ({
        name: key,
        value: val,
      }))
    : [];

  // --- Chart Colors (EduChain palette) ---
  const COLORS = ["#2772A0", "#CCDDEA", "#4C9ED9", "#A8CDE8", "#1E4F73"];

  // --- Motion Config ---
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <motion.section
      className="space-y-10 bg-gradient-to-b from-[#CCDDEA]/30 to-white p-4 md:p-8 rounded-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Schools", value: data.schools, icon: School, color: "#2772A0" },
          { label: "Teachers", value: data.teachers, icon: Users, color: "#4C9ED9" },
          { label: "Students", value: data.students?.total, icon: ClipboardList, color: "#1E4F73" },
          {
            label: "Attendance Rate",
            value: `${data.attendance?.attendance_percentage || 0}%`,
            icon: Activity,
            color: "#A8CDE8",
          },
          {
            label: "Pending Requests",
            value: data.resource_requests?.pending,
            icon: BarChart2,
            color: "#2772A0",
          },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 border border-[#CCDDEA] rounded-2xl shadow-md p-5 flex flex-col justify-center items-center hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <Icon size={28} color={color} className="mb-3" />
            <p className="text-gray-600 text-sm">{label}</p>
            <h3 className="text-2xl font-bold text-[#1E293B] mt-1">{value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Gender Distribution */}
      <motion.div
        className="bg-white/90 border border-[#CCDDEA] rounded-2xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-[#2772A0] mb-4 flex items-center gap-2">
          <PieIcon size={20} className="text-[#2772A0]" /> Gender Distribution
        </h3>
        <div className="h-64 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Disability Distribution */}
      <motion.div
        className="bg-white/90 border border-[#CCDDEA] rounded-2xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-[#2772A0] mb-4 flex items-center gap-2">
          <ClipboardList size={20} className="text-[#2772A0]" /> Disability Distribution
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={disabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#2772A0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Schools per Subcounty */}
      <motion.div
        className="bg-white/90 border border-[#CCDDEA] rounded-2xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-[#2772A0] mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-[#2772A0]" /> Schools per Subcounty
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subcountyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="schools" fill="#4C9ED9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default CountyOverview;
