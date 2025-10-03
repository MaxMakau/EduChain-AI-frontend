import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TimetableForm = () => {
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Replace '1' with school id from context/user if available
      await axiosInstance.put('/schools/timetable/1/', {
        subject,
        day,
        time,
        status: 'PENDING'
      });
      setMessage('Timetable proposal submitted!');
      setSubject(''); setDay(''); setTime('');
    } catch (err) {
      setMessage('Failed to submit timetable.');
    }
  };

  return (
    <div className="card" style={{maxWidth: 500, margin: '0 auto'}}>
      <h3>Propose Timetable</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Day</label>
          <select value={day} onChange={e => setDay(e.target.value)} required>
            <option value="">Select Day</option>
            {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        </div>
        <button className="button primary" type="submit">Submit</button>
        {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
      </form>
    </div>
  );
};

export default TimetableForm;