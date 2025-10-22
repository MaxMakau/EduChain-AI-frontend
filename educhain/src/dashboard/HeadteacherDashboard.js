import React, { useEffect, useState } from "react";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardData } from "../api/dashboard";

import {
  Bell,
  Search,
  LogOut,
  Users,
  ClipboardCheck,
  FileText,
  CalendarDays,
  Banknote,
  BarChart3,
  Target,
  BookOpen,
  Package,
  Menu,
  X,
} from "lucide-react";

import SchoolOverview from "../components/SchoolOverview";
import ResourceApprovalPanel from "../components/ResourceApprovalPanel";
import FinancePanel from "../components/FinancePanel";
import TimetableApprovalPanel from "../components/TimetableApprovalPanel";
import LeaveApprovalPanel from "../components/LeaveApprovalPanel";
import TeacherEvaluationPanel from "../components/TeacherEvaluationPanel";
import StrategicPlanningPanel from "../components/StrategicPlanningPanel";
import StudentList from "../components/StudentList";
import StudentDetail from "../components/StudentDetail";
import InventoryManagement from "../dashboard/InventoryManagement";
import AIAnalytics from "../dashboard/AIAnalytics";
import ChatInterface from "../components/chat/TeacherChatInterface";
import logo from "../assets/logo.png";

const theme = {
  colors: {
    gradientStart: "#F6EFC9",
    gradientEnd: "#C8F3F1",
    primary: "#2563EB",
    primaryLight: "#3B82F6",
    primaryGradient: "linear-gradient(90deg,#2b6be6,#3b82f6)",
    background: "#F8FAFC",
    white: "#FFFFFF",
    textDark: "#0f172a",
    textMuted: "#64748B",
  },
  transition: "all 240ms cubic-bezier(.2,.9,.2,1)",
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DashboardLayout = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    ${({ theme }) => theme.colors.gradientStart},
    ${({ theme }) => theme.colors.gradientEnd}
  );
  overflow: hidden;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
`;

const Sidebar = styled.aside`
  width: 260px;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 18px;
  transition: ${({ theme }) => theme.transition};

  @media (max-width: 900px) {
    position: fixed;
    top: 0;
    left: ${({ $open }) => ($open ? "0" : "-280px")};
    height: 100vh;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;

  img {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: white;
  }

  h1 {
    font-size: 16px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.textDark};
  }

  @media (max-width: 900px) {
    h1 {
      display: none;
    }
  }
`;

const SidebarCurved = styled.div`
  margin-top: 14px;
  flex: 1;
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-top-right-radius: 48px;
  border-bottom-right-radius: 0;
  padding: 20px 18px;
  box-shadow: 6px 10px 36px rgba(37, 99, 235, 0.14);
  animation: ${fadeIn} 300ms ease both;
`;

const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: ${({ active, theme }) =>
    active ? theme.colors.primaryGradient : "transparent"};
  color: ${({ active }) => (active ? "#fff" : "rgba(255,255,255,0.9)")};
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  border: none;
  border-radius: ${({ active }) =>
    active ? "12px 28px 28px 12px" : "10px 0 0 10px"};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};
  box-shadow: ${({ active }) =>
    active ? "0 10px 30px rgba(43,107,230,0.18)" : "none"};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: white;
    transform: translateX(4px);
  }

  svg {
    flex-shrink: 0;
    min-width: 18px;
  }
`;

const LogoutButton = styled(NavItem)`
  margin-top: auto;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Topbar = styled.header`
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: transparent;
  z-index: 2;
`;

const TopbarInner = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 14px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 30px rgba(12, 28, 51, 0.06);

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const Hamburger = styled.div`
  display: none;
  cursor: pointer;
  @media (max-width: 900px) {
    display: block;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 10px 14px;
  flex: 1;
  max-width: 720px;

  input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    color: ${({ theme }) => theme.colors.textDark};
    font-size: 14px;
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;

  .icon {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textDark};
    padding: 8px;
    border-radius: 8px;
    transition: ${({ theme }) => theme.transition};
    &:hover {
      background: rgba(37, 99, 235, 0.08);
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 10px;
    background: ${({ theme }) => theme.colors.background};
    padding: 6px 12px;
    border-radius: 999px;
  }

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .teacherName {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textDark};
  }
`;

const Content = styled.section`
  flex: 1;
  overflow-y: auto;
  padding: 26px 20px;
`;

const HeadteacherDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [overviewData, setOverviewData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "resource", label: "Resources", icon: FileText },
    { id: "finance", label: "Finance", icon: Banknote },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "analytics", label: "AI Analytics", icon: Target },
    { id: "timetable", label: "Timetable", icon: CalendarDays },
    { id: "leave", label: "Leave", icon: ClipboardCheck },
    { id: "evaluation", label: "Evaluation", icon: BookOpen },
    { id: "planning", label: "Planning", icon: Target },
    { id: "students", label: "Students", icon: Users },
  ];

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await fetchDashboardData("HEADTEACHER");
        setOverviewData(data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    loadOverview();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <DashboardLayout>
        {/* SIDEBAR */}
        <Sidebar $open={sidebarOpen}>
          <SidebarHeader>
            <img src={logo} alt="EduChain" />
            <h1>EduChain</h1>
          </SidebarHeader>

          <SidebarCurved>
            <SidebarMenu>
              {tabs.map(({ id, label, icon: Icon }) => (
                <NavItem
                  key={id}
                  active={tab === id}
                  onClick={() => {
                    setTab(id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavItem>
              ))}
              <LogoutButton onClick={logout}>
                <LogOut size={18} />
                <span>Logout</span>
              </LogoutButton>
            </SidebarMenu>
          </SidebarCurved>
        </Sidebar>

        {/* MAIN CONTENT */}
        <Main>
          <Topbar>
            <TopbarInner>
              <Hamburger onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
              </Hamburger>

              <SearchBar>
                <Search size={18} color="#64748B" />
                <input placeholder="Search..." />
              </SearchBar>

              <TopRight>
                <button className="icon">
                  <Bell size={20} />
                </button>
                <div className="profile">
                  <div className="avatar">{user?.first_name?.[0] ?? "H"}</div>
                  <div className="teacherName">
                    {user?.first_name ?? "Headteacher"}
                  </div>
                </div>
              </TopRight>
            </TopbarInner>
          </Topbar>

          <Content>
            {tab === "overview" && <SchoolOverview overview={overviewData} />}
            {tab === "resource" && <ResourceApprovalPanel />}
            {tab === "finance" && <FinancePanel />}
            {tab === "inventory" && (
              <InventoryManagement dashboardData={overviewData} />
            )}
            {tab === "analytics" && (
              <AIAnalytics dashboardData={overviewData} user={user} />
            )}
            {tab === "timetable" && <TimetableApprovalPanel />}
            {tab === "leave" && <LeaveApprovalPanel />}
            {tab === "evaluation" && <TeacherEvaluationPanel />}
            {tab === "planning" && <StrategicPlanningPanel />}
            {tab === "students" && (
              <>
                {!studentId && (
                  <StudentList
                    onSelect={(id) => setStudentId(id)}
                    canEdit={false}
                  />
                )}
                {studentId && (
                  <StudentDetail
                    studentId={studentId}
                    onClose={() => setStudentId(null)}
                  />
                )}
              </>
            )}
          </Content>
        </Main>

        <ChatInterface isOpen={false} onClose={() => {}} />
      </DashboardLayout>
    </ThemeProvider>
  );
};

export default HeadteacherDashboard;
