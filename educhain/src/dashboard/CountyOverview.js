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
  User,
  UserCheck,
} from "lucide-react";

const CountyOverview = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow text-center text-gray-500">
        Loading overview...
      </div>
    );
  }

  // --- Data prep ---
  const subcountyData = Object.entries(data.schools_per_subcounty || {}).map(
    ([name, value]) => ({
      name,
      schools: Math.round(value),
    })
  );

  const genderData = data.students?.by_gender
    ? Object.entries(data.students.by_gender).map(([key, val]) => ({
        name: key === "M" ? "Boys" : "Girls",
        value: Math.round(val),
      }))
    : [];

  const disabilityData = data.students?.by_disability_type
    ? Object.entries(data.students.by_disability_type).map(([key, val]) => ({
        name: key,
        value: Math.round(val),
      }))
    : [];

  // --- Animation variants ---
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <motion.section
      className="bg-gradient-to-b from-[#CCDDEA]/40 to-white px-3 md:px-6 pt-2 pb-6 md:pb-8 rounded-3xl shadow-sm"
      style={{ marginTop: "-12px" }} // physically lifts the section closer to navbar
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5 mt-0">
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
            className="bg-white/90 border border-[#CCDDEA] rounded-2xl shadow-md p-4 flex flex-col justify-center items-center hover:shadow-lg hover:scale-[1.03] transition-all duration-300"
          >
            <Icon size={26} color={color} className="mb-2" />
            <p className="text-gray-600 text-sm">{label}</p>
            <h3 className="text-xl font-bold text-[#1E293B] mt-1">{value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {/* Gender Distribution */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white/95 border border-[#CCDDEA] rounded-2xl shadow p-4 flex flex-col"
        >
          <h3 className="text-base font-semibold text-[#2772A0] mb-2 flex items-center gap-2">
            <PieIcon size={16} className="text-[#2772A0]" /> Gender Distribution
          </h3>
          <div className="flex justify-around items-center mb-2 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-1">
              <User color="#2772A0" size={16} /> Boys
            </div>
            <div className="flex items-center gap-1">
              <UserCheck color="#4C9ED9" size={16} /> Girls
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2772A0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Disability Distribution */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white/95 border border-[#CCDDEA] rounded-2xl shadow p-4 flex flex-col"
        >
          <h3 className="text-base font-semibold text-[#2772A0] mb-2 flex items-center gap-2">
            <ClipboardList size={16} className="text-[#2772A0]" /> Disability Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disabilityData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="url(#colorDisability)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="colorDisability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2772A0" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#A8CDE8" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Schools per Subcounty */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white/95 border border-[#CCDDEA] rounded-2xl shadow p-4 flex flex-col"
        >
          <h3 className="text-base font-semibold text-[#2772A0] mb-2 flex items-center gap-2">
            <BarChart2 size={16} className="text-[#2772A0]" /> Schools per Subcounty
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subcountyData} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#CCDDEA50" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #CCDDEA",
                  }}
                />
                <defs>
                  <linearGradient id="colorSchools" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2772A0" stopOpacity={0.95} />
                    <stop offset="95%" stopColor="#4C9ED9" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <Bar dataKey="schools" fill="url(#colorSchools)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CountyOverview;
