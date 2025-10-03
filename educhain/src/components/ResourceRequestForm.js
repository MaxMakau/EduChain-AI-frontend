import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const RESOURCE_TYPES = [
  'STATIONERY', 'MEALS', 'FURNITURE', 'TEACHING_AIDS', 'OTHER'
];

const ResourceRequestForm = () => {
  const [resourceType, setResourceType] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post('/schools/resources/', {
        resource_type: resourceType,
        description,
        quantity: Number(quantity)
      });
      setMessage('Resource request submitted!');
      setResourceType(''); setDescription(''); setQuantity('');
    } catch (err) {
      setMessage('Failed to submit resource request.');
    }
  };

  return (
    <div className="card" style={{maxWidth: 500, margin: '0 auto'}}>
      <h3>Request Resource</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Resource Type</label>
          <select value={resourceType} onChange={e => setResourceType(e.target.value)} required>
            <option value="">Select Type</option>
            {RESOURCE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label>Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Quantity</label>
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min={1} />
        </div>
        <button className="button primary" type="submit">Submit</button>
        {message && <div style={{color: message.includes('Failed') ? 'red' : 'green', marginTop: 10}}>{message}</div>}
      </form>
    </div>
  );
};

export default ResourceRequestForm;