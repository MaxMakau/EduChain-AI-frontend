import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ProfessionalDevelopmentLog = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [log, setLog] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchPD() {
      try {
        const res = await axiosInstance.get('/schools/pd/');
        setLog(res.data.filter(pd => pd.teacher === user?.id));
      } catch {
        setLog([]);
      }
    }
    fetchPD();
  }, [user]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post('/schools/pd/', {
        teacher: user?.id,
        title: activity,
        date_from: dateFrom,
        date_to: dateTo
      });
      setMessage('Professional development activity added!');
      setActivity(''); setDateFrom(''); setDateTo('');
      // Optionally, refetch log
    } catch (err) {
      setMessage('Failed to add activity.');
    }
  };

  return (
    <div className="card" style={{maxWidth: 500, margin: '0 auto'}}>
      <h3>Professional Development Log</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Start Date</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>End Date</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Activity</label>
          <input value={activity} onChange={e => setActivity(e.target.value)} required />
        </div>
        <button className="button primary" type="submit">Add</button>
        {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
      </form>
      <div style={{marginTop: 20}}>
        <h4>My Activities</h4>
        <ul>
          {log.map((item, idx) => (
            <li key={idx}>{item.date_from} - {item.date_to || ''}: {item.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfessionalDevelopmentLog;