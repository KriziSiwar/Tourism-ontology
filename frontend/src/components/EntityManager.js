import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EntityTable from './EntityTable';
import EntityForm from './EntityForm';

const EntityManager = ({ entityType, entityName, apiEndpoint, fields, columns, idField }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [entityType, apiEndpoint]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/${apiEndpoint}`);
      setData(response.data.results.bindings);
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:5000/api/${apiEndpoint}`;
      if (editingItem) {
        const id = editingItem[idField].value.split('#')[1];
        await axios.put(`${url}/${id}`, formData);
      } else {
        await axios.post(url, formData);
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error(`Error saving ${entityName}:`, error);
    }
  };

  const handleEdit = (item) => {
    if (item) {
      // Editing existing item
      const formValues = {};
      fields.forEach(field => {
        formValues[field] = item[field]?.value || '';
      });
      setFormData(formValues);
      setEditingItem(item);
    } else {
      // Adding new item
      setFormData({});
      setEditingItem(null);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${entityName.slice(0, -1)}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/${apiEndpoint}/${id}`);
        fetchData();
      } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
  };

  if (loading) {
    return <div className="loading">Loading {entityName}...</div>;
  }

  return (
    <div className="entity-manager">
      {showForm ? (
        <EntityForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          fields={fields}
          entityName={entityName}
          isEditing={!!editingItem}
        />
      ) : (
        <EntityTable
          data={data}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          entityName={entityName}
          idField={idField}
        />
      )}
    </div>
  );
};

export default EntityManager;