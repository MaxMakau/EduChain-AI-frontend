import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../api/dashboard';
import { useNavigate } from 'react-router-dom';
import TimetableForm from '../components/TimetableForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import ResourceRequestForm from '../components/ResourceRequestForm';
import ProfessionalDevelopmentLog from '../components/ProfessionalDevelopmentLog';
import SchoolOverview from '../components/SchoolOverview';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';
import StudentDetail from '../components/StudentDetail';
import AttendanceForm from '../components/AttendanceForm';
import BatchAssessmentForm from '../components/BatchAssessmentForm';
import {
  MessageSquareText,
  LogOut,
  Users,
  ClipboardCheck,
  FileText,
  CalendarDays,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import ChatInterface from '../components/chat/TeacherChatInterface';
import logo from '../assets/logo.png';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [studentId, setStudentId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDashboardData('TEACHER');
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data. Check API connection and role access.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const statsData = [
    { name: "Mon", attendance: 92 },
    { name: "Tue", attendance: 89 },
    { name: "Wed", attendance: 94 },
    { name: "Thu", attendance: 90 },
    { name: "Fri", attendance: 96 },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'assessments', label: 'Assessments', icon: FileText },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'leave', label: 'Leave Request', icon: ClipboardCheck },
    { id: 'resource', label: 'Resource Request', icon: FileText },
    { id: 'pdlog', label: 'Professional Development', icon: BookOpen },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-[#2772A0] font-semibold">
        Loading Teacher Dashboard...
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
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EduChain Logo" className="h-10 w-10 rounded-full" />
          <h1 className="text-[#2772A0] font-bold text-lg">Teacher Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden hover:bg-[#E2ECF3] p-2 rounded-full transition"
          >
            {isMenuOpen ? <X size={24} className="text-[#2772A0]" /> : <Menu size={24} className="text-[#2772A0]" />}
          </button>

          {/* Chat (Desktop Only) */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="hover:bg-[#E2ECF3] p-2 rounded-full transition hidden md:block"
            title="Open Chat"
          >
            <MessageSquareText size={24} className="text-[#2772A0]" />
          </button>

          {/* Logout (Desktop Only) */}
          <button
            onClick={logout}
            className="bg-[#2772A0] hover:bg-[#1f5b80] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition hidden md:flex"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden"></div>
      )}

      {/* Mobile Menu Drawer */}
      <div
        ref={menuRef}
        className={`fixed top-16 left-0 w-64 bg-white shadow-md z-50 p-4 transform transition-transform duration-300 md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
                tab === id ? 'bg-[#2772A0] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}

          {/* ✅ Logout button (Mobile view) */}
          <button
            onClick={logout}
            className="flex items-center gap-2 mt-4 bg-[#2772A0] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#1f5b80] transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="mt-24 px-4 sm:px-8 md:px-10 flex flex-col gap-8 pb-10 transition-all">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Welcome, {user?.first_name || 'Teacher'} 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Manage your classes, attendance, and professional logs efficiently.
          </p>
        </div>

        {/* Tab Buttons (Desktop) */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 border-b border-gray-200 pb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                tab === id ? 'bg-[#2772A0] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <Users className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Total Students</h3>
                <p className="text-2xl font-bold text-[#1E293B]">{data?.students.total || 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <ClipboardCheck className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Attendance Rate</h3>
                <p className="text-2xl font-bold text-[#1E293B]">93%</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <FileText className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Assignments</h3>
                <p className="text-2xl font-bold text-[#1E293B]">{data?.assignments_count || 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <BookOpen className="text-[#2772A0] mb-2" />
                <h3 className="text-gray-600">Lessons This Week</h3>
                <p className="text-2xl font-bold text-[#1E293B]">{data?.lessons_count || 0}</p>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-[#1E293B] font-semibold mb-4">Weekly Attendance Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#2772A0" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* School Overview */}
            <SchoolOverview overview={data} />
          </div>
        )}

        {/* Other Tabs */}
        {tab === 'attendance' && <AttendanceForm />}
        {tab === 'assessments' && <BatchAssessmentForm />}
        {tab === 'timetable' && <TimetableForm />}
        {tab === 'leave' && <LeaveRequestForm />}
        {tab === 'resource' && <ResourceRequestForm />}
        {tab === 'pdlog' && <ProfessionalDevelopmentLog />}

        {/* Students Section */}
        {tab === 'students' && (
          <div>
            {!showForm && !showDetail && (
              <>
                <button
                  className="bg-[#2772A0] text-white px-4 py-2 rounded-lg font-medium mb-4 hover:bg-[#1f5b80] transition"
                  onClick={() => {
                    setStudentId(null);
                    setShowForm(true);
                  }}
                >
                  + Add Student
                </button>
                <StudentList
                  onSelect={(id, edit) => {
                    if (edit) {
                      setStudentId(id);
                      setShowForm(true);
                    } else {
                      setStudentId(id);
                      setShowDetail(true);
                    }
                  }}
                  canEdit={true}
                />
              </>
            )}
            {showForm && (
              <StudentForm
                studentId={studentId}
                onSuccess={() => {
                  setShowForm(false);
                  setStudentId(null);
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
            {showDetail && (
              <StudentDetail
                studentId={studentId}
                onClose={() => {
                  setShowDetail(false);
                  setStudentId(null);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Chat */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default TeacherDashboard;
