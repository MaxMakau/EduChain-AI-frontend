import React from 'react';

const SchoolOverview = ({ overview }) => {
  if (!overview) return <div>No school overview data available.</div>;

  const { school, students, teachers, attendance, assessments, resource_requests } = overview;

  return (
    <div className="card" style={{maxWidth: 'none', margin: 0}}>
      <h3>School Overview</h3>
      <div style={{marginBottom: 16}}>
        <strong>School:</strong> {school.name} ({school.code}), Subcounty: {school.subcounty}
      </div>
      <div style={{display: 'flex', gap: '30px', marginBottom: 20, flexWrap: 'wrap'}}>
        <div style={{background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: '18px 28px', minWidth: 160, textAlign: 'center'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--color-primary)'}}>{students.total}</div>
          <div style={{fontSize: '1rem', color: '#555'}}>Total Students</div>
        </div>
        <div style={{background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: '18px 28px', minWidth: 160, textAlign: 'center'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--color-secondary)'}}>{teachers}</div>
          <div style={{fontSize: '1rem', color: '#555'}}>Total Teachers</div>
        </div>
        <div style={{background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: '18px 28px', minWidth: 160, textAlign: 'center'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#10B981'}}>{attendance.attendance_percentage ?? '--'}%</div>
          <div style={{fontSize: '1rem', color: '#555'}}>Attendance Today</div>
        </div>
        <div style={{background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: '18px 28px', minWidth: 160, textAlign: 'center'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#EF4444'}}>{resource_requests.pending}</div>
          <div style={{fontSize: '1rem', color: '#555'}}>Pending Resources</div>
        </div>
      </div>
      <div style={{marginBottom: 16}}>
        <strong>Students by Gender:</strong> {Object.entries(students.by_gender).map(([g, c]) => `${g}: ${c}`).join(', ')}
      </div>
      <div style={{marginBottom: 16}}>
        <strong>Students with Disabilities:</strong> Yes: {students.pwd.yes}, No: {students.pwd.no}
      </div>
      <div style={{marginBottom: 16}}>
        <strong>Disability Types:</strong> {Object.entries(students.by_disability_type).map(([d, c]) => `${d}: ${c}`).join(', ') || 'None'}
      </div>
      <div style={{marginBottom: 16}}>
        <strong>Assessment Averages:</strong>
        <ul>
          {Object.entries(assessments).map(([subject, stats]) => (
            <li key={subject}>
              {subject}: {stats.avg_percentage ?? '--'}% (Avg Score: {stats.avg_score?.toFixed(2)}, Max: {stats.avg_max_score?.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SchoolOverview;