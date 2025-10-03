import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TimetableApprovalPanel = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTimetables() {
      try {
        // Replace '1' with school id from context if available
        const res = await axiosInstance.get('/schools/timetable/1/');
        setTimetables(res.data.schedules || []);
      } catch (err) {
        setError('Failed to fetch timetables.');
      } finally {
        setLoading(false);
      }
    }
    fetchTimetables();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/schools/timetable/${id}/`, { status });
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
      {timetables.length === 0 ? <div>No timetables found.</div> : (
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