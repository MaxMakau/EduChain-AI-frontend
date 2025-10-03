import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const LeaveRequestForm = () => {
  const [reason, setReason] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post('/schools/leaves/', {
        start_date: dateFrom,
        end_date: dateTo,
        reason
      });
      setMessage('Leave request submitted!');
      setReason(''); setDateFrom(''); setDateTo('');
    } catch (err) {
      setMessage('Failed to submit leave request.');
    }
  };

  return (
    <div className="card" style={{maxWidth: 500, margin: '0 auto'}}>
      <h3>Request Leave</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Start Date</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>End Date</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Reason</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} required />
        </div>
        <button className="button primary" type="submit">Submit</button>
        {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
      </form>
    </div>
  );
};

export default LeaveRequestForm;