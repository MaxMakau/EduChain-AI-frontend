// src/dashboard/CountyDashboard.js
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Home,
  Users,
  BookOpen,
  School,
  ClipboardList,
  TrendingUp,
  ChevronDown, // New import
  ChevronUp, // New import
  Menu,
  X,
  LogOut,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import CountyOverview from "./CountyOverview";
import logo from "../assets/logo.png";
import AIAnalytics from "./AIAnalytics";
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
  { id: "resources", label: "Resources", icon: ClipboardList },
  { id: "ai-analytics", label: "AI Analytics", icon: TrendingUp },
];

const endpoints = {
  overview: "/reports/dashboard/county/",
  schools: "/schools/all/",
  resources: "/schools/resources/",
  ai_analytics: "/reports/analytics/",
};

// Small shimmer for loading
const Shimmer = ({ className = "h-20" }) => (
  <div className={`animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`} />
);

// Reusable table component
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
              No data available
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

export default function CountyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState([]); // New state for expanded rows
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const token = localStorage.getItem("access_token");

  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }
    if (isSidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError("");
    const endpoint = endpoints[tab];
    if (!endpoint) return;
    try {
      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setData((prev) => ({ ...prev, [tab]: res.data }));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else {
        setError(err.response?.data?.detail || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Extract the tab from the URL pathname
    const pathSegments = location.pathname.split('/');
    const currentTab = pathSegments[pathSegments.length - 1];
    if (tabs.some(tab => tab.id === currentTab) && currentTab !== activeTab) {
      setActiveTab(currentTab);
    } else if (!tabs.some(tab => tab.id === currentTab) && activeTab !== "overview") {
      // Default to overview if no matching tab is found in URL and not already on overview
      setActiveTab("overview");
    }

    // Fetch data for the active tab (either from URL or default)
    if (activeTab === "ai-analytics") {
      // AIAnalytics component handles its own data fetching
      setLoading(false);
      return;
    }
    fetchTabData(activeTab);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, location.pathname]); // Depend on activeTab and location.pathname

  const schoolsRows = data.schools?.results || data.schools || [];
  const studentsRows = data.students?.results || data.students || [];
  const assessmentsRows = data.assessments?.results || data.assessments || [];
  const resourcesRows = data.resources?.results || data.resources || [];

  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const handleResourceAction = async (resourceId, status) => {
    try {
      setLoading(true);
      setError("");
      await axiosInstance.patch(`/schools/resources/${resourceId}/`, { status }, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      // After successful update, re-fetch resources data to reflect the changes
      await fetchTabData("resources");
    } catch (err) {
      console.error("Failed to update resource status:", err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axiosInstance.post("/users/logout/", { refresh: refreshToken });
      }
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-4 flex flex-col transform transition-transform duration-300 ease-in-out 
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
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-gray-100">
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
                      navigate(`/dashboard/officer/${t.id}`);
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2772A0] text-white font-semibold hover:bg-[#1f5b80]"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setIsSidebarOpen(true)}>
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
                />
              </div>

              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                U
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
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold">{error}</div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.section
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <CountyOverview data={data.overview ?? {}} />
                </motion.section>
              )}

              {activeTab === "schools" && (
                <motion.section
                  key="schools"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#2772A0]">Schools</h3>
                    <button className="px-3 py-2 rounded-md bg-[#2772A0] text-white hover:bg-[#1f5b80]">
                      Add School
                    </button>
                  </div>
                  <Table
                    columns={[
                      { key: "code", title: "Code" },
                      { key: "name", title: "Name" },
                      { key: "subcounty", title: "Subcounty" },
                      { 
                        key: "headteacher", 
                        title: "Headteacher", 
                        render: (row) => row.headteacher ? row.headteacher.split(' ')[0] + " " + row.headteacher.split(' ')[1].charAt(0) + "." : "N/A" 
                      },
                      { key: "total_teachers", title: "Teachers" },
                      { key: "total_students", title: "Students" },
                      { key: "assessment_average", title: "Avg. Assessments" },
                    ]}
                    rows={schoolsRows}
                  />
                </motion.section>
              )}

              {activeTab === "resources" && (
                <motion.section
                  key="resources"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-lg font-semibold text-[#2772A0] mb-4">Resources</h3>
                  <Table
                    columns={[
                      { key: "school", title: "School" },
                      { key: "resource_type", title: "Request Type" },
                      { key: "quantity", title: "Quantity" },
                      { key: "status", title: "Status" },
                      { key: "requested_by", title: "Requested By", render: (row) => row.requested_by ? row.requested_by.split(' ')[0] + " " + row.requested_by.split(' ')[1].charAt(0) + "." : "N/A" },
                      { key: "created_at", title: "Requested At", render: (row) => new Date(row.created_at).toLocaleDateString() },
                      {
                        key: "actions",
                        title: "Actions",
                        render: (row) => {
                          const isExpanded = expandedRows.includes(row.id);
                          return (
                            <div className="flex flex-col items-start">
                              <button onClick={() => toggleRowExpansion(row.id)} className="flex items-center text-blue-600 hover:text-blue-800">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span className="ml-1">Details</span>
                              </button>
                              {isExpanded && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md shadow-inner w-full">
                                  <p className="text-xs text-gray-700 mb-2"><strong>Description:</strong> {row.description}</p>
                                  {row.status === "PENDING" && (
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => handleResourceAction(row.id, "APPROVED")}
                                        className="px-3 py-1 text-xs rounded-md bg-green-500 text-white hover:bg-green-600"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleResourceAction(row.id, "REJECTED")}
                                        className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        },
                      },
                    ]}
                    rows={resourcesRows}
                  />
                </motion.section>
              )}

              {activeTab === "ai-analytics" && (
                <motion.section
                  key="ai-analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AIAnalytics />
                </motion.section>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
