import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const ResourceApprovalPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await axiosInstance.get('/schools/resources/');
        setRequests(res.data);
      } catch (err) {
        setError('Failed to fetch resource requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`/schools/resources/${id}/`, { status });
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    } catch {
      setError('Failed to update request status.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
      <h3>Resource Requests</h3>
      {requests.length === 0 ? <div>No requests found.</div> : (
        <table style={{width: '100%', marginTop: 10}}>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td>{r.resource_type} - {r.description}</td>
                <td>{r.quantity}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === 'PENDING' && (
                    <>
                      <button className="button" onClick={() => handleStatus(r.id, 'APPROVED')}>Approve</button>
                      <button className="button" onClick={() => handleStatus(r.id, 'REJECTED')}>Reject</button>
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

export default ResourceApprovalPanel;