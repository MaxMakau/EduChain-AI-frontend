import React, { useEffect, useState } from 'react';
import { fetchStudents } from '../api/students';

const StudentList = ({ onSelect, canEdit }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents().then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading students...</div>;
  if (!students.length) return <div>No students found.</div>;

  return (
    <div>
      <h4>Students</h4>
      <table style={{width: '100%', marginBottom: 20}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Parent(s)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.first_name} {s.last_name}</td>
              <td>{s.age}</td>
              <td>{s.gender}</td>
              <td>{s.parents?.map(p => p.name).join(', ')}</td>
              <td>
                <button className="button" onClick={() => onSelect(s.id)}>View</button>
                {canEdit && <button className="button" onClick={() => onSelect(s.id, true)}>Edit</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;