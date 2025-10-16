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
  Sparkles,
} from "lucide-react";

const CountyOverview = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow text-center text-gray-500">
        Loading overview...
      </div>
    );
  }

  // --- Data Preparation ---
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

  // --- Theme Colors ---
  const COLORS = ["#2772A0", "#4C9ED9", "#A8CDE8", "#1E4F73", "#CCDDEA"];

  // --- Animations ---
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <motion.section
      className="space-y-8 bg-gradient-to-b from-[#CCDDEA]/40 to-white p-6 md:p-10 rounded-3xl shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Summary Cards */}
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
            icon: Sparkles,
            color: "#2772A0",
          },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white/90 border border-[#CCDDEA] rounded-2xl shadow-md p-5 flex flex-col justify-center items-center hover:shadow-lg hover:scale-[1.03] transition-all duration-300"
          >
            <Icon size={28} color={color} className="mb-3" />
            <p className="text-gray-600 text-sm">{label}</p>
            <h3 className="text-2xl font-bold text-[#1E293B] mt-1">{value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Compact Chart Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white/95 border border-[#CCDDEA] rounded-2xl shadow p-5 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-[#2772A0] mb-3 flex items-center gap-2">
            <PieIcon size={18} className="text-[#2772A0]" /> Gender Distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Disability Distribution */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white/95 border border-[#CCDDEA] rounded-2xl shadow p-5 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-[#2772A0] mb-3 flex items-center gap-2">
            <ClipboardList size={18} className="text-[#2772A0]" /> Disability Distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={disabilityData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="name" type="category" stroke="#6B7280" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#2772A0" radius={[5, 5, 5, 5]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Schools per Subcounty */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white/95 border border-[#CCDDEA] rounded-2xl shadow p-5 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-[#2772A0] mb-3 flex items-center gap-2">
            <BarChart2 size={18} className="text-[#2772A0]" /> Schools per Subcounty
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subcountyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="schools" fill="#2772A0" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CountyOverview;
