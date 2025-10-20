import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../api/dashboard';
import { useNavigate } from 'react-router-dom';
import SchoolTimetableAndRoster from '../components/SchoolTimetableAndRoster';
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

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [overviewData, setOverviewData] = useState(null);
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

  // ✅ Fetch ONLY school overview data
  useEffect(() => {
    const loadOverview = async () => {
      try {
        const result = await fetchDashboardData('TEACHER');
        // Assuming your API returns all data but SchoolOverview is part of it
        setOverviewData(result?.school_overview || result);
      } catch (err) {
        setError('Failed to load School Overview. Check API connection and role access.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, [user, navigate]);

  // Close mobile menu when clicking outside
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
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden hover:bg-[#E2ECF3] p-2 rounded-full transition"
          >
            {isMenuOpen ? <X size={24} className="text-[#2772A0]" /> : <Menu size={24} className="text-[#2772A0]" />}
          </button>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="hover:bg-[#E2ECF3] p-2 rounded-full transition hidden md:block"
            title="Open Chat"
          >
            <MessageSquareText size={24} className="text-[#2772A0]" />
          </button>

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

        {/* Tab Buttons */}
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

        {/* ✅ Overview Tab - Only fetch and show SchoolOverview */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <SchoolOverview overview={overviewData} />
          </div>
        )}

        {/* Other Tabs */}
        {tab === 'attendance' && <AttendanceForm />}
        {tab === 'assessments' && <BatchAssessmentForm />}
        {tab === 'timetable' && <SchoolTimetableAndRoster />}
        {tab === 'leave' && <LeaveRequestForm />}
        {tab === 'resource' && <ResourceRequestForm />}
        {tab === 'pdlog' && <ProfessionalDevelopmentLog />}

        {/* Students Tab */}
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
