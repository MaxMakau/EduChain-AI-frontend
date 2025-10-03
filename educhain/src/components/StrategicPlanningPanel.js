import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const StrategicPlanningPanel = () => {
  const [plan, setPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // You may want to POST to a dedicated endpoint, here is a placeholder
      // await axiosInstance.post('/schools/strategic-plans/', { plan });
      setPlans([...plans, { plan, date: new Date().toISOString().slice(0,10) }]);
      setMessage('Strategic plan submitted!');
      setPlan('');
    } catch {
      setError('Failed to submit strategic plan.');
    }
  };

  return (
    <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
      <h3>Strategic Planning</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Plan/Goal</label>
          <textarea value={plan} onChange={e => setPlan(e.target.value)} required />
        </div>
        <button className="button primary" type="submit">Submit Plan</button>
        {message && <div style={{color: 'green', marginTop: 10}}>{message}</div>}
        {error && <div style={{color: 'red', marginTop: 10}}>{error}</div>}
      </form>
      <div style={{marginTop: 20}}>
        <h4>Submitted Plans</h4>
        <ul>
          {plans.map((p, idx) => (
            <li key={idx}>{p.date}: {p.plan}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StrategicPlanningPanel;