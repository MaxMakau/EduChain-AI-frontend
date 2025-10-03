import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const FinancePanel = () => {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchFinance() {
      try {
        // Replace '1' with school id from context if available
        const res = await axiosInstance.get('/schools/finance/1/');
        setFinance(res.data);
      } catch (err) {
        setError('Failed to fetch finance details.');
      } finally {
        setLoading(false);
      }
    }
    fetchFinance();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
      <h3>Finance Management</h3>
      {finance ? (
        <div>
          <div><strong>Annual Budget:</strong> {finance.annual_budget}</div>
          <div><strong>Funds Received:</strong> {finance.funds_received}</div>
          <div><strong>Funds Spent:</strong> {finance.funds_spent}</div>
          {/* Add more fields as needed */}
        </div>
      ) : <div>No finance data found.</div>}
    </div>
  );
};

export default FinancePanel;