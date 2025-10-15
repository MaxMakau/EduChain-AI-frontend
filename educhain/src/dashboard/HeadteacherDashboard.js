import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardData } from "../api/dashboard";
import ResourceApprovalPanel from "../components/ResourceApprovalPanel";
import FinancePanel from "../components/FinancePanel";
import TimetableApprovalPanel from "../components/TimetableApprovalPanel";
import LeaveApprovalPanel from "../components/LeaveApprovalPanel";
import TeacherEvaluationPanel from "../components/TeacherEvaluationPanel";
import StrategicPlanningPanel from "../components/StrategicPlanningPanel";
import SchoolOverview from "../components/SchoolOverview";
import StudentList from "../components/StudentList";
import StudentDetail from "../components/StudentDetail";
import ChatInterface from "../components/chat/TeacherChatInterface";
import InventoryManagement from "../dashboard/InventoryManagement"; // Corrected import path
import {
  Users,
  ClipboardCheck,
  FileText,
  CalendarDays,
  LogOut,
  MessageSquareText,
  BarChart3,
  Menu,
  X,
  Banknote,
  BookOpen,
  Brain,
  Target,
  Package, // NEW IMPORT
} from "lucide-react";
import logo from "../assets/logo.png";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const HeadteacherDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDashboardData("HEADTEACHER");
        setData(result);
      } catch (err) {
        setError("Failed to load dashboard data. Check API connection and role access.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statsData = [
    { name: "Mon", attendance: 92 },
    { name: "Tue", attendance: 90 },
    { name: "Wed", attendance: 94 },
    { name: "Thu", attendance: 89 },
    { name: "Fri", attendance: 95 },
  ];

  const performanceData = [
    { term: "Term 1", avg: 75 },
    { term: "Term 2", avg: 78 },
    { term: "Term 3", avg: 82 },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "resource", label: "Resource Management", icon: FileText },
    { id: "finance", label: "Finance", icon: Banknote },
    { id: "inventory", label: "Inventory Management", icon: Package }, // NEW TAB
    { id: "timetable", label: "Timetable Oversight", icon: CalendarDays },
    { id: "leave", label: "Leave Management", icon: ClipboardCheck },
    { id: "evaluation", label: "Teacher Evaluation", icon: BookOpen },
    { id: "planning", label: "Strategic Planning", icon: Target },
    { id: "students", label: "Students", icon: Users },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-[#2772A0] font-semibold">
        Loading Headteacher Dashboard...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EduChain Logo" className="h-10 w-10 rounded-full" />
          <h1 className="text-[#2772A0] font-bold text-lg">Headteacher Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden hover:bg-[#E2ECF3] p-2 rounded-full transition"
          >
            {isMenuOpen ? <X size={24} className="text-[#2772A0]" /> : <Menu size={24} className="text-[#2772A0]" />}
          </button>

          {/* Chat */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="hover:bg-[#E2ECF3] p-2 rounded-full transition hidden md:block"
            title="Open Chat"
          >
            <MessageSquareText size={24} className="text-[#2772A0]" />
          </button>

          {/* Logout (Desktop) */}
          <button
            onClick={logout}
            className="bg-[#2772A0] hover:bg-[#1f5b80] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition hidden md:flex"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden"></div>}

      {/* Mobile Drawer */}
      <div
        ref={menuRef}
        className={`fixed top-16 left-0 w-64 bg-white shadow-md z-50 p-4 transform transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setIsMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                tab === id ? "bg-[#2772A0] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
          {/* Mobile Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 mt-4 bg-[#2772A0] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1f5b80] transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <main className="mt-24 px-4 sm:px-8 md:px-10 flex flex-col gap-8 pb-10 transition-all">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Welcome, {user?.first_name || "Headteacher"} 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Oversee school-wide operations, performance, and strategic initiatives.
          </p>
        </div>

        {/* Tabs (Desktop) */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 border-b border-gray-200 pb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                tab === id ? "bg-[#2772A0] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <Users className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Total Students</h3>
                <p className="text-2xl font-bold text-[#1E293B]">{data?.students?.total || 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <BookOpen className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Total Teachers</h3>
                <p className="text-2xl font-bold text-[#1E293B]">{data?.teachers?.total || 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <ClipboardCheck className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Attendance Rate</h3>
                <p className="text-2xl font-bold text-[#1E293B]">94%</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <Target className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Ongoing Projects</h3>
                <p className="text-2xl font-bold text-[#1E293B]">4</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-[#1E293B] font-semibold mb-4">
                  Weekly Attendance Overview
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="attendance"
                        stroke="#2772A0"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-[#1E293B] font-semibold mb-4">
                  Academic Performance (Avg)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="term" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Bar dataKey="avg" fill="#2772A0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* School Overview */}
            <SchoolOverview overview={data} />
          </div>
        )}

        {/* PANELS */}
        {tab === "resource" && <ResourceApprovalPanel />}
        {tab === "finance" && <FinancePanel />}
        {tab === "inventory" && <InventoryManagement />} {/* Render InventoryManagement component */}
        {tab === "timetable" && <TimetableApprovalPanel />}
        {tab === "leave" && <LeaveApprovalPanel />}
        {tab === "evaluation" && <TeacherEvaluationPanel />}
        {tab === "planning" && <StrategicPlanningPanel />}
        {tab === "students" && (
          <div>
            {!studentId && (
              <StudentList onSelect={(id) => setStudentId(id)} canEdit={false} />
            )}
            {studentId && (
              <StudentDetail studentId={studentId} onClose={() => setStudentId(null)} />
            )}
          </div>
        )}
      </main>

      {/* CHAT */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default HeadteacherDashboard;
