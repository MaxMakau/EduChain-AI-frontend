import React, { useEffect, useState } from 'react';
import { fetchStudentDetail, fetchStudentAttendance, fetchStudentAssessments } from '../api/students';

const StudentDetail = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await fetchStudentDetail(studentId);
      setStudent(s);
      setAttendance(await fetchStudentAttendance(studentId));
      setAssessments(await fetchStudentAssessments(studentId));
      setLoading(false);
    }
    load();
  }, [studentId]);

  if (loading) return <div>Loading student details...</div>;
  if (!student) return <div>Student not found.</div>;

  return (
    <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
      <h3>Student Details</h3>
      <div><strong>Name:</strong> {student.first_name} {student.last_name}</div>
      <div><strong>Age:</strong> {student.age}</div>
      <div><strong>Gender:</strong> {student.gender}</div>
      <div><strong>Parent(s):</strong> {student.parents?.map(p => p.name).join(', ')}</div>
      <div><strong>Disability Type:</strong> {student.disability_type || 'None'}</div>
      <div><strong>PWD:</strong> {student.pwd ? 'Yes' : 'No'}</div>
      <h4>Attendance</h4>
      <ul>
        {attendance.map(a => (
          <li key={a.id}>{a.date}: {a.status}</li>
        ))}
      </ul>
      <h4>Assessments</h4>
      <ul>
        {assessments.map(as => (
          <li key={as.id}>{as.subject}: {as.score}/{as.max_score} ({as.date})</li>
        ))}
      </ul>
      <button className="button" onClick={onClose}>Close</button>
    </div>
  );
};

export default StudentDetail;