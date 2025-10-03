import React, { useState } from 'react';
import { addStudent, updateStudent, fetchStudentDetail } from '../api/students';

const initialState = {
  first_name: '',
  last_name: '',
  age: '',
  gender: '',
  parents: '',
  disability_type: '',
  pwd: false,
};

const StudentForm = ({ studentId, onSuccess, onCancel }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (studentId) {
      fetchStudentDetail(studentId).then(data => setForm(data));
    }
  }, [studentId]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (studentId) {
        await updateStudent(studentId, form);
        setMessage('Student updated!');
      } else {
        await addStudent(form);
        setMessage('Student added!');
        setForm(initialState);
      }
      onSuccess && onSuccess();
    } catch {
      setMessage('Failed to save student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{maxWidth: 500, margin: '0 auto'}}>
      <h3>{studentId ? 'Edit Student' : 'Add Student'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>First Name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} required min={2} max={10} />
        </div>
        <div className="input-group">
          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
        <div className="input-group">
          <label>Parent(s)</label>
          <input name="parents" value={form.parents} onChange={handleChange} placeholder="Parent names (comma separated)" />
        </div>
        <div className="input-group">
          <label>Disability Type</label>
          <input name="disability_type" value={form.disability_type} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>
            <input type="checkbox" name="pwd" checked={form.pwd} onChange={handleChange} />
            Person with Disability (PWD)
          </label>
        </div>
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : studentId ? 'Update' : 'Add'}
        </button>
        {onCancel && <button className="button" type="button" onClick={onCancel}>Cancel</button>}
        {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
      </form>
    </div>
  );
};

export default StudentForm;