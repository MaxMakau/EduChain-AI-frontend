import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../api/reports';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDashboardData('PARENT');
        setData(result);
      } catch (err) {
        setError('Failed to load parent dashboard data. Check API connection and role access.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const headerStyle = { 
    backgroundColor: 'var(--color-primary)', 
    color: 'var(--color-white)', 
    padding: '20px', 
    borderRadius: 'var(--border-radius)',
    marginBottom: '20px'
  };
  
  if (loading) return <div className="app-container">Loading Parent Dashboard...</div>;
  if (error) return <div className="app-container error-message">Error: {error}</div>;

  return (
    <div className="app-container">
      <div style={headerStyle}>
        <h1 style={{margin: 0}}>Parent Dashboard</h1>
        <p>Welcome, {user?.first_name || user?.email} (Role: {user?.role})</p>
        <button className="button" style={{width: 'auto', backgroundColor: '#e7e7e7', color: 'var(--color-text)'}} onClick={logout}>Logout</button>
      </div>

      <div className="card" style={{maxWidth: 'none', margin: 0}}>
        <h3>Student Progress Overview</h3>
        <p>Data successfully retrieved from: <code>/reports/dashboard/parent/</code></p>
        
        {/* Render JSON for easy inspection */}
        <pre style={{backgroundColor: '#eee', padding: '15px', borderRadius: '5px', overflowX: 'auto'}}>
          {JSON.stringify(data, null, 2)}
        </pre>
        
        {/* Mock Data Display */}
        {data && data.student_stats && (
          <div style={{marginTop: '20px'}}>
            <p><strong>Student Name:</strong> {data.student_stats.name}</p>
            <p><strong>Attendance %:</strong> <span style={{color: 'var(--color-secondary)'}}>{data.student_stats.attendance_percent}%</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
