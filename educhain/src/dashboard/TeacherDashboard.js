import React, { useEffect, useState } from 'react';
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

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [studentId, setStudentId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDashboardData('TEACHER');
        setData(result);
      } catch (err) {
        setError('Failed to load school dashboard data. Check API connection and role access.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, navigate]);

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

  if (loading) return <div className="app-container">Loading Teacher Dashboard...</div>;
  if (error) return <div className="app-container error-message">Error: {error}</div>;

  return (
    <div className="app-container">
      <div style={headerStyle}>
        <h1 style={{margin: 0}}>Teacher Dashboard</h1>
        <p>Welcome, {user?.first_name || user?.email} (Role: {user?.role})</p>
        <button className="button" style={{width: 'auto', backgroundColor: '#e7e7e7', color: 'var(--color-text)'}} onClick={logout}>Logout</button>
      </div>

      <div style={tabStyle}>
        <button style={tabButtonStyle(tab === 'overview')} onClick={() => setTab('overview')}>Overview</button>
        <button style={tabButtonStyle(tab === 'timetable')} onClick={() => setTab('timetable')}>Timetable</button>
        <button style={tabButtonStyle(tab === 'leave')} onClick={() => setTab('leave')}>Leave Request</button>
        <button style={tabButtonStyle(tab === 'resource')} onClick={() => setTab('resource')}>Resource Request</button>
        <button style={tabButtonStyle(tab === 'pdlog')} onClick={() => setTab('pdlog')}>Professional Development</button>
        <button style={tabButtonStyle(tab === 'students')} onClick={() => setTab('students')}>Students</button>
      </div>

      {tab === 'overview' && (
        <SchoolOverview overview={data} />
      )}

      {tab === 'timetable' && <TimetableForm />}
      {tab === 'leave' && <LeaveRequestForm />}
      {tab === 'resource' && <ResourceRequestForm />}
      {tab === 'pdlog' && <ProfessionalDevelopmentLog />}
      
      {tab === 'students' && (
        <div>
          {!showForm && (
            <>
              <button className="button primary" onClick={() => { setStudentId(null); setShowForm(true); }}>Add Student</button>
              <StudentList onSelect={(id, edit) => { setStudentId(edit ? id : null); setShowForm(edit); }} canEdit={true} />
            </>
          )}
          {showForm && (
            <StudentForm studentId={studentId} onSuccess={() => { setShowForm(false); setStudentId(null); }} onCancel={() => setShowForm(false)} />
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
