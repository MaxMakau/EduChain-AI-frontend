// src/dashboard/CountyDashboard.js
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Home,
  Users,
  BookOpen,
  School,
  ClipboardList,
  TrendingUp,
  Menu,
  X,
  LogOut,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import CountyOverview from "./CountyOverview";
import logo from "../assets/logo.png";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

/* -------------------------
  Colors / small helpers
------------------------- */
const COLORS = {
  oceanBlue: "#2772A0",
  cloudySky: "#CCDDEA",
  bg: "#F8FAFC",
  text: "#1E293B",
  muted: "#6B7280",
};

const tabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "schools", label: "Schools", icon: School },
  { id: "students", label: "Students", icon: Users },
  { id: "assessments", label: "Assessments", icon: BookOpen },
  { id: "resources", label: "Resources", icon: ClipboardList },
  { id: "ai-analytics", label: "AI Analytics", icon: TrendingUp },
];

const endpoints = {
  overview: "/reports/dashboard/county/",
  schools: "/schools/all/",
  students: "/students/all/",
  assessments: "/reports/assessments/summary/",
  resources: "/schools/resources/",
  "ai-analytics": "/reports/ai/analytics/",
};

/* -------------------------
  Small presentational helpers
------------------------- */
const StatCard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(39,114,160,0.08)" }}
        >
          <Icon size={20} className="text-[#2772A0]" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{title}</div>
          <CountUp className="text-2xl font-semibold text-[#1E293B]" end={value} />
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    </motion.div>
  );
};

const MiniLine = ({ data, dataKey = "value" }) => (
  <ResponsiveContainer width="100%" height={70}>
    <LineChart data={data}>
      <Line type="monotone" dataKey={dataKey} stroke={COLORS.oceanBlue} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

/* Count-up without external deps */
function CountUp({ end = 0, duration = 800, className = "" }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    let start = null;
    const from = 0;
    const to = Number(end) || 0;
    const ms = duration;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / ms, 1);
      const current = Math.floor(progress * (to - from) + from);
      setValue(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);
  return <div className={className}>{typeof end === "string" ? end : value}</div>;
}

/* Shimmer card for loading */
const Shimmer = ({ className = "h-20" }) => (
  <div className={`animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`} />
);

