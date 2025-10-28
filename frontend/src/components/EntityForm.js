import React from 'react';

const EntityForm = ({ formData, onChange, onSubmit, onCancel, fields, entityName, isEditing }) => {
  const getInputType = (field) => {
    if (field.includes('date')) return 'datetime-local';
    if (['age', 'prix', 'capacite', 'note'].includes(field)) return 'number';
    return 'text';
  };

  const getFieldLabel = (field) => {
    const labels = {
      nom: 'Name',
      age: 'Age',
      localisation: 'Location',
      prix: 'Price',
      capacite: 'Capacity',
      description: 'Description',
      contact: 'Contact',
      dateDebut: 'Start Date',
      dateFin: 'End Date',
      note: 'Rating'
    };
    return labels[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  return (
    <div className="entity-form">
      <div className="form-header">
        <h2>{isEditing ? 'Edit' : 'Add New'} {entityName.slice(0, -1)}</h2>
      </div>

      <form onSubmit={onSubmit}>
        {fields.map(field => (
          <div key={field} className="form-group">
            <label htmlFor={field}>{getFieldLabel(field)}:</label>
            <input
              type={getInputType(field)}
              id={field}
              name={field}
              value={formData[field] || ''}
              onChange={(e) => onChange(field, e.target.value)}
              required={field === 'nom'}
              step={getInputType(field) === 'number' ? '0.01' : undefined}
            />
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {isEditing ? 'Update' : 'Create'}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntityForm;