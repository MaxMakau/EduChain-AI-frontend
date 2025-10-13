import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
// import { useAuth } from '../context/AuthContext';

const ProfessionalDevelopmentLog = ({ userId, schoolId }) => {
  // const { user } = useAuth();
  const [activity, setActivity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [log, setLog] = useState([]);
  const [message, setMessage] = useState('');
  const [certificateDocument, setCertificateDocument] = useState(null);
  const [showForm, setShowForm] = useState(false); // New state to manage PD form visibility

  // State for Teaching Schemes
  const [teachingSchemes, setTeachingSchemes] = useState([]);
  const [showTeachingSchemeForm, setShowTeachingSchemeForm] = useState(false); // New state for Teaching Scheme form visibility
  const [newSchemeForm, setNewSchemeForm] = useState({
    title: '',
    description: '',
    academic_year: '',
    grade_level: '',
    subject: '',
  });
  const [newSchemeDocument, setNewSchemeDocument] = useState(null);
  const [editingSchemeId, setEditingSchemeId] = useState(null);
  const [schemeMessage, setSchemeMessage] = useState('');

  const fetchPD = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get('/schools/pd/');
      setLog(res.data.filter(pd => pd.teacher === userId));
    } catch {
      setLog([]);
    }
  }, [userId]);

  const fetchTeachingSchemes = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await axiosInstance.get('/schools/schemes/');
      setTeachingSchemes(res.data.filter(scheme => scheme.school === schoolId));
    } catch (err) {
      console.error('Failed to fetch teaching schemes:', err);
      setTeachingSchemes([]);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchPD();
    fetchTeachingSchemes();
  }, [fetchPD, fetchTeachingSchemes]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userId) {
      setMessage('User ID not available. Cannot add activity.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('teacher', userId);
      formData.append('title', activity);
      formData.append('date_from', dateFrom);
      formData.append('date_to', dateTo);
      if (certificateDocument) {
        formData.append('certificate_document', certificateDocument);
      }

      await axiosInstance.post('/schools/pd/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Professional development activity added!');
      setActivity(''); setDateFrom(''); setDateTo(''); setCertificateDocument(null);
      fetchPD(); // Refetch data after successful submission
      setShowForm(false); // Hide the form after submission
    } catch (err) {
      setMessage('Failed to add activity.');
      console.error(err);
    }
  };

  const handleSchemeChange = e => {
    setNewSchemeForm({ ...newSchemeForm, [e.target.name]: e.target.value });
  };

  const handleSchemeDocumentChange = e => {
    setNewSchemeDocument(e.target.files[0]);
  };

  const handleSchemeSubmit = async e => {
    e.preventDefault();
    if (!schoolId) {
      setSchemeMessage('School ID not available. Cannot submit scheme.');
      return;
    }
    if (!userId) {
      setSchemeMessage('User ID not available. Cannot submit scheme.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('school', schoolId);
      formData.append('title', newSchemeForm.title);
      formData.append('description', newSchemeForm.description);
      formData.append('academic_year', newSchemeForm.academic_year);
      formData.append('grade_level', newSchemeForm.grade_level);
      formData.append('subject', newSchemeForm.subject);
      formData.append('uploaded_by', userId);
      if (newSchemeDocument) {
        formData.append('scheme_document', newSchemeDocument);
      }

      if (editingSchemeId) {
        await axiosInstance.patch(`/schools/schemes/${editingSchemeId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSchemeMessage('Teaching scheme updated successfully!');
      } else {
        await axiosInstance.post('/schools/schemes/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSchemeMessage('Teaching scheme added successfully!');
      }
      setNewSchemeForm({
        title: '',
        description: '',
        academic_year: '',
        grade_level: '',
        subject: '',
      });
      setNewSchemeDocument(null);
      setEditingSchemeId(null);
      fetchTeachingSchemes();
      setShowTeachingSchemeForm(false);
    } catch (err) {
      setSchemeMessage('Failed to submit teaching scheme.');
      console.error(err);
    }
  };

  const handleEditScheme = (scheme) => {
    setEditingSchemeId(scheme.id);
    setNewSchemeForm({
      title: scheme.title,
      description: scheme.description,
      academic_year: scheme.academic_year,
      grade_level: scheme.grade_level,
      subject: scheme.subject,
    });
    // Do not pre-fill document input for security reasons
    setShowTeachingSchemeForm(true);
  };

  const handleDeleteScheme = async (schemeId) => {
    if (window.confirm('Are you sure you want to delete this teaching scheme?')) {
      try {
        await axiosInstance.delete(`/schools/schemes/${schemeId}/`);
        setSchemeMessage('Teaching scheme deleted successfully!');
        fetchTeachingSchemes();
      } catch (err) {
        setSchemeMessage('Failed to delete teaching scheme.');
        console.error(err);
      }
    }
  };

  return (
    <div className="card" style={{maxWidth: 800, margin: '0 auto', padding: 20}}>
      <h2>Professional Development & Teaching Schemes</h2>

      {/* Professional Development Log Section */}
      <div style={{marginBottom: 40}}>
        <h3>Professional Development Log</h3>
        <button className="button primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'View Activities' : 'Add New PD Entry'}
        </button>

        {showForm ? (
          <form onSubmit={handleSubmit} style={{marginTop: 20}}>
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
            <div className="input-group">
              <label>Certificate Document</label>
              <input type="file" onChange={e => setCertificateDocument(e.target.files[0])} />
            </div>
            <button className="button primary" type="submit">Add</button>
            {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
          </form>
        ) : (
          <div style={{marginTop: 20}}>
            <h4>My Activities</h4>
            {log.length > 0 ? (
              <ul>
                {log.map((item, idx) => (
                  <li key={idx}>
                    {item.date_from} - {item.date_to || ''}: {item.title}
                    {item.certificate_document && (
                      <a href={item.certificate_document} target="_blank" rel="noopener noreferrer" style={{marginLeft: 10}}>View Certificate</a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No professional development activities logged.</p>
            )}
          </div>
        )}
      </div>

      {/* Teaching Scheme Management Section */}
      <div>
        <h3>Teaching Schemes</h3>
        <button className="button primary" onClick={() => {
          setShowTeachingSchemeForm(!showTeachingSchemeForm);
          setEditingSchemeId(null);
          setNewSchemeForm({
            title: '',
            description: '',
            academic_year: '',
            grade_level: '',
            subject: '',
          });
          setNewSchemeDocument(null);
        }}>
          {showTeachingSchemeForm ? 'View All Schemes' : 'Add New Teaching Scheme'}
        </button>

        {showTeachingSchemeForm ? (
          <form onSubmit={handleSchemeSubmit} style={{marginTop: 20}}>
            <div className="input-group">
              <label>Title</label>
              <input type="text" name="title" value={newSchemeForm.title} onChange={handleSchemeChange} required />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea name="description" value={newSchemeForm.description} onChange={handleSchemeChange} />
            </div>
            <div className="input-group">
              <label>Academic Year</label>
              <input type="text" name="academic_year" value={newSchemeForm.academic_year} onChange={handleSchemeChange} placeholder="e.g., 2024-2025" required />
            </div>
            <div className="input-group">
              <label>Grade Level</label>
              <input type="text" name="grade_level" value={newSchemeForm.grade_level} onChange={handleSchemeChange} />
            </div>
            <div className="input-group">
              <label>Subject</label>
              <input type="text" name="subject" value={newSchemeForm.subject} onChange={handleSchemeChange} required />
            </div>
            <div className="input-group">
              <label>Scheme Document</label>
              <input type="file" onChange={handleSchemeDocumentChange} />
            </div>
            <button className="button primary" type="submit">
              {editingSchemeId ? 'Update Scheme' : 'Add Scheme'}
            </button>
            {schemeMessage && <div style={{color: schemeMessage.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{schemeMessage}</div>}
          </form>
        ) : (
          <div style={{marginTop: 20}}>
            <h4>All Teaching Schemes</h4>
            {teachingSchemes.length > 0 ? (
              <ul>
                {teachingSchemes.map(scheme => (
                  <li key={scheme.id} style={{marginBottom: 10, padding: 10, border: '1px solid #eee', borderRadius: 5}}>
                    <strong>{scheme.title}</strong> ({scheme.subject}, {scheme.academic_year})
                    {scheme.grade_level && <span> - Grade: {scheme.grade_level}</span>}
                    {scheme.description && <p style={{marginTop: 5, fontSize: '0.9em'}}>{scheme.description}</p>}
                    {scheme.scheme_document && (
                      <a href={scheme.scheme_document} target="_blank" rel="noopener noreferrer" style={{marginLeft: 10}}>View Document</a>
                    )}
                    <div style={{marginTop: 5}}>
                      <button className="button secondary small" onClick={() => handleEditScheme(scheme)} style={{marginRight: 10}}>Edit</button>
                      <button className="button danger small" onClick={() => handleDeleteScheme(scheme.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No teaching schemes available. Add one!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDevelopmentLog;