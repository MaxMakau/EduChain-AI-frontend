import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const TimetableApprovalPanel = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isLoading: authLoading } = useAuth(); // Get isLoading from useAuth

  useEffect(() => {
    async function fetchTimetables() {
      if (authLoading) return; // Wait for auth to load

      const schoolId = user?.managed_school?.id || user?.school; // Corrected: user?.school instead of user?.school?.id
      if (!schoolId) {
        setError('School ID not found. Headteacher must manage a school.');
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get(`/schools/timetable/${schoolId}/`); // Use dynamic schoolId
        setTimetables(res.data.schedules || []);
      } catch (err) {
        setError('Failed to fetch timetables.');
      } finally {
        setLoading(false);
      }
    }
    fetchTimetables();
  }, [user, authLoading]); // Add authLoading as a dependency

  const handleStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`/schools/timetable/${id}/`, { status }); // Use patch
      setTimetables(timetables.map(t => t.id === id ? { ...t, status } : t));
    } catch {
      setError('Failed to update timetable status.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
      <h3>Timetable Oversight</h3>
      {timetables.length === 0 ? 
        <div className="text-center p-4 text-gray-600">
          <p>No timetables have been added for your school.</p>
          <p className="mt-2">Please encourage your school teachers to update/submit their timetables and duty rosters.</p>
        </div> 
        : (
        <table style={{width: '100%', marginTop: 10}}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Day</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {timetables.map(t => (
              <tr key={t.id}>
                <td>{t.subject}</td>
                <td>{t.day}</td>
                <td>{t.time}</td>
                <td>{t.status}</td>
                <td>
                  {t.status === 'PENDING' && (
                    <>
                      <button className="button" onClick={() => handleStatus(t.id, 'APPROVED')}>Approve</button>
                      <button className="button" onClick={() => handleStatus(t.id, 'NEEDS_CHANGE')}>Needs Change</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TimetableApprovalPanel;