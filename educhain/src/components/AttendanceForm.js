import React, { useState, useEffect } from 'react';
import { fetchStudents, addStudentAttendance, fetchTodayAttendance } from '../api/students';

const AttendanceForm = () => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadData();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = async () => {
    try {
      const studentsData = await fetchStudents();
      setStudents(studentsData);
      try {
        const todayAttendance = await fetchTodayAttendance();
        setAttendanceRecords(Array.isArray(todayAttendance) ? todayAttendance : []);
      } catch {
        setAttendanceRecords([]);
      }
    } catch {
      setMessage('Failed to load students data.');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (studentId) => pendingChanges[studentId] || attendanceRecords.find(r => r.student === studentId)?.status || null;

  const handleAttendanceChange = (studentId, status) => {
    setMessage('');
    setPendingChanges(prev => ({ ...prev, [studentId]: status }));
    setMessage(`Marked ${students.find(s => s.id === studentId)?.first_name} as ${status}. Click "Submit Attendance" to save all changes.`);
  };

  const getStatusColor = (status) => status === 'PRESENT' ? '#28a745' : status === 'ABSENT' ? '#dc3545' : '#6c757d';
  const getStatusText = (status) => status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Not Marked';

  const submitBatchAttendance = async () => {
    const changes = Object.keys(pendingChanges);
    if (!changes.length) return setMessage('No changes to submit.');
    setSaving(true); setMessage('');
    try {
      await Promise.all(changes.map(studentId =>
        addStudentAttendance({ student_id: parseInt(studentId), date: selectedDate, status: pendingChanges[studentId] })
      ));
      setAttendanceRecords(prev => {
        const updatedRecords = [...(Array.isArray(prev) ? prev : [])];
        changes.forEach(studentId => {
          const idx = updatedRecords.findIndex(r => r.student === parseInt(studentId));
          if (idx >= 0) updatedRecords[idx] = { ...updatedRecords[idx], status: pendingChanges[studentId] };
          else updatedRecords.push({ student: parseInt(studentId), status: pendingChanges[studentId], date: selectedDate });
        });
        return updatedRecords;
      });
      setPendingChanges({});
      setMessage(`Successfully submitted attendance for ${changes.length} student(s)!`);
    } catch {
      setMessage('Failed to submit attendance. Please try again.');
    } finally { setSaving(false); }
  };

  const clearPendingChanges = () => { setPendingChanges({}); setMessage('Pending changes cleared.'); };

  if (loading) return <div style={{ padding: 20 }}>Loading attendance data...</div>;

  const containerStyle = {
    padding: 20,
    display: 'flex',
    justifyContent: 'center'
  };

  const cardStyle = {
    width: isMobile ? '100%' : '1000px',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const tableWrapperStyle = {
    overflowX: 'auto',
    marginTop: 20
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thTdStyle = {
    padding: 12,
    textAlign: 'left',
    borderBottom: '1px solid #ddd'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: isMobile ? '4px' : '8px',
    flexWrap: 'wrap'
  };

  const buttonStyle = (selected, color, textColor) => ({
    backgroundColor: selected ? color : '#e9ecef',
    color: selected ? 'white' : textColor,
    padding: '6px 12px',
    fontSize: '0.9rem',
    border: selected ? '2px solid #2196f3' : '1px solid #ddd',
    flex: isMobile ? 1 : 'unset'
  });

  const messageBoxStyle = {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: message.includes('Failed') ? '#f8d7da' : '#d4edda',
    color: message.includes('Failed') ? '#721c24' : '#155724'
  };

  const pendingContainerStyle = {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    border: '1px solid #2196f3'
  };

  const pendingHeaderStyle = { marginBottom: 10, fontWeight: 'bold', color: '#1976d2' };
  const pendingActionsStyle = { display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: 20,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 20
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h3>Student Attendance</h3>
        <div style={{ marginBottom: 20 }}>
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: 8, marginTop: 5, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        {message && <div style={messageBoxStyle}>{message}</div>}

        {Object.keys(pendingChanges).length > 0 && (
          <div style={pendingContainerStyle}>
            <div style={pendingHeaderStyle}>
              Pending Changes ({Object.keys(pendingChanges).length})
            </div>
            <div style={pendingActionsStyle}>
              <button onClick={submitBatchAttendance} disabled={saving} style={{ padding: '8px 16px' }}>
                {saving ? 'Submitting...' : 'Submit Attendance'}
              </button>
              <button onClick={clearPendingChanges} disabled={saving} style={{ padding: '8px 16px' }}>
                Clear Changes
              </button>
            </div>
          </div>
        )}

        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thTdStyle}>Student Name</th>
                <th style={thTdStyle}>Gender</th>
                <th style={thTdStyle}>Current Status</th>
                <th style={thTdStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const currentStatus = getAttendanceStatus(student.id);
                return (
                  <tr key={student.id}>
                    <td style={thTdStyle}>{student.first_name} {student.last_name}</td>
                    <td style={thTdStyle}>{student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}</td>
                    <td style={thTdStyle}><span style={{ color: getStatusColor(currentStatus), fontWeight: 'bold' }}>{getStatusText(currentStatus)}</span></td>
                    <td style={thTdStyle}>
                      <div style={actionButtonsStyle}>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                          disabled={saving}
                          style={buttonStyle(pendingChanges[student.id] === 'PRESENT', '#28a745', '#333')}
                        >
                          Present {pendingChanges[student.id] === 'PRESENT' && '✓'}
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                          disabled={saving}
                          style={buttonStyle(pendingChanges[student.id] === 'ABSENT', '#dc3545', '#333')}
                        >
                          Absent {pendingChanges[student.id] === 'ABSENT' && '✓'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {students.length === 0 && <div style={emptyStateStyle}>No students found. Add students first.</div>}
        {students.length > 0 && attendanceRecords.length === 0 && <div style={emptyStateStyle}>No attendance records found for today.</div>}
      </div>
    </div>
  );
};

export default AttendanceForm;
