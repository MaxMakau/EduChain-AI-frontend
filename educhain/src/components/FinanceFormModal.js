
import React, { useState, useEffect } from 'react';
import './FinanceFormModal.css'; // We'll create this CSS file next

const FinanceFormModal = ({ isOpen, onClose, initialData, onSave, onCreate, schoolId }) => {
  const [formData, setFormData] = useState({
    academic_year: '',
    period_type: 'ANNUAL',
    period_identifier: '',
    annual_budget: 0,
    funds_received: 0,
    funds_spent: 0,
    expense_breakdown: {},
  });
  const [formError, setFormError] = useState(''); // New state for form-specific errors

  useEffect(() => {
    if (initialData) {
      setFormData({
        academic_year: initialData.academic_year || '',
        period_type: initialData.period_type || 'ANNUAL',
        period_identifier: initialData.period_identifier || '',
        annual_budget: initialData.annual_budget,
        funds_received: initialData.funds_received,
        funds_spent: initialData.funds_spent,
        expense_breakdown: initialData.expense_breakdown || {},
      });
    } else {
      // Reset for new record creation
      setFormData({
        academic_year: '',
        period_type: 'ANNUAL',
        period_identifier: '',
        annual_budget: 0,
        funds_received: 0,
        funds_spent: 0,
        expense_breakdown: {},
      });
    }
    setFormError(''); // Clear form errors on modal open/data change
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpenseBreakdownChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      expense_breakdown: {
        ...prev.expense_breakdown,
        [key]: value
      }
    }));
  };

  const [newExpenseKey, setNewExpenseKey] = useState('');
  const [newExpenseValue, setNewExpenseValue] = useState('');

  const handleAddExpense = () => {
    if (newExpenseKey && newExpenseValue) {
      setFormData(prev => ({
        ...prev,
        expense_breakdown: {
          ...prev.expense_breakdown,
          [newExpenseKey]: parseFloat(newExpenseValue)
        }
      }));
      setNewExpenseKey('');
      setNewExpenseValue('');
    }
  };

  const handleRemoveExpense = (keyToRemove) => {
    setFormData(prev => {
      const newBreakdown = { ...prev.expense_breakdown };
      delete newBreakdown[keyToRemove];
      return {
        ...prev,
        expense_breakdown: newBreakdown
      };
    });
  };

  const handleSubmit = async () => {
    setFormError(''); // Clear previous form errors
    const payload = {
      academic_year: formData.academic_year,
      period_type: formData.period_type,
      period_identifier: (formData.period_type === 'ANNUAL' || formData.period_type === 'OTHER') ? null : formData.period_identifier,
      annual_budget: parseFloat(formData.annual_budget),
      funds_received: parseFloat(formData.funds_received),
      funds_spent: parseFloat(formData.funds_spent),
      expense_breakdown: formData.expense_breakdown,
    };

    try {
      if (initialData) {
        await onSave({ ...payload, id: initialData.id }); // For editing existing record
      } else {
        await onCreate({ ...payload, school: schoolId }); // For creating new record
      }
      onClose();
    } catch (error) {
      if (error.response && error.response.data) {
        setFormError(error.response.data.detail || JSON.stringify(error.response.data));
      } else {
        setFormError('An unexpected error occurred.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{initialData ? 'Edit Finance Record' : 'Create New Finance Record'}</h3>
        {formError && <div style={{color: 'red'}}>{formError}</div>}
        <div>
          <label>Academic Year:</label>
          <input
            type="text"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Period Type:</label>
          <select
            name="period_type"
            value={formData.period_type}
            onChange={handleInputChange}
          >
            <option value="ANNUAL">Annual</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="TERM">Term</option>
            <option value="MONTHLY">Monthly</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        {(formData.period_type === 'QUARTERLY' || formData.period_type === 'TERM' || formData.period_type === 'MONTHLY') && (
          <div>
            <label>Period Identifier:</label>
            <input
              type="text"
              name="period_identifier"
              value={formData.period_identifier}
              onChange={handleInputChange}
            />
          </div>
        )}
        <div>
          <label>Annual Budget:</label>
          <input
            type="number"
            name="annual_budget"
            value={formData.annual_budget}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Funds Received:</label>
          <input
            type="number"
            name="funds_received"
            value={formData.funds_received}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Funds Spent:</label>
          <input
            type="number"
            name="funds_spent"
            value={formData.funds_spent}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <strong>Expense Breakdown:</strong>
          {Object.entries(formData.expense_breakdown).map(([key, value]) => (
            <div key={key} className="expense-item">
              <label>{key}:</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleExpenseBreakdownChange(key, e.target.value)}
              />
              <button type="button" onClick={() => handleRemoveExpense(key)} className="remove-expense-button">Remove</button>
            </div>
          ))}
          <div className="add-expense-section">
            <input
              type="text"
              placeholder="New Expense Category"
              value={newExpenseKey}
              onChange={(e) => setNewExpenseKey(e.target.value)}
            />
            <input
              type="number"
              placeholder="Value"
              value={newExpenseValue}
              onChange={(e) => setNewExpenseValue(e.target.value)}
            />
            <button type="button" onClick={handleAddExpense} className="add-expense-button">Add Expense</button>
          </div>
        </div>
        <button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Create Record'}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FinanceFormModal;
