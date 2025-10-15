import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import FinanceFormModal from './FinanceFormModal';
import './FinancePanel.css';
import { useAuth } from '../context/AuthContext'; // NEW IMPORT

const FinancePanel = () => {
  const [financeRecords, setFinanceRecords] = useState([]); // Changed to an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFinanceRecord, setCurrentFinanceRecord] = useState(null); // For editing or creating
  
  const { user, isLoading: authLoading } = useAuth(); // Get user and authLoading from AuthContext
  const schoolId = user?.managed_school?.id || user?.school; // Dynamically get schoolId

  useEffect(() => {
    async function fetchFinanceRecords() {
      if (authLoading) return; // Wait for auth to load

      if (!schoolId) {
        setError('School ID not found. Ensure user is assigned to a school or manages one.');
        setLoading(false);
        return;
      }
      try {
        // Updated endpoint to fetch all records for the school
        const res = await axiosInstance.get(`/schools/finance/all/?school__id=${schoolId}`);
        setFinanceRecords(res.data); // Store the array of records
        setError('');
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(''); 
          setFinanceRecords([]); // Ensure it's an empty array if 404
        } else {
          setError('Failed to fetch finance details.');
          console.error("Error fetching finance:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchFinanceRecords();
  }, [schoolId, user, authLoading]); // Add schoolId, user, and authLoading as dependencies

  const handleOpenCreateModal = () => {
    setCurrentFinanceRecord(null); // Clear previous data for new record
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setCurrentFinanceRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFinanceRecord(null); // Clear after closing
  };

  const handleSave = async (payload) => {
    try {
      const res = await axiosInstance.patch(`/schools/finance/${payload.id}/`, payload);
      setFinanceRecords(prevRecords =>
        prevRecords.map(record => (record.id === res.data.id ? res.data : record))
      );
      setError('');
      handleCloseModal();
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || JSON.stringify(err.response.data));
      } else {
        setError('Failed to update finance details.');
      }
      console.error("Error updating finance:", err);
    }
  };

  const handleCreate = async (payload) => {
    try {
      const res = await axiosInstance.post(`/schools/finance/create/`, payload);
      setFinanceRecords(prevRecords => [...prevRecords, res.data]); // Add new record to state
      setError('');
      handleCloseModal();
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || JSON.stringify(err.response.data));
      } else {
        setError('Failed to create finance record.');
      }
      console.error("Error creating finance:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="finance-panel-container">
      <div className="finance-panel-header">
        <h3>Finance Management</h3>
        <button onClick={handleOpenCreateModal} className="add-record-button">Add New Record</button>
      </div>
      {error && <div style={{color: 'red'}}>{error}</div>}

      {financeRecords.length > 0 ? (
        <div className="finance-table-container">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Period Type</th>
                <th>Period Identifier</th>
                <th>Annual Budget</th>
                <th>Funds Received</th>
                <th>Funds Spent</th>
                <th>Balance</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {financeRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.academic_year}</td>
                  <td>{record.period_type}</td>
                  <td>{record.period_identifier || 'N/A'}</td>
                  <td>{record.annual_budget}</td>
                  <td>{record.funds_received}</td>
                  <td>{record.funds_spent}</td>
                  <td>{record.balance}</td>
                  <td>{new Date(record.last_updated).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleOpenEditModal(record)}>Modify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Displaying expense breakdown for the currently selected record, or perhaps only for one when editing */}
          {currentFinanceRecord && currentFinanceRecord.expense_breakdown && Object.keys(currentFinanceRecord.expense_breakdown).length > 0 && (
            <div className="expense-breakdown">
              <h4>Expense Breakdown for {currentFinanceRecord.academic_year} - {currentFinanceRecord.period_identifier || currentFinanceRecord.period_type}:</h4>
              <pre>{JSON.stringify(currentFinanceRecord.expense_breakdown, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className="no-records-message">
          <p>No finance data found for this school. Click "Add New Record" to create one.</p>
        </div>
      )}

      <FinanceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={currentFinanceRecord}
        onSave={handleSave}
        onCreate={handleCreate}
        schoolId={schoolId}
      />
    </div>
  );
};

export default FinancePanel;