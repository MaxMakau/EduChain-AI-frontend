import React, { useState, useEffect } from 'react';
import { getInventory, updateInventory, patchInventory } from '../api/inventory';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom'; // Assuming dashboard uses outlet context

const InventoryManagement = ({ dashboardData: propDashboardData }) => {
  const [inventory, setInventory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInventory, setEditedInventory] = useState(null);
  const [newItemName, setNewItemName] = useState(''); // New state for new item name
  const [newItemQuantity, setNewItemQuantity] = useState(0); // New state for new item quantity
  
  const { user, role, isLoading: authLoading } = useAuth(); // Get isLoading from useAuth
  const outletContext = useOutletContext();
  const dashboardData = propDashboardData || outletContext?.dashboardData; // Use prop or outlet context

  // Refined schoolId derivation based on console logs
  const schoolId = user?.managed_school?.id || user?.school || dashboardData?.school_id; // Corrected: user?.school instead of user?.school?.id

  useEffect(() => {
    const fetchInventoryData = async () => {
      if (authLoading) return; // Wait for auth to load

      if (!schoolId) {
        setError("School ID not found. Ensure user is assigned to a school or manages one.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await getInventory(schoolId);
        setInventory(data);
        setEditedInventory(data);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryData();
  }, [schoolId, authLoading, user]); // Add authLoading and user as dependencies

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "other_items_key") {
        setEditedInventory(prev => ({
            ...prev,
            other_items: {
                ...prev.other_items,
                [value]: prev.other_items[value] || 0 // Initialize to 0 if new key
            }
        }));
    } else if (name === "other_items_value") {
        const key = e.target.dataset.key;
        setEditedInventory(prev => ({
            ...prev,
            other_items: {
                ...prev.other_items,
                [key]: parseInt(value) || 0
            }
        }));
    } else {
        setEditedInventory(prev => ({
            ...prev,
            [name]: parseInt(value) || 0,
        }));
    }
};

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    setEditedInventory(prev => ({
      ...prev,
      other_items: {
        ...prev.other_items,
        [newItemName.trim()]: parseInt(newItemQuantity) || 0,
      },
    }));
    setNewItemName('');
    setNewItemQuantity(0);
  };

  const handleDeleteItem = (keyToDelete) => {
    setEditedInventory(prev => {
      const newOtherItems = { ...prev.other_items };
      delete newOtherItems[keyToDelete];
      return {
        ...prev,
        other_items: newOtherItems,
      };
    });
  };

const handleSave = async () => {
    try {
        setIsLoading(true);
        await patchInventory(schoolId, editedInventory); // Changed from updateInventory to patchInventory
        setInventory(editedInventory);
        setIsEditing(false);
        alert("Inventory updated successfully!");
    } catch (err) {
        console.error("Failed to update inventory:", err);
        setError(err);
        alert("Failed to update inventory: " + (err.response?.data?.detail || err.message));
    } finally {
        setIsLoading(false);
    }
};

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-lg font-semibold">Loading Inventory...</p></div>;
  }

  if (error) {
    const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred.';
    return <div className="p-8 text-center text-red-500 font-bold">Error: {errorMessage}</div>;
  }

  if (!inventory) {
    return <div className="p-8 text-center text-gray-600">No inventory data found.</div>;
  }

  const isHeadteacher = role === "HEADTEACHER";
  const canEdit = isHeadteacher && inventory.school === user?.managed_school?.id;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Inventory Management for {inventory.school_name || `School ID: ${inventory.school}`}</h2>
      <p className="text-gray-600 mb-6">View and manage school inventory items.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Current Stock</h3>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Textbooks:</label>
            {canEdit && isEditing ? (
              <input type="number" name="textbooks" value={editedInventory?.textbooks || ''} onChange={handleEditChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            ) : (
              <p className="text-gray-900 text-xl font-bold">{inventory.textbooks}</p>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-gray-700 text-sm font-bold mb-2">ECDE Kits:</label>
            {canEdit && isEditing ? (
              <input type="number" name="ecde_kits" value={editedInventory?.ecde_kits || ''} onChange={handleEditChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            ) : (
              <p className="text-gray-900 text-xl font-bold">{inventory.ecde_kits}</p>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-gray-700 text-sm font-bold mb-2">Stationery Packs:</label>
            {canEdit && isEditing ? (
              <input type="number" name="stationery_packs" value={editedInventory?.stationery_packs || ''} onChange={handleEditChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            ) : (
              <p className="text-gray-900 text-xl font-bold">{inventory.stationery_packs}</p>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-gray-700 text-sm font-bold mb-2">Desks:</label>
            {canEdit && isEditing ? (
              <input type="number" name="desks" value={editedInventory?.desks || ''} onChange={handleEditChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            ) : (
              <p className="text-gray-900 text-xl font-bold">{inventory.desks}</p>
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Other Items:</h4>
            {Object.entries(editedInventory?.other_items || {}).map(([key, value]) => (
              <div key={key} className="flex items-center mb-2">
                <label className="w-1/2 text-gray-700 text-sm mr-2">{key}:</label>
                {canEdit && isEditing ? (
                  <input
                    type="number"
                    name="other_items_value"
                    data-key={key}
                    value={value}
                    onChange={handleEditChange}
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                ) : (
                  <p className="w-1/2 text-gray-900 font-medium">{value}</p>
                )}
                {canEdit && isEditing && (
                  <button 
                    onClick={() => handleDeleteItem(key)} 
                    className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {canEdit && isEditing && (
                <div className="mt-3 flex items-center">
                    <input 
                        type="text"
                        placeholder="New item name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                    />
                    <input 
                        type="number"
                        placeholder="Quantity"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 0)}
                        className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                    />
                    <button onClick={handleAddItem} className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-sm">
                      Add
                    </button>
                </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4">Last Updated: {inventory.last_updated ? new Date(inventory.last_updated).toLocaleString() : 'N/A'}</p>

          {canEdit && (role === "HEADTEACHER") && (
            <div className="mt-6 flex space-x-4">
              {isEditing ? (
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                  Save Changes
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                  Edit Inventory
                </button>
              )}
              {isEditing && (
                <button onClick={() => {
                    setIsEditing(false);
                    setEditedInventory(inventory); // Revert changes
                }} className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50">
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
