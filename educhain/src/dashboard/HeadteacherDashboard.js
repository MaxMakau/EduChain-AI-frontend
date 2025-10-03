import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../api/dashboard';
import ResourceApprovalPanel from '../components/ResourceApprovalPanel';
import FinancePanel from '../components/FinancePanel';
import TimetableApprovalPanel from '../components/TimetableApprovalPanel';
import LeaveApprovalPanel from '../components/LeaveApprovalPanel';
import TeacherEvaluationPanel from '../components/TeacherEvaluationPanel';
import StrategicPlanningPanel from '../components/StrategicPlanningPanel';
import SchoolOverview from '../components/SchoolOverview';
import StudentList from '../components/StudentList';
import StudentDetail from '../components/StudentDetail';

const HeadteacherDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDashboardData('HEADTEACHER');
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data. Check API connection and role access.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const headerStyle = { 
    backgroundColor: 'var(--color-secondary)', 
    color: 'var(--color-white)', 
    padding: '20px', 
    borderRadius: 'var(--border-radius)',
    marginBottom: '20px'
  };

  const tabStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center'
  };

  const tabButtonStyle = active => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid #eee',
    background: 'none',
    color: active ? 'var(--color-primary)' : '#888',
    fontWeight: active ? 'bold' : 'normal',
    cursor: 'pointer',
    outline: 'none',
    fontSize: '1rem',
  });

  if (loading) return <div className="app-container">Loading Headteacher Dashboard...</div>;
  if (error) return <div className="app-container error-message">Error: {error}</div>;

  return (
    <div className="app-container">
      <div style={headerStyle}>
        <h1 style={{margin: 0}}>Headteacher Dashboard</h1>
        <p>Welcome, {user?.first_name || user?.email} (Role: {user?.role})</p>
        <button className="button" style={{width: 'auto', backgroundColor: '#e7e7e7', color: 'var(--color-text)'}} onClick={logout}>Logout</button>
      </div>

      <div style={tabStyle}>
        <button style={tabButtonStyle(tab === 'overview')} onClick={() => setTab('overview')}>Overview</button>
        <button style={tabButtonStyle(tab === 'resource')} onClick={() => setTab('resource')}>Resource Management</button>
        <button style={tabButtonStyle(tab === 'finance')} onClick={() => setTab('finance')}>Finance</button>
        <button style={tabButtonStyle(tab === 'timetable')} onClick={() => setTab('timetable')}>Timetable Oversight</button>
        <button style={tabButtonStyle(tab === 'leave')} onClick={() => setTab('leave')}>Leave Management</button>
        <button style={tabButtonStyle(tab === 'evaluation')} onClick={() => setTab('evaluation')}>Teacher Evaluation</button>
        <button style={tabButtonStyle(tab === 'planning')} onClick={() => setTab('planning')}>Strategic Planning</button>
        <button style={tabButtonStyle(tab === 'students')} onClick={() => setTab('students')}>Students</button>
      </div>

      {tab === 'overview' && (
        <SchoolOverview overview={data} />
      )}

      {tab === 'resource' && <ResourceApprovalPanel />}
      {tab === 'finance' && <FinancePanel />}
      {tab === 'timetable' && <TimetableApprovalPanel />}
      {tab === 'leave' && <LeaveApprovalPanel />}
      {tab === 'evaluation' && <TeacherEvaluationPanel />}
      {tab === 'planning' && <StrategicPlanningPanel />}
      {tab === 'students' && (
        <div>
          {!studentId && (
            <StudentList onSelect={id => setStudentId(id)} canEdit={false} />
          )}
          {studentId && (
            <StudentDetail studentId={studentId} onClose={() => setStudentId(null)} />
          )}
        </div>
      )}
    </div>
  );
};

export default HeadteacherDashboard;