/* Table component (sticky header) */
const Table = ({ columns = [], rows = [] }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-x-auto">
    <table className="min-w-full text-sm table-auto">
      <thead className="text-xs text-gray-500 text-left sticky top-0 bg-white/80">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="py-2 pr-4">
              {c.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-6 text-gray-500">
              No data
            </td>
          </tr>
        ) : (
          rows.map((r, idx) => (
            <tr key={idx} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="py-3 pr-4 align-top">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

/* Defensive transform for overview */
const transformOverview = (raw = {}) => {
  return {
    studentsCount: raw.students_count ?? raw.total_students ?? 0,
    schoolsCount: (raw.schools && raw.schools.length) ?? raw.schools_count ?? 0,
    avgAttendance: raw.avg_attendance ?? raw.attendance_rate ?? 0,
    assignmentsCount: raw.assignments_count ?? 0,
    lessonsCount: raw.lessons_count ?? 0,
    weeklyAttendance: raw.weekly_attendance ?? [
      { name: "Mon", value: 88 },
      { name: "Tue", value: 90 },
      { name: "Wed", value: 93 },
      { name: "Thu", value: 91 },
      { name: "Fri", value: 95 },
    ],
    aiTrend: raw.ai_trend ?? [
      { name: "W1", score: 0.58 },
      { name: "W2", score: 0.62 },
      { name: "W3", score: 0.67 },
      { name: "W4", score: 0.71 },
    ],
  };
};

/* -------------------------
  Main Component
------------------------- */
export default function CountyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  // Fetch data helper (retry/backoff)
  const fetchTabData = async (tab) => {
    setLoading(true);
    setError("");
    const endpoint = endpoints[tab];
    if (!endpoint) {
      setError("No endpoint configured for this tab.");
      setLoading(false);
      return;
    }
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await axiosInstance.get(endpoint, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setData((prev) => ({ ...prev, [tab]: res.data }));
        setLoading(false);
        return;
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
          return;
        }
        if (attempt === MAX_RETRIES - 1) {
          setError(err.response?.data?.detail || err.message || `Failed to load ${tab} data.`);
          setLoading(false);
        } else {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 700));
        }
      }
    }
  };

  useEffect(() => {
    fetchTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const overview = useMemo(() => transformOverview(data.overview ?? data["overview"]), [data.overview]);

  // Normalize rows returned by various endpoints
  const schoolsRows = (data.schools && Array.isArray(data.schools) && data.schools) || data.schools?.results || [];
  const studentsRows = (data.students && Array.isArray(data.students) && data.students) || data.students?.results || [];
  const assessmentsRows =
    (data.assessments && Array.isArray(data.assessments) && data.assessments) || data.assessments?.results || [];
  const resourcesRows = (data.resources && Array.isArray(data.resources) && data.resources) || data.resources?.results || [];

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axiosInstance.post("/users/logout/", { refresh: refreshToken }).catch(() => {});
      }
    } catch (e) {
      // swallow
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg,#F8FAFC)]">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-4 flex flex-col transform transition-transform duration-250 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduChain" className="w-10 h-10 rounded-md" />
            <div>
              <div className="text-[#2772A0] font-bold">EduChain</div>
              <div className="text-xs text-gray-500">County Officer</div>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-gray-100" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-auto">
          <ul className="space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveTab(t.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition ${
                      active ? "bg-[#2772A0] text-white shadow-md" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{t.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2772A0] text-white font-semibold hover:bg-[#1f5b80]">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30  backdrop-blur bg-white/80 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
                <Menu size={20} className="text-[#2772A0]" />
              </button>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-[#1E293B]">County Officer Dashboard</h2>
                <p className="text-sm text-gray-500">Data-driven decisions for your county.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1">
                <Search size={16} className="text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search schools, students, assessments..."
                  className="outline-none text-sm"
                  aria-label="Search"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">U</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Shimmer className="h-24" />
                <Shimmer className="h-24" />
                <Shimmer className="h-24" />
                <Shimmer className="h-24" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <Shimmer className="h-48 lg:col-span-2" />
                <Shimmer className="h-48" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold">{error}</div>
          ) : (
            <>
              {/* Overview */}
              {activeTab === "overview" && (
                <section className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Schools" value={overview.schoolsCount ?? "—"} subtitle="Total registered" icon={School} />
                    <StatCard title="Students" value={overview.studentsCount ?? "—"} subtitle="Across county" icon={Users} />
                    <StatCard title="Avg Attendance" value={`${overview.avgAttendance ?? "—"}%`} subtitle="This week" icon={ClipboardList} />
                    <StatCard title="Assignments" value={overview.assignmentsCount ?? "—"} subtitle="Active" icon={BookOpen} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#1E293B]">Weekly Attendance Trend</h3>
                        <div className="text-sm text-gray-500">Last 7 days</div>
                      </div>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={overview.weeklyAttendance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke={COLORS.oceanBlue} strokeWidth={3} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold text-[#1E293B] mb-4">AI Insights</h3>
                      <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={overview.aiTrend}>
                            <defs>
                              <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.oceanBlue} stopOpacity={0.18} />
                                <stop offset="100%" stopColor={COLORS.oceanBlue} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip />
                            <Area type="monotone" dataKey="score" stroke={COLORS.oceanBlue} fill="url(#aiGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <ul className="mt-4 text-sm text-gray-700 space-y-2">
                        <li>Prediction stability: <strong className="text-[#2772A0]">0.75</strong></li>
                        <li>Top intervention zones: Westlands, Kasarani</li>
                        <li>Resources backlog: <strong className="text-red-600">27 items</strong></li>
                      </ul>
                    </div>
                  </div>

                  <CountyOverview data={data.overview ?? {}} />
                </section>
              )}

              {/* Schools */}
              {activeTab === "schools" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2772A0]">Schools</h3>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-md bg-[#2772A0] text-white hover:bg-[#1f5b80]">Add School</button>
                    </div>
                  </div>

                  <Table
                    columns={[
                      { key: "name", title: "Name" },
                      { key: "code", title: "Code" },
                      { key: "subcounty", title: "Subcounty" },
                      { key: "students", title: "Students" },
                      {
                        key: "actions",
                        title: "Actions",
                        render: (r) => (
                          <div className="flex gap-2">
                            <button className="px-2 py-1 text-sm border rounded text-[#2772A0] border-[#2772A0]">View</button>
                            <button className="px-2 py-1 text-sm border rounded">Edit</button>
                          </div>
                        ),
                      },
                    ]}
                    rows={schoolsRows}
                  />
                </section>
              )}

              {/* Students */}
              {activeTab === "students" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2772A0]">Students</h3>
                    <button className="px-3 py-2 rounded-md bg-[#2772A0] text-white hover:bg-[#1f5b80]">Add Student</button>
                  </div>

                  <Table
                    columns={[
                      { key: "name", title: "Name" },
                      { key: "age", title: "Age" },
                      { key: "school", title: "School" },
                      {
                        key: "status",
                        title: "Status",
                        render: (r) => (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === "Present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {r.status}
                          </span>
                        ),
                      },
                      {
                        key: "actions",
                        title: "Actions",
                        render: (r) => <button className="px-2 py-1 text-sm border rounded">View</button>,
                      },
                    ]}
                    rows={studentsRows}
                  />
                </section>
              )}

              {/* Assessments */}
              {activeTab === "assessments" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2772A0]">Assessments</h3>
                    <button className="px-3 py-2 rounded-md bg-[#2772A0] text-white hover:bg-[#1f5b80]">Create</button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <h4 className="text-sm text-gray-500 mb-3">Recent Assessments</h4>
                      <pre className="text-xs text-gray-600 overflow-x-auto">{JSON.stringify(assessmentsRows.slice(0, 5), null, 2)}</pre>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <h4 className="text-sm text-gray-500 mb-3">Assessment Summary</h4>
                      <BarChart data={(assessmentsRows || []).slice(0, 6)} height={140}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip />
                        <Bar dataKey="score" fill={COLORS.oceanBlue} />
                      </BarChart>
                    </div>
                  </div>
                </section>
              )}

              {/* Resources */}
              {activeTab === "resources" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2772A0]">Resources</h3>
                    <button className="px-3 py-2 rounded-md bg-[#2772A0] text-white hover:bg-[#1f5b80]">Request Resource</button>
                  </div>

                  <Table
                    columns={[
                      { key: "title", title: "Title" },
                      { key: "school", title: "School" },
                      { key: "status", title: "Status" },
                      { key: "requested_by", title: "Requested By" },
                    ]}
                    rows={resourcesRows}
                  />
                </section>
              )}

              {/* AI Analytics */}
              {activeTab === "ai-analytics" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2772A0]">AI Analytics</h3>
                    <div className="text-sm text-gray-500">Model insights & predictions</div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="text-sm text-gray-500 mb-3">Prediction Trend</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data["ai-analytics"]?.trend ?? overview.aiTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke={COLORS.oceanBlue} strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="text-sm text-gray-500 mb-3">Top Insights</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        {(data["ai-analytics"]?.insights || [
                          "Attendance improving in intervention schools.",
                          "Resource fulfillment lagging in remote subcounties.",
                          "PD recommended for early-grade instruction.",
                        ]).map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
