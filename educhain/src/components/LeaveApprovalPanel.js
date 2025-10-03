import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const LeaveApprovalPanel = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const res = await axiosInstance.get('/schools/leaves/');
        setLeaves(res.data);
      } catch (err) {
        setError('Failed to fetch leave requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaves();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await axiosInstance.post(`/schools/leaves/${id}/review/`, { status });
      setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
    } catch {
      setError('Failed to update leave status.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
      <h3>Leave Management</h3>
      {leaves.length === 0 ? <div>No leave requests found.</div> : (
        <table style={{width: '100%', marginTop: 10}}>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id}>
                <td>{l.teacher_name || l.teacher}</td>
                <td>{l.start_date} - {l.end_date}</td>
                <td>{l.reason}</td>
                <td>{l.status}</td>
                <td>
                  {l.status === 'PENDING' && (
                    <>
                      <button className="button" onClick={() => handleReview(l.id, 'APPROVED')}>Approve</button>
                      <button className="button" onClick={() => handleReview(l.id, 'REJECTED')}>Reject</button>
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

export default LeaveApprovalPanel;