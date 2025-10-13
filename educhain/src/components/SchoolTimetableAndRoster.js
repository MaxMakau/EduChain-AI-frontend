import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
// import { useAuth } from '../context/AuthContext'; // Temporarily remove auth context

const SchoolTimetableAndRoster = () => {
  // const { user, isLoading: isAuthLoading } = useAuth(); // Temporarily remove auth context
  const schoolId = '1'; // Hardcoded school ID for now
  const [timetable, setTimetable] = useState(null);
  const [dutyRosters, setDutyRosters] = useState([]);
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for Duty Roster Form
  const [newRosterForm, setNewRosterForm] = useState({
    date: '',
    shift: '',
    assigned_teacher: '',
    role: '',
    notes: '',
  });
  const [newRosterDocument, setNewRosterDocument] = useState(null);
  const [teachers, setTeachers] = useState([]);

  // State for UI toggles
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [showRosterForm, setShowRosterForm] = useState(false);

  useEffect(() => {
    if (schoolId) { // Use schoolId directly
      fetchTimetable();
      fetchDutyRosters();
      fetchTeachers();
    } else {
        setError('School ID not available. Cannot fetch data.');
        setLoading(false);
    }
  }, [schoolId]); // Dependency array includes schoolId

  const fetchTimetable = async () => {
    try {
      const res = await axiosInstance.get(`/schools/timetable/${schoolId}/`);
      setTimetable(res.data);
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDutyRosters = async () => {
    try {
      const res = await axiosInstance.get('/schools/rosters/');
      // Filter rosters by the current school if needed, or backend handles it.
      setDutyRosters(res.data.filter(roster => roster.school === schoolId));
    } catch (err) {
      console.error('Failed to fetch duty rosters:', err);
      setDutyRosters([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const tRes = await axiosInstance.get('/schools/all/');
      setTeachers(tRes.data.filter(u => u.role === 'TEACHER' && u.school === schoolId));
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setTeachers([]);
    }
  };

  const handleTimetableSubmit = async e => {
    e.preventDefault();
    if (!schoolId) {
      setMessage('School ID not available. Cannot submit timetable.');
      return;
    }
    try {
      let updatedSchedule = timetable?.schedule ? { ...timetable.schedule } : {};
      if (!updatedSchedule[day]) {
        updatedSchedule[day] = [];
      }
      updatedSchedule[day].push({ subject, time });

      const payload = {
        schedule: updatedSchedule,
        status: timetable?.status || 'PENDING' // Keep existing status or set to PENDING
      };

      if (timetable && timetable.id) {
        await axiosInstance.put(`/schools/timetable/${schoolId}/`, payload);
      } else {
        await axiosInstance.post('/schools/timetable/', { ...payload, school: schoolId }); // Assuming POST to create if not exists
      }
      setMessage('Timetable entry added/updated!');
      setSubject(''); setDay(''); setTime('');
      fetchTimetable();
      setShowTimetableForm(false);
    } catch (err) {
      setMessage('Failed to submit timetable.');
      console.error(err);
    }
  };

  const handleRosterChange = e => {
    setNewRosterForm({ ...newRosterForm, [e.target.name]: e.target.value });
  };

  const handleRosterDocumentChange = e => {
    setNewRosterDocument(e.target.files[0]);
  };

  const handleRosterSubmit = async e => {
    e.preventDefault();
    if (!schoolId) {
      setMessage('School ID not available. Cannot submit duty roster.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('school', schoolId);
      formData.append('date', newRosterForm.date);
      formData.append('shift', newRosterForm.shift);
      formData.append('assigned_teacher', newRosterForm.assigned_teacher);
      formData.append('role', newRosterForm.role);
      formData.append('notes', newRosterForm.notes);
      if (newRosterDocument) {
        formData.append('document', newRosterDocument);
      }

      await axiosInstance.post('/schools/rosters/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Duty roster entry added!');
      setNewRosterForm({
        date: '',
        shift: '',
        assigned_teacher: '',
        role: '',
        notes: '',
      });
      setNewRosterDocument(null);
      fetchDutyRosters();
      setShowRosterForm(false);
    } catch (err) {
      setMessage('Failed to add duty roster entry.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div className="card" style={{maxWidth: 800, margin: '0 auto', padding: 20}}>
      <h2>School Timetable and Duty Roster Management</h2>

      {/* Timetable Section */}
      <div style={{marginBottom: 40}}>
        <h3>Timetable</h3>
        <button className="button primary" onClick={() => setShowTimetableForm(!showTimetableForm)}>
          {showTimetableForm ? 'View Current Timetable' : 'Propose/Update Timetable'}
        </button>

        {showTimetableForm ? (
          <form onSubmit={handleTimetableSubmit} style={{marginTop: 20}}>
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
            <button className="button primary" type="submit">Submit Timetable Proposal</button>
            {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
          </form>
        ) : (
          <div style={{marginTop: 20}}>
            <h4>Current Timetable</h4>
            {timetable?.schedule && Object.keys(timetable.schedule).length > 0 ? (
              <div>
                <p>Status: {timetable.status}</p>
                {Object.keys(timetable.schedule).map(day => (
                  <div key={day} style={{marginBottom: 15}}>
                    <h5>{day}</h5>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr style={{borderBottom: '1px solid #ddd'}}>
                          <th style={{padding: '8px', textAlign: 'left'}}>Time</th>
                          <th style={{padding: '8px', textAlign: 'left'}}>Subject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetable.schedule[day].sort((a, b) => a.time.localeCompare(b.time)).map((entry, idx) => (
                          <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '8px'}}>{entry.time}</td>
                            <td style={{padding: '8px'}}>{entry.subject}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <p>No timetable available. Propose one!</p>
            )}
          </div>
        )}
      </div>

      {/* Duty Roster Section */}
      <div>
        <h3>Duty Roster</h3>
        <button className="button primary" onClick={() => setShowRosterForm(!showRosterForm)}>
          {showRosterForm ? 'View All Rosters' : 'Add New Duty Roster Entry'}
        </button>

        {showRosterForm ? (
          <form onSubmit={handleRosterSubmit} style={{marginTop: 20}}>
            <div className="input-group">
              <label>Date</label>
              <input type="date" name="date" value={newRosterForm.date} onChange={handleRosterChange} required />
            </div>
            <div className="input-group">
              <label>Shift</label>
              <input type="text" name="shift" value={newRosterForm.shift} onChange={handleRosterChange} />
            </div>
            <div className="input-group">
              <label>Assigned Teacher</label>
              <select name="assigned_teacher" value={newRosterForm.assigned_teacher} onChange={handleRosterChange}>
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name || t.email}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Role</label>
              <input type="text" name="role" value={newRosterForm.role} onChange={handleRosterChange} />
            </div>
            <div className="input-group">
              <label>Notes</label>
              <textarea name="notes" value={newRosterForm.notes} onChange={handleRosterChange} />
            </div>
            <div className="input-group">
              <label>Document</label>
              <input type="file" onChange={handleRosterDocumentChange} />
            </div>
            <button className="button primary" type="submit">Add Duty Roster</button>
            {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
          </form>
        ) : (
          <div style={{marginTop: 20}}>
            <h4>All Duty Rosters</h4>
            {dutyRosters.length > 0 ? (
              <ul>
                {dutyRosters.map(roster => (
                  <li key={roster.id}>
                    <strong>Date:</strong> {roster.date}, <strong>Shift:</strong> {roster.shift}, <strong>Teacher:</strong> {roster.assigned_teacher_display || roster.assigned_teacher}, <strong>Role:</strong> {roster.role}
                    {roster.document && (
                      <a href={roster.document} target="_blank" rel="noopener noreferrer" style={{marginLeft: 10}}>View Document</a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No duty rosters available. Add one!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolTimetableAndRoster;