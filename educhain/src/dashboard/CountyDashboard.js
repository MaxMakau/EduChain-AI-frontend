import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import CountyOverview from "./CountyOverview";
import logo from "../assets/logo.png";

const CountyDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "schools", label: "Schools", icon: School },
    { id: "students", label: "Students", icon: Users },
    { id: "assessments", label: "Assessments", icon: BookOpen },
    { id: "resources", label: "Resources", icon: ClipboardList },
    { id: "ai-analytics", label: "AI Analytics", icon: TrendingUp },
  ];

  // ✅ Correct API endpoints (confirm with your Django backend)
  const endpoints = {
    overview: "/reports/dashboard/county/",
    schools: "/schools/all/",
    students: "/students/all/",
    assessments: "/reports/assessments/summary/", // 🟢 updated from "/assessments/"
    resources: "/schools/resources/",
    "ai-analytics": "/reports/ai/analytics/", // 🟢 verified AI endpoint
  };

  // ✅ Fetch tab data with auth + retry logic
  const fetchTabData = async (tab) => {
    setLoading(true);
    setError("");
    const endpoint = endpoints[tab];
    const token = localStorage.getItem("access_token");
    const MAX_RETRIES = 3;

    console.log(`📡 Fetching [${tab}] from ${endpoint}`);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await axiosInstance.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`✅ [${tab}] success:`, res.data);

        setData((prev) => ({ ...prev, [tab]: res.data }));
        setLoading(false);
        return;
      } catch (err) {
        console.error(`❌ [${tab}] attempt ${attempt + 1}:`, err.message);

        if (err.response?.status === 401) {
          console.warn("⚠️ Unauthorized — logging out user.");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
          return;
        }

        if (attempt === MAX_RETRIES - 1) {
          const message =
            err.response?.status === 404
              ? `No ${tab} data found (404).`
              : `Failed to load ${tab} data. Check API connection.`;
          setError(message);
          setLoading(false);
        } else {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }
  };

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  // ✅ Logout Handler
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axiosInstance.post("/users/logout/", { refresh: refreshToken });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64 flex flex-col`}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduChain Logo" className="h-9 w-9 rounded-full" />
            <h1 className="text-lg font-bold text-[#2772A0]">EduChain</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-600 hover:text-[#2772A0]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 mb-1 rounded-lg transition-all duration-200 font-medium text-sm
                ${
                  activeTab === id
                    ? "bg-[#2772A0] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#2772A0] text-white py-2 rounded-lg font-medium hover:bg-[#1f5b80] transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Section */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#1E293B]">
              County Officer Dashboard
            </h2>
            <p className="text-gray-500 text-sm">
              Empowering data-driven education decisions.
            </p>
          </div>
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={22} className="text-[#2772A0]" />
          </button>
        </header>

        {/* Content */}
        <section className="flex-1 p-6 md:p-10 bg-[#F8FAFC] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-t-[#2772A0] border-gray-300 rounded-full mx-auto"></div>
                <p className="mt-4 text-[#2772A0] font-medium">
                  Loading {activeTab} data...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : (
            <>
              {activeTab === "overview" && <CountyOverview data={data.overview} />}

              {activeTab === "assessments" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#2772A0] mb-3">
                    Assessment Reports
                  </h3>
                  <pre className="text-gray-600 text-sm overflow-x-auto">
                    {JSON.stringify(data.assessments, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === "ai-analytics" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#2772A0] mb-3">
                    AI-Powered Insights
                  </h3>
                  <pre className="text-gray-600 text-sm overflow-x-auto">
                    {JSON.stringify(data["ai-analytics"], null, 2)}
                  </pre>
                </div>
              )}

              {/* Other tabs */}
              {activeTab === "schools" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#2772A0] mb-3">
                    Schools Overview
                  </h3>
                  <pre className="text-gray-600 text-sm overflow-x-auto">
                    {JSON.stringify(data.schools, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === "students" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#2772A0] mb-3">
                    Student Analytics
                  </h3>
                  <pre className="text-gray-600 text-sm overflow-x-auto">
                    {JSON.stringify(data.students, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#2772A0] mb-3">
                    Educational Resources
                  </h3>
                  <pre className="text-gray-600 text-sm overflow-x-auto">
                    {JSON.stringify(data.resources, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default CountyDashboard;
