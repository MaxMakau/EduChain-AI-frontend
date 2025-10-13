import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TeacherEvaluationPanel = () => {
  const [teachers, setTeachers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    teacher: '',
    date: '',
    score: '',
    strengths: '',
    areas_for_improvement: '',
    overall_comment: ''
  });
  const [message, setMessage] = useState('');
  const [document, setDocument] = useState(null);
  const [showForm, setShowForm] = useState(false); // New state to manage form visibility

  useEffect(() => {
    async function fetchData() {
      try {
        const tRes = await axiosInstance.get('/schools/all/');
        setTeachers(tRes.data.filter(u => u.role === 'TEACHER'));
        const eRes = await axiosInstance.get('/schools/evaluations/');
        setEvaluations(eRes.data);
      } catch (err) {
        setError('Failed to fetch teachers or evaluations.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('teacher', form.teacher);
      formData.append('date', form.date);
      formData.append('score', form.score);
      formData.append('strengths', form.strengths);
      formData.append('areas_for_improvement', form.areas_for_improvement);
      formData.append('overall_comment', form.overall_comment);
      if (document) {
        formData.append('document', document);
      }

      await axiosInstance.post('/schools/evaluations/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Evaluation submitted!');
      setForm({
        teacher: '',
        date: '',
        score: '',
        strengths: '',
        areas_for_improvement: '',
        overall_comment: ''
      });
      setDocument(null);
      fetchData(); // Refetch data after successful submission
      setShowForm(false); // Hide the form after submission
    } catch {
      setError('Failed to submit evaluation.');
    }
  };

  const fetchData = async () => { // Define fetchData here for refetching
    try {
      const tRes = await axiosInstance.get('/schools/all/');
      setTeachers(tRes.data.filter(u => u.role === 'TEACHER'));
      const eRes = await axiosInstance.get('/schools/evaluations/');
      setEvaluations(eRes.data);
    } catch (err) {
      setError('Failed to fetch teachers or evaluations.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
      <h3>Teacher Evaluation</h3>
      <button className="button primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'View Past Evaluations' : 'Add New Evaluation'}
      </button>

      {showForm ? (
        <form onSubmit={handleSubmit} style={{marginTop: 20}}>
          <div className="input-group">
            <label>Teacher</label>
            <select name="teacher" value={form.teacher} onChange={handleChange} required>
              <option value="">Select Teacher</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name || t.email}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Score</label>
            <input name="score" value={form.score} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Strengths</label>
            <input name="strengths" value={form.strengths} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Areas for Improvement</label>
            <input name="areas_for_improvement" value={form.areas_for_improvement} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Overall Comment</label>
            <textarea name="overall_comment" value={form.overall_comment} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Document</label>
            <input type="file" onChange={e => setDocument(e.target.files[0])} />
          </div>
          <button className="button primary" type="submit">Submit Evaluation</button>
          {message && <div style={{color: 'green', marginTop: 10}}>{message}</div>}
        </form>
      ) : (
        <div style={{marginTop: 20}}>
          <h4>Past Evaluations</h4>
          <ul>
            {evaluations.map(ev => (
              <li key={ev.id}>
                {ev.date}: {ev.teacher_name || ev.teacher} - Score: {ev.score}
                {ev.document && (
                  <a href={ev.document} target="_blank" rel="noopener noreferrer" style={{marginLeft: 10}}>View Document</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeacherEvaluationPanel;